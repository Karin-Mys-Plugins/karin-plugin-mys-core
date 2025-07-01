import { dir } from '@/dir'
import { DatabaseType, MysDeviceInfoType } from '@/types'
import { common } from '@/utils'
import { Database } from '../database'

const DB = Database.get<MysDeviceInfoType, DatabaseType.Db>()

export const MysDeviceInfoDB = await DB.init(
  dir.DataDir,
  'mysDeviceInfoData',
  {
    md5: Database.PkColumn('STRING'),
    deviceId: Database.Column('STRING', common.getDeviceGuid),
    deviceFp: Database.Column('STRING', ''),
    name: Database.Column('STRING', ''),
    board: Database.Column('STRING', ''),
    model: Database.Column('STRING', ''),
    oaid: Database.Column('STRING', ''),
    androidVersion: Database.Column('STRING', ''),
    fingerprint: Database.Column('STRING', ''),
    product: Database.Column('STRING', ''),
  },
  DatabaseType.Db
)
