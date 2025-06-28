import { DataTypes, Model, ModelAttributeColumnOptions, ModelStatic } from 'sequelize'

export const enum Dialect {
  Sqlite = 'sqlite',
  MySQL = 'mysql',
  MariaDB = 'mariadb',
  PostgreSQL = 'postgres',
  MSSQL = 'mssql',
  Oracle = 'oracle',
  DB2 = 'db2',
  Snowflake = 'snowflake',
}

export enum DatabaseType {
  File = 'file',
  Dir = 'dir',
  Db = 'db',
}

export type ModelAttributes<M extends Model = Model, TAttributes = any> = {
  /**
   * The description of a database column
   */
  [name in keyof TAttributes]: ModelAttributeColumnOptions<M>
}

export type DatabaseReturn<T> = T & {
  _save: (data: T) => Promise<void>
}

export type DatabaseClassInstance<T extends Record<string, any>> = {
  /** 数据库标识 */
  dialect: Dialect

  model: ModelStatic<Model>

  databasePath: string
  databaseType: DatabaseType

  /** 表名 */
  modelName: string

  /** 表定义 */
  modelSchema: ModelAttributes<Model>

  /** 检查数据库是否可用 */
  check (): Promise<boolean>

  /**
   * 初始化表
   * @param DataDir 插件数据目录
   * @param modelName 表名
   * @param modelSchema 表定义
   * @param type 数据库类型
   */
  init (DataDir: string, modelName: string, modelSchema: ModelAttributes<Model>, type: DatabaseType): Promise<DatabaseClassInstance<T>>

  /** 将表定义转换为 JSON 对象 */
  schemaToJSON (pk: string): T

  /** 获取用户数据文件路径 */
  userPath (pk: string): string

  /** 根据主键读取用户数据文件 */
  readSync (path: string, pk: string): DatabaseReturn<T>

  /** 根据主键读取用户数据目录 */
  readDirSync (pk: string): DatabaseReturn<T>

  /** 写入用户数据文件 */
  writeFileSync (pk: string, data: Record<string, any>): boolean

  /** 写入用户数据目录 */
  writeDirSync (pk: string, data: Record<string, any>): boolean

  /** 保存用户数据到文件 */
  saveFile (pk: string): (data: T) => Promise<void>

  /** 保存用户数据到目录 */
  saveDir (pk: string): (data: T) => Promise<void>

  /** 保存用户数据到 SQL 数据库 */
  saveSql (model: Model<any, any>, pk: string): (data: T) => Promise<void>

  /** 根据主键查找或创建用户数据 */
  findByPk (pk: string, create: true): Promise<DatabaseReturn<T>>

  /** 根据主键查找用户数据 */
  findByPk (pk: string, create: boolean): Promise<DatabaseReturn<T> | undefined>

  /** 根据主键数组查找用户数据 */
  findAllByPks (pks: string[]): Promise<DatabaseReturn<T>[]>

  /** 删除用户数据 */
  destroy (pk: string): Promise<boolean>
}

export interface DatabaseClassStatic {
  Column (
    type: keyof typeof DataTypes, def: any, option?: Partial<ModelAttributeColumnOptions<Model>>
  ): ModelAttributeColumnOptions<Model>

  ArrayColumn (
    key: string, fn?: (data: string[]) => string[]
  ): ModelAttributeColumnOptions<Model>

  JsonColumn (
    key: string, def: { [key in string]: any }
  ): ModelAttributeColumnOptions<Model>
}
