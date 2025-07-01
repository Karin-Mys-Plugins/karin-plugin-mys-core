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
  androidVersion: string
  deviceName: string
  deviceBoard: string
  deviceModel: string
  deviceProduct: string
  deviceFingerprint: string
}
