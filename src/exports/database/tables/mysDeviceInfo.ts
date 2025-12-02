import { dir } from '@/dir'
import { common } from '@/exports/utils'
import { Database } from '../database'
import { createTable } from '../dbs'
import { DatabaseType, MysDeviceInfoTableType } from '../types'

export const MysDeviceInfoTable = createTable<MysDeviceInfoTableType>(
  dir.DataDir, 'mys_device_info_data', DatabaseType.Db
)

export const MysDeviceInfoDB = await MysDeviceInfoTable.init(
  {
    md5: Database.PkColumn('STRING'),
    deviceId: Database.Column('STRING', common.getDeviceGuid),
    deviceFp: Database.Column('STRING', ''),
    name: Database.Column('STRING', ''),
    board: Database.Column('STRING', ''),
    model: Database.Column('STRING', ''),
    oaid: Database.Column('STRING', ''),
    version: Database.Column('INTEGER', 12),
    fingerprint: Database.Column('STRING', ''),
    product: Database.Column('STRING', ''),
  }
)
