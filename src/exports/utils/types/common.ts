export interface DefineData<T> {
  defaultConfig: T
}

export interface DefineDataArray<T> extends DefineData<T[]> {
  defaultConfigItem: {
    defaultConfig: T
    required?: T extends Record<string, any> ? (keyof T)[] : never
  }
}
