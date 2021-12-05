import { GluegunToolbox } from 'gluegun';

module.exports = {
  description: 'The Surfinn CLI',
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters: { first },
      print: { error },
    } = toolbox;

    if (first !== undefined) {
      error(`surfinn '${first}' is not a command`);
    } else {
      return require('./help').run(toolbox);
    }
  },
};
