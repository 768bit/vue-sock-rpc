import {WebSocketMessageType, WebSocketRequestBody, WebSocketResponseBody} from './types';
import * as Promise from 'bluebird';
import ShortUniqueId from 'short-unique-id';
import WebSocketError from "./WebSocketError";
import WebSocketRequestCancelledError from "./WebSocketRequestCancelledError";
const UUID = new ShortUniqueId();

declare type WebSocketRequestOptions = {
  RPCOptions?:any
  StatusCallback: (req:WebSocketRequest, message:WebSocketResponseBody) => void
}

class WebSocketRequest {

  messageType: WebSocketMessageType;
  id: string;
  operation: string;
  payload: any;
  seshKey: string;
  topic: string;
  internalPromise: Promise<any>;
  wasCancelled: boolean = false;
  wasError: boolean = false;
  complete: boolean = false;
  queueable: boolean = true;
  hasStatusHandler: boolean = false;
  statusHandler: (req:WebSocketRequest, msg:WebSocketResponseBody) => void;
  private reqObject: WebSocketRequestBody;
  private resolver: (response: WebSocketResponseBody) => void;
  private rejecter: (ex: Error) => void;

  public static RPC(operation: string, payload: any): WebSocketRequest
  public static RPC(operation: string, payload: any, options:WebSocketRequestOptions): WebSocketRequest
  public static RPC(operation: string, payload: any, options?:WebSocketRequestOptions): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.RPCMessage);
    req.reqObject.cmd = operation;
    req.payload = payload;
    if (options) {
      if (options.RPCOptions) {
        req.reqObject.options = options.RPCOptions;
      }
      if (options.StatusCallback && typeof options.StatusCallback === "function") {
        req.hasStatusHandler = true;
        req.statusHandler = options.StatusCallback;
      }
    }
    return req;
  }

  public static HttpGET(path: string): WebSocketRequest
  public static HttpGET(path: string, headers?: Map<string, string>): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
    req.reqObject.path = path;
    req.reqObject.method = "GET";
    if (headers && headers instanceof Map && headers.size > 0) {
      req.reqObject.headers = headers;
    }
    return req;
  }

  public static HttpPOST(path: string, payload: any): WebSocketRequest
  public static HttpPOST(path: string, payload: any, headers?: Map<string, string>): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
    req.reqObject.path = path;
    req.reqObject.method = "POST";
    req.payload = payload;
    if (headers && headers instanceof Map && headers.size > 0) {
      req.reqObject.headers = headers;
    }
    return req;
  }

  public static HttpPUT(path: string, payload: any): WebSocketRequest
  public static HttpPUT(path: string, payload: any, headers?: Map<string, string>): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
    req.reqObject.path = path;
    req.reqObject.method = "PUT";
    req.payload = payload;
    if (headers && headers instanceof Map && headers.size > 0) {
      req.reqObject.headers = headers;
    }
    return req;
  }

  public static HttpDELETE(path: string): WebSocketRequest
  public static HttpDELETE(path: string, headers?: Map<string, string>): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
    req.reqObject.path = path;
    req.reqObject.method = "DELETE";
    if (headers && headers instanceof Map && headers.size > 0) {
      req.reqObject.headers = headers;
    }
    return req;
  }

  public static Basic(payload: any): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.BasicMessage);
    req.payload = payload;
    return req;
  }

  public static Subscribe(topic: string): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.SubscribeMessage);
    req.topic = topic;
    return req;
  }

  public static UnSubscribe(topic: string): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.UnSubscribeMessage);
    req.topic = topic;
    return req;
  }

  public static StartSession(userID: string, jwtTicketID: string): WebSocketRequest {
    let req = new WebSocketRequest(WebSocketMessageType.RPCSessionStartMessage);
    req.queueable = false;
    req.payload = {
      userUUID: userID,
      jwtTicketID: jwtTicketID,
    };
    return req;
  }

  constructor(messageType: WebSocketMessageType) {

    let self = this;

    this.messageType = messageType;

    this.internalPromise = new Promise<any>((resolve, reject) => {

      self.resolver = resolve;
      self.rejecter = reject;

    });

    this.id = UUID.randomUUID(12);

    this.reqObject = {
      messageType: messageType,
      id: this.id
    };

  }

  makeRequestObject(): WebSocketRequestBody {

    if (this.seshKey && this.seshKey !== "") {
      this.reqObject.seshKey = this.seshKey;
    }

    if (this.payload) {
      this.reqObject.payload = this.payload;
    }

    if (this.topic && this.topic !== "") {
      this.reqObject.topic = this.topic;
    }

    return this.reqObject;

  }

  makeMessage(): string {

    return JSON.stringify(this.makeRequestObject());

  }

  setSeshKey(seshKey: string): this {

    this.seshKey = seshKey;

    return this;

  }

  processStatusMessage(message:WebSocketResponseBody) {

    if (this.hasStatusHandler) {
      this.statusHandler(this, message)
    }

  }

  resolve(response: WebSocketResponseBody) {

    if (response.messageType === WebSocketMessageType.RPCSessionStartErrorMessage || response.messageType === WebSocketMessageType.RPCSessionEndErrorMessage) {

      this.reject(response);
      return;

    }

    this.complete = true;

    this.resolver(response);

  }

  reject(response: WebSocketResponseBody) {

    this.complete = true;
    this.wasError = true;

    let ex = new WebSocketError(this.reqObject, response);

    this.rejecter(ex);

  }

  cancel() {

    this.complete = true;
    this.wasCancelled = true;
    this.rejecter(new WebSocketRequestCancelledError());

  }

}


export { WebSocketRequest, WebSocketRequestOptions }
