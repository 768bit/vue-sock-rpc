import Emitter from './Emitter'
import * as Promise from 'bluebird';
import HttpClient from './HttpClient';
import WebSocketRequest from './WebSocketRequest';
import {WebSocketMessageStatus, WebSocketMessageType, WebSocketResponseBody} from "./types";
import Queue from './Queue';

export enum WebSocketConnectionStatus {
  Disconnected = 0x0,
  Connected = 0xF
}

export default class {

  connectionUrl: string;
  format: string;
  opts: any;
  status: WebSocketConnectionStatus = WebSocketConnectionStatus.Disconnected;
  passToStoreHandler: any;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectTimeoutId: any;
  reconnectionCount: number;
  queueEnabled: boolean = true;
  private processingQueue = false;
  WebSocket: WebSocket;
  store: any;
  mutations: any;
  isAuth: boolean = false;
  sessionReady: boolean = true;
  private seshKey: string;
  private requestQueue: Queue;
  private subscriptions:Map<string,any[]>;

  constructor(connectionUrl: string, opts: any = {}) {

    if (connectionUrl.startsWith('//')) {
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      connectionUrl = `${scheme}://${connectionUrl}`
    }

    this.connectionUrl = connectionUrl;
    this.opts = opts;
    this.format = (opts.format ? opts.format.toLowerCase() : "json");
    this.subscriptions = new Map<string, any[]>();

    this.reconnection = this.opts.reconnection || false;
    this.reconnectionAttempts = this.opts.reconnectionAttempts || Infinity;
    this.reconnectionDelay = this.opts.reconnectionDelay || 1000;
    this.reconnectTimeoutId = 0;
    this.reconnectionCount = 0;

    this.queueEnabled = this.opts.queueEnabled || false;
    this.requestQueue = new Queue();

    this.passToStoreHandler = this.opts.passToStoreHandler || false;

    this.connect(connectionUrl, opts);

    if (opts.store) {
      this.store = opts.store;
    }
    if (opts.mutations) {
      this.mutations = opts.mutations;
    }
    this.onEvent()
  }

  private processQueue() {

    if (!this.sessionReady) {
      console.log("Skipping Queue Processing Until Session is Ready.");
      return Promise.resolve();
    }

    if (this.queueEnabled) {

      if (this.processingQueue) {

        return Promise.resolve();

      }

      let rq = this.requestQueue.dequeueAll();

      if (Array.isArray(rq) && rq.length > 0) {

        console.log("Processing WebSocket Queue");

        this.processingQueue = true;
        return Promise.each(rq, (item: { msg?: string, reqID?: string }) => {

          if (item.reqID && item.reqID !== "" && Emitter.hasRequest(item.reqID)) {
            let req = <WebSocketRequest>(Emitter.getRequest(item.reqID));

            if (req.complete || req.wasCancelled || req.wasError) {

              return;

            }

            //we have a request...
            return this.sendRequest(req, true).catch((ex) => {

              return;

            });

          } else if (item.msg && item.msg !== "") {

            try {

              this.sendMessage(item.msg, true);

            } catch (ex) {
            }

            return;

          }

        }).catch((ex) => {

          return;

        }).finally(() => {

          console.log("Completed Processing WebSocket Queue");
          this.processingQueue = false;

          //if there is anything still in the queue we need to process it so only once a "next tick" style que process will be done...

          return this.processQueue();

        }).thenReturn();

      }

    }

    return Promise.resolve();

  }

  startSession(): Promise<any> {
    //start by getting the JWTTicket from the auth handler...
    return HttpClient.postJSON("/_auth/_jwtAuth", {}).then((response: any) => {

      //check the response for the tickets etc...

      if (response && response.hasOwnProperty("userUUID") && response.hasOwnProperty("jwtTicketID") &&
        typeof response.userUUID === "string" && response.userUUID !== "" &&
        typeof response.jwtTicketID === "string" && response.jwtTicketID !== "") {

        //now send the start session request...

        let req = WebSocketRequest.StartSession(response.userUUID, response.jwtTicketID);

        return this.sendRequest(req, true).then((response: WebSocketResponseBody) => {

          if (response && response.seshKey && response.seshKey !== "") {

            console.log("Setting Session Key");

            this.seshKey = response.seshKey;
            this.isAuth = true;
            this.sessionReady = true;

          }

        });

      } else {

        return Promise.reject(new Error("Error Attempting to Authenticate and Authorise the WebSocket Session."));

      }

    }).catch((ex) => {

      window.location.replace("/_auth/logout?req_path=" + encodeURIComponent(window.location.pathname + window.location.search + window.location.hash));

      throw ex;

    });

  }

  private onConnected(event: any) {

    Promise.resolve().then(() => {

      if (this.opts.hasOwnProperty("startSession") && this.opts.startSession === true) {
        //immediately start a session with server (authorisation)

        return this.startSession();

      }

    }).then(() => {

      return this.processQueue();

    }).then(() => {

      this.status = WebSocketConnectionStatus.Connected;
      if (this.reconnection) {
        this.opts.$setInstance(event.currentTarget);
        this.reconnectionCount = 0;
      }

      console.log("WebSocket Connection Ready");

      Emitter.emit("onopen", event);

    });

  }

