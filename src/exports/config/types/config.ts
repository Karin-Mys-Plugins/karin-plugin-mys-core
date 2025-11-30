export interface ConfigDefine<T> {
  defaultConfig: T
}

export interface ConfigDefineArray<T> {
  defaultConfig: T[]
  defaultConfigItem: {
    defaultConfig: T
    required?: T extends Record<string, any> ? (keyof T)[] : never
  }
}
