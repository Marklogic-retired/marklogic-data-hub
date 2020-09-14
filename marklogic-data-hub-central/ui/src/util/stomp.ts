// derived from https://github.com/sjmf/ng2-stompjs-demo
import React from 'react';
import SockJS from 'sockjs-client';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { Client, Message, Stomp } from 'stompjs/lib/stomp.min';
import axios from 'axios';

/** possible states for the STOMP service */
export enum STOMPState {
  CLOSED,
  TRYING,
  CONNECTED,
  SUBSCRIBED,
  DISCONNECTING
}

/** look up states for the STOMP service */
export const STATELOOKUP: string[] = [
  'CLOSED',
  'TRYING',
  'CONNECTED',
  'SUBSCRIBED',
  'DISCONNECTING'
];

export interface IStompContextInterface {
  state: BehaviorSubject<STOMPState>;
  messages: Subject<Message>;
  configure: (endpoint: string) => void;
  isClosed: () => boolean;
  isConfigured: () => boolean;
  isActive: () => boolean;
  isTrying: () => boolean;
  tryConnect: () => Promise<{}>;
  disconnect: (message?: string) => void;
  publish: (endpoint: string, message: string) => void;
  onConnect: () => void;
  onMessage: (message: Message) => void;
  onError: (error: string) => void;
  subscribe: (endpoint: string, resolveFunc: (...args: any[]) => void) => void;
  unsubscribe: (id: string) => void;
}

/**
 *  STOMP Service using stomp.js
 *
 * @description This service handles subscribing to a
 * message queue using the stomp.js library, and returns
 * values via the ES6 Observable specification for
 * asynchronous value streaming by wiring the STOMP
 * messages into a Subject observable.
 */
export class STOMPService {

  /* Service parameters */

  // State of the STOMPService
  public state: BehaviorSubject<STOMPState>;

  // Publishes new messages to Observers
  public messages: Subject<Message>;

  // STOMP Client from stomp.js
  private client: Client;

  private endpoint: string = '';

  private _isActive: boolean = false;

  private _isConfigured: boolean = false;

  private _subscribeQueue: Array<any> = [];

  // Resolve Promise made to calling class, when connected
  private resolvePromise: (...args: any[]) => void = () => {};

  private resolveSubQueue: (...args: any[]) => void = () => {};

  /** Constructor */
  public constructor() {
    this.messages = new Subject<Message>();
    this.state = new BehaviorSubject<STOMPState>(STOMPState.CLOSED);
  }


  /** Set up configuration */
  public configure(endpoint: string): void {
    console.debug('configuring STOMP client...');
    this.endpoint = endpoint;

    // Check for errors:
    if (this.state.getValue() !== STOMPState.CLOSED) {
      throw Error('Already running!');
    }

    const sockJsClient = new SockJS(endpoint);

    // Attempt connection, passing in a callback
    this.client = Stomp.over(sockJsClient);

    // Configure client heartbeating
    this.client.heartbeat.incoming = 0;
    this.client.heartbeat.outgoing = 20000;

    // Set function to debug print messages
    this.client.debug = true;
    this._isConfigured = true;
    console.debug('STOMP client configured!');
  }

  public isConfigured(): boolean {
    return this._isConfigured;
  }

  public isClosed(): boolean {
    return this.state.getValue() == STOMPState.CLOSED;
  }

  public isActive(): boolean {
    return this.state.getValue() == STOMPState.CONNECTED || this.state.getValue() == STOMPState.SUBSCRIBED;
  }

  public isTrying(): boolean {
    return this.state.getValue() == STOMPState.TRYING;
  }
  /**
   * Perform connection to STOMP broker, returning a Promise
   * which is resolved when connected.
   */
  public tryConnect(): Promise<{}> {

    if (this.state.getValue() !== STOMPState.CLOSED) {
      throw Error('Can\'t tryConnect if not CLOSED!');
    }
    if (this.client === null) {
      throw Error('Client not configured!');
    }
    // Attempt connection, passing in a callback
    this.client.connect(
      null,
      null,
      this.onConnect,
      this.onError
    );

    this.state.next(STOMPState.TRYING);

    return new Promise(
      (resolve, reject) => this.resolvePromise = resolve
    );
  }


