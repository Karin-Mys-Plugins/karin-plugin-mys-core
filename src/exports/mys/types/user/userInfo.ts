export const enum UidPermission {
  /** @description 普通绑定 */
  NB = 0,
  /** @description Cookie */
  CK = 1,
  /** @description SToken */
  ST = 2,
  /** @description Cookie + SToken */
  CS = 3
}

export interface StokenParmsType {
  stuid: string
  stoken: string
  mid: string
}

export type CookieParmsType = Partial<{
  ltuid: string
  ltoken: string
  cookie_token: string
  account_id: string
}>

export interface UserGameRoleItem {
  game_biz: string
  region: string
  game_uid: string
  nickname: string
  is_chosen: boolean
}

export class RefreshUidData {
  columnKey: `${string}-uids`
  /** @description 游戏名称 */
  name: string

  declare refresh: (info: UserGameRoleItem[]) => Record<string, UidPermission>

  constructor (game: string, name: string) {
    this.columnKey = `${game}-uids`
    this.name = name
  }
}
