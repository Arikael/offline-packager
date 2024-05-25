import { Dependency } from '../dependency'
import { Cache } from './cache'

export class InMemoryCache implements Cache {
  clear(): Promise<void> {
    this._entries.clear()

    return Promise.resolve()
  }

  entries(): Promise<Dependency[]> {
    return Promise.resolve(
      Array.from(this._entries.entries()).map(([_, dependency]) => dependency),
    )
  }

  async set(dependency: Dependency): Promise<void> {
    this._entries.set(dependency.nameAndVersion, dependency)

    return Promise.resolve()
  }

  async get(packageAndVersion: string): Promise<Dependency | undefined> {
    return Promise.resolve(this._entries.get(packageAndVersion))
  }

  async has(dependency: Dependency): Promise<boolean> {
    return Promise.resolve(this._entries.has(dependency.nameAndVersion))
  }

  private _entries: Map<string, Dependency> = new Map()
}
