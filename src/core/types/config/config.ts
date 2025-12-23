import { MysAccountType } from '@/exports/database'

export interface DefaultCoreConfigType {
  proxy: {
    github: string
    [MysAccountType.os]: string
  }
}
