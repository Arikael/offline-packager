import type { AbbreviatedManifest } from 'pacote'
import { SemVer } from 'semver'
import semver from 'semver/preload'

export interface NameAndVersion {
  name: string
  version: string
}

export class BaseDependency {
  name: string
  version: SemVer = new SemVer('0.0.0')
  get versionString() {
    return this.version.toString()
  }

  constructor(name: string, version: string | SemVer) {
    this.name = name

    if (typeof version === 'string') {
      const semVer = semver.parse(version)

      if (semVer) {
        this.version = semVer
      }
    } else {
      this.version = version
    }
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
