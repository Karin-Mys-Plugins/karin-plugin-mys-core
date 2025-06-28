export interface MysAccountInfoType {
  ltuid: string
  type: MysAccountType
  cookie: string
  stoken: string
  /** 绑定的设备ID */
  deviceId: string
}

export const enum MysAccountType {
  cn = 'mihoyo',
  os = 'hoyolab'
}
