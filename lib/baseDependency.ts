import type { AbbreviatedManifest } from 'pacote'

export interface NameAndVersion {
  name: string
  version: string
}

export class BaseDependency implements NameAndVersion {
  name: string
  version: string

  constructor(name: string, version: string) {
    this.name = name
    this.version = version
  }

  get nameAndVersion() {
    return this.name + '@' + this.version
  }
}

export type SimpleManifest = Pick<
  AbbreviatedManifest,
  'dependencies' | 'devDependencies' | 'peerDependencies' | 'name' | 'version'
>
export type DependencyType = keyof SimpleManifest
