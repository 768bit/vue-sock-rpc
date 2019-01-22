import * as Promise from "bluebird";

export default class {

  public static get(url: string): Promise<string> {

    return new Promise((resolve, reject) => {

      let anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function () {
        if (anHttpRequest.readyState == 4) {
          if (anHttpRequest.status == 200) {
            resolve(anHttpRequest.responseText);
          } else {
            reject(anHttpRequest.responseText);
          }
        }
      };

      anHttpRequest.open("GET", url, true);
      anHttpRequest.send(null);

    });

  }

  public static getJSON(url: string): Promise<any> {

    return new Promise((resolve, reject) => {

      let anHttpRequest = new XMLHttpRequest();
      anHttpRequest.withCredentials = true;
      anHttpRequest.onreadystatechange = function () {
        if (anHttpRequest.readyState == 4) {
          if (anHttpRequest.status == 200) {
            try {
              let parsed = JSON.parse(anHttpRequest.responseText);
              resolve(parsed);
            } catch (ex) {
              reject(ex);
            }
          } else {
            reject(anHttpRequest.responseText);
          }
        }
      };

      anHttpRequest.open("GET", url, true);
      anHttpRequest.send(null);

    });

  }

  public static post(url: string, payload:string): Promise<string> {

    return new Promise((resolve, reject) => {

      let anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function () {
        if (anHttpRequest.readyState == 4) {
          if (anHttpRequest.status == 200) {
            resolve(anHttpRequest.responseText);
          } else {
            reject(anHttpRequest.responseText);
          }
        }
      };

      anHttpRequest.open("POST", url, true);
      anHttpRequest.send(payload);

    });

  }

  public static postJSON(url: string, payload:any): Promise<any> {

    return new Promise((resolve, reject) => {

      let anHttpRequest = new XMLHttpRequest();
      anHttpRequest.withCredentials = true;
      anHttpRequest.onreadystatechange = function () {
        if (anHttpRequest.readyState == 4) {
          if (anHttpRequest.status == 200) {
            try {
              let parsed = JSON.parse(anHttpRequest.responseText);
              resolve(parsed);
            } catch (ex) {
              console.error("Parse Error. Response:", anHttpRequest.responseText);
              reject(ex);
            }
          } else {
            console.error("Error Code:", anHttpRequest.status, "Response:", anHttpRequest.responseText);
            reject(anHttpRequest.responseText);
          }
        }
      };

      anHttpRequest.open("POST", url, true);
      anHttpRequest.send(JSON.stringify(payload));

    });

  }

}
