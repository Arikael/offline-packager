import * as fs from 'node:fs'
import pacote from 'pacote'
import { logger } from './logger.js'
import {
  BaseDependency,
  Dependency,
  DependencyType,
  ManifestDependencies,
} from './dependency'
import { isManifestWithDependencies } from './typeHelpers'
import { Cache } from './caching/cache'

export interface ResolveOptions {
  packageJsonPath: string
  destPath: string
}

export class DependencyResolver {
  private _cache: Cache
  private _runId: number

  constructor(cache: Cache, runId: number) {
    this._cache = cache
    this._runId = runId
  }

  async resolvePackageJson(packageJsonPath: string): Promise<Dependency[]> {
    const manifest = await this.getManifestFromPackageJson(packageJsonPath)
    return await this.resolveDependencies(manifest)
  }

  private async resolveDependencies(
    manifest: ManifestDependencies,
  ): Promise<Dependency[]> {
    const resolvedDependencies: Dependency[] = []
    const dependencies = this.getDependenciesFromManifest(
      manifest,
      'dependencies',
    )

    for (const baseDependency of dependencies) {
      const manifest = await pacote.manifest(baseDependency.nameAndVersion)

      if (await this._cache.exists(manifest.name + '@' + manifest.version)) {
        logger.debug(baseDependency, 'dependency already in cache')
      } else {
        // TODO check how to better assign runId and handle cache
        const dependency = Dependency.fromBaseDependency(manifest)
        dependency.runId = this._runId
        await this._cache.add(dependency)

        resolvedDependencies.push(dependency)
        logger.debug(dependency, 'dependency added to cache')
      }

      const childDependencies = await this.resolveDependencies(manifest)
      childDependencies.forEach((x) => resolvedDependencies.push(x))
    }

    return resolvedDependencies
  }

  private getDependenciesFromManifest(
    manifest: ManifestDependencies,
    type: DependencyType,
  ): BaseDependency[] {
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
