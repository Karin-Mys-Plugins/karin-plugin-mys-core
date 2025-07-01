export interface MysDeviceInfoItem {
  name: string
  board: string
  /** @description 重要参数 */
  model: string
  oaid: string
  androidVersion: string
  fingerprint: string
  product: string
}

export interface MysDeviceInfoIdFp {
  deviceId: string
  deviceFp: string
}

export interface MysDeviceInfoType extends MysDeviceInfoItem, MysDeviceInfoIdFp {
  md5: string
}
