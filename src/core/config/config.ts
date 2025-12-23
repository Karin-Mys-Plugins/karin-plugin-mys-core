import { dir } from '@/dir'
import { Config } from '@/exports/config'
import { MysAccountType } from '@/exports/database'
import { common, DefineDataPropEnum } from '@/exports/utils'
import { DefaultCoreConfigType } from '../types'

export const CoreCfg = new Config<DefaultCoreConfigType>(`${dir.name}:config`, dir.ConfigDir, {
  prop: DefineDataPropEnum.Object,
  default: {
    proxy: {
      prop: DefineDataPropEnum.Object,
      default: {
        github: common.DefineValve('https://gh-proxy.org'),
        [MysAccountType.os]: common.DefineValve(''),
      }
    }
  }
}).watch()
