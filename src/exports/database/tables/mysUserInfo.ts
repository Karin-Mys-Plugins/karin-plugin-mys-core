import { dir } from '@/dir'
import { Database } from '../database'
import { createTable } from '../dbs'
import { BaseGameUIDInfoTableType, BaseUserInfoTableType, DatabaseType } from '../types'

export const MysUserInfoTable = createTable<BaseUserInfoTableType, BaseGameUIDInfoTableType<string>>(
  dir.DataDir, 'mys_user_info_data', DatabaseType.Db
)

export const MysUserInfoDB = await MysUserInfoTable.init(
  [
    Database.PkColumn('userId', 'STRING'),
    Database.ArrayColumn('ltuids', true),
    Database.ArrayColumn('stuids', true),
    Database.ArrayColumn('deviceList', true)
  ]
)
