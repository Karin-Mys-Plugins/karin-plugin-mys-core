import { dir } from '@/dir'
import { Config } from '@/exports/config'
import { common, DefineDataPropEnum } from '@/exports/utils'
import { DeviceConfigType } from '../types'

export const DeviceCfg = new Config<DeviceConfigType>(`${dir.name}:device`, dir.ConfigDir, {
  prop: DefineDataPropEnum.Object,
  default: {
    version: common.DefineValve(12),
    name: common.DefineValve('aurora'),
    board: common.DefineValve('24031PN0DC'),
    model: common.DefineValve('24031PN0DC'),
    product: common.DefineValve('aurora'),
    fingerprint: common.DefineValve('Xiaomi/aurora/aurora:12/V417IR/813:user/release-keys')
  }
}).watch()
