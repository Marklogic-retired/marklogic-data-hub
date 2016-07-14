import { Inject, Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()
export class InstallService {

  messageEmitter = null;
  private messages: Observable<Message>;

  constructor(
    private http: Http,
    private stomp: STOMPService) {
    this.messageEmitter = new EventEmitter();
  }

  install() {
    this.stomp.messages.subscribe(this.onMessage);
    this.stomp.subscribe('/topic/install-status');
    this.http.put('/projects/1/local/install', null).subscribe(() => {});
  }

  public onMessage = (message: Message) => {
    if (message.headers.destination === '/topic/install-status') {
      let json = JSON.parse(message.body);
      this.messageEmitter.next(json);
    }
  }
}
