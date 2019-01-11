import { WebSocketRequest } from "./WebSocketRequest";

class Emitter {
  listeners: Map<string | number | symbol, any>;
  requestStack: Map<string, WebSocketRequest>;

  constructor() {
    this.listeners = new Map();
    this.requestStack = new Map<string, WebSocketRequest>();
  }

  addRequest(req: WebSocketRequest) {

    this.requestStack.set(req.id, req);

  }

  cancelAllRequests() {

    this.requestStack.forEach((req) => {

      this.requestStack.delete(req.id);
      req.cancel();

    });

  }

  hasRequest(reqID: string): boolean {

    return this.requestStack.has(reqID);

  }

  getRequest(reqID: string): WebSocketRequest | undefined {

    if (this.requestStack.has(reqID)) {

      let req = this.requestStack.get(reqID);
      return req;

    }
    return undefined;

  }

  removeRequest(reqID: string) {

    if (this.requestStack.has(reqID)) {
        this.requestStack.delete(reqID);
    }

  }

  addListener(label: string | number | symbol, callback: any, vm: any) {
    if (typeof callback === 'function') {
      this.listeners.has(label) || this.listeners.set(label, []);
      this.listeners.get(label).push({callback: callback, vm: vm});
      return true;
    }
    return false;
  }

  removeListener(label: string | number | symbol, callback: any, vm: any) {
    let listeners = this.listeners.get(label);
    let index;

    if (listeners && listeners.length) {
      index = listeners.reduce((i: number, listener: { callback: any, vm: any }, index: number) => {
        if (typeof listener.callback === 'function' && listener.callback === callback && listener.vm === vm) {
          i = index;
        }
        return i;
      }, -1);

      if (index > -1) {
        listeners.splice(index, 1);
        this.listeners.set(label, listeners);
        return true;
      }
    }
    return false;
  }

  emit(label: string, ...args: any[]) {
    let listeners = this.listeners.get(label);

    if (listeners && listeners.length) {
      listeners.forEach((listener: { callback: any, vm: any }) => {
        listener.callback.call(listener.vm, ...args);
      });
      return true;
    }
    return false;
  }
}

export default new Emitter();
