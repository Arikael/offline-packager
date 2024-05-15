import { Command, Option } from '@commander-js/extra-typings'
import { fetchFromPackageJson } from './lib/packageFetcher.js'
import { type LevelWithSilentOrString } from 'pino'
import { initLogger, logLevels } from './lib/logger.js'

const program = new Command()
// global
program.addOption(
  new Option('-l, --log-level <level>', 'sets the log level').choices(
    logLevels,
  ),
)
program.on('option:log-level', (level: LevelWithSilentOrString) => {
  initLogger(level)
})
// fetch
program
  .command('fetch')
  .description('fetches packages from npm registry')
  .alias('f')
  .requiredOption('-p, --package-json <path>', 'path to the package.json file')
  .option('-d, --dest', 'path to where the tar files are saved')
  .option('-n, --no-tar', 'don\t create a tar with all the downloaded packages')
  .action(async (options) => {
    await fetchFromPackageJson(options.packageJson)
  })

program.parse()
