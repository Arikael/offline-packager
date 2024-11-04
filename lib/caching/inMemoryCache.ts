import { Dependency, DependencyStatus } from './dependency'
import { Cache } from './cache'

export class InMemoryCache implements Cache {
  async getNextRunId(): Promise<number> {
    const all = await this.getAll()
    const runId = all.reduce((prev, current) => {
      return prev && prev.runId > current.runId ? prev : current
    }).runId

    return Promise.resolve(runId)
  }
  async dispose(): Promise<void> {
    await this.deleteAll()
  }

  async deleteAll(status?: DependencyStatus): Promise<void> {
    if (status) {
      const dependencies = await this.getAll(status)
      dependencies.forEach((x) => this._entries.delete(x.nameAndVersion))
    } else {
      this._entries.clear()
    }

    return Promise.resolve()
  }

  initialize(): Promise<void> {
    return Promise.resolve()
  }

  getAll(status?: DependencyStatus): Promise<Dependency[]> {
    const dependencies = Array.from(this._entries.entries())
      .filter((x) => x[1].status === status || !status)
      .map(([_, dependency]) => dependency)

    return Promise.resolve(dependencies)
  }

  async add(dependency: Dependency): Promise<void> {
    const exists = await this.exists(dependency.nameAndVersion)

    if (!exists) {
      this._entries.set(dependency.nameAndVersion, dependency)
    }

    return Promise.resolve()
  }

  async get(packageAndVersion: string): Promise<Dependency | undefined> {
    return Promise.resolve(this._entries.get(packageAndVersion))
  }

  async exists(
    dependency: Dependency,
    status?: DependencyStatus,
  ): Promise<boolean> {
    if (status) {
      const dependencyInCache = this._entries.get(dependency.nameAndVersion)
      const exists =
        (dependencyInCache && dependencyInCache.status === status) || false

      return Promise.resolve(exists)
    }

    return Promise.resolve(this._entries.has(dependency))
  }

  private _entries: Map<string, Dependency> = new Map()
}
