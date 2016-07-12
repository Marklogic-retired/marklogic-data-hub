/*
 * Custom Type Definitions
 * When including 3rd party modules you also need to include the type definition for the module
 * if they don't provide one within the module. You can try to install it with typings

typings install dt~node --save --global

 * If you can't find the type definition in the registry we can make an ambient definition in
 * this file for now. For example

 declare module "my-module" {
   export function doesSomething(value: string): string;
 }

 *
 * If you're prototying and you will fix the types later you can also declare it as type any
 *

declare var assert: any;
declare var _: any;
declare var $: any;

 *
 * If you're importing a module that uses Node.js modules which are CommonJS you need to import as
 *

import * as _ from 'lodash'

 * You can include your type definitions in this file until you create one for the typings registry
 * see https://github.com/typings/registry
 *
 */


// Extra variables that live on Global that will be replaced by webpack DefinePlugin
declare var ENV: string;
declare var HMR: boolean;

interface GlobalEnvironment {
  ENV;
  HMR;
}

interface Es6PromiseLoader {
  (id: string): (exportName?: string) => Promise<any>;
}

type FactoryEs6PromiseLoader = () => Es6PromiseLoader;
type FactoryPromise = () => Promise<any>;

type AsyncRoutes = {
  [component: string]: Es6PromiseLoader |
                               Function |
                FactoryEs6PromiseLoader |
                         FactoryPromise
};


type IdleCallbacks = Es6PromiseLoader |
                             Function |
              FactoryEs6PromiseLoader |
                       FactoryPromise ;

interface WebpackModule {
  hot: {
    data?: any,
    idle: any,
    accept(dependencies?: string | string[], callback?: (updatedDependencies?: any) => void): void;
    decline(dependencies?: string | string[]): void;
    dispose(callback?: (data?: any) => void): void;
    addDisposeHandler(callback?: (data?: any) => void): void;
    removeDisposeHandler(callback?: (data?: any) => void): void;
    check(autoApply?: any, callback?: (err?: Error, outdatedModules?: any[]) => void): void;
    apply(options?: any, callback?: (err?: Error, outdatedModules?: any[]) => void): void;
    status(callback?: (status?: string) => void): void | string;
    removeStatusHandler(callback?: (status?: string) => void): void;
  };
}

interface WebpackRequireEnsureCallback {
    (req: WebpackRequire): void
}

interface WebpackRequire {
    (id: string): any;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure(ids: string[], callback: WebpackRequireEnsureCallback, chunkName?: string): void;
    context(directory: string, useSubDirectories?: boolean, regExp?: RegExp): WebpackContext;
}

interface WebpackContext extends WebpackRequire {
    keys(): string[];
}

interface ErrorStackTraceLimit {
  stackTraceLimit: number;
}


// Extend typings
interface NodeRequire extends WebpackRequire {}
interface ErrorConstructor extends ErrorStackTraceLimit {}
interface NodeRequireFunction extends Es6PromiseLoader  {}
interface NodeModule extends WebpackModule {}
interface Global extends GlobalEnvironment  {}



/**
 * Typescript interface definitions for using
 * Jeff Mesnil's stomp.js Javascript STOMP client
 * under Typescript, for example with Angular 2.
 *
 * https://github.com/jmesnil/stomp-websocket
 *
 */
declare module "stompjs/lib/stomp.min" {

  export interface Client {
    heartbeat: any;

    debug(...args: string[]);

    connect(...args: any[]);
    disconnect(disconnectCallback: () => any, headers?: any);

    send(destination: string, headers?:any, body?: string);
    subscribe(destination: string, callback?: (message: Message) => any, body?: string);
    unsubscribe();

    begin(transaction: string);
    commit(transaction: string);
    abort(transaction: string);

    ack(messageID: string, subscription: string, headers?: any);
    nack(messageID: string, subscription: string, headers?: any);
  }

  export interface Message {
    command: string;
    headers: any;
    body: string;

    ack(headers?: any);
    nack(headers?: any);
  }

  export interface Frame {
    constructor(command: string, headers?: any, body?: string);

    toString(): string;
    sizeOfUTF8(s: string);
    unmarshall(datas: any);
    marshall(command: string, headers?, body?);
  }

  export interface Stomp {
    client: Client;
    Frame: Frame;

    over(ws: WebSocket);
  }

  export var Stomp;
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
    transports?: string | string[]
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

  var SockJS: {
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
