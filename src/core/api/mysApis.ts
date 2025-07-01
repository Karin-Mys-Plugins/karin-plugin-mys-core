import { BaseltuidInfo, BaseMysRes, MysAccountType, UserGameRoleItem } from '@/types'
import lodash from 'node-karin/lodash'
import { DefineMysApi, MysApp, MysHosts } from '.'

export const fetchQRcode = () => new DefineMysApi<
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
      device: data!.device
    },
    HeaderFn: self.NoHeaders
  })
)

export const queryQRcode = () => new DefineMysApi<
  BaseMysRes & {
    data: {
      stat: 'Scanned' | 'Confirmed',
      payload: {
        raw: string
      }
    }
  },
  { device: string, ticket: string }
>((self, data) => ({
  Method: 'POST',
  Url: new URL(`${MysHosts.hk4eSdk}hk4e_cn/combo/panda/qrcode/query`),
  Body: {
    app_id: MysApp.appId,
    device: data!.device,
    ticket: data!.ticket
  },
  HeaderFn: self.NoHeaders
}))

export const getTokenByGameToken = () => new DefineMysApi<
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
>((self, data) => ({
  Method: 'POST',
  Url: new URL(`${MysHosts.passport}account/ma-cn-session/app/getTokenByGameToken`),
  Body: {
    account_id: data!.account_id,
    game_token: data!.game_token
  },
  HeaderFn: self.PassportHeaders
}))

export const getCookieAccountInfoByGameToken = () => new DefineMysApi<
  BaseMysRes & {
    data: {
      cookie_token: string
    }
  },
  { account_id: string, game_token: string }
>((self, data) => ({
  Method: 'GET',
  Url: new URL(`${MysHosts.web[MysAccountType.cn]}auth/api/getCookieAccountInfoByGameToken?account_id=${data.account_id}&game_token=${data.game_token}`),
  HeaderFn: self.NoHeaders
}))

export const getCookieTokenBySToken = (method: 'GET' | 'POST') => new DefineMysApi<
  BaseMysRes & {
    data: {
      cookie_token: string
    }
  },
  { stoken: string }
>((self, data) => ({
  Method: method,
  Url: (function () {
    const url = new URL(`${MysHosts.web[MysAccountType.cn]}auth/api/getCookieAccountInfoBySToken?game_biz=hk4e_cn&${data.stoken}`)
    if (self.isHoyolab) {
      url.searchParams.set('game_biz', 'hk4e_global')
      url.host = MysHosts.web[MysAccountType.os].replace(/^https?:\/\//, '')
    }
    return url
  }()),
  HeaderFn: self.NoHeaders
}))

export const getUserGameRolesByCookie = (uidInfo: {
  cookie: string
} & BaseltuidInfo) => new DefineMysApi<
  BaseMysRes & {
    data: {
      list: UserGameRoleItem[]
    }
  }
>((self, data) => ({
  Method: 'GET',
  Url: new URL(`${MysHosts.web[self.isHoyolab ? MysAccountType.os : MysAccountType.cn]}binding/api/getUserGameRolesByCookie`),
  HeaderFn: self.CookieHeaders
}), uidInfo)

export const getUserFullInfo = (uidInfo: {
  cookie: string
} & BaseltuidInfo) => new DefineMysApi<
  BaseMysRes & {
    data: {
      user_info: {
        uid: string
      }
    }
  }
>((self, data) => ({
  Method: 'GET',
  Url: new URL(`${MysHosts.web.miyoushe}user/wapi/getUserFullInfo?gids=2`),
  HeaderFn: self.CookieHeaders
}), uidInfo)

export const getDeviceFp = () => new DefineMysApi<
  BaseMysRes & {
    data: {
      device_fp: string
    }
  }
>((self, data) => ({
  Method: 'POST',
  Url: new URL(`${MysHosts.publicData[self.isHoyolab ? MysAccountType.os : MysAccountType.cn]}device-fp/api/getFp`),
  Body: (function () {
    const body: any = {
      device_fp: '38d7faa51d2b6',
      device_id: lodash.sampleSize('0123456789abcdef', 16).join(''),
      ext_fields: `{"proxyStatus":0,"isRoot":0,"romCapacity":"512","deviceName":"${self.Device.brand}","productName":"${self.Device.model}","romRemain":"456","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"aaid":"","model":"${self.Device.model}","brand":"${self.Device.brand}","hardware":"qcom","deviceType":"${self.Device.name}","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"96757","appUpdateTimeDiff":1722171241616,"deviceInfo":"${self.Device.fingerprint}","vaid":"${self.Device.oaid}","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"chargeStatus":1,"manufacturer":"${self.Device.brand}","emulatorStatus":0,"appMemory":"512","osVersion":"${self.Device.androidVersion}","vendor":"unknown","accelerometer":"-0.084346995x8.73799x4.6301117","sdRemain":96600,"buildTags":"release-keys","packageName":"com.mihoyo.hyperion","networkType":"WiFi","oaid":"${self.Device.oaid}","debugStatus":1,"ramCapacity":"107433","magnetometer":"-13.9125x-17.8875x-5.4750004","display":"${self.Device.display}","appInstallTimeDiff":1717065300325,"packageVersion":"2.20.2","gyroscope":"0.017714571x-4.5813544E-4x0.0015271181","batteryStatus":76,"hasKeyboard":0,"board":"${self.Device.board}"}`,
      platform: '2',
      seed_id: crypto.randomUUID(),
      seed_time: new Date().getTime().toString()
    }

    if (self.isHoyolab) {
      body.app_name = 'bbs_oversea'
      body.hoyolab_device_id = self.Device.id
    } else {
      body.app_name = 'bbs_cn'
      body.bbs_device_id = self.Device.id
    }

    return body
  }()),
  HeaderFn: self.OkHttpHeaders
}))
