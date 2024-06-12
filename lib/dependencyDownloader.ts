import { Dependency } from './caching/dependency'
import pacote from 'pacote'
import * as fs from 'node:fs'
import { logger } from './logger'
import { Cache } from './caching/cache'

export class DependencyDownloader {
  private _cache: Cache

  constructor(cache: Cache) {
    this._cache = cache
  }

  async downloadDependencies(dependencies: Dependency[], destination: string) {
    if (!fs.existsSync(destination)) {
      throw new Error('directory does not exist')
    }

    try {
      await fs.promises.access(destination, fs.constants.X_OK)
    } catch (error) {
      logger.error('destination ist not a directory')
      throw error
    }

    for (const dependency of dependencies) {
      await pacote.tarball.file(dependency.nameAndVersion, destination)
    }
  }
}
