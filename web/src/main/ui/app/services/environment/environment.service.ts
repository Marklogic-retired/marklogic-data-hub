import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { HubSettings } from '../../models/hub-settings.model';
import * as SemVer from 'semver';

@Injectable()
export class EnvironmentService {

  public settings: HubSettings;
  public marklogicVersion: string;

  constructor(private http: Http, private router: Router) {}

  public getEnvironment(): Observable<boolean> {
    const uri = `/api/current-project/`;
    return this.http.get(uri).pipe(map((res: Response) => {
      const json = res.json();
      this.settings = json.mlSettings;
      this.marklogicVersion = json.marklogicVersion;
      if (json.runningVersion === '0.1.2' || json.runningVersion === '%%mlHubVersion%%' || json.installedVersion === '%%mlHubVersion%%') {
        return true;
      }

      let result: boolean = !SemVer.gt(json.runningVersion, json.installedVersion);
      if (!result) {
        this.router.navigate(['/login']);
      }
      return result;
    }, () => {
      return false;
    }));
  }
}
