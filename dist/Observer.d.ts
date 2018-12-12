import * as Promise from 'bluebird';

export declare enum WebSocketConnectionStatus {
  Disconnected = 0,
  Connected = 15
}

export default class {
  connectionUrl: string;
  format: string;
  opts: any;
  status: WebSocketConnectionStatus;
  passToStoreHandler: any;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectTimeoutId: any;
  reconnectionCount: number;
  queueEnabled: boolean;
  private processingQueue;
  WebSocket: WebSocket;
  store: any;
  mutations: any;
  isAuth: boolean;
  private seshKey;
  private requestQueue;

  constructor(connectionUrl: string, opts?: any);

  private processQueue;

  startSession(): Promise<any>;

  private onConnected;
  private onDisconnected;
  private sendMessage;
  private sendRequest;

  connect(connectionUrl: string, opts?: any): WebSocket;

  reconnect(): void;

  onEvent(): void;

  passToStore(eventName: string, event: any): void;

  defaultPassToStore(eventName: string, event: any): void;
}
