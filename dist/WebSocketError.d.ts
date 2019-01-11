import { WebSocketRequestBody, WebSocketResponseBody } from "./inttypes";
export default class extends Error {
    request: WebSocketRequestBody;
    response: WebSocketResponseBody;
    constructor(request: WebSocketRequestBody, response: WebSocketResponseBody);
}
