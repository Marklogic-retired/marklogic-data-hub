import { Plugin } from './plugin.model';

export class Trace {
  traceId: string;
  format: string;
  identifier: string;
  flowType: string;
  created: string;

  contentPlugin: Plugin;
  headersPlugin: Plugin;
  triplesPlugin: Plugin;
  writerPlugin: Plugin;

  [key: string]: any;
}
