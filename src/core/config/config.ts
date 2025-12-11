import { dir } from '@/dir'
import { Config } from '@/exports/config'
import { MysAccountType } from '@/exports/database'
import { DefaultCoreConfigDefineType, DefaultCoreConfigType } from '../types'

const defaultConfig: DefaultCoreConfigType = {
  proxy: {
    github: 'https://gh-proxy.org',
    [MysAccountType.os]: ''
  }
}

const defaultConfigDefine: DefaultCoreConfigDefineType = {

}

export const CoreCfg = new Config(`${dir.name}:config`, dir.ConfigDir, defaultConfig, defaultConfigDefine).watch()
