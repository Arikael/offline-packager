import { BaseDependency, NameAndVersion } from '../baseDependency'
import { SemVer } from 'semver'

export enum DependencyStatus {
  none,
  resolved,
  downloaded,
}

export class Dependency extends BaseDependency {
  statusDate: Date
  runId: number = -1
  private _status: DependencyStatus

  constructor(
    name: string,
    version: string | SemVer,
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

  static fromNameAndVersion(
    nameAndVersion: NameAndVersion,
    status: DependencyStatus = DependencyStatus.none,
    statusDate: Date = new Date(),
  ): Dependency {
    return new Dependency(
      nameAndVersion.name,
      nameAndVersion.version,
      status,
      statusDate,
    )
  }

  // static isDependency(dependency: unknown): dependency is Dependency {
  //   return (
  //     !!dependency &&
  //     typeof dependency === 'object' &&
  //     'name' in dependency &&
  //     'version' in dependency &&
  //     'status' in dependency &&
  //     'statusDate' in dependency
  //   )
  // }

  // static tryConvertToDependency(source: unknown): Dependency | undefined {
  //   if (Dependency.isDependency(source)) {
  //     return new Dependency(
  //       source.name,
  //       source.version,
  //       source.status,
  //       source.statusDate,
  //     )
  //   }

  //   return undefined
  // }
  //
  // static convertToDependency(source: unknown): Dependency {
  //   if (Dependency.isDependency(source)) {
  //     return new Dependency(
  //       source.name,
  //       source.version,
  //       source.status,
  //       source.statusDate,
  //     )
  //   }
  //
  //   throw new Error(`${source} is not convertible to Dependency`)
  // }
}
