import { Dependency, DependencyStatus } from './dependency'
import { InMemoryCache } from './inMemoryCache'
import { SqliteCache } from './sqliteCache'
import { CacheType } from './cacheType'
import { logger } from '../logger'

export interface GetAllOptions {
  status?: DependencyStatus
  runId?: number
}

export interface Cache {
  getNextRunId(): Promise<number>
  add(dependency: Dependency): Promise<void>
  //setStatus(packageAndVersion: string, status: DependencyStatus): Promise<void>
  get(packageAndVersion: string): Promise<Dependency | undefined>
  exists(dependency: Dependency, status?: DependencyStatus): Promise<boolean>
  getAll(status?: DependencyStatus): Promise<Dependency[]>
  deleteAll(status?: DependencyStatus): Promise<void>
  initialize(): Promise<void>
  dispose(): Promise<void>
}

export const createCache = async (cacheType: CacheType): Promise<Cache> => {
  let cache: Cache
  switch (cacheType) {
    case CacheType.InMemory:
      cache = new InMemoryCache()
      break
    case CacheType.Sqlite:
      cache = new SqliteCache()
      break
    default:
      throw new Error(`${cacheType} is not a valid cache type`)
  }

  process.on('exit', () => {
    logger.info('disposing cache')
    cache.dispose()
  })
  process.on('SIGHUP', () => process.exit(128 + 1))
  process.on('SIGINT', () => process.exit(128 + 2))
  process.on('SIGTERM', () => process.exit(128 + 15))
  await cache.initialize()

  return cache
}
