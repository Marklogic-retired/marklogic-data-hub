import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()
export class InstallService {

  messageEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private http: Http,
    private ngZone: NgZone,
    private stomp: STOMPService) {
    this.stomp.messages.subscribe(this.onMessage);
  }

  install() {
    let unsubscribeId: string;
    this.stomp.subscribe('/topic/install-status').then((msgId: string) => {
      unsubscribeId = msgId;
    });
    return this.ngZone.runOutsideAngular(() => {
      let resp = this.http.put(`/api/current-project/install`, '').share();
      resp.subscribe(() => {
        this.ngZone.run(() => {
          this.stomp.unsubscribe(unsubscribeId);
        });
      });
      return resp.map(this.extractData);
    });
  }

  updateIndexes() {
    return this.http.get(`/api/current-project/update-indexes`);
  }

  uninstall() {
    let unsubscribeId: string;
    this.stomp.subscribe('/topic/uninstall-status').then((msgId: string) => {
      unsubscribeId = msgId;
    });
    return this.ngZone.runOutsideAngular(() => {
      let resp = this.http.delete(`/api/current-project/uninstall`).share();
      resp.subscribe(() => {
        this.ngZone.run(() => {
          this.stomp.unsubscribe(unsubscribeId);
        });
      });
      return resp.map(this.extractData);
    });
  }

  uninstallAll() {
    let unsubscribeId: string;
    this.stomp.subscribe('/topic/uninstall-status').then((msgId: string) => {
      unsubscribeId = msgId;
    });
    return this.ngZone.runOutsideAngular(() => {
      let resp = this.http.delete(`/api/current-project/uninstallAll`).share();
      resp.subscribe(() => {
        this.ngZone.run(() => {
          this.stomp.unsubscribe(unsubscribeId);
        });
      });
      return resp.map(this.extractData);
    });
  }

  private extractData(res: Response) {
    return res.json();
  }

  public onMessage = (message: Message) => {
    if (message.headers.destination === '/topic/install-status' ||
      message.headers.destination === '/topic/uninstall-status') {
      let json = JSON.parse(message.body);
      this.messageEmitter.next(json);
    }
  }
}
