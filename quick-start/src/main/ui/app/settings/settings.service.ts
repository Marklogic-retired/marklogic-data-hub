import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class SettingsService {

  traceEnabled: boolean = false;
  debugEnabled: boolean = false;

  constructor(private http: Http) {
    this.isTracingEnabled();
    this.isDebuggingEnabled();
  }

  toggleTracing() {
    if (this.traceEnabled) {
      this.disableTracing();
    } else {
      this.enableTracing();
    }
  }

  enableTracing() {
    return this.http.post('/api/settings/trace/enable', '').subscribe(() => {
      this.traceEnabled = true;
    });
  }

  disableTracing() {
    return this.http.post('/api/settings/trace/disable', '').subscribe(() => {
      this.traceEnabled = false;
    });
  }

  toggleDebugging() {
    if (this.debugEnabled) {
      this.disableDebugging();
    } else {
      this.enableDebugging();
    }
  }

  enableDebugging() {
    return this.http.post('/api/settings/debug/enable', '').subscribe(() => {
      this.debugEnabled = true;
    });
  }

  disableDebugging() {
    return this.http.post('/api/settings/debug/disable', '').subscribe(() => {
      this.debugEnabled = false;
    });
  }

  private isTracingEnabled() {
    return this.get('/api/settings/trace/is-enabled').subscribe(resp => {
      this.traceEnabled = resp.enabled;
    });
  }

  private isDebuggingEnabled() {
    return this.get('/api/settings/debug/is-enabled').subscribe(resp => {
      this.debugEnabled = resp.enabled;
    });
  }

  private extractData = (res: Response) => {
    return res.json();
  }

  private get(url: string) {
    return this.http.get(url).map(this.extractData);
  }
}
