import { Injectable } from '@angular/core';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';
import { LogMessage } from '../log/log-message.model';

@Injectable()
export class LogListenerService {
  private _messages: Array<string>  = [];

  constructor(private stomp: STOMPService) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.stomp.subscribe('/topic/log');
  }

  get messages(): Array<string> {
    return this._messages;
  }

  public lastMessage(): string {
    return this._messages[this._messages.length-1];
  }

  public add = (message: string) => {
    this._messages.push(message);
  }

  private onWebsockMessage = (message: Message) => {
    if (message.headers.destination === '/topic/log') {
      let log: LogMessage = JSON.parse(message.body);

      if (log.message && log.message !== '') {
        this._messages.push(log.message);
      }

      console.log('log listener - ' + log.message);
    }

  }
}
