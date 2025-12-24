import { common, DefineDataPropEnum, DefineDataTypeArray, DefineDataTypeOArray, DefineDataTypeObject, DefineDataTypeValue, IsUniformRecord } from '@/exports/utils'
import { existToMkdirSync, json, logger, rmSync } from 'node-karin'
import lodash from 'node-karin/lodash'
import fs from 'node:fs'
import path from 'node:path'
import { DataTypes, Model, ModelStatic } from 'sequelize'
import { Database } from '../database'
import { DatabaseReturn, DatabaseType, ModelAttributes } from '../types'

export class DbBase<T extends Record<string, any>, D extends DatabaseType> {
  primaryKey: keyof T | undefined

  declare model: ModelStatic<Model> | undefined

  declare databasePath: string
  declare databaseType: D

  declare modelName: string
  declare modelSchemaDefine: DefineDataTypeObject<T>

  initBase (DataDir: string, modelName: string, modelSchemaDefine: DefineDataTypeObject<T>, type: D, primaryKey?: keyof T) {
    this.primaryKey = primaryKey

    this.databaseType = type
    this.databasePath = path.join(DataDir, modelName)

    type !== DatabaseType.Db && existToMkdirSync(this.databasePath)

    this.modelName = modelName
    this.modelSchemaDefine = modelSchemaDefine
  }

  getModelSchemaOptions (): ModelAttributes<Model, T> {
    const modelSchemaOptions: ModelAttributes<Model, T> = []

    lodash.forEach(this.modelSchemaDefine.default, (define, key) => {
      switch (define.prop) {
        case DefineDataPropEnum.Value: {
          const value = define as DefineDataTypeValue<T[keyof T]>

          const type: keyof typeof DataTypes = value.type === 'text' ? 'TEXT' : value.type === 'number' ? 'INTEGER' : value.type === 'boolean' ? 'BOOLEAN' : 'STRING'

          if (this.modelSchemaDefine.required!.includes(key)) {
            modelSchemaOptions.push(Database.PkColumn(key, type))
          } else {
            modelSchemaOptions.push(Database.Column(key, type, value.default))
          }
          break
        }
        case DefineDataPropEnum.Array: {
          const Array = define as DefineDataTypeArray<T[keyof T]>
          modelSchemaOptions.push(Database.ArrayColumn(key, Array.defaultItem.prop === DefineDataPropEnum.Value, Array.default))
          break
        }
        case DefineDataPropEnum.Object:
        case DefineDataPropEnum.OArray: {
          const Object = define as IsUniformRecord<T[keyof T]> extends true ? DefineDataTypeOArray<T[keyof T]> : DefineDataTypeObject<T[keyof T]>
          modelSchemaOptions.push(Database.ObjectColumn(key, Object.default))
          break
        }
      }
    })

    return modelSchemaOptions
  }

  SchemaDefault (pk: string): T {
    return common.filterData({ [this.primaryKey!]: pk } as T, this.modelSchemaDefine)
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

    lodash.forEach(this.modelSchemaDefine, (define, key) => {
      if (key !== this.primaryKey!) {
        const mergeData = common.filterData(data[key], define as any)

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

      const mergeData = common.filterData(data, this.modelSchemaDefine)
      delete mergeData[this.primaryKey!]

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
      const mergeData: Partial<T> = common.filterData(data, this.modelSchemaDefine)
      delete mergeData[this.model!.primaryKeyAttribute]

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
