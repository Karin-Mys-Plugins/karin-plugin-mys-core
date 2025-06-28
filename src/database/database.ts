import { DatabaseClassStatic, DatabaseFn } from '@/types'
import { logger } from 'node-karin'
import { DataTypes, Model, ModelAttributeColumnOptions } from 'sequelize'
import { Sqlite3, Sqlite3Static } from './dbs/sqlite3'

class DatabaseClass {
  #defaultDatabase: DatabaseFn
  #defaultDatabaseStatic: DatabaseClassStatic

  constructor () {
    this.#defaultDatabase = <T extends Record<string, any>> () => new Sqlite3<T>()
    this.#defaultDatabaseStatic = Sqlite3Static
  }

  /** 设置默认数据库 */
  async default (Database: DatabaseFn, Static: DatabaseClassStatic) {
    const db = Database()
    if (await db.check()) {
      this.#defaultDatabase = Database
      this.#defaultDatabaseStatic = Static
    } else {
      logger.error()
    }
  }

  /** 获取当前使用的数据库 */
  get<T extends Record<string, any>> () {
    return this.#defaultDatabase<T>()
  }

  get PkColumn () {
    return (
      type: keyof typeof DataTypes, option?: Partial<ModelAttributeColumnOptions<Model>>
    ): ModelAttributeColumnOptions<Model> => ({
      type: DataTypes[type],
      primaryKey: true,
      allowNull: false,
      ...option
    })
  }

  get Column (): DatabaseClassStatic['Column'] {
    return this.#defaultDatabaseStatic.Column
  }

  get ArrayColumn (): DatabaseClassStatic['ArrayColumn'] {
    return this.#defaultDatabaseStatic.ArrayColumn
  }

  get JsonColumn (): DatabaseClassStatic['JsonColumn'] {
    return this.#defaultDatabaseStatic.JsonColumn
  }
}

export const Database = new DatabaseClass()
