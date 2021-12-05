export { GluegunCommand, GluegunToolbox } from 'gluegun';

export type CLIType =
  | 'surfinn'
  | 'create-react-app';

export type CLIOptions = {
  cli: CLIType;
  template: string;
};
