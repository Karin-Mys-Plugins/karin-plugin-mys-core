import { BaseGameUIDInfoTableType, MysAccountType, UidPermission, } from '@/exports/database'
import { CookieParamsType, fetchQRcode, getCookieAccountInfoByGameToken, getTokenByGameToken, getUserFullInfo, queryQRcode, RefreshUidResultType, StokenParamsType, UserInfo } from '@/exports/mys'
import { common } from '@/exports/utils'
import karin, { common as karinCommon, logger, segment } from 'node-karin'
import QR from 'qrcode'
import { ShowBindAccountCmdFunc } from './UIDManage'

const QRCodes: Map<string, string | true> = new Map()

export const MiHoYoLoginQRCode = karin.command(
  /^#?(扫码|米哈游|mys)(登录|绑定)$/i,
  async (e) => {
    const qrcode = QRCodes.get(e.userId)
    if (qrcode) {
      if (qrcode === true) return true

      e.reply(['请使用米游社扫码登录', segment.image(qrcode)], {
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

    const stokenParams: StokenParamsType = {
      stuid: Token.data.user_info.aid,
      stoken: Token.data.token.token,
      mid: Token.data.user_info.mid
    }

    const CookieAccountInfo = (await getCookieAccountInfoByGameToken.init(null).request({
      account_id: data.uid, game_token: data.token
    })).data
    if (!CookieAccountInfo?.data?.cookie_token) {
      QRCodes.delete(e.userId)

      e.reply('获取CookieToken失败，请重新登录。', { at: true })
      return true
    }
    const cookieParams: CookieParamsType = {
      ltuid: stokenParams.stuid,
      ltoken: stokenParams.stoken,
      cookie_token: CookieAccountInfo.data.cookie_token,
      account_id: stokenParams.stuid
    }

    const errMsg = await BindStoken(e.userId, stokenParams, { cookieParams, Serv: MysAccountType.cn })
    if (errMsg) {
      e.reply(errMsg, { at: true })

      return true
    }

    QRCodes.delete(e.userId)

    return await ShowBindAccountCmdFunc(e)
  }
)

export const BindCookieByMessage = karin.command(
  /^#?绑定(米游社)?(cookie|ck)$/i,
  async (e) => {
    const cookieMsg = e.msg.replace(/^#?绑定(米游社)?(cookie|ck)/i, '').trim()

    const cookieObj = common.StrToObj(cookieMsg.replace(/[#'" ]/g, ''), ';')

    const errMsg = await BindCookie(e.userId, cookieObj, UidPermission.CK)
    if (errMsg) {
      e.reply(errMsg, { at: true })

      return true
    }

    return await ShowBindAccountCmdFunc(e)
  }
)

export const BindStokenByMessage = karin.command(
  /^#?绑定(米游社)?(stoken|sk)$/i,
  async (e) => {
    const stokenMsg = e.msg.replace(/^#?绑定(米游社)?(stoken|sk)$/i, '').trim()

    const stokenObj = common.StrToObj(stokenMsg.replace(/[#'" ]/g, ''), ';')

    if (!stokenObj.stoken || !(stokenObj.stuid || stokenObj.ltuid) || !stokenObj.mid) {
      e.reply('发送Stoken不完整，建议使用#米哈游登录', { at: true })

      return true
    }

    const errMsg = await BindStoken(e.userId, {
      stuid: stokenObj.stuid || stokenObj.ltuid!,
      stoken: stokenObj.stoken,
      mid: stokenObj.mid
    })
    if (errMsg) {
      e.reply(errMsg, { at: true })

      return true
    }

    return await ShowBindAccountCmdFunc(e)
  }
)

const BindStoken = async (userId: string, stokenParams: StokenParamsType, option?: { cookieParams: CookieParamsType, Serv: MysAccountType }) => {
  const updata = Object.keys(option?.cookieParams || {}).length > 0
    ? { Serv: option!.Serv, cookieParams: option!.cookieParams, message: '' }
    : await UserInfo.refreshCookie(stokenParams, option?.Serv ?? [MysAccountType.cn, MysAccountType.os])

  if (updata.message) return updata.message

  const userInfo = await UserInfo.create(userId)

  await userInfo.saveUserInfo({
    stuids: userInfo.stuids.add(stokenParams.stuid, true)
  })

  await userInfo.saveMysAccountInfo(stokenParams.stuid, {
    type: updata.Serv, stoken: common.ObjToStr(stokenParams as any, ';')
  })

  logger.mark(`[${userId}] 保存Stoken成功 [stuid: ${stokenParams.stuid}]`)

  const errMsg = await BindCookie(userId, updata.cookieParams, UidPermission.CS, updata.Serv)
  if (errMsg) return errMsg

  return false
}

const BindCookie = async (userId: string, cookieObj: CookieParamsType, perm: UidPermission, Serv?: MysAccountType) => {
  if (!cookieObj.cookie_token && !cookieObj.cookie_token_v2) {
    return '发送Cookie不完整(cookie_token缺失)，建议使用#米哈游登录。'
  }

  const ltuid = cookieObj.ltuid || cookieObj.login_uid || cookieObj.ltuid_v2 || cookieObj.account_id_v2 || cookieObj.ltmid_v2
  if (!ltuid) return '发送Cookie不完整，建议使用#米哈游登录。'

  let cookieParams: CookieParamsType = {}
  let flagV2 = false
  if (cookieObj.cookie_token_v2 && (cookieObj.account_mid_v2 || cookieObj.ltmid_v2)) {
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

  const userInfo = await UserInfo.create(userId)

  const uidList: RefreshUidResultType = await (async () => {
    const errMsg = []
    for (const serv of Serv ? [Serv] : [MysAccountType.cn, MysAccountType.os]) {
      const result = await UserInfo.refreshUid({
        userId, type: serv, ltuid, cookie: cookieStr, deviceMd5: userInfo.deviceList[0] || ''
      }, perm)

      if (!result.message) return result

      errMsg.push(result.message)
    }

    return {
      Serv: Serv || MysAccountType.cn, uids: [], mains: [], message: errMsg.pop() || ''
    }
  })()

  if (uidList.message) return uidList.message

  if (flagV2 && isNaN(+cookieParams.ltuid!)) {
    const userFullInfo = (await getUserFullInfo.init({
      type: uidList.Serv, ltuid, cookie: cookieStr, deviceMd5: ''
    }).request(null)).data

    if (userFullInfo.data.user_info.uid) {
      cookieParams.ltuid = cookieParams.account_id = userFullInfo.data.user_info.uid
    } else {
      logger.mark(`绑定Cookie错误2：${userFullInfo?.message || 'Cookie错误'}`)

      return `绑定Cookie失败：${userFullInfo?.message || 'Cookie错误'}`
    }
  }

  await userInfo.saveUserInfo({
    ...uidList.uids.reduce((acc, cur) => {
      acc[cur.columnKey] = cur.data
      return acc
    }, {} as Record<`${string}-uids`, BaseGameUIDInfoTableType<string>[`${string}-uids`]>),
    ...uidList.mains.reduce((acc, cur) => {
      acc[cur.columnKey] = cur.data
      return acc
    }, {} as Record<`${string}-main`, string>),
    ltuids: userInfo.ltuids.add(cookieParams.ltuid!, true),
  })

  await userInfo.saveMysAccountInfo(cookieParams.ltuid!, {
    type: uidList.Serv, cookie: common.ObjToStr(cookieParams, ';'),
  })

  logger.mark(`[${userId}] 保存Cookie成功 [ltuid:${cookieParams.ltuid}]`)

  return false
}
