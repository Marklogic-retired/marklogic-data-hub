import { Inject, Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()
export class InstallService {

  messageEmitter: EventEmitter<any> = new EventEmitter<any>();
  private messages: Observable<Message>;

  constructor(
    private http: Http,
    private stomp: STOMPService) {
    this.stomp.messages.subscribe(this.onMessage);
  }

  install(projectId, environment) {
    this.stomp.subscribe('/topic/install-status');
    this.http.put(`/projects/${projectId}/${environment}/install`, null).subscribe(() => {});
  }

  uninstall() {
    this.stomp.subscribe('/topic/uninstall-status');
    this.http.delete('/current-project/uninstall').subscribe(() => {});
  }

  public onMessage = (message: Message) => {
    if (message.headers.destination === '/topic/install-status' ||
      message.headers.destination === '/topic/uninstall-status') {
      let json = JSON.parse(message.body);
      this.messageEmitter.next(json);
    }
  }
}
