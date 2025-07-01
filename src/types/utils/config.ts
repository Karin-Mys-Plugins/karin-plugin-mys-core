import { CoreCommand } from '../app'

export interface ConfigType {
  device: DeviceConfig
  commands: Record<CoreCommand, CommandItem>
}

export interface CommandItem {
  cmds: string[]
  end: boolean
  flags: string
}

export interface DeviceConfig {
  deviceName: string
  deviceBoard: string
  deviceModel: string
  androidVersion: string
  deviceFingerprint: string
  deviceProduct: string
}
