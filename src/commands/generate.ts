import { GluegunToolbox } from 'gluegun';
import { p, command, heading, warning, direction } from '../tools/pretty';
import {
  showGeneratorHelp,
  updateGenerators,
  installedGenerators,
  availableGenerators,
  generateFromTemplate,
} from '../tools/generators';

module.exports = {
  alias: ['g', 'generator', 'generators'],
  description: 'Generates components and other features from templates',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters } = toolbox;

    p();
    if (parameters.options.help || parameters.options.list) {
      // show help or list generators
      showGeneratorHelp(toolbox);
    } else if (parameters.options.update) {
      // update with fresh generators
      updateGenerators(toolbox);
    } else if (parameters.first) {
      // actually generate something
      generate(toolbox);
    } else {
      // catch-all, just show help
      showGeneratorHelp(toolbox);
    }
  },
};

function generate(toolbox: GluegunToolbox) {
  const { parameters, strings } = toolbox;

  const generators = installedGenerators();

  // what generator are we running?
  const generator = parameters.first.toLowerCase();
  if (!generators.includes(generator)) {
    warning(`⚠️  Generator "${generator}" isn't installed.`);
    p();

    if (availableGenerators().includes(generator)) {
      direction('Install the generator with:');
      p();
      command(`surfinn generate ${generator} --update`);
      p();
      direction('... and then try again!');
    } else {
      direction('Check your spelling and try again');
    }

    return;
  }

  // we need a name for this component
  let dirs = [];
  let name = parameters.second;
  if (!name) {
    return warning(
      `⚠️  Please specify a name for your ${generator}: surfinn g ${generator} MyName`,
    );
  }

  if (name.includes('/')) {
    dirs = name.split('/');
    name = dirs.pop();
  }

  // avoid the my-component-component phenomenon
  const pascalGenerator = strings.pascalCase(generator);
  let pascalName = strings.pascalCase(name);
  if (pascalName === pascalGenerator) {
    p('The name cannot be the same as the generator! Use something else.');
    process.exit(1);
  }

  if (pascalName.endsWith(pascalGenerator)) {
    p(`Stripping ${pascalGenerator} from end of name`);
    p(
      `Note that you don't need to add ${pascalGenerator} to the end of the name -- we'll do it for you!`,
    );
    pascalName = pascalName.slice(0, -1 * pascalGenerator.length);
    command(`surfinn generate ${generator} ${pascalName}`);
  }

  if (generator === 'model') {
    if (parameters.options.store) {
      if (!pascalName.endsWith('Store')) {
        p(`Adding "Store" to end of Store Model name`);
        p(
          `Note that you need to add "Store" to the end of the Store Model name -- but we'll do it for you!`,
        );
        pascalName = pascalName + 'Store';
        command(`surfinn generate ${generator} ${pascalName}`);
      }
    } else {
      if (pascalName.endsWith('Store')) {
        parameters.options.store = true;
        command(`surfinn generate ${generator} ${pascalName}`);
      }
    }
  }

  // okay, let's do it!
  p();
  const updatedFiles = generateFromTemplate(generator, {
    dirs: dirs,
    name: pascalName,
    skipIndexFile: parameters.options.skipIndexFile,
    // model options
    isStore: parameters.options.store,
  });
  heading(`Generated new files:`);
  updatedFiles.forEach((f) => p(f));
}
