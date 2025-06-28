import { MysAccountInfoDB, MysUserInfoDB } from '@/database'
import { BaseltuidInfo, BaseUserInfoType, DatabaseReturn, MysAccountInfoType, MysAccountType, RefreshUidData, StokenParms } from '@/types'
import { getCookieTokenBySToken, getUserGameRolesByCookie } from '../api'

export class BaseUserInfo<U extends BaseUserInfoType> {
  userId: BaseUserInfoType['userId']

  #ltuids: BaseUserInfoType['ltuids'] = []
  #stuids: BaseUserInfoType['stuids'] = []
  #deviceList: BaseUserInfoType['deviceList'] = []

  declare UserInfo: DatabaseReturn<BaseUserInfoType>
  #ltuidMap = new Map<string, DatabaseReturn<MysAccountInfoType>>()

  declare refresh: () => Promise<this>

  constructor (userId: string) {
    this.userId = userId
  }

  get ltuids () {
    return [...this.#ltuids]
  }

  get stuids () {
    return [...this.#stuids]
  }

  get deviceList () {
    return [...this.#deviceList]
  }

  async initMysAccountInfo (UserInfo: DatabaseReturn<BaseUserInfoType>) {
    this.UserInfo = UserInfo
    const { ltuids, stuids } = UserInfo

    this.#ltuidMap.clear()
    this.#ltuids = ltuids
    this.#stuids = stuids

    const idList = Array.from(new Set([...ltuids, ...stuids]))

    const MysAccountInfoList = await MysAccountInfoDB.findAllByPks(idList)
    MysAccountInfoList.forEach((MysAccountInfo) => {
      this.#ltuidMap.set(MysAccountInfo.ltuid, MysAccountInfo)
    })
  }

  getLtuidInfo (ltuid: string) {
    return Object.freeze(this.#ltuidMap.get(ltuid))
  }

  async saveUserInfo (data: U) {
    await this.UserInfo._save(data)
  }

  async saveMysAccountInfo (data: MysAccountInfoType) {
    let MysAccountInfo = this.#ltuidMap.get(data.ltuid)
    if (!MysAccountInfo) {
      MysAccountInfo = await MysAccountInfoDB.findByPk(data.ltuid, true)
    }

    await MysAccountInfo._save(data)
    this.#ltuidMap.set(data.ltuid, { ...MysAccountInfo, ...data })
  }
}

const refreshUidFnMap = new Map<string, (uidList: RefreshUidData) => void>()

export class UserInfo extends BaseUserInfo<BaseUserInfoType> {
  static async create (userId: string) {
    const userInfo = new BaseUserInfo<BaseUserInfoType>(userId)

    userInfo.refresh = async () => {
      const UserInfoData = await MysUserInfoDB.findByPk(userId, true)

      await userInfo.initMysAccountInfo(UserInfoData)

      return userInfo
    }

    return await userInfo.refresh()
  }

  static async refreshCookie (stokenParams: StokenParms, serv: MysAccountType): Promise<{
    Serv: MysAccountType, cookie: string, message: string
  }> {
    const res = await getCookieTokenBySToken(
      serv === MysAccountType.cn ? 'GET' : 'POST'
    ).request({
      stoken: new URLSearchParams({
        stoken: stokenParams.stoken,
        mid: stokenParams.mid,
        uid: stokenParams.stuid
      }).toString()
    })

    const result = { Serv: serv, cookie: '', message: '' }
    if (res?.retcode === -100) {
      result.message = '登录状态失效，请重新#扫码登录！'
    } else if (res?.data?.cookie_token) {
      result.cookie = `ltuid=${stokenParams.stuid};ltoken=${stokenParams.stoken};cookie_token=${res.data.cookie_token};account_id=${stokenParams.stuid}`
    } else {
      result.message = '获取Cookie失败，请重新#扫码登录！'
    }

    return result
  }

  static refreshUidFn (key: string, fn: (uidList: RefreshUidData) => void) {
    refreshUidFnMap.set(key, fn)
  }

  static refreshUid = async (options: { cookie: string } & BaseltuidInfo): Promise<{
    Serv: MysAccountType, uids: RefreshUidData, message: string
  }> => {
    let message = ''
    const uidList = { data: {}, names: {} }

    if (refreshUidFnMap.size > 0) {
      const res = await getUserGameRolesByCookie(options).request({})

      if (res?.retcode === 0) {
        refreshUidFnMap.forEach(fnc => fnc(uidList))
      } else if (res?.retcode === -100) {
        message = 'Cookie已失效，请重新#扫码登录或#刷新Cookie！'
      } else {
        message = res?.message || '刷新UID失败，请稍后再试！'
      }
    }

    return {
      Serv: options.type, uids: uidList, message
    }
  }
}
