/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare var System: any;


// declare class Clipboard {
//     constructor(selector: (string | Element | NodeListOf<Element>), options?: ClipboardOptions);

//     /**
//      * Subscribes to events that indicate the result of a copy/cut operation.
//      * @param type {String} Event type ('success' or 'error').
//      * @param handler Callback function.
//      */
//     on(type: 'success', handler: (e: ClipboardEvent) => void): this;
//     on(type: 'error', handler: (e: ClipboardEvent) => void): this;
//     on(type: string, handler: (e: ClipboardEvent) => void): this;

//     /**
//      * Clears all event bindings.
//      */
//     destroy(): void;
// }

// interface ClipboardOptions {
//     /**
//      * Overwrites default command ('cut' or 'copy').
//      * @param {Element} elem Current element
//      * @returns {String} Only 'cut' or 'copy'.
//      */
//     action?: (elem: Element) => string;

//     /**
//      * Overwrites default target input element.
//      * @param {Element} elem Current element
//      * @returns {Element} <input> element to use.
//      */
//     target?: (elem: Element) => Element;

//     /**
//      * Returns the explicit text to copy.
//      * @param {Element} elem Current element
//      * @returns {String} Text to be copied.
//      */
//     text?: (elem: Element) => string;
// }

// interface ClipboardEvent {
//     action: string;
//     text: string;
//     trigger: Element;
//     clearSelection(): void;
// }

// declare module 'clipboard' {
//     export default Clipboard;
// }

/**
 * Typescript interface definitions for using
 * Jeff Mesnil's stomp.js Javascript STOMP client
 * under Typescript, for example with Angular 2.
 *
 * https://github.com/jmesnil/stomp-websocket
 *
 */
declare module 'stompjs/lib/stomp.min' {

  export interface Client {
    heartbeat: any;

    debug(...args: string[]): any;

    connect(...args: any[]): any;
    disconnect(disconnectCallback: () => any, headers?: any): any;

    send(destination: string, headers?: any, body?: string): any;
    subscribe(destination: string, callback?: (message: Message) => any, body?: string): any;
    unsubscribe(id: string): any;

    begin(transaction: string): any;
    commit(transaction: string): any;
    abort(transaction: string): any;

    ack(messageID: string, subscription: string, headers?: any): any;
    nack(messageID: string, subscription: string, headers?: any): any;
  }

  export interface Message {
    command: string;
    headers: any;
    body: string;

    ack(headers?: any): any;
    nack(headers?: any): any;
  }

  export interface Frame {
    constructor(command: string, headers?: any, body?: string): any;

    toString(): string;
    sizeOfUTF8(s: string): any;
    unmarshall(datas: any): any;
    marshall(command: string, headers?: any, body?: any): any;
  }

  export interface Stomp {
    client: Client;
    Frame: Frame;

    over(ws: WebSocket): any;
  }

  export var Stomp: any;
}


// Type definitions for sockjs-client 1.0.3
// Project: https://github.com/sockjs/sockjs-client
// Definitions by: Emil Ivanov <https://github.com/vladev>, Alexander Rusakov <https://github.com/arusakov/>

declare namespace __SockJSClient {
  interface BaseEvent {
    type: string;
  }

  interface OpenEvent extends BaseEvent {}

  interface CloseEvent extends BaseEvent {
    code: number;
    reason: string;
    wasClean: boolean;
  }

  interface MessageEvent extends BaseEvent {
    data: string;
  }

  interface SessionGenerator {
    (): string;
  }

  interface Options {
    server?: string;
    sessionId?: number | SessionGenerator;
    transports?: string | string[];
  }

  enum State {
    CONNECTING = 0, OPEN, CLOSING, CLOSED
  }

  interface SockJSClass extends EventTarget {
    readyState: State;
    protocol: string;
    url: string;
    onopen: (e: OpenEvent) => any;
    onclose: (e: CloseEvent) => any;
    onmessage: (e: MessageEvent) => any;
    send(data: any): void;
    close(code?: number, reason?: string): void;
  }
}

declare module 'sockjs-client' {
  import SockJSClass = __SockJSClient.SockJSClass;
  import Options = __SockJSClient.Options;
  import State = __SockJSClient.State;

  let SockJS: {
    new(url: string, _reserved?: any, options?: Options): SockJSClass;
    (url: string, _reserved?: any, options?: Options): SockJSClass;
    prototype: SockJSClass;
    CONNECTING: State;
    OPEN: State;
    CLOSING: State;
    CLOSED: State;
  };

  export = SockJS;
}
