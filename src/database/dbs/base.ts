import { DatabaseReturn, DatabaseType, ModelAttributes } from '@/types'
import { json, logger } from 'node-karin'
import lodash from 'node-karin/lodash'
import fs from 'node:fs'
import path from 'node:path'
import { Model, ModelStatic } from 'sequelize'

export class DbBase<T extends Record<string, any>> {
  declare model: ModelStatic<Model>

  declare databasePath: string
  declare databaseType: DatabaseType

  declare modelName: string
  declare modelSchema: ModelAttributes<Model>

  schemaToJSON (pk: string): T {
    const result: Record<string, any> = {
      [this.model.primaryKeyAttribute]: pk
    }
    lodash.forEach(this.modelSchema, (value, key) => {
      if (key !== this.model.primaryKeyAttribute) {
        result[key] = typeof value.defaultValue === 'function' ? value.defaultValue() : value.defaultValue
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

  readSync (path: string, pk: string): DatabaseReturn<T> {
    const result: DatabaseReturn<T> = json.readSync(path)
    result._save = this.saveFile(pk)

    return result
  }

  readDirSync (pk: string): DatabaseReturn<T> {
    const path = this.userPath(pk)
    const files = fs.readdirSync(path)

    const result: Record<string, any> = {
      _save: this.saveDir(pk),
      [this.model.primaryKeyAttribute]: pk
    }
    const filePromises = files.map(async (file) => {
      const data = await json.read(`${path}/${file}`)
      result[data.key] = data.data
    })

    Promise.all(filePromises).then().catch((err) => {
      logger.error(err)
    })

    return result as DatabaseReturn<T>
  }

  writeFileSync (pk: string, data: Record<string, any>) {
    const defData = this.schemaToJSON(pk)
    for (const key in data) {
      !(key in defData) && delete data[key]
    }

    json.writeSync(this.userPath(pk), lodash.merge({}, defData, data))

    return true
  }

  writeDirSync (pk: string, data: Record<string, any>) {
    const path = this.userPath(pk)
    lodash.forEach(this.modelSchema, (value, key) => {
      if (key !== this.model.primaryKeyAttribute) {
        const result = {
          key,
          [this.model.primaryKeyAttribute]: pk,
          data: data[key] || value.defaultValue
        }
        json.writeSync(`${path}/${key}.json`, result)
      }
    })
    return true
  }

  saveFile (pk: string): (data: T) => Promise<void> {
    return async (data: T) => {
      delete data[this.model.primaryKeyAttribute]

      this.writeFileSync(pk, data)
    }
  }

  saveDir (pk: string): (data: T) => Promise<void> {
    return async (data: T) => {
      delete data[this.model.primaryKeyAttribute]

      this.writeDirSync(pk, data)
    }
  }

  saveSql (model: Model<any, any>, pk: string): (data: T) => Promise<void> {
    return async (data: T) => {
      delete data[this.model.primaryKeyAttribute]

      const Attributes = this.schemaToJSON(pk)
      for (const key in data) {
        !(key in Attributes) && delete data[key]
      }

      await model.update(data)
    }
  }
}
