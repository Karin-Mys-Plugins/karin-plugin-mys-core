import { BaseGameUIDInfoTableType, BaseUserInfoTableType, MysAccountType } from '@/exports/database'
import { BaseUserInfo } from '../../user'
import { UidInfo } from '../api'

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

export interface UserGameRoleItem {
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

export declare class GameUserInfoBase<GameUserInfoTableType extends BaseUserInfoTableType> extends BaseUserInfo<GameUserInfoTableType> {
  main_uid: string
  bind_uids: BaseGameUIDInfoTableType<string>[`${string}-uids`]

  get mainUIDInfo (): UidInfo | undefined

  get uidInfoList (): UidInfo[]

  static create<T extends BaseUserInfoTableType> (userId: string): Promise<GameUserInfoBase<T>>

  getUIDInfo (uid: string): UidInfo | undefined
}

export class RegisterGameBase<GameUserInfoTableType extends BaseUserInfoTableType> {
  game: string
  columnKey: `${string}-uids`
  /** @description 游戏名称 */
  name: string
  /** @description 指令前缀匹配 */
  prefix: RegExp

  declare refresh: (info: UserGameRoleItem[]) => string[]

  declare UserInfo: typeof GameUserInfoBase<GameUserInfoTableType>

  constructor (game: string, name: string, prefix: RegExp) {
    this.game = game
    this.columnKey = `${game}-uids`

    this.name = name
    this.prefix = prefix
  }
}
