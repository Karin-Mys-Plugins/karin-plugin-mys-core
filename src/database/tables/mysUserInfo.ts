import { dir } from '@/dir'
import { BaseUserInfoType, DatabaseType } from '@/types'
import { Database } from '../database'

const DB = Database.get<BaseUserInfoType, DatabaseType.Db>()

export const BaseMysUserInfoSchema = {
  userId: Database.PkColumn('STRING'),
  ltuids: Database.ArrayColumn('ltuids'),
  stuids: Database.ArrayColumn('stuids'),
  deviceList: Database.ArrayColumn('deviceList'),
}

export const MysUserInfoDB = await DB.init(
  dir.DataDir, 'mysUserInfoData', BaseMysUserInfoSchema, DatabaseType.Db
)
