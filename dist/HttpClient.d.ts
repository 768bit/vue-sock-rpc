import * as Promise from "bluebird";
export default class {
    static get(url: string): Promise<string>;
    static getJSON(url: string): Promise<any>;
}
