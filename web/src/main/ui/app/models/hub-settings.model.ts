export class HubSettings {
  host: string = null;
  name: string = 'data-hub';

  stagingDbName: string = null;
  stagingTriggersDbName: string = null;
  stagingSchemasDbName: string = null;
  stagingHttpName: string = null;
  stagingForestsPerHost: number = null;
  stagingPort: number = null;
  stagingAuthMethod: string = null;

  finalDbName: string = null;
  finalTriggersDbName: string = null;
  finalSchemasDbName: string = null;
  finalHttpName: string = null;
  finalForestsPerHost: number = null;
  finalPort: number = null;
  finalAuthMethod: string = null;

  traceDbName: string = null;
  traceHttpName: string = null;
  traceForestsPerHost: number = null;
  tracePort: number = null;
  traceAuthMethod: string = null;

  jobDbName: string = null;
  jobHttpName: string = null;
  jobForestsPerHost: number = null;
  jobPort: number = null;
  jobAuthMethod: string = null;

  modulesDbName: string = null;

  username: string = null;

  constructor() {};
}
