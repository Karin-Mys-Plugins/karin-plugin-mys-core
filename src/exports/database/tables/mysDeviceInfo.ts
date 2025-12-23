import { dir } from '@/dir'
import { common, DefineDataPropEnum } from '@/exports/utils'
import { createTable } from '../dbs'
import { DatabaseType, MysDeviceInfoTableType } from '../types'

export const MysDeviceInfoTable = createTable<MysDeviceInfoTableType>(
  dir.DataDir, 'mys_device_info_data', DatabaseType.Db
)

export const MysDeviceInfoDB = await MysDeviceInfoTable.init(
  {
    prop: DefineDataPropEnum.Object,
    default: {
      md5: common.DefineValve(''),
      deviceId: common.DefineValve(common.getDeviceGuid),
      deviceFp: common.DefineValve(''),
      name: common.DefineValve(''),
      board: common.DefineValve(''),
      model: common.DefineValve(''),
      oaid: common.DefineValve(''),
      version: common.DefineValve(12),
      fingerprint: common.DefineValve(''),
      product: common.DefineValve(''),
    },
    required: ['md5']
  }
)
