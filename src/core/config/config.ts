import { dir } from '@/dir'
import { Config } from '@/exports/config'
import { MysAccountType } from '@/exports/database'
import { DefineDataPropEnum } from '@/exports/utils'
import { DefaultCoreConfigType } from '../types'

export const CoreCfg = new Config<DefaultCoreConfigType>(`${dir.name}:config`, dir.ConfigDir, {
  prop: DefineDataPropEnum.Object,
  default: {
    proxy: {
      prop: DefineDataPropEnum.OArray,
      default: {
        github: 'https://gh-proxy.org'
      },
      defaultItem: {
        prop: DefineDataPropEnum.Value,
        type: 'string',
        default: ''
      },
      requiredDefault: ['github', MysAccountType.os]
    }
  }
}).watch()
