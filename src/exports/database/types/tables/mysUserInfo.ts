import { DatabaseArray } from '../dbs'

export interface BaseUserInfoTableType {
  userId: string
  ltuids: DatabaseArray<string>
  stuids: DatabaseArray<string>
  deviceList: DatabaseArray<string>
}

export const enum UidPermission {
  /** @description 普通绑定 */
  BIND = 0,
  /** @description Cookie */
  CK = 1,
  /** @description SToken */
  ST = 2,
  /** @description Cookie + SToken */
  CS = 3,
  /** @description 删除绑定 */
  DEL = 4
}

export interface BindUidsItemType {
  perm: UidPermission
  ltuid: string
}

export type BaseGameUIDInfoTableType<Game extends string> = {
  [P in `${Game}-main`]: string
} & {
  [P in `${Game}-uids`]: Record<string, BindUidsItemType>
}
