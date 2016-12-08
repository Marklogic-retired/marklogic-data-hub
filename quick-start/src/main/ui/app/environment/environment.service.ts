import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import { HubSettings } from './hub-settings.model';

@Injectable()
export class EnvironmentService {

  public settings: HubSettings;

  constructor(private http: Http) {}

  public getEnvironment(): Observable<boolean> {
    const uri = `/api/current-project/`;
    return this.http.get(uri).map((res: Response) => {
      const json = res.json();
      this.settings = json['mlSettings'];
      return true;
    });
  }
}
