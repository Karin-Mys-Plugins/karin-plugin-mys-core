import { BaseMysRes, DeviceInfo, MysAccountType, MysApiInfoFn, UidInfo } from '@/types'
import { common } from '@/utils'
import md5 from 'md5'
import { logger } from 'node-karin'
import axios, { AxiosHeaders, AxiosRequestConfig } from 'node-karin/axios'
import lodash from 'node-karin/lodash'
import { MysApp } from './mysApp'

export class DefineMysApi<
  R extends BaseMysRes & Record<string, any> | undefined = undefined,
  D extends Record<string, any> = {}
> {
  uidInfo: UidInfo

  #apiInfo: MysApiInfoFn<R, D>

  declare Device: DeviceInfo

  #needDeviceFp: boolean = false
  #needCheckCode: boolean = false

  constructor (apiInfo: MysApiInfoFn<R, D>, uidInfo?: UidInfo, opt: { deviceFp?: boolean, checkCode?: boolean } = {}) {
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

    this.Device = {
      id: common.getDeviceGuid(),
      name: `Karin-${common.randomString(8, 'All')}`
    }

    return this.Device
  }

  async request (data: D, checkCode: boolean = true): Promise<R> {
    const { Method, Url, Body, HeaderFn } = this.#apiInfo(this, data)

    const Headers = new AxiosHeaders(await HeaderFn({
      query: Url.search.substring(1), body: Body
    }, data))

    if (this.#needDeviceFp) {
      Headers.set()
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
      logger.debug(`mys-core-requst[${logger.green(`${Date.now() - start}ms`)}]: ${JSON.stringify(params, null, 2)}`)

      return response
    }

    const res = response.data

    logger.debug(`mys-core-requst[${logger.green(`${Date.now() - start}ms`)}]: ${JSON.stringify(params, null, 2)} -> ${JSON.stringify(res, null, 2)}`)

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
    return res
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
}
