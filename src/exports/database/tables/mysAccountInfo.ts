import { dir } from '@/dir'
import { common, DefineDataPropEnum } from '@/exports/utils'
import { createTable } from '../dbs'
import { DatabaseType, MysAccountInfoTableType, MysAccountType } from '../types'

export const MysAccountInfoTable = createTable<MysAccountInfoTableType>(
  dir.DataDir, 'mys_account_info_data', DatabaseType.Db
)

export const MysAccountInfoDB = await MysAccountInfoTable.init(
  {
    prop: DefineDataPropEnum.Object,
    default: {
      ltuid: common.DefineValve(''),
      type: common.DefineValve(MysAccountType.cn),
      cookie: common.DefineValve('', true),
      stoken: common.DefineValve(''),
      deviceMd5: common.DefineValve(''),
    },
    required: ['ltuid']
  }
)
