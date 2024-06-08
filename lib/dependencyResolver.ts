import * as fs from 'node:fs'
import pacote from 'pacote'
import { logger } from './logger.js'
import { Dependency } from './caching/dependency'
import { isManifest } from './typeHelpers'
import { Cache } from './caching/cache'
import {
  BaseDependency,
  DependencyType,
  SimpleManifest,
} from './baseDependency'

export class DependencyResolver {
  private _cache: Cache
  private _runId: number
  private concurrent = 0
  public concurrentResult: number[] = []

  constructor(cache: Cache, runId: number) {
    this._cache = cache
    this._runId = runId
  }

  async resolvePackageJson(packageJsonPath: string): Promise<Dependency[]> {
    const manifest = await this.getManifestFromPackageJson(packageJsonPath)
    return await this.resolveDependencies(manifest)
  }

  private async resolveDependency(
    dependency: BaseDependency,
    parentManifest: SimpleManifest,
  ): Promise<Dependency[]> {
    const resolvedDependencies: Dependency[] = []
    const dependencyManifest = await pacote.manifest(dependency.nameAndVersion)
    const manifestNameAndVersion =
      dependencyManifest.name + '@' + dependencyManifest.version

    if (await this._cache.exists(manifestNameAndVersion)) {
      logger.debug(
        dependency,
        `dependency from ${parentManifest.name + '@' + parentManifest.version} already in cache`,
      )
    } else {
      // TODO check how to better assign runId and handle cache
      const dependency = Dependency.fromNameAndVersion(dependencyManifest)
      dependency.runId = this._runId
      await this._cache.add(dependency)

      resolvedDependencies.push(dependency)
      logger.debug(
        dependency,
        `dependency from ${parentManifest.name + '@' + parentManifest.version} added to cache`,
      )
    }

    const childDependencies = await this.resolveDependencies(dependencyManifest)

    return resolvedDependencies.concat(childDependencies)
  }

  private async resolveDependencies(
    manifest: SimpleManifest,
  ): Promise<Dependency[]> {
    const dependencies = this.getDependenciesFromManifest(
      manifest,
      'dependencies',
    )

    this.concurrent += dependencies.length
    this.concurrentResult.push(this.concurrent)

    const resolveDependencies = dependencies.map((d) =>
      this.resolveDependency(d, manifest),
    )
    const childDependencies = await Promise.all(resolveDependencies)
    this.concurrent -= childDependencies.length
    this.concurrentResult.push(this.concurrent)

    return childDependencies.reduce((prev, current) => {
      return prev.concat(current)
    }, [])
  }

  private getDependenciesFromManifest(
    manifest: SimpleManifest,
    type: DependencyType,
  ): BaseDependency[] {
    if (manifest[type]) {
      // TODO: dont use !, better narrow down type
      return Object.entries(manifest[type]!).map(
        (x: [key: string, value: string]) => new BaseDependency(x[0], x[1]),
      )
    }

    return []
  }

  private async getManifestFromPackageJson(
    packageJsonPath: string,
  ): Promise<SimpleManifest> {
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('packageJsonPath does not exist')
    }

    const packageJson = await fs.promises.readFile(packageJsonPath, 'utf8')
    const content = JSON.parse(packageJson)

    if (!isManifest(content)) {
      throw new Error(`the file ${packageJsonPath} is not a valid manifest`)
    }

    const manifest: SimpleManifest = {
      name: content.name,
      version: content.version,
    }

    if (content.dependencies) {
      manifest.dependencies = content.dependencies
    }

    return manifest
  }
}
