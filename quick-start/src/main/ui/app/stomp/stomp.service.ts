// borrowed from https://github.com/sjmf/ng2-stompjs-demo

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { STOMPConfig } from './config';

import * as SockJS from 'sockjs-client';

import { Client, Message, Stomp } from 'stompjs/lib/stomp.min';

/** possible states for the STOMP service */
export enum STOMPState {
  CLOSED,
  TRYING,
  CONNECTED,
  SUBSCRIBED,
  DISCONNECTING
};

/** look up states for the STOMP service */
export const StateLookup: string[] = [
  "CLOSED",
  "TRYING",
  "CONNECTED",
  "SUBSCRIBED",
  "DISCONNECTING"
];

/**
 * Angular2 STOMP Service using stomp.js
 *
 * @description This service handles subscribing to a
 * message queue using the stomp.js library, and returns
 * values via the ES6 Observable specification for
 * asynchronous value streaming by wiring the STOMP
 * messages into a Subject observable.
 */
@Injectable()
export class STOMPService {

  /* Service parameters */

  // State of the STOMPService
  public state: BehaviorSubject<STOMPState>;

  // Publishes new messages to Observers
  public messages: Subject<Message>;

  // Configuration structure with MQ creds
  private config: STOMPConfig;

  // STOMP Client from stomp.js
  private client: Client;

  // Resolve Promise made to calling class, when connected
  private resolvePromise: { (...args: any[]): void };

  /** Constructor */
  public constructor() {
    this.messages = new Subject<Message>();
    this.state = new BehaviorSubject<STOMPState>(STOMPState.CLOSED);
  }


  /** Set up configuration */
  public configure(config?: STOMPConfig): void {

    // Check for errors:
    if (this.state.getValue() != STOMPState.CLOSED)
      throw Error("Already running!");
    if (config === null && this.config === null)
      throw Error("No configuration provided!");

    // Set our configuration
    if(config != null)
      this.config = config;

    // Connecting via SSL Websocket?
    var scheme: string = 'http';
    if (this.config.https) scheme = 'wss';

    let sockJsClient = SockJS(this.config.endpoint);

    // Attempt connection, passing in a callback
    this.client = Stomp.over(sockJsClient);

    // Configure client heartbeating
    this.client.heartbeat.incoming = this.config.heartbeat_in;
    this.client.heartbeat.outgoing = this.config.heartbeat_out;

    // Set function to debug print messages
    this.client.debug = this.debug;
  }


  /**
   * Perform connection to STOMP broker, returning a Promise
   * which is resolved when connected.
   */
  public try_connect(): Promise<{}> {

    if(this.state.getValue() != STOMPState.CLOSED)
      throw Error("Can't try_connect if not CLOSED!");
    if(this.client === null)
      throw Error("Client not configured!");

    // Attempt connection, passing in a callback
    this.client.connect(
      this.config.user,
      this.config.pass,
      this.on_connect,
      this.on_error
    );

    console.log("connecting...");
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
  public publish(message: string) {

    for (var t of this.config.publish)
      this.client.send(t, {}, message);
  }


  /** Subscribe to server message queues */
  private subscribe(): void {

    // Subscribe to our configured queues
    for (var t of this.config.subscribe)
      this.client.subscribe(t, this.on_message, <any>{ ack: 'auto' });

    // Update the state
    if (this.config.subscribe.length > 0)
      this.state.next( STOMPState.SUBSCRIBED );
  }


  /**
   * Callback Functions
   *
   * Note the method signature: () => preserves lexical scope
   * if we need to use this.x inside the function
   */
  public debug(...args: any[]) {

    // Push arguments to this function into console.log
    if (window.console && console.log && console.log.apply) {
      console.log.apply(console, args);
    }
  }


  // Callback run on successfully connecting to server
  public on_connect = () => {

    // Indicate our connected state to observers
    this.state.next( STOMPState.CONNECTED );

    // Subscribe to message queues
    this.subscribe();

    // Resolve our Promise to the caller
    this.resolvePromise();

    // Clear callback
    this.resolvePromise = null;
  }


  // Handle errors from stomp.js
  public on_error = (error: string) => {

    console.error('Error: ' + error);

    // Check for dropped connection and try reconnecting
    if (error.indexOf("Lost connection") != -1) {

      // Reset state indicator
      this.state.next( STOMPState.CLOSED );

      // Attempt reconnection
      console.log("Reconnecting in 5 seconds...");
      setTimeout(() => {
        this.configure();
        this.try_connect();
      }, 5000);
    }
  }


  // On message RX, notify the Observable with the message object
  public on_message = (message: Message) => {

    if (message.body) {
      this.messages.next(message);
    } else {
      console.error("Empty message received!");
    }
  }
}
