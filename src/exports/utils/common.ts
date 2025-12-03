import lodash from 'node-karin/lodash'
import { DefineDataArray } from './types'

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

export function filterData (user: any, defaults: any, Define: any) {
  if (Array.isArray(user) && Array.isArray(defaults)) {
    const DefineArray = Define as DefineDataArray<any> | undefined
    if (DefineArray?.defaultConfigItem) {
      const filtered: any[] = []
      const required = DefineArray.defaultConfigItem.required as string[] | undefined

      user.forEach((value, key) => {
        // 如果定义了 required，检查元素是否包含所有必需的键
        if (required && lodash.isPlainObject(value)) {
          const _value = value as Record<string, any>
          const hasAllRequired = required.every(requiredKey => requiredKey in _value && _value[requiredKey] !== undefined && _value[requiredKey] !== null && _value[requiredKey] !== '')

          if (!hasAllRequired) return
        }

        filtered[key] = filterData(value, DefineArray.defaultConfigItem.defaultConfig, DefineArray.defaultConfigItem.defaultConfig)
      })

      return filtered
    }

    return user
  } else if (lodash.isPlainObject(user) && lodash.isPlainObject(defaults)) {
    const filtered: Record<string, any> = {}

    const _user = user as Record<string, any>
    const _defaults = defaults as Record<string, any>

    const mergedValue = lodash.merge({}, _defaults, _user)

    const _Define = Define as any
    if (Define?.defaultConfig) {
      lodash.forEach(_user, (value, key) => {
        // 合并用户配置和默认配置，确保动态键也包含完整字段
        const mergedValue = lodash.merge(Array.isArray(value) ? [] : {}, Define.defaultConfig, value)

        filtered[key] = filterData(mergedValue, Define.defaultConfig, Array.isArray(value) ? _Define : _Define[key])
      })
    }

    lodash.forEach(_defaults, (value, key) => {
      filtered[key] = filterData(mergedValue[key], value, _Define?.[key])
    })

    return filtered
  }

  return user
}
