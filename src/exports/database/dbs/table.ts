import { Model, ModelAttributeColumnOptions } from 'sequelize'
import { Database } from '../database'
import { DatabaseClassInstance, DatabaseType, Dialect } from '../types'

export class Table<
  TableType extends Record<string, any>,
  ExtraTableType extends Record<string, any> = {},
  DBType extends DatabaseType = DatabaseType
> {
  #dialect: Dialect
  #Database: DatabaseClassInstance<TableType, DBType>

  #DataDir: string
  #tableName: string
  #type: DBType

  #primaryKey: keyof TableType | undefined

  declare initCache: DatabaseClassInstance<TableType, DBType>
  declare modelSchema: Record<keyof TableType, ModelAttributeColumnOptions<Model>>
  declare modelSchemaDefine: Partial<Record<keyof TableType, any>>

  /**
   * @param type Db: 直接保存在sqlite数据中、 File: 保存在单个json文件中、 Dir: 保存在多个json文件的目录中、Schema中除pk外每一个键值对应一个文件 e.g tableName/user/key.json
   */
  constructor (DataDir: string, tableName: string, type: DBType, primaryKey?: keyof TableType) {
    this.#primaryKey = primaryKey

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

  async init (Schema: Record<keyof TableType, ModelAttributeColumnOptions<Model>>, SchemaDefine: Partial<Record<keyof TableType, any>> = {}) {
    this.modelSchema = Schema
    this.modelSchemaDefine = SchemaDefine

    this.initCache = await this.#Database.init(
      this.#DataDir, this.#tableName, this.modelSchema, this.modelSchemaDefine, this.#type, this.#primaryKey
    )

    return this.#cache<TableType>()
  }

  async addSchem<newTableType extends ExtraTableType> (newSchema: Record<keyof newTableType, ModelAttributeColumnOptions<Model>>, SchemaDefine: Partial<Record<keyof newTableType, any>> = {}) {
    this.modelSchema = Object.assign(this.modelSchema, newSchema)
    this.modelSchemaDefine = Object.assign(this.modelSchemaDefine, SchemaDefine)

    this.initCache = await this.#Database.init(
      this.#DataDir, this.#tableName, this.modelSchema, this.modelSchemaDefine, this.#type
    )

    return this.#cache<TableType & newTableType>()
  }
}

export function createTable<
  TableType extends Record<string, any>,
  ExtraTableType extends Record<string, any> = {}
> (DataDir: string, tableName: string, type: DatabaseType.File, primaryKey: keyof TableType): Table<TableType, ExtraTableType, DatabaseType.File>

export function createTable<
  TableType extends Record<string, any>,
  ExtraTableType extends Record<string, any> = {}
> (DataDir: string, tableName: string, type: DatabaseType.Dir, primaryKey: keyof TableType): Table<TableType, ExtraTableType, DatabaseType.Dir>

export function createTable<
  TableType extends Record<string, any>,
  ExtraTableType extends Record<string, any> = {}
> (DataDir: string, tableName: string, type: DatabaseType.Db, primaryKey?: keyof TableType): Table<TableType, ExtraTableType, DatabaseType.Db>

export function createTable<
  TableType extends Record<string, any>,
  ExtraTableType extends Record<string, any> = {},
  DBType extends DatabaseType = DatabaseType
> (DataDir: string, tableName: string, type: DBType, primaryKey?: keyof TableType): Table<TableType, ExtraTableType, DBType> {
  return new Table<TableType, ExtraTableType, DBType>(DataDir, tableName, type, primaryKey)
}
