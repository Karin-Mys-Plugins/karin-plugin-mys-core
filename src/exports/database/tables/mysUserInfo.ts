import { dir } from '@/dir'
import { Database } from '../database'
import { createTable } from '../dbs'
import { BaseGameUIDInfoTableType, BaseUserInfoTableType, DatabaseType } from '../types'

export const MysUserInfoTable = createTable<BaseUserInfoTableType, BaseGameUIDInfoTableType<string>>(
  dir.DataDir, 'mys_user_info_data', DatabaseType.Db
)

export const MysUserInfoDB = await MysUserInfoTable.init(
  {
    userId: Database.PkColumn('STRING'),
    ltuids: Database.ArrayColumn('ltuids'),
    stuids: Database.ArrayColumn('stuids'),
    deviceList: Database.ArrayColumn('deviceList'),
  }
)
