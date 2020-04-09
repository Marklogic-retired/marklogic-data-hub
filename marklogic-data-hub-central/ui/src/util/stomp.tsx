// derived from https://github.com/sjmf/ng2-stompjs-demo
import React from 'react';
import SockJS from 'sockjs-client';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { Client, Message, Stomp } from 'stompjs/lib/stomp.min';

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

interface IStompContextInterface {
  state: BehaviorSubject<STOMPState>;
  messages: Subject<Message>;
  configure: (endpoint: string) => void;
  tryConnect: () => Promise<{}>;
  disconnect: (message?: string) => void;
  publish: (endpoint: string, message: string) => void;
  onConnect: () => void;
  onConnected: () => Promise<{}>;
  onMessage: (message: Message) => void;
  onError: (error: string) => void;
  subscribe: (endpoint: string) => Promise<string>;
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

  private onConnectedPromise: Promise<{}>;

  private _subscribeQueue: Array<any> = [];

  // Resolve Promise made to calling class, when connected
  private resolvePromise: (...args: any[]) => void = () => {};

  private resolveSubQueue: (...args: any[]) => void = () => {};

  /** Constructor */
  public constructor(endpoint: string) {
    this.messages = new Subject<Message>();
    this.state = new BehaviorSubject<STOMPState>(STOMPState.CLOSED);
    this.configure(endpoint);
    this.onConnectedPromise = this.tryConnect();
  }


  /** Set up configuration */
  public configure(endpoint: string): void {
    console.log('configuring STOMP client...');
    this.endpoint = endpoint;

    // Check for errors:
    if (this.state.getValue() !== STOMPState.CLOSED) {
      throw Error('Already running!');
    }

    const sockJsClient = SockJS(endpoint);

    // Attempt connection, passing in a callback
    this.client = Stomp.over(sockJsClient);

    // Configure client heartbeating
    this.client.heartbeat.incoming = 0;
    this.client.heartbeat.outgoing = 20000;

    // Set function to debug print messages
    this.client.debug = true;
    console.log('STOMP client configured!');
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
    this.state.next( STOMPState.DISCONNECTING );

    // Disconnect. Callback will set CLOSED state
    this.client.disconnect(
      () => this.state.next( STOMPState.CLOSED ),
      message
    );
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

    this.subscribeQueue();

    // Resolve our Promise to the caller
    this.resolvePromise();

    // Clear callback
    this.resolvePromise = () => {};
  }

  public onConnected(): Promise<{}> {
    return this.onConnectedPromise;
  }

  // Handle errors from stomp.js
  public onError = (error: string) => {

    console.error('Error: ' + error);

    // Check for dropped connection and try reconnecting
    if (error.indexOf('Lost connection') !== -1) {

      // Reset state indicator
      this.state.next( STOMPState.CLOSED );

      // Attempt reconnection
      console.log('Reconnecting in 5 seconds...');
      setTimeout(() => {
        this.configure(this.endpoint);
        this.tryConnect();
      }, 5000);

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

  public subscribe(endpoint: string): Promise<string> {
    return this.subscribeInternal(endpoint, () => {});
  }

  /** Subscribe to server message queues */
  subscribeInternal(endpoint: string, resolveFunc: (...args: any[]) => void ): Promise<string> {

    // let resolveFunc: { (...args: any[]): void };
    let promise;
    if (!resolveFunc) {
      promise = new Promise(
        (resolve, reject) => resolveFunc = resolve
      );
    }
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

    return promise;
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

export const StompContext = React.createContext<IStompContextInterface>(new STOMPService(window.location.origin + '/websocket'));

/*
{
  state: new Subject<Message>(),
  messages: new BehaviorSubject<STOMPState>(STOMPState.CLOSED),
  configure: () => {},
  tryConnect: () => {},
  disconnect: () => {},
  onConnect: () => {},
  onMessage: () => {},
  onError: () => {},
  subscribe: () => {}
}*/
