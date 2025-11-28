export interface ConfigIgnore<T> {
  defaultConfig: T
}

export interface ConfigIgnoreArray<T> {
  defaultConfig: T[]
  defaultConfigItem: {
    defaultConfig: T
    required?: T extends Record<string, any> ? (keyof T)[] : never
  }
}
