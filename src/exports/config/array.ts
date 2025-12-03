import { logger } from 'node-karin'
import lodash from 'node-karin/lodash'
import { Config } from './config'

export class EnhancedArray<T> extends Array<T> {
  #keyPath: string
  #cfg: Config<any>

  constructor (cfg: Config<any>, items: T[], path: string) {
    super()

    Object.setPrototypeOf(this, EnhancedArray.prototype)
    if (Array.isArray(items)) {
      this.push(...items)
    }

    this.#cfg = cfg
    this.#keyPath = path
  }

  /**
   * @param element - string | number
   * @returns
   */
  has (element: T & (string | number)): boolean {
    return new Set(this).has(element)
  }

  /**
   * @param isEqual 是否不添加重复元素
   * @param save 是否立即保存
   */
  add (element: T, isEqual: boolean, save: boolean): this {
    if (isEqual) {
      const existingSet = new Set(this.map(item => JSON.stringify(item)))

      if (existingSet.has(JSON.stringify(element))) return this
    }

    this.push(element)
    this.#cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  /**
   * @param isEqual 是否不添加重复元素
   * @param save 是否立即保存
   */
  addSome (elements: T[], isEqual: boolean, save: boolean): this {
    if (isEqual) {
      const existingSet = new Set(this.map(item => JSON.stringify(item)))

      elements = elements.filter(element => !existingSet.has(JSON.stringify(element)))

      if (elements.length === 0) return this
    }

    this.push(...elements)
    this.#cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  /** @description 删除指定索引 */
  pullAt (idx: number, save: boolean): this {
    if (idx < 0 || idx >= this.length) {
      logger.error(`索引 ${idx} 超出范围 [0, ${this.length - 1}]`)
      return this
    }
    lodash.pullAt(this, idx)

    this.#cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  /** @description 删除指定元素 */
  pullAll (elements: T[], save: boolean): this {
    lodash.pullAll(this, elements)

    this.#cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  /** @description 使用条件函数删除元素 */
  remove (predicate: (item: T) => boolean, save: boolean): this {
    lodash.remove(this as T[], predicate)

    this.#cfg.set<T[]>(this.#keyPath, this.slice(), save)

    return this
  }

  clear () {
    this.length = 0

    return this
  }
}
