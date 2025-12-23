import { dir } from '@/dir'
import { DefineDataTypeOArray, DefineDataTypeObject, IsUniformRecord } from '@/exports/utils'
import { existsSync, json, logger, mkdirSync, rmSync } from 'node-karin'
import fs from 'node:fs'
import path from 'node:path'
import { DataTypes, Model, ModelAttributeColumnOptions, Op, Sequelize } from 'sequelize'
import { ColumnOption, ColumnOptionType, DatabaseArray, DatabaseClassInstance, DatabaseClassStatic, DatabaseReturn, DatabaseType, Dialect } from '../types'
import { DbBase } from './base'

const dialect = Dialect.Sqlite

const sequelize = new Sequelize({
  storage: path.join(dir.DataDir, 'database', 'sqlite3.db'), dialect, logging: false
})

export class Sqlite3<T extends Record<string, any>, D extends DatabaseType> extends DbBase<T, D> implements DatabaseClassInstance<T, D> {
  dialect: Dialect = dialect

  async check (): Promise<boolean> {
    try {
      await sequelize.authenticate()
      return true
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async init (DataDir: string, modelName: string, modelSchemaDefine: IsUniformRecord<T> extends true ? DefineDataTypeOArray<T> : DefineDataTypeObject<T>, type: D, primaryKey?: keyof T): Promise<DatabaseClassInstance<T, D>> {
    this.initBase(DataDir, modelName, modelSchemaDefine, type, primaryKey)

    if (this.databaseType === DatabaseType.Db) {
      const modelSchemaOptions = this.getModelSchemaOptions()

      const modelSchema = modelSchemaOptions.reduce((acc, cur) => {
        acc[cur.key] = cur.Option
        return acc
      }, {} as Record<keyof T, ModelAttributeColumnOptions<Model>>)

      this.model = sequelize.define(this.modelName, modelSchema, {
        timestamps: false, freezeTableName: true
      })
      await this.model.sync()

      const queryInterface = sequelize.getQueryInterface()
      const tableDescription = await queryInterface.describeTable(this.modelName)

      for (const Schema of modelSchemaOptions) {
        const { key, Option } = Schema
        const _key = key as string

        if (!tableDescription[_key]) {
          await queryInterface.addColumn(this.modelName, _key, Option)
          if (typeof Option === 'string') continue

          const defaultValue = Option.defaultValue
          if (defaultValue !== undefined) {
            await this.model.update({ [_key]: defaultValue }, { where: {} })
          }
        }
      }
    }

    return this
  }

  async findByPk (pk: string, create: true): Promise<DatabaseReturn<T>[D]>
  async findByPk (pk: string, create?: false): Promise<DatabaseReturn<T>[D] | undefined>
  async findByPk (pk: string, create: boolean = false): Promise<DatabaseReturn<T>[D] | undefined> {
    if (this.databaseType !== DatabaseType.Db) {
      const path = this.userPath(pk)
      if (!existsSync(path)) {
        if (create) {
          const data = this.SchemaDefault(pk)

          if (this.databaseType === DatabaseType.Dir) {
            mkdirSync(path)
            this.writeDirSync(pk, data)

            return {
              ...data,
              save: this.saveDir(pk),
              destroy: () => this.destroyPath(pk)
            } as DatabaseReturn<T>[D]
          } else {
            json.writeSync(path, data)

            return {
              ...data,
              save: this.saveFile(pk),
              destroy: () => this.destroyPath(pk)
            } as DatabaseReturn<T>[D]
          }
        }

        return undefined
      }

      if (this.databaseType === DatabaseType.Dir) {
        return this.readDirSync(pk) as DatabaseReturn<T>[D]
      } else {
        return this.readSync(path, pk) as DatabaseReturn<T>[D]
      }
    } else {
      let result = await this.model!.findByPk(pk)
      if (!result && create) {
        result = await this.model!.create(this.SchemaDefault(pk))
      }
      if (!result) return undefined

      return {
        ...result.toJSON<T>(),
        save: this.saveSql(result, pk),
        destroy: () => this.destroySql(pk)
      }
    }
  }

  async findAllByPks (pks: string[]): Promise<DatabaseReturn<T>[D][]> {
    if (this.databaseType !== DatabaseType.Db) {
      const result: DatabaseReturn<T>[D][] = []
      pks.forEach((pk) => {
        const path = this.userPath(pk)
        if (existsSync(path)) {
          if (this.databaseType === DatabaseType.Dir) {
            result.push(this.readDirSync(pk) as DatabaseReturn<T>[D])
          } else {
            result.push(this.readSync(path, pk) as DatabaseReturn<T>[D])
          }
        }
      })

      return result
    } else {
      const result = await this.model!.findAll({
        where: {
          [this.model!.primaryKeyAttribute]: pks
        }
      })

      return result.map((item) => ({
        ...item.toJSON<T>(),
        save: this.saveSql(item, item[this.model!.primaryKeyAttribute as keyof Model<any, any>]),
        destroy: () => this.destroySql(item[this.model!.primaryKeyAttribute as keyof Model<any, any>])
      }))
    }
  }

  async findAll (excludePks?: string[]): Promise<DatabaseReturn<T>[D][]> {
    const excludeSet = new Set(excludePks || [])

    if (this.databaseType !== DatabaseType.Db) {
      const result: DatabaseReturn<T>[D][] = []
      const files = fs.readdirSync(this.databasePath)

      if (this.databaseType === DatabaseType.Dir) {
        files.forEach((file) => {
          if (excludeSet.has(file)) return

          const stat = fs.statSync(path.join(this.databasePath, file))
          if (stat.isDirectory()) {
            result.push(this.readDirSync(file) as DatabaseReturn<T>[D])
          }
        })
      } else {
        files.forEach((file) => {
          if (!file.endsWith('.json')) return

          const pk = file.replace('.json', '')
          if (excludeSet.has(pk)) return

          result.push(this.readSync(this.userPath(pk), pk) as DatabaseReturn<T>[D])
        })
      }

      return result
    } else {
      const whereClause = excludePks && excludePks.length > 0
        ? { [this.model!.primaryKeyAttribute]: { [Op.notIn]: excludePks } }
        : {}

      const result = await this.model!.findAll({ where: whereClause })

      return result.map((item) => ({
        ...item.toJSON<T>(),
        save: this.saveSql(item, item[this.model!.primaryKeyAttribute as keyof Model<any, any>]),
        destroy: () => this.destroySql(item[this.model!.primaryKeyAttribute as keyof Model<any, any>])
      }))
    }
  }

  async destroy (pk: string): Promise<boolean> {
    if (this.databaseType !== DatabaseType.Db) {
      rmSync(this.userPath(pk), { recursive: true })

      return true
    } else {
      const destroyed = await this.model!.destroy({
        where: { [this.model!.primaryKeyAttribute]: pk }
      })

      return destroyed > 0
    }
  }
}

export const Sqlite3Static = new class Sqlite3Static implements DatabaseClassStatic {
  dialect = dialect
  description = '插件默认数据库'

  Column = <T, K extends string> (
    key: K, type: keyof typeof DataTypes, def: T, option?: Partial<ModelAttributeColumnOptions<Model>>
  ): ColumnOption<ColumnOptionType.Normal, K> => (
    {
      key,
      type: ColumnOptionType.Normal,
      Option: {
        type: DataTypes[type],
        defaultValue: def,
        ...option
      }
    }
  )

  ArrayColumn = <T, K extends string> (
    key: K, split: boolean, def: T[] = []
  ): ColumnOption<ColumnOptionType.Array, K> => (
    {
      key,
      type: ColumnOptionType.Array,
      Option: {
        type: DataTypes.STRING,
        defaultValue: def.join(','),
        get (): DatabaseArray<T> {
          let data = this.getDataValue(key)
          if (split) {
            return new DatabaseArray<T>(data.split(',').filter(Boolean))
          } else {
            try {
              data = JSON.parse(data) || []
            } catch (e) {
              data = []
            }

            return new DatabaseArray<T>(data)
          }
        },
        set (data: DatabaseArray<T>) {
          this.setDataValue(key, (data || []).join(','))
        }
      }
    }
  )

  ObjectColumn = <T, K extends string> (
    key: K, def: T = {} as T
  ): ColumnOption<ColumnOptionType.Json, K> => (
    {
      key,
      type: ColumnOptionType.Json,
      Option: {
        type: DataTypes.STRING,
        defaultValue: JSON.stringify(def),
        get (this: Model): T {
          let data = this.getDataValue(key)
          try {
            data = JSON.parse(data) || def
          } catch (e) {
            data = def
          }
          return data
        },
        set (this: Model, data: T) {
          this.setDataValue(key, JSON.stringify(data))
        }
      }
    }
  )
}()
