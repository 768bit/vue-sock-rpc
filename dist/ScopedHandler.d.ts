export default class {
    namespace: string;
    handlers: Map<string, (payload: any) => void>;
    alwaysProcessMessageWithDefaultHandler: boolean;
    onObjectHandler: (data: any) => void;
    onMessageHandler: (msg: string) => void;
    constructor(namespace: string);
    addHandler(eventName: string, handler: (payload: any) => void): this;
    hasHandler(eventName: string): boolean;
    handleMessage(payload: string): void;
    removeHandler(eventName: string): this;
}
