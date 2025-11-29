import { Model, ModelAttributeColumnOptions } from 'sequelize'
import { Database } from '../database'
import { DatabaseClassInstance, DatabaseType, Dialect } from '../types'

export class Table<TableType extends Record<string, any>, DBType extends DatabaseType, ExtraTableType extends Record<string, any>> {
  #dialect: Dialect
  #Database: DatabaseClassInstance<TableType, DBType>

  #DataDir: string
  #tableName: string
  #type: DBType

  declare initCache: DatabaseClassInstance<TableType, DBType>
  declare modelSchema: Record<keyof TableType, ModelAttributeColumnOptions<Model>>

  constructor (DataDir: string, tableName: string, type: DBType) {
    this.#Database = Database.get<TableType, DBType>()
    this.#dialect = this.#Database.dialect

    this.#DataDir = DataDir
    this.#tableName = tableName
    this.#type = type
  }

  #cache <T extends Record<string, any>> () {
    return async () => {
      const Db = Database.get<TableType, DBType>()
      if (Db.dialect !== this.#dialect) {
        this.#dialect = Db.dialect
        this.#Database = Db

        await this.init(this.modelSchema)
      }

      return this.initCache as unknown as DatabaseClassInstance<T, DBType>
    }
  }

  async init (Schema: Record<keyof TableType, ModelAttributeColumnOptions<Model>>) {
    this.modelSchema = Schema

    this.initCache = await this.#Database.init(
      this.#DataDir, this.#tableName, this.modelSchema, this.#type
    )

    return this.#cache<TableType>()
  }

  async addSchem<newTableType extends ExtraTableType> (newSchema: Record<keyof newTableType, ModelAttributeColumnOptions<Model>>) {
    this.modelSchema = Object.assign(this.modelSchema, newSchema)

    this.initCache = await this.#Database.init(
      this.#DataDir, this.#tableName, this.modelSchema, this.#type
    )

    return this.#cache<TableType & newTableType>()
  }
}
