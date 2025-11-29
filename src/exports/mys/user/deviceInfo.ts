import { MysDeviceInfoDatabaseBaseType, MysDeviceInfoDatabaseIdFpType, MysDeviceInfoDB } from '@/exports/database'
import md5 from 'md5'

export class DeviceInfo {
  static async get (Md5: string) {
    return await (await MysDeviceInfoDB()).findByPk(Md5)
  }

  static async create (userId: string, deviceInfo: Partial<MysDeviceInfoDatabaseBaseType & MysDeviceInfoDatabaseIdFpType>) {
    const deviceMd5 = md5([
      userId,
      deviceInfo.deviceId || '',
      deviceInfo.name || '',
      deviceInfo.board || '',
      deviceInfo.model || '',
      deviceInfo.oaid || '',
      deviceInfo.version || '',
      deviceInfo.fingerprint || '',
      deviceInfo.product || ''
    ].join('_'))

    const MysDeviceInfo = await (await MysDeviceInfoDB()).findByPk(deviceMd5, true)
    await MysDeviceInfo.save(deviceInfo)

    return deviceMd5
  }
}
