import { fetchQRcode, getCookieAccountInfoByGameToken, getTokenByGameToken, queryQRcode } from '@/core/mys/api'
import { common } from '@/exports/utils'
import karin, { common as karinCommon, logger, segment } from 'node-karin'
import QR from 'qrcode'

const QRCodes: Map<string, string | true> = new Map()

export const MiHoYoLoginQRCode = karin.command(
  /^#?(扫码|米哈游)(登录|绑定)$/i,
  async (e) => {
    const qrcode = QRCodes.get(e.userId)
    if (qrcode) {
      if (qrcode === true) return true

      e.reply(['请使用米游社扫码登录', qrcode], {
        at: true, recallMsg: 60
      })

      return true
    }
    QRCodes.set(e.userId, true)

    const device = common.randomString(64, 'All')
    const QRcode = (await fetchQRcode.init(null).request({ device })).data
    if (!QRcode?.data?.url) {
      QRCodes.delete(e.userId)

      e.reply('获取二维码失败、请稍后再试...', { at: true })
      return true
    }

    const image = (await QR.toDataURL(QRcode.data.url)).replace('data:image/png;base64,', 'base64://')
    if (!image) {
      QRCodes.delete(e.userId)

      e.reply('生成二维码失败、请稍后再试...', { at: true })
      return true
    }

    QRCodes.set(e.userId, image)
    e.reply(['请使用米游社扫码登录', segment.image(image)], { at: true, recallMsg: 60 })
    setTimeout(() => {
      QRCodes.delete(e.userId)
    }, 5 * 60 * 1000)

    let data, Scanned
    const ticket = QRcode.data.url.split('ticket=')[1]
    for (let n = 1; n < 60; n++) {
      await karinCommon.sleep(5000)
      try {
        const res = (await queryQRcode.init(null).request({ device, ticket })).data
        if (!res) continue

        if (res.retcode === 3503) {
          QRCodes.delete(e.userId)

          e.reply(res.message, { at: true })
          return true
        }

        if (res.retcode !== 0) {
          QRCodes.delete(e.userId)

          e.reply('二维码已过期，请重新登录', { at: true })
          return true
        }

        if (res.data.stat === 'Scanned') {
          if (Scanned) {
            e.reply('二维码已扫描，请确认登录', { at: true })
          } else {
            Scanned = true

            QRCodes.set(e.userId, true)
          }
        } else if (res.data.stat === 'Confirmed') {
          data = JSON.parse(res.data.payload.raw) as { uid: string, token: string }

          break
        }
      } catch (err) {
        logger.error(err)

        break
      }
    }

    if (!data?.uid || !data?.token) {
      QRCodes.delete(e.userId)

      e.reply('米游社登录失败', { at: true })
      return true
    }

    const Token = (await getTokenByGameToken.init(null).request({
      account_id: parseInt(data.uid), game_token: data.token
    })).data
    if (!Token?.data?.token?.token) {
      QRCodes.delete(e.userId)

      e.reply('获取Token失败，请重新登录。', { at: true })
      return true
    }

    const stoken = `stoken=${Token.data.token.token};stuid=${Token.data.user_info.aid};mid=${Token.data.user_info.mid};`

    const CookieAccountInfo = (await getCookieAccountInfoByGameToken.init(null).request({
      account_id: data.uid, game_token: data.token
    })).data
    if (!CookieAccountInfo?.data?.cookie_token) {
      QRCodes.delete(e.userId)

      e.reply('获取CookieToken失败，请重新登录。', { at: true })
      return true
    }
    const cookie = `ltuid=${Token.data.user_info.aid};ltoken=${Token.data.token.token};cookie_token=${CookieAccountInfo.data.cookie_token};account_id=${Token.data.user_info.aid}`

    QRCodes.delete(e.userId)

    return true
  }
)
