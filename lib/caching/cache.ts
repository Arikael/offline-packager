import { Dependency, DependencyStatus } from '../dependency'
import { InMemoryCache } from './inMemoryCache'
import { SqliteCache } from './sqliteCache'
import { CacheType } from './cacheType'

export interface Cache {
  set(dependency: Dependency): Promise<void>
  get(packageAndVersion: string): Promise<Dependency | undefined>
  exists(packageAndVersion: string, status?: DependencyStatus): Promise<boolean>
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

  await cache.initialize()

  return cache
}
