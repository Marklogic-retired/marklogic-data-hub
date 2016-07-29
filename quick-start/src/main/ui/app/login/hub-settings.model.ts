export class HubSettings {
  host: string = null;
  name: string = null;

  stagingDbName: string = null;
  stagingHttpName: string = null;
  stagingForestsPerHost: number = null;
  stagingPort: number = null;

  finalDbName: string = null;
  finalHttpName: string = null;
  finalForestsPerHost: number = null;
  finalPort: number = null;

  traceDbName: string = null;
  traceHttpName: string = null;
  traceForestsPerHost: number = null;
  tracePort: number = null;

  jobDbName: string = null;
  jobHttpName: string = null;
  jobForestsPerHost: number = null;
  jobPort: number = null;

  modulesDbName: string = null;
  triggersDbName: string = null;
  schemasDbName: string = null;

  authMethod: string = null;

  constructor() {};
}
