import { DatabaseClassInstance } from './dbs'

export type DatabaseFn = <T extends Record<string, any>> () => DatabaseClassInstance<T>
