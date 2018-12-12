import {WebSocketMessageType, WebSocketRequestBody, WebSocketResponseBody} from './types';
import * as Promise from 'bluebird';

declare class WebSocketRequest {
  messageType: WebSocketMessageType;
  id: string;
  operation: string;
  payload: any;
  seshKey: string;
  internalPromise: Promise<any>;
  wasCancelled: boolean;
  wasError: boolean;
  complete: boolean;
  queueable: boolean;
  private reqObject;
  private resolver;
  private rejecter;

  static RPC(operation: string, payload: any): WebSocketRequest;
  static RPC(operation: string, payload: any, moduleURI: string): WebSocketRequest;
  static RPC(operation: string, payload: any, moduleURI: string, options?: Map<string, any>): WebSocketRequest;
  static RPC(operation: string, payload: any, moduleURI: string, options: Map<string, any>): WebSocketRequest;

  static HttpGET(path: string): WebSocketRequest;

  static HttpPOST(path: string, payload: any): WebSocketRequest;

  static HttpPUT(path: string, payload: any): WebSocketRequest;

  static HttpDELETE(path: string): WebSocketRequest;

  static Basic(payload: any): WebSocketRequest;

  static StartSession(userID: string, jwtTicketID: string): WebSocketRequest;

  constructor(messageType: WebSocketMessageType);

  makeRequestObject(): WebSocketRequestBody;

  makeMessage(): string;

  setSeshKey(seshKey: string): this;

  resolve(response: WebSocketResponseBody): void;

  reject(response: WebSocketResponseBody): void;

  cancel(): void;
}

export default WebSocketRequest;
