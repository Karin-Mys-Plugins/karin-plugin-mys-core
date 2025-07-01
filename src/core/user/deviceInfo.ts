import { MysDeviceInfoDB } from '@/database'
import { BaseUserInfoType, MysDeviceInfoIdFp, MysDeviceInfoItem } from '@/types'
import md5 from 'md5'
import lodash from 'node-karin/lodash'
import { BaseUserInfo } from './userInfo'

export class DeviceInfo {
  static async get (Md5: string) {
    return await MysDeviceInfoDB.findByPk(Md5)
  }

  static async create (UserInfo: BaseUserInfo<BaseUserInfoType>, deviceInfo: Partial<MysDeviceInfoItem & MysDeviceInfoIdFp>) {
    const deviceMd5 = md5([
      UserInfo.userId,
      deviceInfo.deviceId || '',
      deviceInfo.name || '',
      deviceInfo.board || '',
      deviceInfo.model || '',
      deviceInfo.oaid || '',
      deviceInfo.androidVersion || '',
      deviceInfo.fingerprint || '',
      deviceInfo.product || ''
    ].join('_'))

    const MysDeviceInfo = await MysDeviceInfoDB.findByPk(deviceMd5, true)
    await MysDeviceInfo.save(deviceInfo)

    await UserInfo.saveUserInfo({
      deviceList: lodash.uniq([...UserInfo.deviceList, deviceMd5])
    })
  }
}
