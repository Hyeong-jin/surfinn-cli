import { build } from 'gluegun';

/**
 * Create the cli and kick it off
 */
async function run(argv: string[]) {
  // create a CLI runtime
  const cli = build()
    .brand('surfinn-cli')
    .exclude(['semver', 'prompt', 'http', 'template'])
    .src(__dirname)
    .defaultCommand(require('./commands/help'))
    .create();

  return cli.run(argv);
}

module.exports = { run };
