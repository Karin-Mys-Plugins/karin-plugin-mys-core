import { DeviceInfo, UserInfo } from '@/core'
import { MysAccountType } from '@/types'
import karin from 'node-karin'

export const BingMysDevice = karin.command(
  /^#绑定(米游社)?设备$/,
  async (e) => {
    const userInfo = await UserInfo.create(e.userId)
    const ltuidInfoList = userInfo.getLtuidInfoList()
    const cnLtuidInfoList = ltuidInfoList.filter(info => info.type === MysAccountType.cn)

    if (cnLtuidInfoList.length === 0) {
      if (ltuidInfoList.length === 0) {
        e.reply('暂未绑定国服米游社账号，请先“#扫码绑定”绑定', { at: true })
      } else {
        e.reply('国际服暂不需要绑定设备。', { at: true })
      }
      return true
    }

    e.reply('请发送设备信息(建议私聊发送)，或者发送“取消”取消绑定', { at: true })

    const ctx = await karin.ctx(e)
    if (/^#?取消(绑定)/.test(ctx.msg)) {
      e.reply('已取消绑定', { at: true })
      return true
    }

    const device = JSON.parse(ctx.msg) as Partial<{
      device_id: string
      device_fp: string
      deviceName: string
      deviceBoard: string
      deviceModel: string
      oaid: string
      androidVersion: string
      deviceFingerprint: string
      deviceProduct: string
    }>

    if (device.device_id && device.device_fp) {
      await DeviceInfo.create(userInfo, {
        deviceId: device.device_id,
        deviceFp: device.device_fp,
      })
    } else if (device.deviceName && device.deviceBoard && device.deviceModel && device.oaid && device.androidVersion && device.deviceFingerprint && device.deviceProduct) {
      await DeviceInfo.create(userInfo, {
        name: device.deviceName,
        board: device.deviceBoard,
        model: device.deviceModel,
        oaid: device.oaid,
        androidVersion: device.androidVersion,
        fingerprint: device.deviceFingerprint,
        product: device.deviceProduct,
      })
    } else {
      e.reply('设备信息不完整，请提供完整的设备信息', { at: true })
      return true
    }

    e.reply('设备绑定成功', { at: true })
    return true
  }
)
