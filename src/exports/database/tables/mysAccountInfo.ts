import { dir } from '@/dir'
import { Database } from '../database'
import { createTable } from '../dbs'
import { DatabaseType, MysAccountInfoTableType, MysAccountType } from '../types'

export const MysAccountInfoTable = createTable<MysAccountInfoTableType>(
  dir.DataDir, 'mys_account_info_data', DatabaseType.Db
)

export const MysAccountInfoDB = await MysAccountInfoTable.init(
  [
    Database.PkColumn('ltuid', 'STRING'),
    Database.Column('type', 'STRING', MysAccountType.cn),
    Database.Column('cookie', 'TEXT', ''),
    Database.Column('stoken', 'STRING', ''),
    Database.Column('deviceMd5', 'STRING', '')
  ]
)
