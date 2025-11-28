import { MysAccountType } from '@/exports/database'
import { SendMessage } from 'node-karin'
import { AxiosRequestConfig, AxiosResponse } from 'node-karin/axios'
import { DefineApi } from '../../api/define'

export type RequestResult<R> = {
  data: R, check: () => Promise<RequestResult<R>>, error: SendMessage[]
}

export interface BaseMysRes {
  retcode: number
  message: string
}

export type ApiInfoFn<
  /** @description 请求参数 */
  R extends BaseMysRes & Record<string, any> | null = null,
  /** @description 响应数据 */
  D extends Record<string, any> | null = null,
  U extends Record<string, any> | null = null
> = (self: DefineApi<R, D, U>, data: D) => {
  Url: URL
  Body?: any
  Method: 'GET' | 'POST'
  Options?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'headers'>
  HeaderFn: () => Record<string, string> | Promise<Record<string, string>>
  /** @description 对响应数据进行处理 */
  Result?: (response: AxiosResponse) => Promise<{ data: R, row: any }>
}

export interface BaseltuidInfo {
  ltuid: string
  type: MysAccountType
  deviceMd5: string
}

export interface UidInfo extends BaseltuidInfo {
  uid: string
  cookie: string
  stoken: string

  userId: string
  owner: boolean
}

export interface DeviceInfoType {
  id: string
  name: string
  board: string
  model: string
  oaid: string
  androidVersion: string
  fingerprint: string
  product: string
}
