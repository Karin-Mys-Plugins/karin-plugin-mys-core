import { DeviceCfg, DeviceConfigType } from '@/core'
import { dir } from '@/dir'
import { MysAccountType, MysDeviceInfoDatabaseBaseType, MysDeviceInfoDatabaseIdFpType } from '@/exports/database'
import { common } from '@/exports/utils'
import md5 from 'md5'
import { logger, redis, SendMessage } from 'node-karin'
import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from 'node-karin/axios'
import { ApiInfoFn, BaseMysRes, RequestResult } from '../types/api'
import { DeviceInfo } from '../user'
import { getDeviceFp } from './apis'
import { MysApp } from './app'

export class DefineApi<
  R extends BaseMysRes & Record<string, any> | null = null,
  D extends Record<string, any> | null = null,
  U extends Record<string, any> | null = null
> {
  declare UserInfo: U

  declare DeviceInfo: MysDeviceInfoDatabaseBaseType & MysDeviceInfoDatabaseIdFpType & {
    /** @description 重要参数 */
    brand: string
    display: string
  }

  #apiInfo: ApiInfoFn<R, D, U>

  /** @description 是否使用Fp请求 */
  #useFp: boolean = false

  constructor (apiInfo: ApiInfoFn<R, D, U>) {
    this.#apiInfo = apiInfo
  }

  get isHoyolab () {
    return this.UserInfo?.type === MysAccountType.os
  }

  init (userInfo: U) {
    this.UserInfo = userInfo

    return {
      request: async (data: D): Promise<RequestResult<R>> => await this.#requestData(this.#apiInfo, data),
      requestCache: async (key: string, seconds: number, data: D): Promise<RequestResult<R>> => {
        const redisKey = `${dir.name}:apiCache:${key}`

        const cache = await redis.get(redisKey)
        if (cache) {
          try {
            const cacheData: R = JSON.parse(cache)

            return this.#checkDataCode(cacheData)
          } catch (err) {
            logger.error(`[${dir.name}] redisCache(${key}) json parse error:`, err)

            await redis.del(redisKey)
          }
        }

        const result = await this.#requestData(this.#apiInfo, data)

        seconds > 0 && await redis.setEx(redisKey, seconds, JSON.stringify(result))

        return result
      }
    }
  }

  #setDevice (device: MysDeviceInfoDatabaseBaseType & { deviceId: string }, deviceFp?: string) {
    const fingerprintSplit = device.fingerprint.split('/')

    this.DeviceInfo = {
      deviceId: device.deviceId,
      deviceFp: deviceFp || '',
      name: device.name,
      board: device.board,
      model: device.model,
      oaid: device.oaid,
      version: device.version,
      fingerprint: device.fingerprint,
      product: device.product,
      brand: fingerprintSplit[0],
      display: fingerprintSplit[3]
    }
  }

  /** @description 使用CookieHeaders等需要device进行请求时使用 */
  async initDevice (userInfo: U, deviceFp: boolean = false) {
    const defaultDeviceInfo = DeviceCfg.get<DeviceConfigType>('')
    if (userInfo?.deviceMd5) {
      const deviceData = await DeviceInfo.get(userInfo.deviceMd5)

      deviceData && this.#setDevice(deviceData)
    }

    if (!this.DeviceInfo) {
      const uuid = crypto.randomUUID()

      this.#setDevice({ ...defaultDeviceInfo, oaid: uuid, deviceId: uuid })
    }

    if (deviceFp && !this.DeviceInfo.deviceFp) {
      const fpData = (await (await getDeviceFp.initDevice(null)).requestCache(`getDeviceFp:${userInfo!.ltuid}`, 3600 * 8, null)).data

      this.#useFp = true
      this.DeviceInfo.deviceFp = fpData?.data?.device_fp || '38d7faa51d2b6'
    }

    return this.init(userInfo)
  }

  async #requestData (apiInfo: ApiInfoFn<any, any, any>, data: any): Promise<RequestResult<R>> {
    const { Url, Body, Method, Options = {}, HeaderFn, Result } = apiInfo(this, data)

    const Headers = new AxiosHeaders(await HeaderFn())

    if (this.#useFp) {
      Headers.set('x-rpc-device_id', this.DeviceInfo.deviceId)
      Headers.set('x-rpc-device_fp', this.DeviceInfo.deviceFp)
    }

    const params: AxiosRequestConfig = {
      url: Url.href, method: Method, data: Body, headers: Headers
    }

    const start = Date.now()
    let response: AxiosResponse<any, any>
    try {
      if (Method === 'GET') {
        response = await axios.get(params.url!, {
          headers: params.headers, ...Options
        })
      } else if (Method === 'POST') {
        response = await axios.post(params.url!, params.data, {
          headers: params.headers, ...Options
        })
      } else {
        response = await axios.request(params)
      }
    } catch (err) {
      logger.debug(`[${dir.name}] requst-error(${logger.green(`${Date.now() - start}ms`)}): ${JSON.stringify(params, null, 2)}`, err)

      return this.#checkDataCode(null as any)
    }

    const res = Result ? await Result(response) : { data: response.data, row: response.data }

    logger.debug(`[${dir.name}] requst-success(${logger.green(`${Date.now() - start}ms`)}): ${JSON.stringify(params, null, 2)} -> ${JSON.stringify(res.row, null, 2)}`)

    return this.#checkDataCode(res.data)
  }

  getDS1 (saltKey: keyof typeof MysApp.salt, query: string = '', body: string = '') {
    const r = common.randomString(6, 'All')
    const t = Math.floor(Date.now() / 1000)
    let DS = `salt=${MysApp.salt[saltKey]}&t=${t}&r=${r}`
    if (query || body) DS += `&b=${body}&q=${query}`

    return `${t},${r},${md5(DS)}`
  }

  getDS2 (saltKey: keyof typeof MysApp.salt, query: string = '', body: string = '') {
    const r = 100001 + Math.floor(Math.random() * 100000)
    const t = Math.floor(Date.now() / 1000)

    return `${t},${r},${md5(`salt=${MysApp.salt[saltKey]}&t=${t}&r=${r}&b=${body}&q=${query}`)}`
  }

  NoHeaders = (options: { query?: string, body?: any } = {}) => ({})

  BaseCnHeaders = () => ({
    'x-rpc-app_version': MysApp.version.cn,
    'x-rpc-client_type': '5',
    'x-rpc-device_id': this.DeviceInfo.deviceId,
    'User-Agent': `Mozilla/5.0 (Linux; Android 12; ${this.DeviceInfo.name}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.73 Mobile Safari/537.36 miHoYoBBS/${MysApp.version.cn}`,
    Referer: 'https://webstatic.mihoyo.com'
  })

  BaseOsHeaders = () => ({
    'x-rpc-app_version': MysApp.version.cn,
    'x-rpc-client_type': '4',
    'x-rpc-language': 'zh-cn'
  })

  PassportHeaders = (options: { query?: string, body?: any } = {}) => ({
    'x-rpc-app_version': MysApp.version.cn,
    'x-rpc-game_biz': 'bbs_cn',
    'x-rpc-client_type': '2',
    'User-Agent': 'okhttp/4.8.0',
    'x-rpc-app_id': 'bll8iq97cem8',
    DS: this.getDS1('PROD', options.query, JSON.stringify(options.body || ''))
  })

  CookieHeaders = (options: { query?: string, body?: any } = {}) => ({
    Cookie: this.UserInfo!.cookie,
    ...(this[this.isHoyolab ? 'BaseOsHeaders' : 'BaseCnHeaders']())
  })

  OkHttpHeaders = (options: { query?: string, body?: any } = {}) => ({
    'User-Agent': 'okhttp/4.9.3',
    Connection: 'Keep-Alive',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json'
  })

  #checkDataCode (data: R, error: SendMessage[] = []): RequestResult<R> {
    return {
      data,
      check: async () => {
        const errMsg: SendMessage[] = []

        switch (data?.retcode) {
          case 0:
          case -1002: // 伙伴不存在~
            break
          case -1:
          case -100:
          case 1001:
          case 10001:
          case 10103:
            if (/(登录|login)/i.test(data.message)) {
              logger.mark(`karin-plugin-mys-core: [cookie失效][uid: ${this.UserInfo?.uid}][userId:${this.UserInfo?.userId}]`)

              errMsg.push(`UID:${this.UserInfo?.uid}，米游社Cookie已失效，请【#刷新Cookie】或重新绑定。`)
            } else {
              errMsg.push(`UID:${this.UserInfo?.uid}米游社查询失败，请稍后再试！`)
            }
            break
          case 10102:
            if (data.message === 'Data is not public for the user') {
              errMsg.push(`UID:${this.UserInfo?.uid}，米游社数据未公开！`)
            } else {
              errMsg.push(`UID:${this.UserInfo?.uid}，请先去米游社绑定角色！`)
            }
            break
          case 1008:
            errMsg.push(`UID:${this.UserInfo?.uid}，请先去米游社绑定角色！`)
            break
          case 10101:
            errMsg.push(`UID:${this.UserInfo?.uid}，查询已达今日上限！`)
            break
          case 5003:
          case 10041:
            logger.mark(`karin-plugin-mys-core: [UID:${this.UserInfo?.uid}][userId:${this.UserInfo?.userId}] 账号异常`)

            errMsg.push(`UID:${this.UserInfo?.uid}，账号异常，请绑定设备后查询。`)
            break
          case 1034:
          case 10035:
            logger.mark(`karin-plugin-mys-core: [UID:${this.UserInfo?.uid}][userId:${this.UserInfo?.userId}] 遇到验证码`)

            errMsg.push(`UID:${this.UserInfo?.uid}，查询遇到验证码，请绑定设备后查询。`)
            break
          case 10307:
            errMsg.push(`UID:${this.UserInfo?.uid}，版本更新期间，数据维护中。`)
            break
          default:
            errMsg.push(`UID:${this.UserInfo?.uid}，米游社接口报错，暂时无法查询：${data?.message || 'unknow error'}。`)
            break
        }

        return this.#checkDataCode(data, errMsg)
      },
      error
    }
  }
}
