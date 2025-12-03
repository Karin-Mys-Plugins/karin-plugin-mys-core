import { BaseUserInfoTableType, DatabaseReturn, DatabaseType, MysAccountInfoDB, MysAccountInfoTableType, MysAccountType, MysDeviceInfoDB, MysUserInfoDB, UidPermission } from '@/exports/database'
import { getCookieTokenBySToken, getUserGameRolesByCookie } from '@/exports/mys'
import lodash from 'node-karin/lodash'
import { BaseltuidInfoType, CookieParamsType, GameUserInfoBase, RefreshUidResultType, StokenParamsType } from '../types'
import { MysGame } from './game'

export class BaseUserInfo<U extends BaseUserInfoTableType> {
  userId: BaseUserInfoTableType['userId']

  ltuidMap = new Map<string, DatabaseReturn<MysAccountInfoTableType>[DatabaseType.Db]>()

  declare UserInfo: DatabaseReturn<U>[DatabaseType.Db]

  declare refresh: () => Promise<this>

  constructor (userId: string) {
    this.userId = userId
  }

  get ltuids () {
    return this.UserInfo.ltuids
  }

  get stuids () {
    return this.UserInfo.stuids
  }

  get deviceList () {
    return this.UserInfo.deviceList
  }

  get LtuidInfoList () {
    return Array.from(this.ltuidMap.values()).map(info => Object.freeze(info)).sort((a, b) => +a.ltuid - +b.ltuid)
  }

  async initMysAccountInfo (UserInfo: DatabaseReturn<U>[DatabaseType.Db], initAll: boolean) {
    this.UserInfo = UserInfo

    this.ltuidMap.clear()

    const idList = Array.from(new Set([...UserInfo.ltuids, ...UserInfo.stuids]))

    if (initAll) {
      const MysAccountInfoList = await (await MysAccountInfoDB()).findAllByPks(idList)
      MysAccountInfoList.forEach((MysAccountInfo) => {
        this.ltuidMap.set(MysAccountInfo.ltuid, MysAccountInfo)
      })
    } else {
      const self = this as unknown as GameUserInfoBase<any>
      const mainLtuid = self.bind_uids?.[self.main_uid]?.ltuid

      if (mainLtuid) {
        const MysAccountInfo = await (await MysAccountInfoDB()).findByPk(mainLtuid)
        MysAccountInfo && this.ltuidMap.set(MysAccountInfo.ltuid, MysAccountInfo)
      }
    }
  }

  getLtuidInfo (ltuid: string) {
    return Object.freeze(this.ltuidMap.get(ltuid))
  }

  async getDeviceInfoList () {
    return await (await MysDeviceInfoDB()).findAllByPks(this.deviceList)
  }

  async saveUserInfo (data: Partial<U>) {
    await this.UserInfo.save(data)
  }

  async saveMysAccountInfo (ltuid: string, data: Partial<MysAccountInfoTableType>) {
    let MysAccountInfo = this.ltuidMap.get(ltuid)
    if (!MysAccountInfo) {
      MysAccountInfo = await (await MysAccountInfoDB()).findByPk(ltuid, true)
    }

    await MysAccountInfo.save(data)
    this.ltuidMap.set(ltuid, { ...MysAccountInfo, ...data })
  }
}

export class UserInfo extends BaseUserInfo<BaseUserInfoTableType> {
  static async create (userId: string, initAll: boolean = false): Promise<UserInfo> {
    const userInfo = new BaseUserInfo<BaseUserInfoTableType>(userId)

    userInfo.refresh = async () => {
      const UserInfoData = await (await MysUserInfoDB()).findByPk(userId, true)

      await userInfo.initMysAccountInfo(UserInfoData, initAll)

      return userInfo
    }

    return await userInfo.refresh()
  }

  static async refreshUid (options: { userId: string, cookie: string } & BaseltuidInfoType, perm: UidPermission): Promise<RefreshUidResultType> {
    let message = ''

    const uids: RefreshUidResultType['uids'] = []

    if (MysGame.num > 0) {
      const res = (await (await getUserGameRolesByCookie.initDevice(options)).request(null)).data

      if (res?.retcode === 0) {
        await MysGame.forEachGame(async Game => {
          const uidList = new Set(await Game.refresh(res.data.list, options))

          const userInfo = await Game.UserInfo.create(options.userId)
          const bindUids = userInfo.bind_uids
          uidList.forEach(uid => {
            if (!(uid in bindUids) || bindUids[uid]!.perm < perm) {
              bindUids[uid] = {
                perm, ltuid: options.ltuid
              }
            }
          })

          lodash.forEach(bindUids, (info, uid) => {
            if (!uidList.has(uid) && info?.ltuid === options.ltuid) {
              bindUids[uid] = {
                perm: UidPermission.BIND, ltuid: ''
              }
            }
          })

          uids.push({
            name: Game.name,
            columnKey: Game.columnKey,
            data: bindUids
          })
        })
      } else if (res?.retcode === -100) {
        message = 'Cookie已失效，请重新#扫码登录或#刷新Cookie！'
      } else {
        message = res?.message || '刷新UID失败，请稍后再试！'
      }
    }

    return {
      Serv: options.type, uids, message
    }
  }

  static async refreshCookie (stokenParams: StokenParamsType, serv: MysAccountType | MysAccountType[]): Promise<
    { Serv: MysAccountType, cookieParams: CookieParamsType; message: string }
  > {
    if (Array.isArray(serv)) {
      for (const s of serv) {
        const res = await UserInfo.refreshCookie(stokenParams, s)

        if (Object.keys(res.cookieParams).length > 0) {
          return res
        }
      }

      return {
        Serv: MysAccountType.cn, cookieParams: {}, message: '获取Cookie失败，请重新#扫码登录！'
      }
    }

    const res = (await getCookieTokenBySToken.init(null).request({
      stoken: new URLSearchParams({
        stoken: stokenParams.stoken,
        mid: stokenParams.mid,
        uid: stokenParams.stuid
      }).toString(),
      method: serv === MysAccountType.cn ? 'GET' : 'POST'
    })).data

    let message = ''
    let cookieParams: CookieParamsType = {}

    if (res?.retcode === -100) {
      message = '登录状态失效，请重新#扫码登录！'
    } else if (res?.data?.cookie_token) {
      cookieParams = {
        ltuid: stokenParams.stuid,
        ltoken: stokenParams.stoken,
        cookie_token: res.data.cookie_token,
        account_id: stokenParams.stuid
      }
    } else {
      message = '获取Cookie失败，请重新#扫码登录！'
    }

    return {
      Serv: serv, cookieParams, message
    }
  }
}
