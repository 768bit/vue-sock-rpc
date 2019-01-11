import { WebSocketRequest } from "./WebSocketRequest";
declare class Emitter {
    listeners: Map<string | number | symbol, any>;
    requestStack: Map<string, WebSocketRequest>;
    constructor();
    addRequest(req: WebSocketRequest): void;
    cancelAllRequests(): void;
    hasRequest(reqID: string): boolean;
    getRequest(reqID: string): WebSocketRequest | undefined;
    removeRequest(reqID: string): void;
    addListener(label: string | number | symbol, callback: any, vm: any): boolean;
    removeListener(label: string | number | symbol, callback: any, vm: any): boolean;
    emit(label: string, ...args: any[]): boolean;
}
declare const _default: Emitter;
export default _default;