  private onDisconnected(event: any) {

    this.isAuth = false;
    this.sessionReady = false;
    this.seshKey = "";
    this.status = WebSocketConnectionStatus.Disconnected;
    if (this.reconnection) {
      this.reconnect();
    }

    console.log("WebSocket Connection Disconnected");

    Emitter.emit("onclose", event);

  }

  private sendMessage(msg: string, dontQueue: boolean = false) {

    if (!dontQueue && this.queueEnabled && this.status !== WebSocketConnectionStatus.Connected) {

      this.requestQueue.enqueue({msg: msg});

    } else {

      this.processQueue().then(() => {

        this.WebSocket.send(msg);

      });

    }

  }

  private sendRequest(req: WebSocketRequest, dontQueue: boolean = false): Promise<any> {

    if (this.isAuth && this.seshKey && this.seshKey !== "") {
      req.setSeshKey(this.seshKey);
    }

    if (!dontQueue && this.queueEnabled && (this.status !== WebSocketConnectionStatus.Connected || !this.sessionReady)) {

      if (!req.queueable) {
        req.cancel();
        return req.internalPromise;
      }

      Emitter.addRequest(req);
      console.log("Queueing Request", req.id);
      this.requestQueue.enqueue({reqID: req.id});

    } else {

      Emitter.addRequest(req);

      //if we are warned not to process queue then we just send the req...

      if (dontQueue) {

        this.WebSocket.send(req.makeMessage());

      } else {

        this.processQueue().then(() => {

          console.log("Sending Request", req.id);
          this.WebSocket.send(req.makeMessage());

        });
      }
    }

    return req.internalPromise;

  }

  connect(connectionUrl: string, opts: any = {}) {
    let protocol = opts.protocol || '';
    let self = this;
    this.WebSocket = opts.WebSocket || (protocol === '' ? new WebSocket(connectionUrl) : new WebSocket(connectionUrl, protocol));
    if (!('sendMessage' in this.WebSocket)) {
      // @ts-ignore
      this.WebSocket.sendMessage = function (msg) {
        self.sendMessage(msg);
      }
    }
    if (!('sendObj' in this.WebSocket)) {
      // @ts-ignore
      this.WebSocket.sendObj = function (obj) {
        self.sendMessage(JSON.stringify(obj));
      }
    }
    if (!('callRPC' in this.WebSocket)) {
      // @ts-ignore
      this.WebSocket.callRPC = function (cmd: string, payload: string, options?:WebSocketRequestOptions): Promise<any> {

        //create the request object so we can get an id...

        let req = WebSocketRequest.RPC(cmd, payload, options);
        return self.sendRequest.call(self, req);

      };

    }
    if (!('subscribe' in this.WebSocket)) {
      // @ts-ignore
      this.WebSocket.subscribe = function (topic: string, handler:any): Promise<any> {

        if (typeof handler !== "function") {
          return Promise.reject(new Error("Handler must be a function"))
        }

        if (self.subscriptions.has(topic)) {
          let st = self.subscriptions.get(topic);
          if (st.indexOf(handler) >= 0) {
            return Promise.reject(new Error("Handler already registered for pub/sub for topic: " + topic));
          } else {
            st.push(handler);
            return Promise.resolve();
          }
        } else {
          let req = WebSocketRequest.Subscribe(topic);
          return self.sendRequest.call(self, req).then(() => {

            //subscribe and add topic to subscriptions...
            self.subscriptions.set(topic, [handler]);

          });
        }

      };
    }
    if (!('unsubscribe' in this.WebSocket)) {
      // @ts-ignore
      this.WebSocket.unsubscribe = function (topic: string, handler:any): Promise<any> {

        if (!handler || typeof handler !== "function") {
          if (self.subscriptions.has(topic)) {
            let req = WebSocketRequest.UnSubscribe(topic);
            return self.sendRequest.call(self, req).then(() => {

            });
          } else {
            return Promise.reject(new Error("Supplied topic is not registered for pub/sub: " + topic))
          }
        }
        if (self.subscriptions.has(topic)) {
          let st = self.subscriptions.get(topic);
          let ind = st.indexOf(handler);
          if (ind >= 0) {
            self.subscriptions.set(topic, st.splice(ind, 1));
            return Promise.resolve();
          } else {
            return Promise.reject(new Error("Supplied Handler is not registered for pub/sub for topic: " + topic))
          }
        } else {
          return Promise.reject(new Error("Supplied topic is not registered for pub/sub: " + topic))
        }

      };
    }

    return this.WebSocket;
  }

