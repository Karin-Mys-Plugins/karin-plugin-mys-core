import { BaseMysRes, DeviceConfig, MysAccountType, MysApiInfoFn, MysDeviceInfoItem, UidInfo } from '@/types'
import { Cfg, common } from '@/utils'
import md5 from 'md5'
import { logger, redis } from 'node-karin'
import axios, { AxiosHeaders, AxiosRequestConfig } from 'node-karin/axios'
import lodash from 'node-karin/lodash'
import { DeviceInfo } from '../user'
import { getDeviceFp } from './mysApis'
import { MysApp } from './mysApp'

export class DefineMysApi<
  R extends BaseMysRes & Record<string, any> | undefined = undefined,
  D extends Record<string, any> = {}
> {
  uidInfo: UidInfo

  #apiInfo: MysApiInfoFn<R, D>

  declare Device: MysDeviceInfoItem & {
    id: string
    /** @description 重要参数 */
    brand: string
    display: string
  }

  declare DeviceFp: string

  #needDeviceFp: boolean = false
  #needCheckCode: boolean = false

  constructor (apiInfo: MysApiInfoFn<R, D>, uidInfo?: Partial<UidInfo>, opt: { deviceFp?: boolean, checkCode?: boolean } = {}) {
    this.#apiInfo = apiInfo

    this.uidInfo = uidInfo as UidInfo

    this.#needDeviceFp = !!opt.deviceFp
    this.#needCheckCode = !!opt.checkCode
  }

  get isHoyolab () {
    return this.uidInfo.type === MysAccountType.os
  }

  async getApi (data: D) {
    const { Method, Url, Body, HeaderFn } = this.#apiInfo(this, data)

    const Headers = new AxiosHeaders(await HeaderFn({
      query: Url.search.substring(1), body: Body
    }, data))

    return {
      Method, Url, Body, Headers
    }
  }

  async getDevice () {
    if (this.Device) return this.Device

    const defDevice = Cfg.get<DeviceConfig>('device')
    const DbDevice = await DeviceInfo.get(this.uidInfo.deviceMd5)

    const uuid = crypto.randomUUID()
    const fingerprint = DbDevice?.fingerprint || defDevice.deviceFingerprint

    this.Device = {
      id: DbDevice?.deviceId || uuid,
      name: DbDevice?.name || defDevice.deviceName,
      board: DbDevice?.board || defDevice.deviceBoard,
      model: DbDevice?.model || defDevice.deviceModel,
      oaid: DbDevice?.oaid || uuid,
      androidVersion: DbDevice?.androidVersion || defDevice.androidVersion,
      fingerprint,
      product: DbDevice?.product || defDevice.deviceProduct,
      brand: fingerprint.split('/')[0],
      display: fingerprint.split('/')[3]
    }

    this.DeviceFp = DbDevice?.deviceFp || await redis.get(`karin-piugin-mya-core:deviceFp:${this.uidInfo.ltuid}`) || ''

    return {
      device: this.Device,
      deviceFp: this.DeviceFp
    }
  }

  setDevice (device: MysDeviceInfoItem & { id: string, brand: string, display: string }, deviceFp?: string) {
    this.Device = device
    this.DeviceFp = deviceFp || ''

    return this
  }

  async request (data: D, checkCode: boolean = true): Promise<R> {
    const { Method, Url, Body, HeaderFn } = this.#apiInfo(this, data)

    const Headers = new AxiosHeaders(await HeaderFn({
      query: Url.search.substring(1), body: Body
    }, data))

    if (this.#needDeviceFp) {
      if (!this.DeviceFp) {
        const res = await getDeviceFp().request({})
        if (res.data?.device_fp) {
          this.DeviceFp = res.data.device_fp
          await redis.setEx(`karin-piugin-mya-core:deviceFp:${this.uidInfo.ltuid}`, 60 * 60 * 8, res.data.device_fp)
        }
      }

      Headers.set('x-rpc-device_id', this.Device.id)
      Headers.set('x-rpc-device_fp', this.DeviceFp)
    }

    const params: AxiosRequestConfig = {
      url: Url.href, method: Method, data: Body, headers: Headers
    }

    const start = Date.now()
    let response: any
    try {
      if (Method === 'GET') {
        response = await axios.get(params.url!, {
          headers: params.headers
        })
      } else if (Method === 'POST') {
        response = await axios.post(params.url!, params.data, {
          headers: params.headers
        })
      } else {
        response = axios.request(params)
      }
    } catch (err) {
      logger.debug(`mys-core-requst-error[${logger.green(`${Date.now() - start}ms`)}]: ${JSON.stringify(params, null, 2)}`)

      return response
    }

    const res = response.data

    logger.debug(`mys-core-requst-success[${logger.green(`${Date.now() - start}ms`)}]: ${JSON.stringify(params, null, 2)} -> ${JSON.stringify(res, null, 2)}`)

    if (!res) {
      return undefined as R
    }

    if ('retcode' in res) {
      res.retcode = Number(res.retcode)
    }

    if (this.#needCheckCode && checkCode) {
      return await this.checkRetCode(res, data)
    }

    return res
  }

  async checkRetCode (res: R, data?: D, validate: boolean = true): Promise<R> {
    const result = res!
    const err = (msg: string) => {
      if (!result.error) {
        result.error = []
      }
      result.error.push(msg)
    }

    switch (result.retcode) {
      case 0:
      case -1002: // 伙伴不存在~
        break
      case -1:
      case -100:
      case 1001:
      case 10001:
      case 10103:
        if (/(登录|login)/i.test(result.message)) {
          logger.mark(`karin-plugin-mys-core: [cookie失效][uid: ${this.uidInfo.uid}][userId:${this.uidInfo.userId}]`)
          err(`UID:${this.uidInfo.uid}，米游社Cookie已失效，请【#刷新Cookie】或重新绑定。`)
        } else {
          err(`UID:${this.uidInfo.uid}米游社查询失败，请稍后再试`)
        }
        break
      case 10102:
        if (result.message === 'Data is not public for the user') {
          err(`UID:${this.uidInfo.uid}，米游社数据未公开`)
        } else {
          err(`UID:${this.uidInfo.uid}，请先去米游社绑定角色`)
        }
        break
      case 1008:
        err(`UID:${this.uidInfo.uid}，请先去米游社绑定角色`)
        break
      case 10101:
        err(`UID:${this.uidInfo.uid}，查询已达今日上限`)
        break
      case 5003:
      case 10041:
        logger.mark(`karin-plugin-mys-core: [UID:${this.uidInfo.uid}][userId:${this.uidInfo.userId}] 账号异常`)
        err(`UID:${this.uidInfo.uid}，账号异常，请绑定设备后查询。`)
        break
      case 1034:
      case 10035:
        logger.mark(`karin-plugin-mys-core: [UID:${this.uidInfo.uid}][userId:${this.uidInfo.userId}] 遇到验证码`)
        err(`UID:${this.uidInfo.uid}，遇到验证码，请绑定设备后查询。`)
        break
      case 10307:
        err(`UID:${this.uidInfo.uid}，版本更新期间，数据维护中`)
        break
      default:
        err(`UID:${this.uidInfo.uid}，米游社接口报错，暂时无法查询：${result.message || 'unknow error'}`)
        break
    }

    return result
  }

  getDS1 (saltKey: keyof typeof MysApp.salt, query: string = '', body: string = '') {
    const r = common.randomString(6, 'All')
    const t = Math.floor(Date.now() / 1000)
    let DS = `salt=${MysApp.salt[saltKey]}&t=${t}&r=${r}`
    if (query || body) DS += `&b=${body}&q=${query}`

    return `${t},${r},${md5(DS)}`
  }

  getDS2 (saltKey: keyof typeof MysApp.salt, query: string = '', body: string = '') {
    const r = lodash.random(100001, 200000)
    const t = Math.floor(Date.now() / 1000)

    return `${t},${r},${md5(`salt=${MysApp.salt[saltKey]}&t=${t}&r=${r}&b=${body}&q=${query}`)}`
  }

  NoHeaders = (options: { query?: string, body?: any } = {}) => ({})

  BaseCnHeaders = async () => {
    await this.getDevice()

    return {
      'x-rpc-app_version': MysApp.version.cn,
      'x-rpc-client_type': '5',
      'x-rpc-device_id': this.Device.id,
      'User-Agent': `Mozilla/5.0 (Linux; Android 12; ${this.Device.name}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.73 Mobile Safari/537.36 miHoYoBBS/${MysApp.version.cn}`,
      Referer: 'https://webstatic.mihoyo.com'
    }
  }

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
    DS: this.getDS1('PROD', options.query, JSON.stringify(options.body))
  })

  CookieHeaders = (options: { query?: string, body?: any } = {}) => ({
    Cookie: this.uidInfo.cookie!,
    ...(this[this.isHoyolab ? 'BaseOsHeaders' : 'BaseCnHeaders']())
  })

  OkHttpHeaders = (options: { query?: string, body?: any } = {}) => ({
    'User-Agent': 'okhttp/4.9.3',
    Connection: 'Keep-Alive',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
  })
}
