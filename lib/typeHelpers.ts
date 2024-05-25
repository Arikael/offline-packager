import { DependencyType, ManifestDependencies } from './dependency'

export const isManifestWithDependencies = (
  manifest: unknown,
): manifest is ManifestDependencies => {
  return (
    isDependencyPropertyAnObject(manifest, 'dependencies') ||
    isDependencyPropertyAnObject(manifest, 'devDependencies') ||
    isDependencyPropertyAnObject(manifest, 'peerDependencies')
  )
}

const isDependencyPropertyAnObject = (
  // TODO: fix usage of any
  //eslint-disable-next-line
  manifest: any,
  type: DependencyType,
): boolean => {
  return (
    type in manifest &&
    typeof manifest[type] === 'object' &&
    manifest[type] !== null
  )
}
