import { dir } from '@/dir'
import { common } from '@/exports/utils'
import { Database } from '../database'
import { createTable } from '../dbs'
import { DatabaseType, MysDeviceInfoTableType } from '../types'

export const MysDeviceInfoTable = createTable<MysDeviceInfoTableType>(
  dir.DataDir, 'mys_device_info_data', DatabaseType.Db
)

export const MysDeviceInfoDB = await MysDeviceInfoTable.init(
  [
    Database.PkColumn('md5', 'STRING'),
    Database.Column('deviceId', 'STRING', common.getDeviceGuid),
    Database.Column('deviceFp', 'STRING', ''),
    Database.Column('name', 'STRING', ''),
    Database.Column('board', 'STRING', ''),
    Database.Column('model', 'STRING', ''),
    Database.Column('oaid', 'STRING', ''),
    Database.Column('version', 'INTEGER', 12),
    Database.Column('fingerprint', 'STRING', ''),
    Database.Column('product', 'STRING', ''),
  ]
)
