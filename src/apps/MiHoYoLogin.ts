import { fetchQRcode, getCookieAccountInfoByGameToken, getTokenByGameToken, getUserFullInfo, queryQRcode, UserInfo } from '@/core'
import { MysAccountType, RefreshUidData, StokenParms } from '@/types'
import { common } from '@/utils'
import karin, { common as karinCommon, logger, segment } from 'node-karin'
import lodash from 'node-karin/lodash'
import QR from 'qrcode'

const QRCodes: Map<string, string | true> = new Map()

export const MiHoYoLoginQRCode = karin.command(
  /^#?(扫码|二维码|辅助)(登录|绑定|登陆)$/i,
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

    const QRcode = await fetchQRcode().request({ device })
    if (!QRcode?.data?.url) {
      QRCodes.delete(e.userId)
      e.reply('获取二维码失败、请稍后再试', { at: true })
      return true
    }

    const image = (await QR.toDataURL(QRcode.data.url)).replace('data:image/png;base64,', 'base64://')
    if (!image) {
      QRCodes.delete(e.userId)
      e.reply('生成二维码失败、请稍后再试', { at: true })
      return true
    }
    QRCodes.set(e.userId, image)
    e.reply(['请使用米游社扫码登录', segment.image(image)], { at: true, recallMsg: 60 })

    let data, Scanned
    const ticket = QRcode.data.url.split('ticket=')[1]
    for (let n = 1; n < 60; n++) {
      await karinCommon.sleep(5000)
      try {
        const res = await queryQRcode().request({ device, ticket })
        if (!res) continue

        if (res.retcode === 3503) {
          e.reply(res.message, { at: true, recallMsg: 60 })
          QRCodes.delete(e.userId)
          return true
        }

        if (res.retcode !== 0) {
          e.reply('二维码已过期，请重新登录', { at: true, recallMsg: 60 })
          QRCodes.delete(e.userId)
          return true
        }

        if (res.data.stat === 'Scanned') {
          if (Scanned) {
            e.reply('二维码已扫描，请确认登录', { at: true, recallMsg: 60 })
          } else {
            Scanned = true
            QRCodes.set(e.userId, true)
          }
        }

        if (res.data.stat === 'Confirmed') {
          data = JSON.parse(res.data.payload.raw) as { uid: string, token: string }
          break
        }
      } catch (err) {
        logger.error(err)
        break
      }
    }
    if (!data?.uid && !data?.token) {
      e.reply('米游社登录失败', { at: true })
      QRCodes.delete(e.userId)
      return true
    }

    const res = await getTokenByGameToken().request({
      account_id: parseInt(data.uid), game_token: data.token
    })
    if (!res) {
      e.reply('获取Token失败', { at: true })
      QRCodes.delete(e.userId)

      return true
    }

    const stoken = `stoken=${res.data.token.token};stuid=${res.data.user_info.aid};mid=${res.data.user_info.mid};`

    const res2 = await getCookieAccountInfoByGameToken().request({
      account_id: data.uid, game_token: data.token
    })
    const cookie = `ltuid=${res.data.user_info.aid};ltoken=${res.data.token.token};cookie_token=${res2.data.cookie_token};account_id=${res.data.user_info.aid}`

    const message = await bingStoken(e.userId, stoken, { cookie, Serv: MysAccountType.cn })
    e.reply(message, { at: true })

    QRCodes.delete(e.userId)

    return true
  }
)

