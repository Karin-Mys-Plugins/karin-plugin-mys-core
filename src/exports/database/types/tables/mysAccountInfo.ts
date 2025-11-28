export const enum MysAccountType {
  cn = 'mihoyo',
  os = 'hoyolab'
}

export interface MysAccountInfoTableType {
  ltuid: string
  type: MysAccountType
  cookie: string
  stoken: string
  /** 绑定的设备md5 */
  deviceMd5: string
}
