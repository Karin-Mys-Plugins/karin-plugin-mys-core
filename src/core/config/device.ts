import { dir } from '@/dir'
import { Config } from '@/exports/config'
import path from 'node:path'
import { DeviceConfigType } from '../types'

const ConfigPath = path.join(dir.ConfigDir, 'device.json')

const DefaultDevice: DeviceConfigType = {
  version: 12,
  name: 'aurora',
  board: '24031PN0DC',
  model: '24031PN0DC',
  product: 'aurora',
  fingerprint: 'Xiaomi/aurora/aurora:12/V417IR/813:user/release-keys'
}

export const DeviceCfg = new Config(`${dir.name}:device`, ConfigPath, DefaultDevice, {}).watch()
