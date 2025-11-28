import lodash from 'node-karin/lodash'

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
 * 生成设备guid
 */
export const getDeviceGuid = () => {
  function S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}
