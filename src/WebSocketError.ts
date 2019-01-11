import {
  WebSocketMessageStatusToString,
  WebSocketMessageType,
  WebSocketMessageTypeToString,
  WebSocketRequestBody,
  WebSocketResponseBody
} from "./inttypes";

export default class extends Error {

  request: WebSocketRequestBody;
  response: WebSocketResponseBody;

  constructor(request: WebSocketRequestBody, response: WebSocketResponseBody) {

    let mt = WebSocketMessageTypeToString(response.messageType);

    let msg = `WebSocket Error: ${mt} Request -> ${WebSocketMessageStatusToString(response.statusCode)} | `;

    let hasContent = false;

    switch (response.messageType) {
      case WebSocketMessageType.RPCMessage:
        msg += `CMD: ${request.cmd} | ID: ${request.id}`;
        if (request.moduleURI && request.moduleURI !== "") {
          msg += ` | MODULE: ${request.moduleURI}`;
        }
        hasContent = true;
        break;
      case WebSocketMessageType.HTTPMessage:
        msg += `PATH: ${request.path} | METHOD: ${request.method}`;
        hasContent = true;
        break;
      default:
        break;

    }

    if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {

      if (hasContent) {
        msg += " | ";
      }

      for (let i = 0; i < response.errors.length; i++) {

        if (typeof response.errors[i] === "string") {
          msg += (i > 0 ? `\nError ${i}: ` : `Error ${i}: `) + response.errors[i];
        } else if (response.errors[i] instanceof Error) {
          msg += (i > 0 ? `\nError ${i}: ` : `Error ${i}: `) + (<Error>response.errors[i]).message;
        } else {
          msg += (i > 0 ? `\nError ${i}: ` : `Error ${i}: `) + response.errors[i].toString();
        }

      }

    }

    super(msg);

    this.request = request;
    this.response = response;

  }

}
