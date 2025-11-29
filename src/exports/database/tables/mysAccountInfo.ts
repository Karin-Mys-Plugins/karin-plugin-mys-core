import { dir } from '@/dir'
import { Database } from '../database'
import { Table } from '../dbs'
import { DatabaseType, MysAccountInfoTableType, MysAccountType } from '../types'

export const MysAccountInfoTable = new Table<MysAccountInfoTableType, DatabaseType.Db, {}>(
  dir.DataDir, 'mys_account_info_data', DatabaseType.Db
)

export const MysAccountInfoDB = await MysAccountInfoTable.init(
  {
    ltuid: Database.PkColumn('STRING'),
    type: Database.Column('STRING', MysAccountType.cn),
    cookie: Database.Column('TEXT', ''),
    stoken: Database.Column('STRING', ''),
    deviceMd5: Database.Column('STRING', ''),
  }
)
