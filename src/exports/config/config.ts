import { common } from '@/exports/utils'
import { existsSync, existToMkdirSync, logger, requireFileSync, watch, writeJsonSync } from 'node-karin'
import lodash from 'node-karin/lodash'
import path from 'node:path'
import { EnhancedArray } from './array'

// 递归生成嵌套键路径类型
type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any> ? T[Key] extends ArrayLike<any> ? Key | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>>}` : Key | `${Key}.${PathImpl<T[Key], keyof T[Key]>}` : Key
  : never

type Path<T> = PathImpl<T, keyof T> | keyof T

// 根据路径推断值类型
type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T ? Rest extends Path<T[Key]> ? PathValue<T[Key], Rest> : never : never
  : P extends keyof T ? T[P] : never

export class Config<C extends { [key: string]: any }> {
  #cfgName: `${string}:${string}`
  /**
   * @description 配置缓存
   */
  #ConfigCache: C | null = null
  /**
   * @description 默认配置
   */
  #DefaultConfig: C
  #DefineConfig: { [key: string]: any }
  /**
   * @description 配置保存路径
   */
  #ConfigPath: string

  /**
   * @param name 插件名称:配置名称
   */
  constructor (name: `${string}:${string}`, ConfigDir: string, DefaultConfig: C, DefineConfig: { [key: string]: any }) {
    this.#cfgName = name

    const splitName = name.split(':')
    if (!splitName[1]) {
      throw new Error('配置名称格式错误，应为 插件名称:配置名称')
    }

    this.#ConfigPath = path.join(ConfigDir, `${splitName[1]}.json`)

    this.#DefaultConfig = DefaultConfig
    this.#DefineConfig = DefineConfig

    existToMkdirSync(ConfigDir)

    !existsSync(this.#ConfigPath) && writeJsonSync(this.#ConfigPath, DefaultConfig, true)

    this.loadConfig()
  }

  loadConfig (): C {
    const config = requireFileSync(this.#ConfigPath)

    // 检查并补全缺失的配置项
    const mergedConfig = this.mergeWithDefaults(config, this.#DefaultConfig, this.#DefineConfig)

    // 更新缓存
    this.#ConfigCache = mergedConfig

    return mergedConfig
  }

  mergeWithDefaults (userConfig: C, defaultConfig: C, DefineConfig: Record<string, any>): C {
    // 先过滤用户配置，只保留默认配置中定义的字段
    const filteredUserConfig = common.filterData(userConfig, defaultConfig, DefineConfig)

    // 然后合并配置
    const result = lodash.merge({}, defaultConfig, filteredUserConfig)

    if (!lodash.isEqual(result, userConfig)) {
      try {
        writeJsonSync(this.#ConfigPath, result)
      } catch (err) {
        logger.error(err)
      }
    }

    return result
  }

  /**
   * @description 获取配置路径对应的默认配置
   */
  getDef (path: ''): C
  getDef<P extends Path<C> | ''> (path: P): C | PathValue<C, P> {
    const defConfig = JSON.parse(JSON.stringify(this.#DefaultConfig))

    return lodash.get(defConfig, path)
  }

  /**
   * @description 获取配置路径对应的配置
   * @param path 配置路径,支持任意深度的嵌套路径,返回值类型会根据路径自动推断
   * @param isArray 是否返回 EnhancedArray 类型
   * @param def 默认值
   */
  get (path: '', isArray?: false, def?: C): C
  get<P extends Path<C>> (path: P, isArray?: false, def?: PathValue<C, P>): PathValue<C, P>
  get<P extends Path<C>, T = PathValue<C, P>> (path: P, isArray: true, def?: T[]): EnhancedArray<T extends any[] ? T[number] : T, C>
  get<P extends Path<C> | ''> (path: P, isArray: boolean = false, def?: PathValue<C, P>): C | PathValue<C, P> | EnhancedArray<any, C> {
    const conf = JSON.parse(JSON.stringify(this.#ConfigCache))
    const pathStr = String(path)

    const result = pathStr ? lodash.get(conf, pathStr, def) : conf

    if (isArray) {
      if (!Array.isArray(result)) {
        logger.error(`配置路径 ${pathStr} 不是数组类型`)
        return new EnhancedArray<any, C>(this, [], pathStr)
      }

      return new EnhancedArray<any, C>(this, result, pathStr)
    }

    return result
  }

  /**
   * @description 设置配置项的值
   * @param path 配置路径,支持任意深度的嵌套路径
   * @param value 要设置的值,类型会根据路径自动推断
   * @param save 是否立即保存
   */
  set (path: '', value: C, save: boolean): void
  set<P extends Path<C>> (path: P, value: PathValue<C, P>, save: boolean): void
  set<P extends Path<C> | ''> (path: P, value: C | PathValue<C, P>, save: boolean): void {
    lodash.set(this.#ConfigCache!, String(path), value)

    save && this.save()
  }

  /**
   * @description 立即保存配置
   */
  save () {
    try {
      logger.debug(`[${this.#cfgName}] 保存配置`, this.#ConfigCache)

      writeJsonSync(this.#ConfigPath, this.#ConfigCache)
    } catch (err) {
      logger.error(err)
    }
  }

  watch (fnc?: (self: Config<C>, oldData: C, newData: C) => Promise<void> | void) {
    watch(this.#ConfigPath, async (oldData: C, newData) => {
      fnc && await fnc(this, oldData, newData)

      this.loadConfig()
    })

    return this
  }
}