  reconnect() {
    if (this.reconnectionCount <= this.reconnectionAttempts) {
      this.reconnectionCount++;
      clearTimeout(this.reconnectTimeoutId);

      this.reconnectTimeoutId = setTimeout(() => {
        if (this.store) {
          this.passToStore('SOCKET_RECONNECT', this.reconnectionCount);
        }

        this.connect(this.connectionUrl, this.opts);
        this.onEvent();
      }, this.reconnectionDelay);
    } else {
      if (this.store) {
        this.passToStore('SOCKET_RECONNECT_ERROR', true);
      }
    }
  }

  onEvent() {
    let self = this;
    ['onmessage', 'onclose', 'onerror', 'onopen'].forEach((eventType) => {
      (<any>this.WebSocket)[eventType] = (event: any) => {

        switch (eventType) {
          case "onmessage":
            //attempt to parse the message...
            try {

              let parsed: string | undefined | {} | WebSocketResponseBody = event;
              if (typeof parsed === "string") {
                parsed = JSON.parse(parsed);
              } else if (parsed && (<any>parsed).data && typeof (<any>parsed).data === "string") {
                parsed = JSON.parse((<any>parsed).data);
              }
              console.log("Got message", parsed);
              if (parsed && parsed.hasOwnProperty("messageType")) {

                if (parsed.hasOwnProperty("id") && typeof (<WebSocketResponseBody>parsed).id === "string" && (<WebSocketResponseBody>parsed).id !== "" &&
                  Emitter.hasRequest((<WebSocketResponseBody>parsed).id)) {

                  let req = Emitter.getRequest((<WebSocketResponseBody>parsed).id);
                  if ((<WebSocketResponseBody>parsed).messageType === WebSocketMessageType.RPCStatusMessage) {

                    //handle the response directly if a handler is registered... we will report it back as required...
                    if (req.hasStatusHandler) {
                      req.processStatusMessage((<WebSocketResponseBody>parsed))
                    } else {
                      //dump the status message as needed...
                    }

                  } else if ((<WebSocketResponseBody>parsed).statusCode > WebSocketMessageStatus.RPCStatusOK) {
                    Emitter.removeRequest((<WebSocketResponseBody>parsed).id);
                    if ((<WebSocketResponseBody>parsed).statusCode === WebSocketMessageStatus.RPCStatusUnauthorised) {
                      //try again!
                      //we will attempt a reauth now...
                      window.location.replace("/_auth/logout?req_path=" + encodeURIComponent(window.location.pathname + window.location.search + window.location.hash));
                    }
                    (<WebSocketRequest>req).reject(<WebSocketResponseBody>parsed);
                  }  else {
                    Emitter.removeRequest((<WebSocketResponseBody>parsed).id);
                    console.log("Resolving Response");
                    (<WebSocketRequest>req).resolve(<WebSocketResponseBody>parsed);
                  }
                } else if ((<WebSocketResponseBody>parsed).messageType === WebSocketMessageType.PublishMessage &&
                  typeof (<WebSocketResponseBody>parsed).topic === "string" && (<WebSocketResponseBody>parsed).topic !== "") {

                  //item is a publish message... iterate the handlers for topic and send data...
                  if (self.subscriptions.has((<WebSocketResponseBody>parsed).topic)) {
                    let st = self.subscriptions.get((<WebSocketResponseBody>parsed).topic);
                    if (st && Array.isArray(st) && st.length > 0) {
                      st.forEach((handler) => {
                        handler((<WebSocketResponseBody>parsed).topic, (<WebSocketResponseBody>parsed).payload.publish)
                      })
                    }
                  }
                }
                return;
              }
              //were unable to parse the request... pass the parsed item down to anything that is subscribed for onobject or onmessage events...
              if (this.store) {
                this.passToStore('SOCKET_' + eventType, event);
              } else {
                Emitter.emit("onmessage", event);
                Emitter.emit("onobject", parsed);
              }
            } catch (ex) {
              console.log("Error Processing inbound message", ex, event);
              ex.payload = event;
              Emitter.emit("onerror", ex);
              return;
            }
            break;
          case "onclose":
            this.onDisconnected(event);
            return;
          case "onopen":
            this.onConnected(event);
            return;
          default:
            Emitter.emit(eventType, event);
            return;

        }

      }
    })
  }

  passToStore(eventName: string, event: any) {
    if (this.passToStoreHandler) {
      this.passToStoreHandler(eventName, event, this.defaultPassToStore.bind(this));
    } else {
      this.defaultPassToStore(eventName, event);
    }
  }

  defaultPassToStore(eventName: string, event: any) {
    if (!eventName.startsWith('SOCKET_')) {
      return;
    }
    let method = 'commit';
    let target = eventName.toUpperCase();
    let msg = event;
    if (this.format === 'json' && event.data) {
      msg = JSON.parse(event.data);
      if (msg.mutation) {
        target = [msg.namespace || '', msg.mutation].filter((e) => !!e).join('/');
      } else if (msg.action) {
        method = 'dispatch';
        target = [msg.namespace || '', msg.action].filter((e) => !!e).join('/');
      }
    }
    if (this.mutations) {
      target = this.mutations[target] || target;
    }
    this.store[method](target, msg);
  }
}
