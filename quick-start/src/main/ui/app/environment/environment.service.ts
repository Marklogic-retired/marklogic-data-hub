import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { HubSettings } from './hub-settings.model';
import * as SemVer from 'semver';

@Injectable()
export class EnvironmentService {

  public settings: HubSettings;

  constructor(private http: Http, private router: Router) {}

  public getEnvironment(): Observable<boolean> {
    const uri = `/api/current-project/`;
    return this.http.get(uri).map((res: Response) => {
      const json = res.json();
      this.settings = json.mlSettings;
      if (json.runningVersion === '0.1.2') {
        return true;
      }

      let result: boolean = !SemVer.gt(json.runningVersion, json.installedVersion);
      if (!result) {
        this.router.navigate(['/login']);
      }
      return result;
    });
  }
}
