import * as fs from 'node:fs'
import pacote from 'pacote'
import { logger } from './logger.js'
import { Dependency, DependencyType, ManifestDependencies } from './dependency'
import { isManifestWithDependencies } from './typeHelpers'
import { InMemoryCache } from './caching/inMemoryCache'

export interface ResolveOptions {
  packageJsonPath: string
  destPath: string
}

export class DependencyResolver {
  private _cache: InMemoryCache = new InMemoryCache()

  async resolvePackageJson(packageJsonPath: string): Promise<Dependency[]> {
    const manifest = await this.getManifestFromPackageJson(packageJsonPath)
    return await this.resolveDependencies(manifest)
  }

  private async resolveDependencies(
    manifest: ManifestDependencies,
  ): Promise<Dependency[]> {
    const dependencies = this.getDependenciesFromManifest(
      manifest,
      'dependencies',
    )

    for (const dependency of dependencies) {
      if (await this._cache.has(dependency)) {
        logger.debug(dependency, 'dependency already in cache')
        continue
      }

      const manifest = await pacote.manifest(dependency.nameAndVersion)
      await this._cache.set(dependency)
      logger.debug(dependency, 'dependency added to cache')

      await this.resolveDependencies(manifest)
    }

    return this._cache.entries()
  }

  private getDependenciesFromManifest(
    manifest: ManifestDependencies,
    type: DependencyType,
  ): Dependency[] {
    if (manifest[type]) {
      // TODO: dont use !, better narrow down type
      return Object.entries(manifest[type]!).map(
        (x: [key: string, value: string]) => new Dependency(x[0], x[1]),
      )
    }

    return []
  }

  private async getManifestFromPackageJson(
    packageJsonPath: string,
  ): Promise<ManifestDependencies> {
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('packageJsonPath does not exist')
    }

    const packageJson = await fs.promises.readFile(packageJsonPath, 'utf8')
    const content = JSON.parse(packageJson)

    if (!isManifestWithDependencies(content)) {
      logger.info(
        packageJsonPath,
        'is either not a package.json file or does not have any dependencies',
      )
      return {}
    }

    if (content.dependencies) {
      return {
        dependencies: content.dependencies,
      }
    }

    return {}
  }
}
