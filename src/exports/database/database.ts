import { logger } from 'node-karin'
import { Sqlite3 } from './dbs/sqlite3'
import { DatabaseFn, DatabaseType, Dialect } from './types'

export const Database = new class DatabaseClass {
  #defaultDialect = Dialect.Sqlite
  #DatabaseMap: Map<Dialect, { Database: DatabaseFn, desc: string }> = new Map()

  default (dialect: Dialect) {
    const db = this.#DatabaseMap.get(dialect)
    if (!db) {
      logger.error(`未找到数据库: ${dialect}！使用默认数据库。`)

      return
    }
    this.#defaultDialect = dialect
  }

  /** @description 添加数据库 */
  async Add (Db: DatabaseFn) {
    const db = Db()
    if (await db.check()) {
      this.#DatabaseMap.set(db.dialect, { Database: Db, desc: db.description })
    } else {
      logger.error(`${db.dialect} check failed!`)
    }
  }

  get Db () {
    const dialect = this.#defaultDialect

    const db = this.#DatabaseMap.get(dialect)
    if (!db) {
      logger.error(`未找到数据库: ${dialect}！使用默认数据库。`)

      return this.#DatabaseMap.get(Dialect.Sqlite)!
    }
    return db!
  }

  get details (): { dialect: Dialect, desc: string }[] {
    return Array.from(this.#DatabaseMap.entries()).map(([dialect, { desc }]) => ({
      dialect, desc
    }))
  }

  /** @description 获取当前使用的数据库 */
  get<T extends Record<string, any>, D extends DatabaseType> () {
    return this.Db.Database<T, D>()
  }
}()

await Database.Add(
  <T extends Record<string, any>, D extends DatabaseType> () => new Sqlite3<T, D>()
)
