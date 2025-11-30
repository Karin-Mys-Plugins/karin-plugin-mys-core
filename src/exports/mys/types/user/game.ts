import { BaseGameUIDInfoTableType, BaseUserInfoTableType } from '@/exports/database'
import { BaseUserInfo } from '../../user'
import { UidInfoType } from '../api'
import { UserGameRoleItem } from './userInfo'

export declare class GameUserInfoBase<GameUserInfoTableType extends BaseUserInfoTableType> extends BaseUserInfo<GameUserInfoTableType> {
  get main_uid (): string
  get bind_uids (): BaseGameUIDInfoTableType<string>[`${string}-uids`]

  get mainUIDInfo (): UidInfoType | undefined

  get uidInfoList (): UidInfoType[]

  static create (userId: string): Promise<GameUserInfoBase<any>>

  getUIDInfo (uid: string): UidInfoType | undefined
}

type gameName = '崩坏：星穹铁道' | '崩坏：因缘精灵' | '原神' | '崩坏3' | '崩坏学园2' | '未定事件簿' | '绝区零' | '星布谷地'

export class RegisterGameBase<GameUserInfoTableType extends BaseUserInfoTableType> {
  game: string
  columnKey: `${string}-uids`
  /** @description 游戏名称 */
  name: gameName

  /** @description 指令前缀匹配 */
  prefix: RegExp

  refresh: (info: UserGameRoleItem[]) => string[]

  UserInfo: typeof GameUserInfoBase<GameUserInfoTableType>

  constructor (game: string, name: gameName, prefix: RegExp, userInfo: typeof GameUserInfoBase<GameUserInfoTableType>, refreshFuc: (info: UserGameRoleItem[]) => string[]) {
    this.game = game
    this.columnKey = `${game}-uids`

    this.name = name
    this.prefix = prefix

    this.UserInfo = userInfo

    this.refresh = refreshFuc
  }
}
