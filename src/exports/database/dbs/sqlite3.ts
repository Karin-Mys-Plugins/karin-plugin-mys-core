import { dir } from '@/dir'
import { DefineDataPropEnum, DefineDataTypeArray, DefineDataTypeOArray, DefineDataTypeObject, DefineDataTypeValue } from '@/exports/utils'
import { existsSync, json, logger, mkdirSync, rmSync } from 'node-karin'
import lodash from 'node-karin/lodash'
import sqlite3, { type Database } from 'node-karin/sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseArray, DatabaseClassInstance, DatabaseReturn, DatabaseType, DataTypes, Dialect } from '../types'
import { DbBase } from './base'

const dialect = Dialect.Sqlite

let sharedDb: Database | null = null

function getSharedDatabase (): Database {
  if (!sharedDb) {
    const dbPath = path.join(dir.DataDir, 'database', 'sqlite3.db')
    sharedDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        logger.error('Failed to open database:', err)
      }
    })
  }
  return sharedDb
}

export class Sqlite3<T extends Record<string, any>, D extends DatabaseType> extends DbBase<T, D> implements DatabaseClassInstance<T, D> {
  declare model: Database

  dialect: Dialect = dialect
  description: string = 'SQLite3数据库'

  async check (): Promise<boolean> {
    try {
      const db = getSharedDatabase()
      return await new Promise<boolean>((resolve) => {
        db.get('SELECT 1', (err) => {
          if (err) {
            logger.error(err)
            resolve(false)
          } else {
            resolve(true)
          }
        })
      })
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  switchProp (define: DefineDataTypeObject<any, any> | DefineDataTypeArray<any> | DefineDataTypeOArray<any> | DefineDataTypeValue<any>) {
    const result: { type: DataTypes, value: any } = { type: DataTypes.TEXT, value: null }

    switch (define.prop) {
      case DefineDataPropEnum.Value: {
        switch (define.type) {
          case 'number':
            result.type = DataTypes.INTEGER
            break
          case 'boolean':
            result.type = DataTypes.BOOLEAN
            break
          case 'text':
          case 'string':
          default:
            result.type = DataTypes.TEXT
            break
        }
        result.value = typeof define.default === 'function' ? null : define.default
        break
      }
      case DefineDataPropEnum.Array:
      case DefineDataPropEnum.Object:
      case DefineDataPropEnum.OArray: {
        result.type = DataTypes.TEXT
        result.value = JSON.stringify(define.default ?? (define.prop === DefineDataPropEnum.Array ? [] : {}))
        break
      }
    }

    return result
  }

  /**
   * 将从数据库读取的数据转换为正确的类型
   * @param row 数据库行数据
   */
  private parseRowData (row: any): void {
    lodash.forEach(this.modelSchemaDefine.default, (define, key) => {
      switch (define.prop) {
        case DefineDataPropEnum.Array:
          try {
            const parsed = JSON.parse(row[key])
            row[key] = new DatabaseArray(Array.isArray(parsed) ? parsed : [])
          } catch (e) {
            row[key] = new DatabaseArray(define.default)
          }
          break
        case DefineDataPropEnum.Object:
        case DefineDataPropEnum.OArray:
          try {
            row[key] = JSON.parse(row[key])
          } catch (e) {
            row[key] = define.default ?? {}
          }
          break
      }
    })
  }

  async init (DataDir: string, modelName: string, modelSchemaDefine: DefineDataTypeObject<T, 1>, type: D): Promise<DatabaseClassInstance<T, D>> {
    this.initBase(DataDir, modelName, modelSchemaDefine, type)

    if (this.databaseType === DatabaseType.Db) {
      this.model = getSharedDatabase()

      // 直接从 modelSchemaDefine 创建表结构
      const columns: string[] = []

      for (const key in this.modelSchemaDefine.default) {
        const define = this.modelSchemaDefine.default[key]
        let constraints = ''
        const { type: sqlType, value: defaultValue } = this.switchProp(define)

        // 判断是否为主键
        const isPrimaryKey = key === this.primaryKey

        // 设置约束
        if (isPrimaryKey) {
          constraints = 'PRIMARY KEY NOT NULL'
        }

        // 设置默认值
        if (defaultValue !== undefined && defaultValue !== null && !isPrimaryKey) {
          const defaultVal = typeof defaultValue === 'string'
            ? `'${defaultValue.replace(/'/g, "''")}'`
            : defaultValue
          constraints += ` DEFAULT ${defaultVal}`.trim()
        }

        columns.push(`${key} ${sqlType} ${constraints}`.trim())
      }

      const createTableSQL = `CREATE TABLE IF NOT EXISTS ${this.modelName} (${columns.join(', ')})`

      await new Promise<void>((resolve, reject) => {
        this.model.run(createTableSQL, (err) => {
          if (err) {
            logger.error('Failed to create table:', err)
            reject(err)
          } else {
            resolve()
          }
        })
      })

      // 检查并添加缺失的列
      const tableInfo = await new Promise<any[]>((resolve, reject) => {
        this.model.all(`PRAGMA table_info(${this.modelName})`, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows || [])
          }
        })
      })

      const existingColumns = new Set(tableInfo.map((col: any) => col.name))

      for (const key in this.modelSchemaDefine.default) {
        const define = this.modelSchemaDefine.default[key]

        if (!existingColumns.has(key) && key !== this.primaryKey) {
          const { type: sqlType, value: defaultValue } = this.switchProp(define)

          const alterSQL = `ALTER TABLE ${this.modelName} ADD COLUMN ${key} ${sqlType}`

          await new Promise<void>((resolve, reject) => {
            this.model.run(alterSQL, (err) => {
              if (err) {
                logger.error(`Failed to add column ${key}:`, err)
                reject(err)
              } else {
                resolve()
              }
            })
          })

          // 设置默认值
          if (defaultValue !== undefined && defaultValue !== null) {
            const updateSQL = `UPDATE ${this.modelName} SET ${key} = ?`
            await new Promise<void>((resolve, reject) => {
              this.model.run(updateSQL, [defaultValue], (err) => {
                if (err) {
                  logger.error(`Failed to set default value for ${key}:`, err)
                  reject(err)
                } else {
                  resolve()
                }
              })
            })
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
      const selectSQL = `SELECT * FROM ${this.modelName} WHERE ${this.primaryKey} = ?`

      let result = await new Promise<any>((resolve, reject) => {
        this.model.get(selectSQL, [pk], (err, row) => {
          if (err) {
            reject(err)
          } else {
            resolve(row)
          }
        })
      })

      if (!result && create) {
        const data: any = this.SchemaDefault(pk)

        const keys = Object.keys(data)
        const placeholders = keys.map(() => '?').join(', ')

        for (const key in this.modelSchemaDefine.default) {
          const define = this.modelSchemaDefine.default[key]
          if (define.prop === DefineDataPropEnum.Array || define.prop === DefineDataPropEnum.Object || define.prop === DefineDataPropEnum.OArray) {
            data[key] = JSON.stringify(data[key])
          }
        }

        const insertSQL = `INSERT INTO ${this.modelName} (${keys.join(', ')}) VALUES (${placeholders})`

        await new Promise<void>((resolve, reject) => {
          this.model.run(insertSQL, Object.values(data), (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })

        result = data
      }

      if (!result) return undefined

      this.parseRowData(result)

      return {
        ...result,
        save: this.saveSqlNative(pk),
        destroy: () => this.destroy(pk)
      } as DatabaseReturn<T>[D]
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
      if (pks.length === 0) return []

      const placeholders = pks.map(() => '?').join(', ')
      const selectSQL = `SELECT * FROM ${this.modelName} WHERE ${this.primaryKey} IN (${placeholders})`

      const rows = await new Promise<any[]>((resolve, reject) => {
        this.model.all(selectSQL, pks, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows || [])
          }
        })
      })

      rows.forEach((row) => this.parseRowData(row))

      return rows.map((item) => ({
        ...item,
        save: this.saveSqlNative(item[this.primaryKey]),
        destroy: () => this.destroy(item[this.primaryKey])
      })) as DatabaseReturn<T>[D][]
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
      let selectSQL = `SELECT * FROM ${this.modelName}`
      const params: string[] = []

      if (excludePks && excludePks.length > 0) {
        const placeholders = excludePks.map(() => '?').join(', ')
        selectSQL += ` WHERE ${this.primaryKey} NOT IN (${placeholders})`
        params.push(...excludePks)
      }

      const rows = await new Promise<any[]>((resolve, reject) => {
        this.model.all(selectSQL, params, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows || [])
          }
        })
      })

