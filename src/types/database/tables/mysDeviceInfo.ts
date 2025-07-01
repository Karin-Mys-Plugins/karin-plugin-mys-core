export interface MysDeviceInfoItem {
  deviceId: string
  deviceFp: string
  name: string
  board: string
  model: string
  oaid: string
  androidVersion: string
  fingerprint: string
  product: string
}

export interface MysDeviceInfoType extends MysDeviceInfoItem {
  md5: string
}