  /** Disconnect the STOMP client and clean up */
  public disconnect(message?: string) {
    // Notify observers that we are disconnecting!
    this.state.next(STOMPState.DISCONNECTING);
    if (this.client && this._isActive) {
      // Disconnect. Callback will set CLOSED state
      this.client.disconnect(
        () => {
          this.state.next(STOMPState.CLOSED);
          this._isActive = false;
          // for Cypress tests only
          if ((window as any).Cypress) {
            delete (window as any).stompClientConnected;
          }
        },
        message
      );
    } else {
      this.state.next(STOMPState.CLOSED);
      this._isActive = false;
    }
  }


  /** Send a message to all topics */
  public publish(endpoint: string, message: string): void {
    this.client.send(endpoint, {}, message);
  }

  /**
   * Callback Functions
   *
   * Note the method signature: () => preserves lexical scope
   * if we need to use this.x inside the function
   */
  public debug(...args: any[]): void {

    // Push arguments to this function into console.log
    if (window.console && console.log && console.log.apply) {
      console.log.apply([console].concat(args));
    }
  }


  // Callback run on successfully connecting to server
  public onConnect = () => {

    // Indicate our connected state to observers
    this.state.next( STOMPState.CONNECTED );

    this._isActive = true;

    this.subscribeQueue();

    // Resolve our Promise to the caller
    this.resolvePromise();

    // for Cypress tests only
    if ((window as any).Cypress) {
      (window as any).stompClientConnected = true;
    }

    // Clear callback
    this.resolvePromise = () => {};
  }

  // Handle errors from stomp.js
  public onError = async (error: string, ...other: any[]) => {
    console.log('STOMP error:', error, other);
    // Check for dropped connection and try reconnecting
    if (this._isActive && error.indexOf('Lost connection') !== -1) {
      this.client = null;
      // Reset state indicator
      this.state.next( STOMPState.CLOSED );

      // check to see if it failed due to being logged out
      axios('/api/environment/systemInfo')
          .then(() => {
            // Attempt reconnection
            console.debug('Reconnecting in 5 seconds...');
            setTimeout(() => {
              // ensure the
              if (this.isClosed()) {
                this.configure(this.endpoint);
                this.tryConnect();
              }
            }, 5000);
          })
          .catch(err => {
              if (err.response.status === 401) {
                localStorage.setItem('dataHubUser', '');
                localStorage.setItem('loginResp', '');
                window.location.reload();
              }
            });
    }
  }


  // On message RX, notify the Observable with the message object
  public onMessage = (message: Message) => {
    if (message.body) {
      this.messages.next(message);
    } else {
      console.error('Empty message received!');
    }
  }

  public subscribe(endpoint: string, resolveFunc: (...args: any[]) => void): void {
    if (!this._isActive) {
      this._isActive = true;
    }
    return this.subscribeInternal(endpoint, resolveFunc);
  }

  /** Subscribe to server message queues */
  subscribeInternal(endpoint: string, resolveFunc: (...args: any[]) => void ): void {

    if (this.state.getValue() === STOMPState.TRYING) {
      this._subscribeQueue.push({
        endpoint: endpoint,
        resolveFunc: resolveFunc
      });
    } else {
      const resp = this.client.subscribe(
        endpoint, this.onMessage, { ack: 'auto' });
      resolveFunc(resp.id); // this.resolveSubQueue(resp.id);
    }
  }

  public unsubscribe(id: string): void {
    this.client.unsubscribe(id);
  }

  private subscribeQueue() {
    for (const item of this._subscribeQueue) {
      this.subscribeInternal(item.endpoint, item.resolveFunc);
    }
    this._subscribeQueue = [];
  }
}

export const StompContext = React.createContext<IStompContextInterface>(new STOMPService());