import { MysAccountType } from '@/exports/database'
import { UserGameRoleItem } from '@/exports/mys'
import { BaseltuidInfo, BaseMysRes, DefineApi, MysApp, MysHosts } from '@/exports/mys/api'

export const fetchQRcode = new DefineApi<
  BaseMysRes & {
    data: {
      url: string
    }
  },
  { device: string }
>(
  (self, data) => ({
    Method: 'POST',
    Url: new URL(`${MysHosts.hk4eSdk}hk4e_cn/combo/panda/qrcode/fetch`),
    Body: {
      app_id: MysApp.appId,
      device: data.device
    },
    HeaderFn: self.NoHeaders
  })
)

export const queryQRcode = new DefineApi<
  BaseMysRes & {
    data: {
      stat: 'Scanned' | 'Confirmed',
      payload: {
        raw: string
      }
    }
  },
  { device: string, ticket: string }
>(
  (self, data) => ({
    Method: 'POST',
    Url: new URL(`${MysHosts.hk4eSdk}hk4e_cn/combo/panda/qrcode/query`),
    Body: {
      app_id: MysApp.appId,
      device: data.device,
      ticket: data.ticket
    },
    HeaderFn: self.NoHeaders
  })
)

export const getTokenByGameToken = new DefineApi<
  BaseMysRes & {
    data: {
      token: {
        token: string
      },
      user_info: {
        aid: string
        mid: string
      }
    }
  },
  { account_id: number, game_token: string }
>(
  (self, data) => ({
    Method: 'POST',
    Url: new URL(`${MysHosts.passport}account/ma-cn-session/app/getTokenByGameToken`),
    Body: {
      account_id: data.account_id,
      game_token: data.game_token
    },
    HeaderFn: self.PassportHeaders
  })
)

export const getCookieAccountInfoByGameToken = new DefineApi<
  BaseMysRes & {
    data: {
      cookie_token: string
    }
  },
  { account_id: string, game_token: string }
>(
  (self, data) => ({
    Method: 'GET',
    Url: new URL(`${MysHosts.web[MysAccountType.cn]}auth/api/getCookieAccountInfoByGameToken?account_id=${data.account_id}&game_token=${data.game_token}`),
    HeaderFn: self.NoHeaders
  })
)

export const getCookieTokenBySToken = new DefineApi<
  BaseMysRes & {
    data: {
      cookie_token: string
    }
  },
  { stoken: string, method: 'GET' | 'POST' }
>(
  (self, data) => ({
    Method: data.method,
    Url: (function () {
      const url = new URL(`${MysHosts.web[MysAccountType.cn]}auth/api/getCookieAccountInfoBySToken?game_biz=hk4e_cn&${data.stoken}`)
      if (self.isHoyolab) {
        url.searchParams.set('game_biz', 'hk4e_global')
        url.host = MysHosts.web[MysAccountType.os].replace(/^https?:\/\//, '')
      }
      return url
    }()),
    HeaderFn: self.NoHeaders
  })
)

export const getUserGameRolesByCookie = new DefineApi<
  BaseMysRes & {
    data: {
      list: UserGameRoleItem[]
    }
  },
  null,
  { cookie: string } & BaseltuidInfo
>(
  (self, data) => ({
    Method: 'GET',
    Url: new URL(`${MysHosts.web[self.isHoyolab ? MysAccountType.os : MysAccountType.cn]}binding/api/getUserGameRolesByCookie`),
    HeaderFn: self.CookieHeaders
  })
)
