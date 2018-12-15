declare enum WebSocketMessageType {
    ServerHelloMessage = 0,
    RPCSessionStartMessage = 1,
    RPCSessionEndMessage = 4,
    RPCMessage = 32,
    RPCStatusMessage = 34,
    HTTPMessage = 64,
    ByteSessionStartMessage = 176,
    ByteSessionEndMessage = 180,
    RPCSessionStartErrorMessage = 224,
    RPCSessionEndErrorMessage = 225,
    BasicMessage = 255
}
declare function WebSocketMessageTypeToString(messageType: WebSocketMessageType): string;
declare enum WebSocketMessageStatus {
    RPCStatusOK = 200,
    RPCStatusUnauthorised = 401,
    RPCStatusError = 500,
    RPCStatusLocalError = 614,
    RPCStatusRequestCancelled = 670
}
declare function WebSocketMessageStatusToString(statusCode: WebSocketMessageStatus): string;
declare type WebSocketRequestBody = {
    messageType: WebSocketMessageType;
    cmd?: string;
    method?: string;
    path?: string;
    moduleURI?: string;
    id: string;
    seshKey?: string;
    headers?: any;
    payload?: any;
    options?: any;
};
declare type WebSocketResponseBody = {
    messageType: WebSocketMessageType;
    cmd?: string;
    method?: string;
    path?: string;
    moduleURI?: string;
    id: string;
    seshKey?: string;
    headers?: Map<string, string>;
    payload: any;
    options?: Map<string, any>;
    statusCode: WebSocketMessageStatus;
    errors?: Error[] | string[];
};
export { WebSocketMessageType, WebSocketMessageStatus, WebSocketRequestBody, WebSocketResponseBody, WebSocketMessageTypeToString, WebSocketMessageStatusToString };
