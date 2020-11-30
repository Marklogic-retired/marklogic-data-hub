import {IStompContextInterface, STOMPState} from "../../util/stomp";
import {BehaviorSubject, Subject} from "rxjs";
import {Message} from "stompjs/lib/stomp.min";

export const defaultStompContext: IStompContextInterface = {
  state: new BehaviorSubject<STOMPState>(STOMPState.CLOSED),
  messages: new Subject<Message>(),
  configure: jest.fn(),
  isClosed: jest.fn(),
  isConfigured: jest.fn(),
  isActive: jest.fn(),
  isTrying: jest.fn(),
  tryConnect: jest.fn(),
  disconnect: jest.fn(),
  publish: jest.fn(),
  onConnect: jest.fn(),
  onMessage: jest.fn(),
  onError: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn()
};