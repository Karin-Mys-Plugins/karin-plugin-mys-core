import { Render } from '@/core'
import { DatabaseReturn, DatabaseType, MysAccountInfoTableType, UidPermission } from '@/exports/database'
import { GameUserInfoBase, MysGame, UserInfo } from '@/exports/mys'
import karin, { handler, Message, segment } from 'node-karin'

export const BindUID = karin.command(
  /^#?(.*?)绑定uid(?:\s*(.+))?$/i,
  async (e, next) => {
    const msgMatch = e.msg.match(/^#?(?<prefix>.*?)绑定uid(?:\s*(?<uid>.+))?$/i)?.groups!

    const Game = MysGame.match(msgMatch.prefix?.trim() || '')
    if (!Game) return next()

    const uid = msgMatch.uid?.trim()
    if (!uid) {
      e.reply('请提供要绑定的游戏UID！', { at: true })

      return true
    }

    const userInfo = await Game.UserInfo.create(e.userId)

    const bindUids = userInfo.bind_uids
    if (!(uid in bindUids)) {
      bindUids[uid] = { perm: UidPermission.BIND, ltuid: '' }
    }

    await userInfo.saveUserInfo({
      [Game.game + '-main']: uid, [Game.game + '-uids']: bindUids
    })

    await handler.call(`MYS.${Game.game}.ShowUID`, { e })

    return true
  }
)

const getMainUid = (uid: string, mainUid: string, bindUids: GameUserInfoBase<any>['bind_uids']) => {
  if (mainUid !== uid) return mainUid

  const filterUids = Object.entries(bindUids).filter(value => value[1]!.perm !== UidPermission.DEL)
  if (filterUids.length > 0) return filterUids[0][0]

  return ''
}

export const UnbindUID = karin.command(
  /^#?(.*?)(删除|解绑)uid(?:\s*(.+))?$/i,
  async (e, next) => {
    const msgMatch = e.msg.match(/^#?(?<prefix>.*?)(删除|解绑)uid(?:\s*(?<idx>.+))?$/i)?.groups!

    const Game = MysGame.match(msgMatch.prefix?.trim() || '')
    if (!Game) return next()

    const uid = msgMatch.idx?.trim()
    const idx = +uid.split('.')[0]
    if (isNaN(idx)) {
      e.reply('请正确提供要解绑的游戏UID或序号！', { at: true })

      return true
    }

    const userInfo = await Game.UserInfo.create(e.userId)

    const bindUids = userInfo.bind_uids

    let delUid = uid
    if (idx <= 10000) {
      const filterUids = Object.entries(bindUids).filter(value => value[1]!.perm !== UidPermission.DEL)
      if (idx > filterUids.length || idx <= 0) {
        e.reply('UID序号不存在，请检查后重新输入！', { at: true })

        return 'break'
      }

      delUid = filterUids[idx - 1][0]
    }
    if (delUid in bindUids) {
      if (bindUids[delUid]!.perm === UidPermission.BIND) {
        delete bindUids[delUid]
      } else {
        bindUids[delUid]!.perm = UidPermission.DEL
      }
    } else {
      e.reply('UID未绑定，请检查后重新输入！', { at: true })

      return 'break'
    }

    const mainUid = getMainUid(delUid, userInfo.main_uid, bindUids)

    await userInfo.saveUserInfo({
      [Game.game + '-main']: mainUid, [Game.game + '-uids']: bindUids
    })

    await handler.call(`MYS.${Game.game}.ShowUID`, { e })

    return true
  }
)

export const ShowBindAccountCmdFunc = async (e: Message) => {
  const userInfo = await UserInfo.create(e.userId, true)

  const renderData: {
    User: {
      userId: string
      avatar: string
      nickname: string
    },
    AccountList: {
      ltuid: string
      permission: UidPermission
      bindUids: {
        gameName: string
        uids: { uid: string, perm: UidPermission }[]
      }[]
    }[]
  } = {
    User: {
      userId: e.userId,
      avatar: await e.bot.getAvatarUrl(e.userId, 100),
      nickname: e.contact.name
    },
    AccountList: []
  }

  const ltuidInfoList = userInfo.LtuidInfoList
  if (ltuidInfoList.length > 0) {
    for (const ltuidInfo of ltuidInfoList) {
      const data = {
        ltuid: ltuidInfo.ltuid,
        permission: UidPermission.BIND,
        bindUids: [] as {
          gameName: string
          uids: { uid: string, perm: UidPermission }[]
        }[]
      }

      if (ltuidInfo.cookie) {
        data.permission += UidPermission.CK
      }
      if (ltuidInfo.stoken) {
        data.permission += UidPermission.ST
      }

      await MysGame.forEachGame(async Game => {
        const gameUserInfo = await Game.UserInfo.create(e.userId)

        data.bindUids.push({
          gameName: Game.name,
          uids: Object.entries(gameUserInfo.bind_uids).filter(([, info]) => info!.ltuid === ltuidInfo.ltuid).map(([uid, info]) => ({
            uid, perm: info!.perm
          }))
        })
      })

      renderData.AccountList.push(data)
    }
  }

  const image = await Render.template('ShowBindAccount', renderData)
  image && e.reply(segment.image(image), { at: true })

  return true
}

export const ShowBindAccount = karin.command(
  /^#?(米游社|mys)账号(列表)?$/i, ShowBindAccountCmdFunc
)

export const UnbindAccount = karin.command(
  /^#?(删除|解绑)(米游社|mys)账号(?:\s*(.+))?$/i,
  async (e) => {
    const msgMatch = e.msg.match(/^#?(删除|解绑)(米游社|mys)账号(?:\s*(?<idx>.+))?$/i)?.groups!

    const uid = msgMatch.idx?.trim()
    const idx = +uid.split('.')[0]
    if (isNaN(idx)) {
      e.reply('请正确提供要解绑的米游社UID或序号！', { at: true })

      return true
    }

    const userInfo = await UserInfo.create(e.userId, true)

    let ltuidInfo: DatabaseReturn<MysAccountInfoTableType>[DatabaseType.Db] | undefined
    const ltuidInfoList = userInfo.LtuidInfoList
    if (idx < 10000) {
      if (idx > ltuidInfoList.length || idx <= 0) {
        e.reply('米游社UID序号不存在，请检查后重新输入！', { at: true })

        return true
      }
      ltuidInfo = ltuidInfoList[idx - 1]
    } else {
      ltuidInfo = ltuidInfoList.find(info => info.ltuid === uid)

      if (!ltuidInfo) {
        e.reply('米游社UID未绑定，请检查后重新输入！', { at: true })

        return true
      }
    }

    const ltuid = ltuidInfo.ltuid
    await ltuidInfo.destroy()

    await userInfo.saveUserInfo({
      ltuids: userInfo.ltuids.remove(ltuid),
      stuids: userInfo.stuids.remove(ltuid)
    })

    await MysGame.forEachGame(async Game => {
      const gameUserInfo = await Game.UserInfo.create(e.userId)
      const bindUids = gameUserInfo.bind_uids

      for (const uid in bindUids) {
        if (bindUids[uid]!.ltuid === ltuid) {
          bindUids[uid]!.perm = UidPermission.BIND
        }
      }
    })

    return await ShowBindAccountCmdFunc(e)
  }
)
