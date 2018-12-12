import { WebSocketRequestBody, WebSocketResponseBody } from "./types";
export default class extends Error {
    request: WebSocketRequestBody;
    response: WebSocketResponseBody;
    constructor(request: WebSocketRequestBody, response: WebSocketResponseBody);
}
