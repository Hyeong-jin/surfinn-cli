import { GluegunToolbox } from '../types';
// import { spawnProgress } from '../tools/spawn';
import { copyBoilerplate } from '../tools/react';
import { packager } from '../tools/packager';
import {
  command,
  direction,
  heading,
  surfinnHeading,
  p,
  startSpinner,
  stopSpinner,
  clearSpinners,
} from '../tools/pretty';

// CLI tool versions we support
// const cliDependencyVersions: { [k: string]: string } = {
//   expo: '4',
//   podInstall: '0.1',
//   rnRename: '2',
// };

export default {
  run: async (toolbox: GluegunToolbox) => {
    const { print, filesystem, system, meta, parameters, strings } = toolbox;
    const { kebabCase } = strings;
    const { exists, path, remove } = filesystem;
    const { info, colors } = print;
    const { gray, red, magenta, cyan, yellow, green } = colors;

    // start tracking performance
    const perfStart = new Date().getTime();

    // retrieve project name from toolbox
    const {
      validateProjectName,
      validateBundleIdentifier,
    } = require('../tools/validations');
    const projectName = validateProjectName(toolbox);
    const projectNameKebab = kebabCase(projectName);

    // if they pass in --overwrite, remove existing directory otherwise throw if exists
    if (parameters.options.overwrite) {
      remove(projectName);
    } else if (exists(projectName)) {
      const alreadyExists = `Error: There's already a folder with the name "${projectName}". To force overwriting that folder, run with --overwrite.`;
      p();
      p(yellow(alreadyExists));
      process.exit(1);
    }

    // if they pass in --boilerplate, warn them to use old Ignite
    // const bname = parameters.options.b || parameters.options.boilerplate;
    // if (bname) {
    //   p();
    //   p(
    //     yellow(`Different boilerplates are no longer supported in Ignite v4+.`),
    //   );
    //   p(gray(`To use the old CLI to support different boilerplates, try:`));
    //   p(cyan(`npx ignite-cli@3 new ${projectName} --boilerplate ${bname}`));
    //   process.exit(1);
    // }
    const tplName =
      parameters.options.tpl ||
      parameters.options.template ||
      'surfinn-template-ts';

    // debug?
    const debug = Boolean(parameters.options.debug);
    const log = (...m) => {
      if (debug) {
        m.map((_m) => info(` ${_m}`)).join(' ');
      }
      return m.join(' ');
    };

    // custom bundle identifier (android only)
    // TODO: refactor alert, need to rethink this
    const bundleIdentifier =
      validateBundleIdentifier(toolbox, parameters.options.bundle) ||
      `com.surfinn.${projectName}`;

    // expo or no?
    const surfinnPath = path(`${meta.src}`, '..');
    const templatePath = path(surfinnPath, 'templates', tplName);
    // const cliEnv = debug ? { ...process.env } : process.env;
    log(JSON.stringify({ surfinnPath, templatePath: templatePath }));

    // welcome everybody!
    p('\n');
    surfinnHeading();
    p(
      ` █ Creating ${magenta(projectName)} using ${red(
        'Surfinn',
      )} ${meta.version()}`,
    );
    p(
      ` █ Powered by ${red(
        'Surfinn React App',
      )} - http://surfinn-cli.surfinn.kr`,
    );
    p(` █ Using ${cyan('create-react-app')}`);
    p(` █ Template: ${green(tplName)}`);
    p(` █ Bundle identifier: ${magenta(bundleIdentifier)}`);
    p(` ────────────────────────────────────────────────\n`);

    // remove pods and node_modules, if they exist, because those will be rebuilt anyway
    startSpinner('Creating app');
    // remove(path(templatesPath, 'ios', 'Pods'));
    // remove(path(templatesPath, 'node_modules'));

    // startSpinner(' 3D-printing a new React app');
    await copyBoilerplate(toolbox, {
      boilerplatePath: templatePath,
      projectName,
      excluded: ['node_modules', 'yarn.lock', 'package.lock'],
    });
    // stopSpinner(' 3D-printing a new React app', '🖨');
    stopSpinner('Creating app', '🔥');

    // note the original directory
    const cwd = log(process.cwd());

    // jump into the project to do additional tasks
    process.chdir(projectName);

    log('Project Name ', projectName);
    log('cwd ', process.cwd());

    // copy the .gitignore if it wasn't copied over
    // Release Ignite installs have the boilerplate's .gitignore in .gitignore.template
    // (see https://github.com/npm/npm/issues/3763); development Ignite still
    // has it in .gitignore. Copy it from one or the other.
    // const targetIgnorePath = log(path(process.cwd(), '.gitignore'));
    // if (!filesystem.exists(targetIgnorePath)) {
    //   // gitignore in dev mode?
    //   let sourceIgnorePath = log(path(templatePath, '.gitignore'));

    //   // gitignore in release mode?
    //   if (!filesystem.exists(sourceIgnorePath)) {
    //     sourceIgnorePath = log(path(templatePath, '.gitignore.template'));
    //   }

    //   // copy the file over
    //   filesystem.copy(sourceIgnorePath, targetIgnorePath);
    // }

    // Update package.json:
    // - We need to replace the app name in the detox paths. We do it on the
    //   unparsed file content since that's easier than updating individual values
    //   in the parsed structure, then we parse that as JSON.
    // - Having a "prepare" script in package.json messes up expo-cli init above
    //   (it fails because npm-run-all hasn't been installed yet), so we
    //   add it.
    // - If Expo, we also merge in our extra expo stuff.
    // - Then write it back out.
    let packageJsonRaw = filesystem.read('package.json');
    packageJsonRaw = packageJsonRaw
      .replace(/HelloWorld/g, projectName)
      .replace(/hello-world/g, projectNameKebab);
    let packageJson = JSON.parse(packageJsonRaw);

    filesystem.write('./package.json', packageJson);

    // yarn it
    startSpinner('Unboxing NPM dependencies');
    await packager.install({ onProgress: log });
    stopSpinner('Unboxing NPM dependencies', '🧶');

    // remove the gitignore template
    filesystem.remove('.gitignore.template');

    // rename the app using `react-native-rename`
    // startSpinner(' Writing your app name in the sand');
    // const renameCmd = `npx react-native-rename@${cliDependencyVersions.rnRename} ${projectName} -b ${bundleIdentifier}`;
    // log(renameCmd);
    // await spawnProgress(renameCmd, { onProgress: log });
    // stopSpinner(' Writing your app name in the sand', '🏝');

    // Make sure all our modifications are formatted nicely
    // const npmOrYarnRun = packager.is('yarn') ? 'yarn' : 'npm run';
    // await spawnProgress(`${npmOrYarnRun} format`, {});

    // commit any changes
    // if (parameters.options.git !== false) {
    startSpinner(' Backing everything up in source control');
    log('cwd ', process.cwd());
    await system.run(log(` git init `));
    await system.run(log(` git add -A`));
    await system.run(
      log(` git commit -m "New Surfinn ${meta.version()} app" `),
    );
    stopSpinner(' Backing everything up in source control', '🗄');
    // }

    // back to the original directory
    process.chdir(log(cwd));

    // clean up any spinners we forgot to clear
    clearSpinners();

    // we're done! round performance stats to .xx digits
    const perfDuration =
      Math.round((new Date().getTime() - perfStart) / 10) / 100;

    p();
    p();
    heading(
      `${red('Surfinn CLI')} created ${yellow(projectName)} in ${gray(
        `${perfDuration}s`,
      )}`,
    );
    p();
    direction(`To get started:`);
    command(`  cd ${projectName}`);
    command(`  yarn start`);

    p();
    p('Need additional help?');
    p();
    direction('Join our Slack community at http://surfinn-cli.surfinn.kr.');
    p();
    heading('Now get cooking! 🍽');
    surfinnHeading();
  },
};
