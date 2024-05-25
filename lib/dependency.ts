import type { AbbreviatedManifest } from 'pacote'

export class Dependency {
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

export type ManifestDependencies = Pick<
  AbbreviatedManifest,
  'dependencies' | 'devDependencies' | 'peerDependencies' // | 'name' | 'version'
>
export type DependencyType = keyof ManifestDependencies
