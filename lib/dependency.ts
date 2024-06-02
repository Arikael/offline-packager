import type { AbbreviatedManifest } from 'pacote'

export enum DependencyStatus {
  none,
  resolved,
  downloaded,
}

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

export class Dependency extends BaseDependency {
  statusDate: Date
  runId: number = -1
  private _status: DependencyStatus

  constructor(
    name: string,
    version: string,
    status: DependencyStatus = DependencyStatus.none,
    statusDate: Date = new Date(),
  ) {
    super(name, version)
    this._status = status
    this.statusDate = statusDate
  }

  get status() {
    return this._status
  }

  set status(newStatus: DependencyStatus) {
    this._status = newStatus
    this.statusDate = new Date()
  }

  static fromBaseDependency(
    baseDependency: NameAndVersion,
    status: DependencyStatus = DependencyStatus.none,
    statusDate: Date = new Date(),
  ): Dependency {
    return new Dependency(
      baseDependency.name,
      baseDependency.version,
      status,
      statusDate,
    )
  }

  static isDependency(dependency: unknown): dependency is Dependency {
    return (
      !!dependency &&
      typeof dependency === 'object' &&
      'name' in dependency &&
      'version' in dependency &&
      'status' in dependency &&
      'statusDate' in dependency
    )
  }

  static tryConvertToDependency(source: unknown): Dependency | undefined {
    if (Dependency.isDependency(source)) {
      return new Dependency(
        source.name,
        source.version,
        source.status,
        source.statusDate,
      )
    }

    return undefined
  }

  static convertToDependency(source: unknown): Dependency {
    if (Dependency.isDependency(source)) {
      return new Dependency(
        source.name,
        source.version,
        source.status,
        source.statusDate,
      )
    }

    throw new Error(`${source} is not convertible to Dependency`)
  }
}

export type ManifestDependencies = Pick<
  AbbreviatedManifest,
  'dependencies' | 'devDependencies' | 'peerDependencies' // | 'name' | 'version'
>
export type DependencyType = keyof ManifestDependencies
