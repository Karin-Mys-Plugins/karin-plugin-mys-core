import lodash from 'node-karin/lodash'
import moment from 'node-karin/moment'

/**
 * 生成随机数
 * @param min - 最小值
 * @param max - 最大值
 * @returns
 */
export const random = (min: number, max: number) => lodash.random(min, max)

/**
 * 睡眠函数
 * @param ms - 毫秒
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 使用moment返回时间
 * @param format - 格式
 */
export const timef = (format = 'YYYY-MM-DD HH:mm:ss') => moment().format(format)

/**
 * 生成设备guid
 */
export const getDeviceGuid = () => {
  function S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

/**
 *  生成随机字符串
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
 * 将字符串解析为key-value键值对
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
 * 将key-value键值对解析为字符串
 * @param obj - key-value键值对
 * @param sep - 分隔符
 */
export const ObjToStr = (obj: { [key: string]: string | number }, sep: string) => {
  return Object.entries(obj).filter(([k, v]) => v).map(([k, v]) => `${k}=${v}`).join(sep) + sep
}

/**
 * 使用moment返回今日剩余时间
 */
export const getEndOfDay = () => Number(moment().endOf('day').format('X')) - Number(moment().format('X'))
