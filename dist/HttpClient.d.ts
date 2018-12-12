import * as Promise from "bluebird";
export default class {
    static get(url: string): Promise<string>;
    static getJSON(url: string): Promise<any>;
    static post(url: string, payload: string): Promise<string>;
    static postJSON(url: string, payload: any): Promise<any>;
}
