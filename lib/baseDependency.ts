import type { AbbreviatedManifest } from 'pacote'
import { SemVer, parse, clean } from 'semver'

export interface NameAndVersion {
  name: string
  version: string
}

export class BaseDependency {
  name: string
  rawVersion: string | SemVer
  version: SemVer = new SemVer('0.0.0')
  get versionString() {
    return this.version.toString()
  }

  constructor(name: string, version: string | SemVer) {
    this.name = name
    this.rawVersion = version

    if (typeof version === 'string') {
      this.trySetVersion(version)
    } else {
      this.version = version
    }
  }

  trySetVersion(version: string) {
    if (version.startsWith('^') || version.startsWith('~')) {
      version = version.substring(1)
    }

    const semVer = parse(clean(version))

    if (semVer) {
      this.version = semVer
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
