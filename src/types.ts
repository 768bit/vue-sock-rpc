import * as Promise from "bluebird";
import { WebSocketRequestOptions } from "./WebSocketRequest"
import {RPCPayload} from "./inttypes";
export { WebSocketMessageType, WebSocketMessageStatus, WebSocketRequestBody, WebSocketResponseBody, WebSocketMessageTypeToString, WebSocketMessageStatusToString } from "./inttypes";

declare interface RPCWebSocket extends WebSocket {
  sendMessage(msg:string):void
  sendObj(obj:any):void
  callRPC(cmd: string, payload?:RPCPayload|any, options?:WebSocketRequestOptions): Promise<any>
  subscribe(topic: string, handler:any): Promise<any>
  unsubscribe(topic: string, handler?:any): Promise<any>
}

export { WebSocketRequestOptions, RPCWebSocket, RPCPayload }
