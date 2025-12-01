import { BaseGameUIDInfoTableType, BaseUserInfoTableType } from '@/exports/database'
import { BaseUserInfo } from '../../user'
import { UidInfoType } from '../api'

export declare class GameUserInfoBase<GameUserInfoTableType extends BaseUserInfoTableType> extends BaseUserInfo<GameUserInfoTableType> {
  get main_uid (): string
  get bind_uids (): BaseGameUIDInfoTableType<string>[`${string}-uids`]

  get mainUIDInfo (): UidInfoType | undefined

  get uidInfoList (): UidInfoType[]

  static create (userId: string): Promise<GameUserInfoBase<any>>

  getUIDInfo (uid: string): UidInfoType | undefined
}

export type gameName = '崩坏：星穹铁道' | '崩坏：因缘精灵' | '原神' | '崩坏3' | '崩坏学园2' | '未定事件簿' | '绝区零' | '星布谷地'
