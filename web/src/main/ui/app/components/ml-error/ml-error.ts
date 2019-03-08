export class MlErrorStack {
  uri: string;
  line: number;
  column: number;
  operation: string;
  xqueryVersion: string;
  variables: any;
}

export class MlError {
  code: string;
  name: string;
  xqueryVersion: string;
  message: string;
  formatString: string;
  stack: string;
  retryable: boolean;
  expr: string;
  data: Array<string>;
  stacks: Array<MlErrorStack>;
  stackFrames: Array<MlErrorStack>;

  constructor() {}
}
