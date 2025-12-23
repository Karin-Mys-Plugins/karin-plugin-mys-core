import { dir } from '@/dir'
import { common, DefineDataPropEnum } from '@/exports/utils'
import { createTable } from '../dbs'
import { BaseGameUIDInfoTableType, BaseUserInfoTableType, DatabaseType } from '../types'

export const MysUserInfoTable = createTable<BaseUserInfoTableType, BaseGameUIDInfoTableType<string>>(
  dir.DataDir, 'mys_user_info_data', DatabaseType.Db
)

export const MysUserInfoDB = await MysUserInfoTable.init(
  {
    prop: DefineDataPropEnum.Object,
    default: {
      userId: common.DefineValve(''),
      ltuids: {
        prop: DefineDataPropEnum.Array,
        default: [],
        defaultItem: common.DefineValve('')
      },
      stuids: {
        prop: DefineDataPropEnum.Array,
        default: [],
        defaultItem: common.DefineValve('')
      },
      deviceList: {
        prop: DefineDataPropEnum.Array,
        default: [],
        defaultItem: common.DefineValve('')
      }
    },
    required: ['userId']
  }
)
