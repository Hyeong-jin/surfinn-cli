import { filesystem, GluegunToolbox, strings } from 'gluegun';
import * as ejs from 'ejs';
import { command, heading, surfinnHeading, p, warning } from './pretty';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function showGeneratorHelp(toolbox: GluegunToolbox) {
  const inSurfinn = isSurfinnProject();
  const generators = inSurfinn ? installedGenerators() : [];

  surfinnHeading();
  heading('Surfinn Generators');
  p();
  p(
    'When you create a new app with Ignite CLI, it will install several generator',
  );
  p('templates in the project folder under the `surfinn/templates` folder.');
  p();
  heading('Commands');
  p();
  command('--list  ', 'List installed generators', ['surfinn g --list']);
  command(
    '--update',
    "Update installed generators. You can also use the 'surfinn update X' format",
    [
      'surfinn g --update',
      `surfinn g model --update`,
      `surfinn update model`,
      `surfinn update --all`,
    ],
  );
  warning("          ⚠️  this erases any customizations you've made!");
  p();
  heading('Installed generators');
  p();
  if (inSurfinn) {
    const longestGen = generators.reduce((c, g) => Math.max(c, g.length), 0);
    generators.forEach((g) => {
      command(g.padEnd(longestGen), `generates a ${g}`, [
        `surfinn g ${g} Demo`,
      ]);
    });
  } else {
    warning(
      '⚠️  Not in an Surfinn project root. Go to your Surfinn project root to see generators.',
    );
  }
}

export function updateGenerators(toolbox: GluegunToolbox) {
  const { parameters } = toolbox;

  let generatorsToUpdate;
  if (parameters.first) {
    // only update the specified one
    generatorsToUpdate = [parameters.first];
  } else {
    // update any available generators
    generatorsToUpdate = availableGenerators();
  }

  const changes = installGenerators(generatorsToUpdate);
  const distinct = (val, index, self) => self.indexOf(val) === index;
  const allGenerators = changes
    .concat(generatorsToUpdate)
    .filter(distinct)
    .sort();

  heading(
    `Updated ${changes.length} generator${changes.length === 1 ? '' : 's'}`,
  );

  allGenerators.forEach((g) => {
    if (changes.includes(g)) {
      heading(`  ${g} - updated`);
    } else {
      p(`  ${g} - no changes`);
    }
  });
}

export function isSurfinnProject(): boolean {
  return filesystem.exists('./surfinn') === 'dir';
}

function surfinnDir() {
  const cwd = process.cwd();
  return filesystem.path(cwd, 'surfinn');
}

function appDir() {
  const cwd = process.cwd();
  return filesystem.path(cwd, 'src');
}

function templatesDir() {
  return filesystem.path(surfinnDir(), 'templates');
}

/**
 * Finds generator templates installed in the current project
 */
export function installedGenerators(): string[] {
  const { subdirectories, separator } = filesystem;

  const generators = subdirectories(templatesDir()).map(
    (g) => g.split(separator).slice(-1)[0],
  );

  return generators;
}

type GeneratorOptions = {
  dirs: string[];
  name: string;
  skipIndexFile?: boolean;
  isStore?: boolean;
};

/**
 * Generates something using a template
 */
