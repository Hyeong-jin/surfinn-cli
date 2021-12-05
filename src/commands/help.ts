import { GluegunToolbox } from 'gluegun';
import { showGeneratorHelp } from '../tools/generators';
import {
  p,
  command,
  heading,
  surfinnHeading,
  direction,
  link,
} from '../tools/pretty';

module.exports = {
  dashed: true,
  alias: ['h'],
  description: 'Displays Surfinn CLI help',
  run: async (toolbox: GluegunToolbox) => {
    const { meta, parameters } = toolbox;

    p();

    // specific help -- generators
    if (
      parameters.second &&
      (parameters.second === 'g' || parameters.second.startsWith('generat'))
    ) {
      return showGeneratorHelp(toolbox);
    }

    surfinnHeading();
    heading(`Welcome to Surfinn CLI ${meta.version()}!`);
    p();
    p('Surfinn is a CLI that helps you spin up a new React app using a');
    p('battle-tested tech stack.');
    p();
    heading('Commands');
    p();
    command('new         ', 'Creates a new React app', [
      'surfinn new MyApp',
      'surfinn new MyApp --bundle kr.surfinn.myAwesomeApp',
      'surfinn new MyApp --template surfinn-template-ts',
    ]);
    p();
    command('generate (g)', 'Generates components and other app features', [
      'surfinn generate --hello',
      'surfinn generate component Hello',
      'surfinn generate model User',
      'surfinn generate model User --store',
      'surfinn generate screen Login',
    ]);
    p();
    command(
      'doctor      ',
      'Checks your environment & displays versions of installed dependencies',
      ['surfinn doctor'],
    );
    p();
    direction(`See the documentation: ${link('https://wiki.surfinn.kr')}`);
    p();
    direction(
      `If you need additional help, join our Slack at ${link(
        'https://surfinn.kr/surfinn-cli',
      )}`,
    );
    p();
    surfinnHeading();
  },
};
