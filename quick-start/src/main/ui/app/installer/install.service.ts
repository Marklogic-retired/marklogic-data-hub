import { Inject, Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPConfig } from '../stomp/config';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()

/**
 *
 */
export class InstallService {

  messageEmitter = null;
  private messages: Observable<Message>;
  private config: STOMPConfig = {
    host: 'localhost',
    port: 8080,
    https: false,

    endpoint: '/install-status',

    user: null,
    pass: null,

    subscribe: ['/topic/install-status'],
    publish: ['/topic/install-status'],

    heartbeat_in: 0,
    heartbeat_out: 20000
  };

  constructor(
    private http: Http,
    private stomp: STOMPService) {
    this.messageEmitter = new EventEmitter();
  }

  install() {
    this.stomp.configure(this.config);
    this.stomp.try_connect().then(this.onConnect);
    this.http.put('/projects/1/local/install', null).subscribe(() => {});
  }

  public onConnect = () => {

    // Store local reference to Observable
    // for use with template ( | async )
    this.messages = this.stomp.messages;

    // Subscribe a function to be run on_next message
    this.messages.subscribe(this.onNext);
  }

  public onNext = (message: Message) => {
    let json = JSON.parse(message.body);
    this.messageEmitter.next(json);
  }
}
