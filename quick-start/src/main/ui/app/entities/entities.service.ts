import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPConfig } from '../stomp/config';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()
export class EntitiesService {
  messageEmitter: EventEmitter<string> = new EventEmitter<string>();
  private messages: Observable<Message>;

  private config: STOMPConfig = {
    host: 'localhost',
    port: 8080,
    https: false,

    endpoint: '/mlcp-status',

    user: null,
    pass: null,

    subscribe: ['/topic/mlcp-status'],
    publish: ['/topic/mlcp-status'],

    heartbeat_in: 0,
    heartbeat_out: 20000
  };

  constructor(
    private http: Http,
    private auth: AuthService,
    private stomp: STOMPService
  ) {}

  getEntities() {
    return this.get('/entities/');
  }

  getEntity(entityName) {
    return this.get(`/entities/${entityName}`);
  }

  createEntity(entity) {
    return this.post('/entities/', entity);
  }

  createFlow(entity, flowType, flow) {
    return this.post(`/entities/${entity.entityName}/flows/${flowType}`, flow);
  }

  getInputFlowOptions(flow) {
    return this.get(`/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`);
  }

  runInputFlow(flow, mlcpOptions) {
    this.stomp.configure(this.config);
    this.stomp.try_connect().then(this.onConnect);

    const url = `/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`;
    return this.post(url, mlcpOptions).subscribe(() => {});
  }

  runHarmonizeFlow(flow) {
    const url = `/entities/${flow.entityName}/flows/HARMONIZE/${flow.flowName}/run`;
    return this.post(url, null).subscribe(() => {});
  }

  public extractData = (res: Response) => {
    if (!this.auth.isAuthenticated()) {
      this.auth.setAuthenticated(true);
    }
    return res.json();
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
    if (json.percentComplete === 100) {
      console.log('disconnecting mlcp listener');
      this.stomp.disconnect();
    }
  }

  private get(url) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url, data) {
    return this.http.post(url, data).map(this.extractData);
  }
}
