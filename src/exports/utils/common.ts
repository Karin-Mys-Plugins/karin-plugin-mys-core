import lodash from 'node-karin/lodash'
import { DefineDataPropEnum, DefineDataTypeArray, DefineDataTypeOArray, DefineDataTypeObject, DefineDataTypeValue } from './types'

/**
 * @description 生成随机字符串
 * @param length - 字符串长度
 */
export const randomString = (length: number, type: 'Lower' | 'Upper' | 'All') => {
  let str = '0123456789'
  if (type === 'Lower' || type === 'All') {
    str += 'abcdefghijklmnopqrstuvwxyz'
  }
  if (type === 'Upper' || type === 'All') {
    str += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }

  return lodash.sampleSize(str, length).join('')
}

/**
 * @description 生成设备guid
 */
export const getDeviceGuid = () => {
  function S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

/**
 * @description 将字符串解析为key-value键值对
 * @param Str - 字符串
 * @param sep - 分隔符
 */
export const StrToObj = <
  D extends { [key: string]: string }
> (Str: string, sep: string | RegExp): Partial<D> => {
  const strObj: { [key: string]: string } = {}

  Str.split(sep).forEach(item => {
    const [key, value] = item.split('=')
    if (key) {
      strObj[key] = value || ''
    }
  })

  return strObj as Partial<D>
}

/**
 * @description 将key-value键值对解析为字符串
 * @param obj - key-value键值对
 * @param sep - 分隔符
 */
export const ObjToStr = (obj: Record<string, string | number>, sep: string) => {
  return Object.entries(obj).filter(([k, v]) => v).map(([k, v]) => `${k}=${v}`).join(sep) + sep
}

export function DefineValve<T extends string> (value: T | (() => T), long?: boolean): DefineDataTypeValue<T>
export function DefineValve<T extends number | boolean> (value: T | (() => T), long?: never): DefineDataTypeValue<T>
export function DefineValve<T extends string | number | boolean> (value: T | (() => T), long?: boolean): DefineDataTypeValue<T> {
  return {
    prop: DefineDataPropEnum.Value,
    type: (long ? 'text' : typeof value) as DefineDataTypeValue<T>['type'],
    default: value
  }
}

export function filterData (data: any, define: DefineDataTypeObject<any> | DefineDataTypeArray<any> | DefineDataTypeOArray<any> | DefineDataTypeValue<any>, defaultValue?: any): any {
  switch (define.prop) {
    case DefineDataPropEnum.Array: {
      if (!Array.isArray(data)) return defaultValue || define.default

      const filtered: typeof define.default = []

      data.forEach((value: any) => {
        const filterValue = filterData(value, define.defaultItem)

        if (define.defaultItem.prop === DefineDataPropEnum.Object) {
          if (!lodash.isPlainObject(value)) return

          const _value = value as Record<string, any>
          if (define.required && !define.required.every(k => _value[k] !== undefined && _value[k] !== null && _value[k] !== '' && !isNaN(filterValue))) return
        }

        filterValue !== undefined && filterValue !== null && filterValue !== '' && !isNaN(filterValue) && filtered.push(filterValue)
      })

      return filtered
    }
    case DefineDataPropEnum.Object: {
      if (!lodash.isPlainObject(data)) return defaultValue || define.default

      const filtered: typeof define.default = {}

      lodash.forEach(define.default, (value, key) => {
        const filterValue = filterData(data[key], value)

        if (define.required && !define.required.every(k => data[k] !== undefined && data[k] !== null && data[k] !== '' && !isNaN(filterValue))) {
          throw new Error(`keys ${define.required.join(', ')} undefined or has invalid value!`)
        }

        filtered[key] = filterValue
      })

      return filtered
    }
    case DefineDataPropEnum.OArray: {
      if (!lodash.isPlainObject(data)) return defaultValue || define.default

      const filtered: typeof define.default = {}

      lodash.forEach(data, (value, key) => {
        const filterValue = filterData(value, define.defaultItem)

        if (define.defaultItem.prop === DefineDataPropEnum.Object) {
          if (!lodash.isPlainObject(value)) return

          const _value = value as Record<string, any>
          if (define.required && !define.required.every(k => _value[k] !== undefined && _value[k] !== null && _value[k] !== '' && !isNaN(filterValue))) return
        }

        if (define.defaultItem.prop === DefineDataPropEnum.Array && !Array.isArray(value)) return

        filterValue !== undefined && filterValue !== null && filterValue !== '' && !isNaN(filterValue) && (filtered[key] = filterValue)
      })

      return filtered
    }
    case DefineDataPropEnum.Value: {
      if (data === undefined || data === null) return defaultValue ?? define.default

      switch (define.type) {
        case 'text':
        case 'string':
          switch (typeof data) {
            case 'string':
              return data
            case 'number':
              return data + ''
          }
          return defaultValue ?? (typeof define.default === 'function' ? define.default() : define.default)
        case 'number': {
          switch (typeof data) {
            case 'number':
              return data
            case 'string': {
              const num = +data
              return isNaN(num) ? (defaultValue ?? (typeof define.default === 'function' ? define.default() : define.default)) : num
            }
          }
          return defaultValue ?? (typeof define.default === 'function' ? define.default() : define.default)
        }
        case 'boolean':
          return !!data
      }
    }
  }
}
