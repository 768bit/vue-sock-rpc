enum WebSocketMessageType {
  ServerHelloMessage = 0x00,
  RPCSessionStartMessage = 0x01,
  RPCSessionEndMessage = 0x04,
  RPCMessage = 0x20,
  RPCStatusMessage = 0x22,
  HTTPMessage = 0x40,
  ByteSessionStartMessage = 0xB0,
  ByteSessionEndMessage = 0xB4,
  RPCSessionStartErrorMessage = 0xE0,
  RPCSessionEndErrorMessage = 0xE1,
  BasicMessage = 0xFF
}

function WebSocketMessageTypeToString(messageType: WebSocketMessageType): string {

  switch (messageType) {
    case WebSocketMessageType.ServerHelloMessage:
      return "ServerHello";
    case WebSocketMessageType.RPCMessage:
      return "RPC";
    case WebSocketMessageType.RPCStatusMessage:
      return "RPCStatus";
    case WebSocketMessageType.BasicMessage:
      return "Basic";
    case WebSocketMessageType.HTTPMessage:
      return "HTTP";
    case WebSocketMessageType.RPCSessionStartMessage:
      return "SessionStart";
    case WebSocketMessageType.RPCSessionStartErrorMessage:
      return "SessionStartError";
    case WebSocketMessageType.RPCSessionEndMessage:
      return "SessionEnd";
    case WebSocketMessageType.RPCSessionEndErrorMessage:
      return "SessionEndError";
    default:
      return "Other";
  }

}

enum WebSocketMessageStatus {
  RPCStatusOK = 0x00C8, //200
  RPCStatusUnauthorised = 0x0191, //401
  RPCStatusError = 0x01F4, //500
  RPCStatusLocalError = 0x0266, //550
  RPCStatusRequestCancelled = 0x029E  //670
}

function WebSocketMessageStatusToString(statusCode: WebSocketMessageStatus): string {

  switch (statusCode) {
    case WebSocketMessageStatus.RPCStatusOK:
      return `[${statusCode}]::OK`;
    case WebSocketMessageStatus.RPCStatusUnauthorised:
      return `[${statusCode}]::UNAUTHORISED`;
    case WebSocketMessageStatus.RPCStatusError:
      return `[${statusCode}]::ERROR`;
    case WebSocketMessageStatus.RPCStatusLocalError:
      return `[${statusCode}]::LOCAL_ERROR`;
    case WebSocketMessageStatus.RPCStatusRequestCancelled:
      return `[${statusCode}]::CANCELLED`;
    default:
      return `[${statusCode}]::UNKNOWN`;

  }

}

declare type WebSocketRequestBody = {
  messageType: WebSocketMessageType
  cmd?: string
  method?: string
  path?: string
  moduleURI?: string
  id: string
  seshKey?: string
  headers?: any
  payload?: any
  options?: any
}


declare type WebSocketResponseBody = {
  messageType: WebSocketMessageType
  cmd?: string
  method?: string
  path?: string
  moduleURI?: string
  id: string
  seshKey?: string
  headers?: Map<string, string>
  payload: any
  options?: Map<string, any>
  statusCode: WebSocketMessageStatus
  errors?: Error[] | string[]
}


export {
  WebSocketMessageType,
  WebSocketMessageStatus,
  WebSocketRequestBody,
  WebSocketResponseBody,
  WebSocketMessageTypeToString,
  WebSocketMessageStatusToString
};
