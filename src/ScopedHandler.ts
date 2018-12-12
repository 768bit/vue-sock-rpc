export default class {

  namespace: string;
  handlers: Map<string, (payload: any) => void>;
  alwaysProcessMessageWithDefaultHandler: boolean;
  onObjectHandler: (data: any) => void;
  onMessageHandler: (msg: string) => void;

  constructor(namespace: string)
  constructor(namespace: string, alwaysProcessMessageWithDefaultHandler: boolean = false) {

    this.namespace = namespace;
    this.alwaysProcessMessageWithDefaultHandler = alwaysProcessMessageWithDefaultHandler;
    this.handlers = new Map<string, any>();

  }

  addHandler(eventName: string, handler: (payload: any) => void): this {

    if (!this.handlers.has(eventName)) {

      this.handlers.set(eventName, handler);

    }

    return this;

  }

  hasHandler(eventName: string): boolean {

    if (!this.handlers.has(eventName)) {

      return true;

    }

    return false;

  }

  handleMessage(payload: string) {

    // if (this.alwaysProcessMessageWithDefaultHandler && this.onMessageHandler && typeof this.onMessageHandler === "function") {
    //
    //   this.onMessageHandler(msg)
    //
    // }
    //
    // let parsed = JSON.parse(msg);
    //
    // if (this.alwaysProcessMessageWithDefaultHandler && this.onObjectHandler && typeof this.onObjectHandler === "function") {
    //
    //   this.onMessageHandler(parsed)
    //
    // }
    //
    // let handled = false;


  }

  removeHandler(eventName: string): this {

    if (this.handlers.has(eventName)) {

      this.handlers.delete(eventName);

    }

    return this;

  }

}
