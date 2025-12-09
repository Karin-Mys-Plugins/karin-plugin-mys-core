import { dir } from '@/dir'
import { Config } from '@/exports/config'
import { DefaultCoreConfigDefineType, DefaultCoreConfigType } from '../types'

const defaultConfig: DefaultCoreConfigType = {
  githubProxyUrl: 'https://gh-proxy.org'
}

const defaultConfigDefine: DefaultCoreConfigDefineType = {

}

export const CoreCfg = new Config(`${dir.name}:config`, dir.ConfigDir, defaultConfig, defaultConfigDefine).watch()
