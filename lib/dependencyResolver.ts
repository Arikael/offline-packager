import * as fs from 'node:fs'
import pacote from 'pacote'
import { logger } from './logger.js'
import { Dependency } from './caching/dependency'
import { isManifest } from './typeHelpers'
import { Cache } from './caching/cache'
import {
  BaseDependency,
  DependencyType,
  ManifestDependencies,
} from './baseDependency'

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
      const dependencyManifest = await pacote.manifest(
        baseDependency.nameAndVersion,
      )
      const manifestNameAndVersion =
        dependencyManifest.name + '@' + dependencyManifest.version

      if (await this._cache.exists(manifestNameAndVersion)) {
        logger.debug(
          baseDependency,
          `dependency from ${manifest.name + '@' + manifest.version} already in cache`,
        )
      } else {
        // TODO check how to better assign runId and handle cache
        const dependency = Dependency.fromNameAndVersion(dependencyManifest)
        dependency.runId = this._runId
        await this._cache.add(dependency)

        resolvedDependencies.push(dependency)
        logger.debug(
          baseDependency,
          `dependency from ${manifest.name + '@' + manifest.version} added to cache`,
        )
      }

      const childDependencies =
        await this.resolveDependencies(dependencyManifest)
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

    if (!isManifest(content)) {
      throw new Error(`the file ${packageJsonPath} is not a valid manifest`)
    }

    const manifest: ManifestDependencies = {
      name: content.name,
      version: content.version,
    }

    if (content.dependencies) {
      manifest.dependencies = content.dependencies
    }

    return manifest
  }
}
