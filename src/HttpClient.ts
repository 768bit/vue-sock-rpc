import * as Promise from "bluebird";

export default class {

  public static get(url: string): Promise<string> {

    return new Promise((resolve, reject) => {

      let anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function () {
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) {
          resolve(anHttpRequest.responseText);
        } else {
          reject(anHttpRequest.responseText);
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
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) {
          try {
            let parsed = JSON.parse(anHttpRequest.responseText);
            resolve(parsed);
          } catch (ex) {
            reject(ex);
          }
        } else {
          reject(anHttpRequest.responseText);
        }
      };

      anHttpRequest.open("GET", url, true);
      anHttpRequest.send(null);

    });

  }

}
