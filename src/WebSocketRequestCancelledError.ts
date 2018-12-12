export default class extends Error {
  constructor() {
    super("The WebSocketRequest was cancelled");
    this.name = "WebSocketRequestCancelledError";
  }
}
