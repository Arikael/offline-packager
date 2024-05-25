import { Dependency } from './dependency'
import pacote from 'pacote'
import * as fs from 'node:fs'
import { logger } from './logger'
export class DependencyDownloader {
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
