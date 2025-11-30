import { BaseGameUIDInfoTableType, BaseUserInfoTableType } from '@/exports/database'
import { BaseUserInfo } from '../../user'
import { UidInfo } from '../api'

export declare class GameUserInfoBase<GameUserInfoTableType extends BaseUserInfoTableType> extends BaseUserInfo<GameUserInfoTableType> {
  get main_uid (): string
  get bind_uids (): BaseGameUIDInfoTableType<string>[`${string}-uids`]

  get mainUIDInfo (): UidInfo | undefined

  get uidInfoList (): UidInfo[]

  static create<T extends BaseUserInfoTableType> (userId: string): Promise<GameUserInfoBase<T>>

  getUIDInfo (uid: string): UidInfo | undefined
}
