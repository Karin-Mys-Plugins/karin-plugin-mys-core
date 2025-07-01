import { CoreCommand } from '../app'

export interface ConfigType {
  device: DeviceConfig
  commands: Record<CoreCommand, CommandItem>
}

export interface CommandItem {
  /**
   * @description 触发指令
   */
  cmds: string[]
  /**
   * @description 是否强制保留默认指令
   */
  default: boolean
  /**
   * @description 是否需要结束锚点
   */
  end: boolean
  /**
   * @description 忽略大小写
   */
  flags: boolean
}

export interface DeviceConfig {
  androidVersion: string
  deviceName: string
  deviceBoard: string
  deviceModel: string
  deviceProduct: string
  deviceFingerprint: string
}
