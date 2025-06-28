import { MysAccountType } from '@/types'

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
