export const enum DefineDataPropEnum {
  Value = 'value',
  Array = 'array',
  Object = 'object',
  OArray = 'object-array'
}

export interface DefineDataTypeValue<V extends string | number | boolean> {
  prop: DefineDataPropEnum.Value
  type: V extends string ? ('string' | 'text') : V extends number ? 'number' : V extends boolean ? 'boolean' : never
  default: (() => V) | V
}

export interface DefineDataTypeArray<V extends string | number | Record<string, any>> {
  prop: DefineDataPropEnum.Array
  default: V[]
  defaultItem: V extends string | number ? DefineDataTypeValue<V> : V extends Record<string, any> ? DefineDataTypeObject<V> : never
  required?: V extends Record<string, any> ? (Extract<keyof V, string>)[] : never
}

export interface DefineDataTypeOArray<V extends string | number | boolean | Record<string, any> | Array<any>> {
  prop: DefineDataPropEnum.OArray
  default: Record<string, V>
  defaultItem: V extends string | number | boolean ? DefineDataTypeValue<V> : V extends Array<infer U> ? DefineDataTypeArray<U extends string | number | Record<string, any> ? U : any> : V extends Record<string, any> ? DefineDataTypeObject<V> : never
  required?: V extends Record<string, any> ? (Extract<keyof V, string>)[] : never
}

// 辅助类型:检查是否所有值都是同一类型
export type IsUniformRecord<T> = T extends Record<string, infer U>
  ? (Record<string, U> extends T ? (string extends keyof T ? true : false) : false)
  : false

export interface DefineDataTypeObject<V extends Record<string, any>> {
  prop: DefineDataPropEnum.Object
  default: {
    [K in keyof V]: V[K] extends string | number | boolean ? DefineDataTypeValue<V[K]> : V[K] extends Array<infer U> ? DefineDataTypeArray<U extends string | number | Record<string, any> ? U : any> : IsUniformRecord<V[K]> extends true ? V[K] extends Record<string, infer U> ? U extends string | number | boolean | Record<string, any> | Array<any> ? DefineDataTypeOArray<U> : never : never : V[K] extends Record<string, any> ? DefineDataTypeObject<V[K]> : never
  }
  required?: V extends Record<string, any> ? (Extract<keyof V, string>)[] : never
}

export type DefineDataTypes<T extends any> = T extends string | number | boolean ? DefineDataTypeValue<T> : T extends Array<infer U> ? DefineDataTypeArray<U extends string | number | Record<string, any> ? U : any> : IsUniformRecord<T> extends true ? T extends Record<string, infer U> ? U extends string | number | boolean | Record<string, any> | Array<any> ? DefineDataTypeOArray<U> : never : never : T extends Record<string, any> ? DefineDataTypeObject<T> : never
