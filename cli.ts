import { Command } from '@commander-js/extra-typings'
import { fetchFromPackageJson } from './lib/packageFetcher.js'

const program = new Command()
program
  .command('fetch')
  .description('fetches packages from npm registry')
  .alias('f')
  .option('-p, --package-json <path>', 'path to the package.json file')
  .option('-d, --dest', 'path to where the tar files are saved')
  .option('-n, --no-tar', 'don\t create a tar with all the downloaded packages')
  .action(async (options) => {
    console.log('test')
    if (!options.packageJson) {
      return
    }

    await fetchFromPackageJson(options.packageJson)
  })

async function main(): Promise<void> {
  await program.parseAsync(process.argv)
}

main()
