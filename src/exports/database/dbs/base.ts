import { common } from '@/exports/utils'
import { existToMkdirSync, json, logger, rmSync } from 'node-karin'
import lodash from 'node-karin/lodash'
import fs from 'node:fs'
import path from 'node:path'
import { Model, ModelStatic } from 'sequelize'
import { ColumnOptionType, DatabaseReturn, DatabaseType, ModelAttributes } from '../types'

export class DbBase<T extends Record<string, any>, D extends DatabaseType> {
  primaryKey: keyof T | undefined

  declare model: ModelStatic<Model> | undefined

  declare databasePath: string
  declare databaseType: D

  declare modelName: string
  declare modelSchema: ModelAttributes<Model, T>
  declare modelSchemaDefine: Partial<Record<keyof T, any>>

  initBase (DataDir: string, modelName: string, modelSchema: ModelAttributes<Model, T>, modelSchemaDefine: Partial<Record<keyof T, any>>, type: D, primaryKey?: keyof T) {
    this.primaryKey = primaryKey

    this.databaseType = type
    this.databasePath = path.join(DataDir, modelName)
    if (type !== DatabaseType.Db) {
      existToMkdirSync(this.databasePath)
    }

    this.modelName = modelName
    this.modelSchema = modelSchema
    this.modelSchemaDefine = modelSchemaDefine
  }

  schemaToJSON (pk: string): T {
    const primaryKey = this.model?.primaryKeyAttribute || this.primaryKey!

    const result: Record<string, any> = {
      [primaryKey]: pk
    }
    this.modelSchema.forEach(({ key, type, Option }) => {
      if (key !== primaryKey) {
        const Value = typeof Option.defaultValue === 'function' ? Option.defaultValue() : Option.defaultValue
        result[key as string] = type === ColumnOptionType.Json ? JSON.parse(Value) : ColumnOptionType.Array ? Value.split(',') : Value
      }
    })

    return result as T
  }

  userPath (pk: string) {
    if (this.databaseType === DatabaseType.Dir) {
      return path.join(this.databasePath, pk)
    }

    return path.join(this.databasePath, `${pk}.json`)
  }

  readSync (path: string, pk: string): DatabaseReturn<T>[DatabaseType.File] {
    const result: DatabaseReturn<T>[D] = json.readSync(path)

    result.save = this.saveFile(pk)
    result.destroy = () => this.destroyPath(pk)

    return result
  }

  readDirSync (pk: string): DatabaseReturn<T>[DatabaseType.Dir] {
    const path = this.userPath(pk)
    const files = fs.readdirSync(path)

    const result: Record<string, any> = {
      save: this.saveDir(pk),
      destroy: () => this.destroyPath(pk),
      [this.primaryKey!]: pk
    }
    const filePromises = files.map(async (file) => {
      const data = await json.read(`${path}/${file}`)
      result[data.key] = data.data
    })

    Promise.all(filePromises).then().catch((err) => {
      logger.error(err)
    })

    return result as DatabaseReturn<T>[D]
  }

  writeDirSync (pk: string, data: Record<string, any>) {
    const path = this.userPath(pk)

    this.modelSchema.forEach(({ key, type, Option }) => {
      if (key !== this.primaryKey!) {
        const mergeData = common.filterData(data[key as string], Option.defaultValue, this.modelSchemaDefine[key])

        json.writeSync(`${path}/${key as string}.json`, {
          key,
          [this.primaryKey!]: pk,
          data: mergeData
        })
      }
    })

    return true
  }

  saveFile (pk: string): (data: T) => Promise<DatabaseReturn<T>[DatabaseType.File]> {
    return async (data: Partial<T>) => {
      const userPath = this.userPath(pk)

      const mergeData = common.filterData(data, this.schemaToJSON(pk), this.modelSchemaDefine)

      delete data[this.primaryKey!]

      json.writeSync(userPath, mergeData)

      return this.readSync(userPath, pk)
    }
  }

  saveDir (pk: string): (data: T) => Promise<DatabaseReturn<T>[DatabaseType.Dir]> {
    return async (data: Partial<T>) => {
      delete data[this.primaryKey!]

      this.writeDirSync(pk, data)

      return this.readDirSync(pk)
    }
  }

  destroyPath (pk: string): Promise<boolean> {
    return new Promise((resolve) => {
      const userPath = this.userPath(pk)

      try {
        rmSync(userPath, { recursive: true })

        resolve(true)
      } catch (err) {
        logger.error(err)

        resolve(false)
      }
    })
  }

  saveSql (model: Model<any, any>, pk: string): (data: Partial<T>) => Promise<DatabaseReturn<T>[DatabaseType.Db]> {
    return async (data: Partial<T>) => {
      delete data[this.model!.primaryKeyAttribute]

      const defData = this.schemaToJSON(pk)

      const mergeData: Partial<T> = {}
      lodash.forEach(data, (value, key: keyof T) => {
        if (value !== undefined && value !== null) {
          mergeData[key] = common.filterData(value, defData[key], this.modelSchemaDefine[key])
        }
      })

      const result = await model.update(mergeData)

      return {
        ...result.toJSON<T>(),
        save: this.saveSql(result, pk),
        destroy: () => this.destroySql(pk)
      }
    }
  }

  destroySql (pk: string): Promise<boolean> {
    return new Promise((resolve) => {
      const result = this.model!.destroy({ where: { [this.model!.primaryKeyAttribute]: pk } })
        .then(count => count > 0).catch(() => false)

      resolve(result)
    })
  }
}
