import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()
export class InstallService {

  messageEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private http: Http,
    private stomp: STOMPService) {
    this.stomp.messages.subscribe(this.onMessage);
  }

  install() {
    let unsubscribeId: string;
    this.stomp.subscribe('/topic/install-status').then((msgId: string) => {
      unsubscribeId = msgId;
    });
    let resp = this.http.put(`/api/current-project/install`, '').share();
    resp.subscribe(() => {
      this.stomp.unsubscribe(unsubscribeId);
    });
    return resp.map(this.extractData);
  }

  uninstall() {
    let unsubscribeId: string;
    this.stomp.subscribe('/topic/uninstall-status').then((msgId: string) => {
      unsubscribeId = msgId;
    });
    let resp = this.http.delete(`/api/current-project/uninstall`).share();
    resp.subscribe(() => {
      this.stomp.unsubscribe(unsubscribeId);
    });
    return resp.map(this.extractData);
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
