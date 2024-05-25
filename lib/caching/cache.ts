import { Dependency } from '../dependency'

export interface Cache {
  set(dependency: Dependency): Promise<void>
  get(packageAndVersion: string): Promise<Dependency | undefined>
  has(dependency: Dependency): Promise<boolean>
  entries(): Promise<Dependency[]>
  clear(): Promise<void>
}
