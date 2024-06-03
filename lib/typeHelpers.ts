import { ManifestDependencies } from './baseDependency'

export const isManifest = (
  manifest: unknown,
): manifest is ManifestDependencies => {
  return (
    typeof manifest === 'object' &&
    manifest !== null &&
    'name' in manifest &&
    typeof manifest.name === 'string' &&
    'version' in manifest &&
    typeof manifest.version === 'string'
  )
}
