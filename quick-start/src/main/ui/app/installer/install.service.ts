import { Injectable, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
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

  install(projectId: string, environment: string) {
    let unsubscribeId: string;
    this.stomp.subscribe('/topic/install-status').then((msgId: string) => {
      unsubscribeId = msgId;
    });
    this.http.put(`/api/projects/${projectId}/${environment}/install`, '').subscribe(() => {
      this.stomp.unsubscribe(unsubscribeId);
    });
  }

  uninstall(projectId: string, environment: string) {
    let unsubscribeId: string;
    this.stomp.subscribe('/topic/uninstall-status').then((msgId: string) => {
      unsubscribeId = msgId;
    });
    this.http.delete(`/api/projects/${projectId}/${environment}/uninstall`).subscribe(() => {
      this.stomp.unsubscribe(unsubscribeId);
    });
  }

  public onMessage = (message: Message) => {
    if (message.headers.destination === '/topic/install-status' ||
      message.headers.destination === '/topic/uninstall-status') {
      let json = JSON.parse(message.body);
      this.messageEmitter.next(json);
    }
  }
}
