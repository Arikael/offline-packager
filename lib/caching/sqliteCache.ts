import { Dependency, DependencyStatus } from '../dependency'
import { Cache } from './cache'
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export class SqliteCache implements Cache {
  private defaultColumns: string[] = [
    'name',
    'version',
    'status',
    'statusDate',
    'source',
  ]

  dispose(): Promise<void> {
    this.db.close()

    return Promise.resolve()
  }

  private _db?: Database.Database

  private get db(): Database.Database {
    if (!this._db) {
      throw new Error('db is not initialized, call initialize() first')
    }
    return this._db
  }

  async initialize(): Promise<void> {
    const dbDirectory = path.join(os.homedir(), '.offline-packager')
    const dbName = 'offline-packager.db'
    const dbExists = fs.existsSync(dbName)

    await fs.promises.mkdir(dbDirectory, {
      recursive: true,
    })

    const dbPath = path.join(dbDirectory, dbName)
    this._db = new Database(dbPath, {})

    if (!dbExists) {
      const migrationFile = './caching/sqlite-migration.sql'
      const sql = await fs.promises.readFile(migrationFile, 'utf-8')
      this.db.exec(sql)
    }
  }

  set(dependency: Dependency): Promise<void> {
    const statement = this.db.prepare(
      'INSERT INTO dependencies (name, version, status, statusDate, source)',
    )

    statement.run(
      dependency.name,
      dependency.version,
      dependency.status,
      dependency.statusDate,
      'npm',
    )

    return Promise.resolve()
  }

  get(packageAndVersion: string): Promise<Dependency | undefined> {
    const statement = this.db.prepare(
      `SELECT ${this.defaultColumns.join(',')} FROM dependencies WHERE nameAndVersion = ?`,
    )
    const dependency = statement.get(packageAndVersion)

    return Promise.resolve(Dependency.tryConvertToDependency(dependency))
  }

  exists(
    packageAndVersion: string,
    status?: DependencyStatus,
  ): Promise<boolean> {
    let sql = `SELECT ${this.defaultColumns.join(',')} FROM dependencies WHERE nameAndVersion = ?`

    if (status) {
      sql += ' AND status = ?'
    }

    const statement = this.db.prepare(sql)
    const dependency = statement.run(packageAndVersion, status)

    return Promise.resolve(dependency !== undefined)
  }

  getAll(status?: DependencyStatus): Promise<Dependency[]> {
    let sql = `SELECT ${this.defaultColumns.join(',')} FROM Dependencies`

    if (status) {
      sql += ' WHERE status = ?'
    }

    const statement = this.db.prepare(sql)
    const result = statement.all(status)
    const dependencies = result
      .filter((x) => Dependency.isDependency(x))
      .map((x) => Dependency.convertToDependency(x))

    return Promise.resolve(dependencies)
  }

  deleteAll(status?: DependencyStatus): Promise<void> {
    let sql = 'DELETE FROM Dependencies'

    if (status) {
      sql += ' WHERE status = ?'
    }
    const statement = this.db.prepare(sql)
    statement.run(status)

    return Promise.resolve()
  }
}