const bingCookie = async (userId: string, cookie: string, Serv: MysAccountType = MysAccountType.cn): Promise<string> => {
  const cookieObj = common.StrToObj(cookie.replace(/[#'" ]/g, ''), ';')
  if (!cookieObj.cookie_token && !cookieObj.cookie_token_v2) {
    return '发送Cookie不完整，建议使用#扫码登录'
  }

  const ltuid = cookieObj.ltuid || cookieObj.login_uid || cookieObj.ltuid_v2 || cookieObj.account_id_v2 || cookieObj.ltmid_v2
  if (!ltuid) {
    return '发送Cookie不完整，建议使用#扫码登录'
  }

  let cookieParams: Record<string, any> = {}
  let flagV2 = false
  if (cookieObj.cookie_token_v2 && (cookieObj.account_mid_v2 || cookieObj.ltmid_v2)) { //
    // account_mid_v2 为版本必须带的字段，不带的话会一直提示绑定cookie失败 请重新登录
    flagV2 = true
    cookieParams = {
      ltuid,
      account_mid_v2: cookieObj.account_mid_v2,
      cookie_token_v2: cookieObj.cookie_token_v2,
      ltoken_v2: cookieObj.ltoken_v2,
      ltmid_v2: cookieObj.ltmid_v2
    }
  } else {
    cookieParams = {
      ltuid,
      account_id: ltuid,
      ltoken: cookieObj.ltoken,
      cookie_token: cookieObj.cookie_token || cookieObj.cookie_token_v2
    }
  }
  if (cookieObj.mi18nLang) {
    cookieParams.mi18nLang = cookieObj.mi18nLang
  }

  const cookieStr = common.ObjToStr(cookieParams, ';')

  let uidList: {
    Serv: MysAccountType
    uids: RefreshUidData
    message: string
  } = {
    Serv,
    uids: { data: {}, names: {} },
    message: '刷新UID失败，请稍后再试！'
  }
  for (const serv of Serv ? [Serv] : [MysAccountType.cn, MysAccountType.os]) {
    uidList = await UserInfo.refreshUid({
      type: serv, ltuid, cookie: cookieStr,
    })
    if (!uidList.message) break
  }
  if (uidList.message) {
    return uidList.message
  }

  if (flagV2 && isNaN(Number(cookieParams.ltuid))) {
    const userFullInfo = await getUserFullInfo({
      type: uidList.Serv, ltuid, cookie: cookieStr,
    }).request({})

    if (userFullInfo?.data?.user_info) {
      if (userFullInfo.data.user_info.uid) {
        cookieParams.ltuid = cookieParams.account_id = userFullInfo.data.user_info.uid
      }
    } else {
      logger.mark(`绑定Cookie错误2：${userFullInfo?.message || 'Cookie错误'}`)
      return `绑定Cookie失败：${userFullInfo?.message || 'Cookie错误'}`
    }
  }

  const userInfo = await UserInfo.create(userId)
  await userInfo.saveUserInfo({
    userId,
    ...uidList.uids.data,
    ltuids: lodash.uniq([...userInfo.ltuids, cookieParams.ltuid]),
    stuids: userInfo.stuids,
    deviceList: userInfo.deviceList,
  })

  const ltuidInfo = userInfo.getLtuidInfo(cookieParams.ltuid)
  await userInfo.saveMysAccountInfo({
    ltuid: cookieParams.ltuid,
    type: uidList.Serv,
    cookie: common.ObjToStr(cookieParams, ';'),
    stoken: ltuidInfo?.stoken || '',
    deviceId: ltuidInfo?.deviceId || ''
  })

  logger.mark(`[${userId}] 保存Cookie成功 [ltuid:${cookieParams.ltuid}]`)

  const sendMsg: string[] = []
  lodash.forEach(uidList.uids.data, (uids, game) => {
    sendMsg.push(`【${uidList.uids.names[game]}】：${uids.join('、')}`)
  })

  return `Cookie绑定成功！\n${sendMsg.join('\n')}`
}

const bingStoken = async (userId: string, stoken: string, option?: { cookie: string, Serv: MysAccountType }): Promise<string> => {
  const { cookie = '', Serv = MysAccountType.cn } = option || {}
  const stokenObj = common.StrToObj(stoken.replace(/[#'" ]/g, ''), ';')

  if (!stokenObj.stoken || !(stokenObj.stuid || stokenObj.ltuid) || !stokenObj.mid) {
    return '发送Stoken不完整，建议使用#扫码登录'
  }

  const stokenParams: StokenParms = {
    stuid: stokenObj.stuid || stokenObj.ltuid!,
    stoken: stokenObj.stoken,
    mid: stokenObj.mid
  }

  let updata: { Serv: MysAccountType, cookie: string; message: string } = { Serv, cookie, message: '' }
  if (!updata.cookie) {
    for (const serv of Serv ? [Serv] : [MysAccountType.cn, MysAccountType.os]) {
      updata = await UserInfo.refreshCookie(stokenParams, serv)
      if (updata.cookie) break
    }
    if (updata.message) {
      return updata.message
    }
  }

  const Stoken = common.ObjToStr(stokenParams as any, ';')

  const userInfo = await UserInfo.create(userId)
  await userInfo.saveUserInfo({
    userId,
    ltuids: userInfo.ltuids,
    stuids: lodash.uniq([...userInfo.stuids, stokenParams.stuid]),
    deviceList: userInfo.deviceList,
  })

  const ltuidInfo = userInfo.getLtuidInfo(stokenParams.stuid)
  await userInfo.saveMysAccountInfo({
    ltuid: stokenParams.stuid,
    type: updata.Serv,
    cookie: ltuidInfo?.cookie || '',
    stoken: Stoken,
    deviceId: ltuidInfo?.deviceId || ''
  })

  logger.mark(`[${userId}] 保存Stoken成功 [stuid: ${stokenParams.stuid}]`)

  const sendMsg = []
  sendMsg.push(`米游社ID：${stokenParams.stuid}\nStoken绑定成功！`)
  sendMsg.push(await bingCookie(userId, updata.cookie, updata.Serv))

  return sendMsg.join('\n')
}
