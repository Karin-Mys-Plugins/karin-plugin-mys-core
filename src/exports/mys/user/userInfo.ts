import { getCookieTokenBySToken, getUserGameRolesByCookie } from '@/core/mys/api'
import { BaseUserInfoTableType, DatabaseReturn, DatabaseType, MysAccountInfoDB, MysAccountInfoTableType, MysAccountType, MysDeviceInfoDB, MysUserInfoDB } from '@/exports/database'
import { BaseltuidInfo, CookieParmsType, RefreshUidData, StokenParmsType, UidPermission } from '../types'

export class BaseUserInfo<U extends BaseUserInfoTableType> {
  userId: BaseUserInfoTableType['userId']

  #ltuidMap = new Map<string, DatabaseReturn<MysAccountInfoTableType>[DatabaseType.Db]>()

  declare UserInfo: DatabaseReturn<BaseUserInfoTableType>[DatabaseType.Db]

  declare refresh: () => Promise<this>

  constructor (userId: string) {
    this.userId = userId
  }

  get ltuids () {
    return [...this.UserInfo.ltuids]
  }

  get stuids () {
    return [...this.UserInfo.stuids]
  }

  get deviceList () {
    return [...this.UserInfo.deviceList]
  }

  async initMysAccountInfo (UserInfo: DatabaseReturn<BaseUserInfoTableType>[DatabaseType.Db]) {
    this.UserInfo = UserInfo

    this.#ltuidMap.clear()

    const idList = Array.from(new Set([...UserInfo.ltuids, ...UserInfo.stuids]))

    const MysAccountInfoList = await (await MysAccountInfoDB()).findAllByPks(idList)
    MysAccountInfoList.forEach((MysAccountInfo) => {
      this.#ltuidMap.set(MysAccountInfo.ltuid, MysAccountInfo)
    })
  }

  getLtuidInfo (ltuid: string) {
    return Object.freeze(this.#ltuidMap.get(ltuid))
  }

  getLtuidInfoList () {
    return Array.from(this.#ltuidMap.values()).map(info => Object.freeze(info))
  }

  async getDeviceInfoList () {
    return await (await MysDeviceInfoDB()).findAllByPks(this.deviceList)
  }

  async saveUserInfo (data: Partial<U>) {
    await this.UserInfo.save(data)
  }

  async saveMysAccountInfo (ltuid: string, data: Partial<MysAccountInfoTableType>) {
    let MysAccountInfo = this.#ltuidMap.get(ltuid)
    if (!MysAccountInfo) {
      MysAccountInfo = await (await MysAccountInfoDB()).findByPk(ltuid, true)
    }

    await MysAccountInfo.save(data)
    this.#ltuidMap.set(ltuid, { ...MysAccountInfo, ...data })
  }
}

const refreshUidFClassMap = new Map<string, RefreshUidData>()

export class UserInfo extends BaseUserInfo<BaseUserInfoTableType> {
  static async create (userId: string) {
    const userInfo = new BaseUserInfo<BaseUserInfoTableType>(userId)

    userInfo.refresh = async () => {
      const UserInfoData = await (await MysUserInfoDB()).findByPk(userId, true)

      await userInfo.initMysAccountInfo(UserInfoData)

      return userInfo
    }

    return await userInfo.refresh()
  }

  static addRefreshUidDataClass (refreshClass: RefreshUidData) {
    refreshUidFClassMap.set(refreshClass.columnKey, refreshClass)
  }

  static async refreshUid (options: { cookie: string } & BaseltuidInfo) {
    let message = ''

    const uids: {
      name: string,
      columnKey: `${string}-uids`,
      data: Record<string, UidPermission>
    }[] = []

    if (refreshUidFClassMap.size > 0) {
      const res = (await getUserGameRolesByCookie.init(options).request(null)).data

      if (res?.retcode === 0) {
        refreshUidFClassMap.forEach(refreshClass => {
          uids.push({
            name: refreshClass.name,
            columnKey: refreshClass.columnKey,
            data: refreshClass.refresh(res.data.list)
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

  static async refreshCookie (stokenParams: StokenParmsType, serv: MysAccountType) {
    const res = (await getCookieTokenBySToken.init(null).request({
      stoken: new URLSearchParams({
        stoken: stokenParams.stoken,
        mid: stokenParams.mid,
        uid: stokenParams.stuid
      }).toString(),
      method: serv === MysAccountType.cn ? 'GET' : 'POST'
    })).data
    let message = ''
    let cookieParms: CookieParmsType = {}

    if (res?.retcode === -100) {
      message = '登录状态失效，请重新#扫码登录！'
    } else if (res?.data?.cookie_token) {
      cookieParms = {
        ltuid: stokenParams.stuid,
        ltoken: stokenParams.stoken,
        cookie_token: res.data.cookie_token,
        account_id: stokenParams.stuid
      }
    } else {
      message = '获取Cookie失败，请重新#扫码登录！'
    }

    return {
      Serv: serv, cookieParms, message
    }
  }
}
