import { dir } from '@/dir'
import { CommandItem, ConfigType, CoreCommand } from '@/types'
import {
  existsSync,
  logger,
  requireFileSync,
  watch,
  writeJsonSync
} from 'node-karin'
import lodash from 'node-karin/lodash'
import path from 'node:path'

const DefaultConfig: ConfigType = {
  device: {
    androidVersion: '12',
    deviceName: 'aurora',
    deviceBoard: '24031PN0DC',
    deviceModel: '24031PN0DC',
    deviceProduct: 'aurora',
    deviceFingerprint: 'Xiaomi/aurora/aurora:12/V417IR/813:user/release-keys'
  },
  commands: {
    [CoreCommand.BingMysDevice]: {
      cmds: ['#绑定设备', '#绑定米游社设备'], default: true, end: true, flags: false
    }
  }
}

const ConfigPath = path.join(dir.ConfigDir, 'config.json')

export class Config<C extends Record<string, any>> {
  /**
   * @description 配置文件路径
   */
  #ConfigPath: string
  /**
   * @description 默认配置(只读)
   */
  #DefaultConfig: Readonly<C>
  /**
   * @description 配置缓存
   */
  #configCache: C | null = null

  constructor (ConfigPath: string, DefaultConfig: C) {
    this.#ConfigPath = ConfigPath
    this.#DefaultConfig = Object.freeze(DefaultConfig)

    !existsSync(this.#ConfigPath) && writeJsonSync(this.#ConfigPath, this.#DefaultConfig)

    this.loadConfig()

    watch(this.#ConfigPath, () => {
      this.loadConfig()
    })
  }

  loadConfig (): C {
    const config = requireFileSync(this.#ConfigPath)

    // 检查并补全缺失的配置项
    const mergedConfig = this.mergeWithDefaults(config, this.#DefaultConfig)

    // 更新缓存
    this.#configCache = mergedConfig

    return mergedConfig
  }

  mergeWithDefaults (userConfig: Record<string, any>, defaultConfig: Record<string, any>): C {
    // 递归函数，用于过滤掉用户配置中不存在于默认配置的字段
    const filterUserConfig = (user: any, defaults: any): any => {
      if (lodash.isPlainObject(user) && lodash.isPlainObject(defaults)) {
        const filtered: Record<string, any> = {}
        for (const key in defaults) {
          if (Object.prototype.hasOwnProperty.call(user, key)) {
            filtered[key] = filterUserConfig(user[key], defaults[key])
          }
        }
        return filtered
      }
      return user
    }

    // 先过滤用户配置，只保留默认配置中定义的字段
    const filteredUserConfig = filterUserConfig(userConfig, defaultConfig)

    // 然后合并配置
    const result = lodash.merge({}, defaultConfig, filteredUserConfig)

    if (!lodash.isEqual(result, userConfig)) {
      try {
        writeJsonSync(this.#ConfigPath, result)
      } catch (err) {
        logger.error(err)
      }
    }

    return result as C
  }

  /**
 * @description 获取配置路径对应的默认配置
 */
  getDef<T> (path: string) {
    const defConfig = JSON.parse(JSON.stringify(this.#DefaultConfig))

    return lodash.get(defConfig, path) as T
  }

  /**
   * @description 获取配置路径对应的配置
   */
  get<T> (path: string, isArray?: false): T
  get<T> (path: string, isArray: true): EnhancedArray<T>
  get<T> (path: string, isArray: boolean = false): T | EnhancedArray<T> {
    const conf = JSON.parse(JSON.stringify(this.#configCache))
    const result = lodash.get(conf, path)

    if (isArray) {
      if (!Array.isArray(result)) {
        logger.error(`配置路径 ${path} 不是数组类型`)
        return new EnhancedArray<T>([], path)
      }

      return new EnhancedArray<T>(result, path)
    }

    return result as T
  }

  /**
   * @param save 是否立即保存
   */
  set<T> (path: string, value: T, save: boolean): void {
    lodash.set(this.#configCache!, path, value)

    save && this.save()
  }

  /**
   * @description 立即保存配置
   */
  save () {
    try {
      writeJsonSync(this.#ConfigPath, this.#configCache)
    } catch (err) {
      logger.error(err)
    }
  }

  /**
   * @description 获取触发指令正则表达式
   */
  getCommand (cmd: CoreCommand): RegExp {
    const command = this.get<CommandItem>(`commands.${cmd}`)

    return new RegExp(`^(${command.cmds.join('|')})${command.end ? '$' : ''}`, command.flags ? 'i' : undefined)
  }
}

export const Cfg = new Config(ConfigPath, DefaultConfig)

export class EnhancedArray<T> extends Array<T> {
  #keyPath: string

  constructor (items: T[], path: string) {
    super()

    Object.setPrototypeOf(this, EnhancedArray.prototype)
    if (Array.isArray(items)) {
      this.push(...items)
    }

    this.#keyPath = path
  }

  /**
   * @param isEqual 是否不添加重复元素
   * @param save 是否立即保存
   */
  add (element: T, isEqual: boolean, save: boolean): this {
    if (isEqual && this.some(item => lodash.isEqual(item, element))) {
      return this
    }

    this.push(element)
    Cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  /**
   * @param isEqual 是否不添加重复元素
   * @param save 是否立即保存
   */
  addSome (elements: T[], isEqual: boolean, save: boolean): this {
    if (isEqual) {
      elements = elements.filter(element => !this.some(item => lodash.isEqual(item, element)))

      if (elements.length === 0) {
        return this
      }
    }

    this.push(...elements)
    Cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  /**
   * @param save 是否立即保存
   */
  remove (predicate: T | ((item: T) => boolean), save: boolean, isIndex: boolean = false): this {
    let newArr: T[] = []

    if (isIndex && lodash.isNumber(predicate)) {
      if (predicate < 0 || predicate >= this.length) {
        logger.error(`索引 ${predicate} 超出范围`)
        return this
      }
      newArr = [...this.slice(0, predicate), ...this.slice(predicate + 1)]
    } else if (lodash.isFunction(predicate)) {
      newArr = this.filter(item => !predicate(item))
    } else {
      newArr = lodash.without(this, predicate)
    }

    // 清空当前数组并添加新元素
    this.length = 0
    this.push(...newArr)

    Cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  clear () {
    this.length = 0
    return this
  }
}