export function generateFromTemplate(
  generator: string,
  options: GeneratorOptions,
): string[] {
  const { find, path, dir, copy, separator } = filesystem;
  const { pascalCase, kebabCase, pluralize, camelCase, snakeCase } = strings;

  const dirNames = options.dirs.map(dir => kebabCase(dir));

  // permutations of the name
  const pascalCaseName = pascalCase(options.name);
  const kebabCaseName = kebabCase(options.name);
  const camelCaseName = camelCase(options.name);
  const snakeCaseName = snakeCase(options.name);

  const pascalCaseModelName = pascalCaseName.slice(0, -1 * 'Store'.length);
  const camelCaseModelName = camelCaseName.slice(0, -1 * 'Store'.length);



  // passed into the template generator
  const props = {
    camelCaseName,
    kebabCaseName,
    pascalCaseName,
    snakeCaseName,
    pascalCaseModelName,
    camelCaseModelName,
    ...options,
  };
  // console.log('PROPS', props);
  // where are we copying from?
  const templateDir = path(templatesDir(), generator);
  // where are we copying to?
  const generatorDir = path(appDir(), pluralize(generator));
  const destinationDir = path(generatorDir, ...dirNames, kebabCaseName);

  // find index file if it exists
  let indexFile: string;
  let hasIndex: boolean;
  try {
    indexFile = find(generatorDir, {
      matching: 'index.@(ts|tsx|js|jsx)',
      recursive: false,
    })[0];
    hasIndex = !!indexFile;
  } catch (e) {
    // just ignore if index doesn't exist
  }

  // find the files
  const files = find(templateDir, { matching: '*' });

  // create destination folder
  dir(destinationDir);

  // loop through the files
  const newFiles = files.map((templateFilename: string) => {
    // get the filename and replace `NAME` with the actual name
    let filename = templateFilename
      .split(separator)
      .slice(-1)[0]
      .replace('NAME', kebabCaseName);

    // strip the .ejs
    if (filename.endsWith('.ejs')) filename = filename.slice(0, -4);

    let destinationFile: string;

    // if .ejs, run through the ejs template system
    if (templateFilename.endsWith('.ejs')) {
      // where we're going
      destinationFile = path(destinationDir, filename);

      // file-specific props
      const data = { props: { ...props, filename } };

      // read the template
      const templateContent = filesystem.read(templateFilename);

      // render the template
      const content = ejs.render(templateContent, data);

      // write to the destination file
      filesystem.write(destinationFile, content);
    } else {
      // no .ejs, so just direct copy
      destinationFile = path(destinationDir, filename);
      copy(templateFilename, destinationFile);
    }

    // append to barrel export if applicable
    if (
      !options.skipIndexFile &&
      hasIndex &&
      !filename.includes('.test') &&
      !filename.includes('.story') &&
      !filename.includes('.styles')
    ) {
      const basename = filename.split('.')[0];
      const exportLine = `export * from "./${[...dirNames, kebabCaseName, basename].join('/')}"\n`;
      const indexContents = filesystem.read(indexFile);
      const exportExists = indexContents.includes(exportLine);

      if (!exportExists) {
        filesystem.append(indexFile, exportLine);
      }
    }

    return destinationFile;
  });

  return newFiles;
}

/**
 * Directory where we can find Ignite CLI generator templates
 */
function sourceDirectory(): string {
  return filesystem.path(
    __filename,
    '..',
    '..',
    '..',
    'boilerplate',
    'surfinn',
    'templates',
  );
}

/**
 * Finds generator templates in Ignite CLI
 */
export function availableGenerators(): string[] {
  const { subdirectories, separator } = filesystem;
  return subdirectories(sourceDirectory()).map(
    (g) => g.split(separator).slice(-1)[0],
  );
}

/**
 * Copies over generators (specific generators, or all) from Ignite CLI to the project
 * surfinn/templates folder.
 */
export function installGenerators(generators: string[]): string[] {
  const { path, find, copy, dir, cwd, separator, exists, read } = filesystem;
  const sourceDir = sourceDirectory();
  const targetDir = path(cwd(), 'surfinn', 'templates');

  if (!isSurfinnProject()) {
    throw new Error(
      "Not in an Ignite root directory (can't find ./surfinn folder)",
    );
  }

  // for each generator type, copy it over to the surfinn/templates folder
  const changedGenerators = generators.filter((gen) => {
    const sourceGenDir = path(sourceDir, gen);
    const targetGenDir = path(targetDir, gen);

    // ensure the directory exists
    dir(targetDir);

    // find all source files
    const files = find(sourceGenDir, { matching: '*' });

    // copy them over
    const changedFiles = files.filter((file) => {
      const filename = file.split(separator).slice(-1)[0];
      const targetFile = path(targetGenDir, filename);

      if (!exists(targetFile) || read(targetFile) !== read(file)) {
        copy(file, targetFile, { overwrite: true });
        return true;
      } else {
        return false;
      }
    });

    return changedFiles.length > 0;
  });

  return changedGenerators;
}
