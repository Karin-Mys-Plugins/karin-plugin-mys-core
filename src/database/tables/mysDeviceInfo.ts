import { dir } from '@/dir'
import { DatabaseType, MysDeviceInfoType } from '@/types'
import { Database } from '../database'

const DB = Database.get<MysDeviceInfoType>()

export const MysDeviceInfoDB = await DB.init(
  dir.DataDir,
  'mysDeviceInfoData',
  {
    md5: Database.PkColumn('STRING'),
    deviceFp: Database.Column('STRING', ''),
  },
  DatabaseType.Db
)
