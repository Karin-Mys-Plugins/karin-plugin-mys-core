import { BaseGameUIDInfoTableType, MysAccountType } from '@/exports/database'

export interface StokenParamsType {
  stuid: string
  stoken: string
  mid: string
}

export type CookieParamsType = Partial<{
  ltmid_v2: string

  ltuid: string
  ltuid_v2: string
  login_uid: string

  ltoken: string
  ltoken_v2: string

  cookie_token: string
  cookie_token_v2: string

  account_id: string
  account_id_v2: string

  account_mid_v2: string

  mi18nLang: string
}>

export interface UserGameRoleItemType {
  game_biz: string
  region: string
  game_uid: string
  nickname: string
  is_chosen: boolean
}

export interface RefreshUidResultType {
  Serv: MysAccountType
  uids: {
    name: string
    columnKey: `${string}-uids`
    data: BaseGameUIDInfoTableType<string>[`${string}-uids`]
  }[]
  message: string
}
