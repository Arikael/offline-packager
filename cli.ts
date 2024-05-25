import { Command, Option } from '@commander-js/extra-typings'
import { type LevelWithSilentOrString } from 'pino'
import { initLogger, logLevels } from './lib/logger.js'
import { DependencyResolver } from './lib/dependencyResolver'
import { DependencyDownloader } from './lib/dependencyDownloader'

const program = new Command()
// global
program
  .addOption(
    new Option('-l, --log-level <level>', 'sets the log level').choices(
      logLevels,
    ),
  )
  .on('option:log-level', (level: LevelWithSilentOrString) => {
    initLogger(level)
  })

//  fetch packages
program
  .command('fetch')
  .description('fetches packages from npm registry')
  .alias('f')
  .requiredOption('-p, --package-json <path>', 'path to the package.json file')
  .option(
    '-d, --destination <destination>',
    'path to where the tar files are saved',
    './packages',
  )
  .option('-n, --no-tar', 'don\t create a tar with all the downloaded packages')
  .option('-c, --concurrency', 'defines how many concurrent downloads happen')
  .action(async (options) => {
    const dependencyResolver = new DependencyResolver()
    const dependenciesToDownload = await dependencyResolver.resolvePackageJson(
      options.packageJson,
    )

    const dependencyDownloader = new DependencyDownloader()
    await dependencyDownloader.downloadDependencies(
      dependenciesToDownload,
      options.destination,
    )
  })

program.parse()
