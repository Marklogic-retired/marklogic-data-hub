export interface InjectableDependency {
  src: string;
  inject: string | boolean;
  vendor?: boolean;
  env?: string[] | string;
}

export interface Environments {
  DEVELOPMENT: string;
  PRODUCTION: string;
  [key: string]: string;
}

export interface SassOptions {
  file?: string;
  data?: string;
  importer?: (url: string, prev: string, done: (file?: string, contents?: string) => any) => any;
  functions?: Array<any>;
  includePaths?: Array<string>;
  indentedSyntax?: boolean;
  indentType?: string;
  indentWidth?: number;
  linefeed?: string;
  omitSourceMapUrl?: boolean;
  outFile?: string;
  outputStyle?: string;
  precision?: number;
  sourceComments?: boolean;
  sourceMap?: boolean;
  sourceMapContents?: boolean;
  sourceMapEmbed?: boolean;
  sourceMapRoot?: string;
}
