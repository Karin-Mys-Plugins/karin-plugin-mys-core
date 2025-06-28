import { dir } from '@/dir'
import { Config } from '@/types/utils'
import {
  copyConfigSync,
  logger,
  requireFileSync,
  watch,
  writeJsonSync
} from 'node-karin'
import lodash from 'node-karin/lodash'

export const Cfg = new class Cfg {
  #configCache: Config | null = null

  constructor () {
    copyConfigSync(dir.defConfigDir, dir.ConfigDir, ['.json'])

    this.loadConfig()

    watch(`${dir.ConfigDir}/config.json`, () => {
      logger.info('配置文件已修改，重新加载配置')
      this.loadConfig()
    })
  }

  loadConfig (): Config {
    const cfg = requireFileSync(`${dir.ConfigDir}/config.json`)
    const def = requireFileSync(`${dir.defConfigDir}/config.json`)

    // 检查并补全缺失的配置项
    const mergedConfig = this.mergeWithDefaults(cfg, def)

    // 更新缓存
    this.#configCache = mergedConfig

    return mergedConfig
  }

  mergeWithDefaults (userConfig: Record<string, any>, defaultConfig: Record<string, any>): Config {
    const result = lodash.merge({}, defaultConfig, userConfig)

    if (!lodash.isEqual(result, userConfig)) {
      try {
        writeJsonSync(`${dir.ConfigDir}/config.json`, result)
      } catch (err) {
        logger.error(err)
      }
    }

    return result
  }

  /**
   *
   * @param path 配置路径
   * @template T 配置类型
   * @description 获取配置路径对应的配置
   * @returns
   */
  get<T> (path: string, isArray: false): T
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

  set<T> (path: string, value: T): void {
    const conf = JSON.parse(JSON.stringify(this.#configCache))

    lodash.set(conf, path, value)
    this.#configCache = conf

    try {
      writeJsonSync(`${dir.ConfigDir}/config.json`, conf)
    } catch (err) {
      logger.error(err)
    }
  }
}()

class EnhancedArray<T> extends Array<T> {
  #keyPath: string

  constructor (items: T[], path: string) {
    super(...items)
    this.#keyPath = path
  }

  add (element: T): this {
    this.push(element)
    Cfg.set<T[]>(this.#keyPath, this.slice())

    return this
  }

  remove (predicate: T | ((item: T) => boolean), isIndex: boolean = false): this {
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

    Cfg.set<T[]>(this.#keyPath, this.slice())

    return this
  }
}
