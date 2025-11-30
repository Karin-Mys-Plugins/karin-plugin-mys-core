import { MysAccountType } from '@/exports/database'
import { DeviceInfo, UserInfo } from '@/exports/mys'
import karin, { Message } from 'node-karin'

export const BindMysDevice = karin.command(
  /^#绑定(米游社|mys)?设备$/,
  async (e) => {
    const userInfo = await UserInfo.create(e.userId)
    const ltuidInfoList = userInfo.LtuidInfoList
    const cnLtuidInfoList = ltuidInfoList.filter(info => info.type === MysAccountType.cn)

    if (cnLtuidInfoList.length === 0) {
      if (ltuidInfoList.length === 0) {
        e.reply('暂未绑定国服米游社账号，请先“#米游社绑定”进行绑定！', { at: true })
      } else {
        e.reply('国际服暂不需要绑定设备。', { at: true })
      }
      return true
    }

    e.reply('请发送设备信息(建议私聊发送)，或者发送“取消”取消绑定', { at: true })

    const ctx = await karin.ctx(e)
    if (/^#?取消(绑定)?/.test(ctx.msg)) {
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

    let deviceMD5 = ''
    if (device.deviceName && device.deviceBoard && device.deviceModel && device.oaid && device.androidVersion && device.deviceFingerprint && device.deviceProduct) {
      deviceMD5 = await DeviceInfo.create(e.userId, {
        name: device.deviceName,
        board: device.deviceBoard,
        model: device.deviceModel,
        oaid: device.oaid,
        version: +device.androidVersion,
        fingerprint: device.deviceFingerprint,
        product: device.deviceProduct,
        deviceId: device.device_id || crypto.randomUUID(),
        deviceFp: device.device_fp || '',
      })
    } else if (device.device_id && device.device_fp) {
      deviceMD5 = await DeviceInfo.create(e.userId, {
        deviceId: device.device_id,
        deviceFp: device.device_fp,
      })
    } else {
      e.reply('设备信息不完整，请提供完整的设备信息', { at: true })

      return true
    }

    await userInfo.saveUserInfo({
      deviceList: userInfo.deviceList.add(deviceMD5, true)
    })

    return await ShowBindDeviceCmdFuc(e)
  }
)

const ShowBindDeviceCmdFuc = async (e: Message) => {
  e.reply('设备绑定成功', { at: true })

  return true
}

// export const ShowBindMysDevice = karin.command(
//   /^#?(米游社|mys)设备(列表)?$/, ShowBindDeviceCmdFuc
// )