      rows.forEach((row) => this.parseRowData(row))

      return rows.map((item) => ({
        ...item,
        save: this.saveSqlNative(item[this.primaryKey]),
        destroy: () => this.destroy(item[this.primaryKey])
      })) as DatabaseReturn<T>[D][]
    }
  }

  async destroy (pk: string): Promise<boolean> {
    if (this.databaseType !== DatabaseType.Db) {
      rmSync(this.userPath(pk), { recursive: true })
      return true
    } else {
      const deleteSQL = `DELETE FROM ${this.modelName} WHERE ${this.primaryKey} = ?`

      return await new Promise<boolean>((resolve) => {
        this.model.run(deleteSQL, [pk], function (err) {
          if (err) {
            logger.error(err)
            resolve(false)
          } else {
            resolve(this.changes > 0)
          }
        })
      })
    }
  }

  private saveSqlNative (pk: string): (data: Partial<T>) => Promise<boolean> {
    return async (data: Partial<T>) => {
      const updateData = { ...data }
      delete updateData[this.primaryKey]

      const keys = Object.keys(updateData).filter(key => updateData[key as keyof T] !== undefined && updateData[key as keyof T] !== null)

      if (keys.length > 0) {
        const setClause = keys.map(key => `${key} = ?`).join(', ')
        const values = keys.map(key => {
          const value = updateData[key as keyof T]
          const define = this.modelSchemaDefine.default[key]

          // 如果是 Array、Object 或 OArray 类型，需要序列化为 JSON
          if (define && (define.prop === DefineDataPropEnum.Array || define.prop === DefineDataPropEnum.Object || define.prop === DefineDataPropEnum.OArray)) {
            return JSON.stringify(value)
          }

          return value
        })

        const updateSQL = `UPDATE ${this.modelName} SET ${setClause} WHERE ${this.primaryKey} = ?`

        await new Promise<void>((resolve, reject) => {
          this.model.run(updateSQL, [...values, pk], (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      }

      return true
    }
  }
}
