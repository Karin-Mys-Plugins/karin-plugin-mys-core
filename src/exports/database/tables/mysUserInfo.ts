import { dir } from '@/dir'
import { Database } from '../database'
import { Table } from '../dbs'
import { BaseUserInfoTableType, DatabaseType } from '../types'

export const MysUserInfoTable = new Table<BaseUserInfoTableType, DatabaseType.Db>(
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
