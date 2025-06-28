import { DefineMysApi } from '@/core/api/define'
import { MysAccountType } from '@/types/database/tables'

export interface BaseltuidInfo {
  ltuid: string
  type: MysAccountType
}

export interface UidInfo extends BaseltuidInfo {
  uid?: string
  cookie?: string
  stoken?: string
  owner?: boolean
}

export interface DeviceInfo {
  id: string
  name: string
}

export interface BaseMysRes {
  retcode: number
  message: string

  error?: string[]
  isCache?: boolean
}

export type MysApiInfoFn<
  R extends BaseMysRes & Record<string, any> | undefined = undefined,
  D extends Record<string, any> = {}
> = (self: DefineMysApi<R, D>, data: D) => {
  Method: 'GET' | 'POST'
  Url: URL
  Body?: any
  HeaderFn: (options: { query: string, body: any, }, data?: D) => Record<string, string> | Promise<Record<string, string>>
}
