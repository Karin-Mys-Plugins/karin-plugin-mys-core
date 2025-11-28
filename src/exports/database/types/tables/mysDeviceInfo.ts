export interface MysDeviceInfoDatabaseBaseType {
  name: string
  board: string
  /** @description 重要参数 */
  model: string
  oaid: string
  version: number
  fingerprint: string
  product: string
}

export interface MysDeviceInfoDatabaseIdFpType {
  deviceId: string
  deviceFp: string
}

export interface MysDeviceInfoTableType extends MysDeviceInfoDatabaseBaseType, MysDeviceInfoDatabaseIdFpType {
  md5: string
}
