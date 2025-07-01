import { dir } from '@/dir'
import { DatabaseType, MysAccountInfoType, MysAccountType } from '@/types'
import { Database } from '../database'

const DB = Database.get<MysAccountInfoType, DatabaseType.Db>()

export const MysAccountInfoDB = await DB.init(
  dir.DataDir,
  'mysAccountInfoData',
  {
    ltuid: Database.PkColumn('STRING'),
    type: Database.Column('STRING', MysAccountType.cn),
    cookie: Database.Column('TEXT', ''),
    stoken: Database.Column('STRING', ''),
    deviceMd5: Database.Column('STRING', ''),
  },
  DatabaseType.Db
)
