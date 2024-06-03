import { Dependency, DependencyStatus } from './dependency'
import { Cache } from './cache'
import Database, { Statement } from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

export class SqliteCache implements Cache {
  private defaultColumns: string[] = [
    'name',
    'version',
    'status',
    'statusDate',
    'source',
    'runId',
  ]

  private preparedStatements: Map<string, Statement> = new Map()

  getNextRunId(): Promise<number> {
    const statement = this.getStatement(
      'maxRunId',
      'SELECT MAX(runId) + 1 FROM Dependencies',
    )
    const result = statement.get()

    if (typeof result === 'number') {
      return Promise.resolve(result)
    }

    return Promise.resolve(1)
  }

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

  private getStatement(key: string, sql: string): Statement {
    let statement = this.preparedStatements.get(key)

    if (!statement) {
      statement = this.db.prepare(sql)
      this.preparedStatements.set(key, statement)
    } else if (statement.source !== sql) {
      throw new Error(
        `you tried to overwrite the statement with key ${key} with a new sql query`,
      )
    }

    return statement
  }

  async initialize(): Promise<void> {
    const dbDirectory = './'
    const dbName = 'offline-packager.db'

    await fs.promises.mkdir(dbDirectory, {
      recursive: true,
    })

    const dbPath = path.join(dbDirectory, dbName)
    this._db = new Database(dbPath, {})

    const migrationFile = './caching/sqlite-migration.sql'
    const sql = await fs.promises.readFile(migrationFile, 'utf-8')
    this.db.exec(sql)
  }

  add(dependency: Dependency): Promise<void> {
    const statement = this.getStatement(
      'set',
      'INSERT INTO dependencies (name, version, status, statusDate, source, runId) ' +
        'VALUES(@name, @version, @status, @statusDate, @source, @runId)',
    )

    statement.run({
      name: dependency.name,
      version: dependency.version,
      status: dependency.status,
      statusDate: dependency.statusDate.toISOString(),
      source: 'npm',
      runId: dependency.runId,
    })

    return Promise.resolve()
  }

  get(packageAndVersion: string): Promise<Dependency | undefined> {
    const statement = this.getStatement(
      'get',
      `SELECT ${this.defaultColumns.join(',')} FROM dependencies WHERE nameAndVersion = ?`,
    )
    const dependency = statement.get(packageAndVersion)

    return Promise.resolve(Dependency.tryConvertToDependency(dependency))
  }

  exists(nameAndVersion: string, status?: DependencyStatus): Promise<boolean> {
    const params = {
      nameAndVersion,
      status: status ? status : null,
    }
    const sql =
      `SELECT ${this.defaultColumns.join(',')} FROM dependencies ` +
      'WHERE nameAndVersion = @nameAndVersion AND (status = @status OR @status IS NULL)'

    const statement = this.getStatement('exists', sql)
    const dependency = statement.get(params)

    return Promise.resolve(dependency !== undefined)
  }

  getAll(status?: DependencyStatus): Promise<Dependency[]> {
    const sql = `SELECT ${this.defaultColumns.join(',')} FROM Dependencies WHERE status = @status OR @status IS NULL`
    const statement = this.getStatement('getAll', sql)
    const result = statement.all({ status })

    const dependencies = result
      .filter((x) => Dependency.isDependency(x))
      .map((x) => Dependency.convertToDependency(x))

    return Promise.resolve(dependencies)
  }

  deleteAll(status?: DependencyStatus): Promise<void> {
    const sql =
      'DELETE FROM Dependencies WHERE status = @status OR @status IS NULL'

    const statement = this.getStatement('deleteAll', sql)
    statement.run(status)

    return Promise.resolve()
  }
}
