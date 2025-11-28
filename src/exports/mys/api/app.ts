import { MysAccountType } from '@/exports/database'

const version = { cn: '2.70.1', os: '1.5.0' }

const appId = 2 // 崩三 1 未定 2 原神 4 崩二 7 崩铁 8 绝区零 12

const salt = {
  os: '6cqshh5dhw73bzxn20oexa9k516chk7s',
  '4X': 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs',
  '6X': 't0qEgfub6cvueAPgR5m9aQWWVciEer7v',
  K2: 'S9Hrn38d2b55PamfIR9BNA3Tx9sQTOem',
  LK2: 'sjdNFJB7XxyDWGIAk0eTV8AOCfMJmyEo',
  PROD: 'JwYDpKvLj6MrMqqYU6jTKF17KNO2PXoS'
}

export const MysApp = Object.freeze({
  version, appId, salt
})

export const MysHosts = Object.freeze({
  bbs: {
    [MysAccountType.cn]: 'https://bbs-api.miyoushe.com/',
    [MysAccountType.os]: 'https://bbs-api-os.mihoyo.com/',
  },
  web: {
    [MysAccountType.cn]: 'https://api-takumi.mihoyo.com/',
    [MysAccountType.os]: 'https://api-os-takumi.mihoyo.com/',
    /** new web host */
    miyoushe: 'https://api-takumi.miyoushe.com/',
  },
  static: 'https://api-takumi-static.mihoyo.com/',
  record: {
    [MysAccountType.cn]: 'https://api-takumi-record.mihoyo.com/',
    [MysAccountType.os]: 'https://bbs-api-os.mihoyo.com/',
  },
  hk4e: {
    [MysAccountType.cn]: 'https://hk4e-api.mihoyo.com/',
    [MysAccountType.os]: 'https://hk4e-api-os.hoyoverse.com/',
  },
  hk4eGacha: 'https://public-operation-hk4e.mihoyo.com/',
  hk4eSdk: 'https://hk4e-sdk.mihoyo.com/',
  napGacha: {
    [MysAccountType.cn]: 'https://public-operation-nap.mihoyo.com/',
    [MysAccountType.os]: 'https://public-operation-nap-sg.hoyoverse.com/',
  },
  publicData: {
    [MysAccountType.cn]: 'https://public-data-api.mihoyo.com/',
    [MysAccountType.os]: 'https://sg-public-data-api.hoyoverse.com/',
  },
  napAct: {
    [MysAccountType.cn]: 'https://act-nap-api.mihoyo.com/',
    [MysAccountType.os]: 'https://sg-act-nap-api.mihoyo.com/',
  },
  passport: 'https://passport-api.mihoyo.com/',
  hk4eSg: {
    [MysAccountType.os]: 'https://sg-hk4e-api.hoyolab.com/',
  },
  publicSg: {
    [MysAccountType.os]: 'https://sg-public-api.hoyolab.com/',
    hoyoverse: 'https://sg-public-api.hoyoverse.com/',
  }
})
