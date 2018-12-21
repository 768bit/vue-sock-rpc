'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Promise$1 = require('bluebird');
var ShortUniqueId = _interopDefault(require('short-unique-id'));

var Emitter = /** @class */ (function () {
    function Emitter() {
        this.listeners = new Map();
        this.requestStack = new Map();
    }
    Emitter.prototype.addRequest = function (req) {
        this.requestStack.set(req.id, req);
    };
    Emitter.prototype.cancelAllRequests = function () {
        var _this = this;
        this.requestStack.forEach(function (req) {
            _this.requestStack.delete(req.id);
            req.cancel();
        });
    };
    Emitter.prototype.hasRequest = function (reqID) {
        return this.requestStack.has(reqID);
    };
    Emitter.prototype.getRequest = function (reqID) {
        if (this.requestStack.has(reqID)) {
            var req = this.requestStack.get(reqID);
            return req;
        }
        return undefined;
    };
    Emitter.prototype.removeRequest = function (reqID) {
        if (this.requestStack.has(reqID)) {
            this.requestStack.delete(reqID);
        }
    };
    Emitter.prototype.addListener = function (label, callback, vm) {
        if (typeof callback === 'function') {
            this.listeners.has(label) || this.listeners.set(label, []);
            this.listeners.get(label).push({ callback: callback, vm: vm });
            return true;
        }
        return false;
    };
    Emitter.prototype.removeListener = function (label, callback, vm) {
        var listeners = this.listeners.get(label);
        var index;
        if (listeners && listeners.length) {
            index = listeners.reduce(function (i, listener, index) {
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
    };
    Emitter.prototype.emit = function (label) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var listeners = this.listeners.get(label);
        if (listeners && listeners.length) {
            listeners.forEach(function (listener) {
                var _a;
                (_a = listener.callback).call.apply(_a, [listener.vm].concat(args));
            });
            return true;
        }
        return false;
    };
    return Emitter;
}());
var Emitter$1 = new Emitter();

var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.get = function (url) {
        return new Promise$1(function (resolve, reject) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function () {
                if (anHttpRequest.readyState == 4) {
                    if (anHttpRequest.status == 200) {
                        resolve(anHttpRequest.responseText);
                    }
                    else {
                        reject(anHttpRequest.responseText);
                    }
                }
            };
            anHttpRequest.open("GET", url, true);
            anHttpRequest.send(null);
        });
    };
    default_1.getJSON = function (url) {
        return new Promise$1(function (resolve, reject) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.withCredentials = true;
            anHttpRequest.onreadystatechange = function () {
                if (anHttpRequest.readyState == 4) {
                    if (anHttpRequest.status == 200) {
                        try {
                            var parsed = JSON.parse(anHttpRequest.responseText);
                            resolve(parsed);
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    }
                    else {
                        reject(anHttpRequest.responseText);
                    }
                }
            };
            anHttpRequest.open("GET", url, true);
            anHttpRequest.send(null);
        });
    };
    default_1.post = function (url, payload) {
        return new Promise$1(function (resolve, reject) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function () {
                if (anHttpRequest.readyState == 4) {
                    if (anHttpRequest.status == 200) {
                        resolve(anHttpRequest.responseText);
                    }
                    else {
                        reject(anHttpRequest.responseText);
                    }
                }
            };
            anHttpRequest.open("POST", url, true);
            anHttpRequest.send(payload);
        });
    };
    default_1.postJSON = function (url, payload) {
        return new Promise$1(function (resolve, reject) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.withCredentials = true;
            anHttpRequest.onreadystatechange = function () {
                if (anHttpRequest.readyState == 4) {
                    if (anHttpRequest.status == 200) {
                        try {
                            var parsed = JSON.parse(anHttpRequest.responseText);
                            resolve(parsed);
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    }
                    else {
                        reject(anHttpRequest.responseText);
                    }
                }
            };
            anHttpRequest.open("POST", url, true);
            anHttpRequest.send(JSON.stringify(payload));
        });
    };
    return default_1;
}());

var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType[WebSocketMessageType["ServerHelloMessage"] = 0] = "ServerHelloMessage";
    WebSocketMessageType[WebSocketMessageType["RPCSessionStartMessage"] = 1] = "RPCSessionStartMessage";
    WebSocketMessageType[WebSocketMessageType["RPCSessionEndMessage"] = 4] = "RPCSessionEndMessage";
    WebSocketMessageType[WebSocketMessageType["RPCMessage"] = 32] = "RPCMessage";
    WebSocketMessageType[WebSocketMessageType["RPCStatusMessage"] = 34] = "RPCStatusMessage";
    WebSocketMessageType[WebSocketMessageType["HTTPMessage"] = 64] = "HTTPMessage";
    WebSocketMessageType[WebSocketMessageType["ByteSessionStartMessage"] = 176] = "ByteSessionStartMessage";
    WebSocketMessageType[WebSocketMessageType["ByteSessionEndMessage"] = 180] = "ByteSessionEndMessage";
    WebSocketMessageType[WebSocketMessageType["RPCSessionStartErrorMessage"] = 224] = "RPCSessionStartErrorMessage";
    WebSocketMessageType[WebSocketMessageType["RPCSessionEndErrorMessage"] = 225] = "RPCSessionEndErrorMessage";
    WebSocketMessageType[WebSocketMessageType["BasicMessage"] = 255] = "BasicMessage";
})(WebSocketMessageType || (WebSocketMessageType = {}));
function WebSocketMessageTypeToString(messageType) {
    switch (messageType) {
        case WebSocketMessageType.ServerHelloMessage:
            return "ServerHello";
        case WebSocketMessageType.RPCMessage:
            return "RPC";
        case WebSocketMessageType.RPCStatusMessage:
            return "RPCStatus";
        case WebSocketMessageType.BasicMessage:
            return "Basic";
        case WebSocketMessageType.HTTPMessage:
            return "HTTP";
        case WebSocketMessageType.RPCSessionStartMessage:
            return "SessionStart";
        case WebSocketMessageType.RPCSessionStartErrorMessage:
            return "SessionStartError";
        case WebSocketMessageType.RPCSessionEndMessage:
            return "SessionEnd";
        case WebSocketMessageType.RPCSessionEndErrorMessage:
            return "SessionEndError";
        default:
            return "Other";
    }
}
var WebSocketMessageStatus;
(function (WebSocketMessageStatus) {
    WebSocketMessageStatus[WebSocketMessageStatus["RPCStatusOK"] = 200] = "RPCStatusOK";
    WebSocketMessageStatus[WebSocketMessageStatus["RPCStatusUnauthorised"] = 401] = "RPCStatusUnauthorised";
    WebSocketMessageStatus[WebSocketMessageStatus["RPCStatusError"] = 500] = "RPCStatusError";
    WebSocketMessageStatus[WebSocketMessageStatus["RPCStatusLocalError"] = 614] = "RPCStatusLocalError";
    WebSocketMessageStatus[WebSocketMessageStatus["RPCStatusRequestCancelled"] = 670] = "RPCStatusRequestCancelled"; //670
})(WebSocketMessageStatus || (WebSocketMessageStatus = {}));
function WebSocketMessageStatusToString(statusCode) {
    switch (statusCode) {
        case WebSocketMessageStatus.RPCStatusOK:
            return "[" + statusCode + "]::OK";
        case WebSocketMessageStatus.RPCStatusUnauthorised:
            return "[" + statusCode + "]::UNAUTHORISED";
        case WebSocketMessageStatus.RPCStatusError:
            return "[" + statusCode + "]::ERROR";
        case WebSocketMessageStatus.RPCStatusLocalError:
            return "[" + statusCode + "]::LOCAL_ERROR";
        case WebSocketMessageStatus.RPCStatusRequestCancelled:
            return "[" + statusCode + "]::CANCELLED";
        default:
            return "[" + statusCode + "]::UNKNOWN";
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var default_1$1 = /** @class */ (function (_super) {
    __extends(default_1, _super);
    function default_1(request, response) {
        var _this = this;
        var mt = WebSocketMessageTypeToString(response.messageType);
        var msg = "WebSocket Error: " + mt + " Request -> " + WebSocketMessageStatusToString(response.statusCode) + " | ";
        var hasContent = false;
        switch (response.messageType) {
            case WebSocketMessageType.RPCMessage:
                msg += "CMD: " + request.cmd + " | ID: " + request.id;
                if (request.moduleURI && request.moduleURI !== "") {
                    msg += " | MODULE: " + request.moduleURI;
                }
                hasContent = true;
                break;
            case WebSocketMessageType.HTTPMessage:
                msg += "PATH: " + request.path + " | METHOD: " + request.method;
                hasContent = true;
                break;
            default:
                break;
        }
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
            if (hasContent) {
                msg += " | ";
            }
            for (var i = 0; i < response.errors.length; i++) {
                if (typeof response.errors[i] === "string") {
                    msg += (i > 0 ? "\nError " + i + ": " : "Error " + i + ": ") + response.errors[i];
                }
                else if (response.errors[i] instanceof Error) {
                    msg += (i > 0 ? "\nError " + i + ": " : "Error " + i + ": ") + response.errors[i].message;
                }
                else {
                    msg += (i > 0 ? "\nError " + i + ": " : "Error " + i + ": ") + response.errors[i].toString();
                }
            }
        }
        _this = _super.call(this, msg) || this;
        _this.request = request;
        _this.response = response;
        return _this;
    }
    return default_1;
}(Error));

var default_1$2 = /** @class */ (function (_super) {
    __extends(default_1, _super);
    function default_1() {
        var _this = _super.call(this, "The WebSocketRequest was cancelled") || this;
        _this.name = "WebSocketRequestCancelledError";
        return _this;
    }
    return default_1;
}(Error));

var UUID = new ShortUniqueId();
var WebSocketRequest = /** @class */ (function () {
    function WebSocketRequest(messageType) {
        this.wasCancelled = false;
        this.wasError = false;
        this.complete = false;
        this.queueable = true;
        this.hasStatusHandler = false;
        var self = this;
        this.messageType = messageType;
        this.internalPromise = new Promise$1(function (resolve, reject) {
            self.resolver = resolve;
            self.rejecter = reject;
        });
        this.id = UUID.randomUUID(12);
        this.reqObject = {
            messageType: messageType,
            id: this.id
        };
    }
    WebSocketRequest.RPC = function (operation, payload, options) {
        var req = new WebSocketRequest(WebSocketMessageType.RPCMessage);
        req.reqObject.cmd = operation;
        req.payload = payload;
        if (options) {
            if (options.RPCOptions) {
                req.reqObject.options = options.RPCOptions;
            }
            if (options.StatusCallback && typeof options.StatusCallback === "function") {
                req.hasStatusHandler = true;
                req.statusHandler = options.StatusCallback;
            }
        }
        return req;
    };
    WebSocketRequest.HttpGET = function (path, headers) {
        var req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
        req.reqObject.path = path;
        req.reqObject.method = "GET";
        if (headers && headers instanceof Map && headers.size > 0) {
            req.reqObject.headers = headers;
        }
        return req;
    };
    WebSocketRequest.HttpPOST = function (path, payload, headers) {
        var req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
        req.reqObject.path = path;
        req.reqObject.method = "POST";
        req.payload = payload;
        if (headers && headers instanceof Map && headers.size > 0) {
            req.reqObject.headers = headers;
        }
        return req;
    };
    WebSocketRequest.HttpPUT = function (path, payload, headers) {
        var req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
        req.reqObject.path = path;
        req.reqObject.method = "PUT";
        req.payload = payload;
        if (headers && headers instanceof Map && headers.size > 0) {
            req.reqObject.headers = headers;
        }
        return req;
    };
    WebSocketRequest.HttpDELETE = function (path, headers) {
        var req = new WebSocketRequest(WebSocketMessageType.HTTPMessage);
        req.reqObject.path = path;
        req.reqObject.method = "DELETE";
        if (headers && headers instanceof Map && headers.size > 0) {
            req.reqObject.headers = headers;
        }
        return req;
    };
    WebSocketRequest.Basic = function (payload) {
        var req = new WebSocketRequest(WebSocketMessageType.BasicMessage);
        req.payload = payload;
        return req;
    };
    WebSocketRequest.StartSession = function (userID, jwtTicketID) {
        var req = new WebSocketRequest(WebSocketMessageType.RPCSessionStartMessage);
        req.queueable = false;
        req.payload = {
            userUUID: userID,
            jwtTicketID: jwtTicketID,
        };
        return req;
    };
    WebSocketRequest.prototype.makeRequestObject = function () {
        if (this.seshKey && this.seshKey !== "") {
            this.reqObject.seshKey = this.seshKey;
        }
        if (this.payload) {
            this.reqObject.payload = this.payload;
        }
        return this.reqObject;
    };
    WebSocketRequest.prototype.makeMessage = function () {
        return JSON.stringify(this.makeRequestObject());
    };
    WebSocketRequest.prototype.setSeshKey = function (seshKey) {
        this.seshKey = seshKey;
        return this;
    };
    WebSocketRequest.prototype.processStatusMessage = function (message) {
        if (this.hasStatusHandler) {
            this.statusHandler(this, message);
        }
    };
    WebSocketRequest.prototype.resolve = function (response) {
        if (response.messageType === WebSocketMessageType.RPCSessionStartErrorMessage || response.messageType === WebSocketMessageType.RPCSessionEndErrorMessage) {
            this.reject(response);
            return;
        }
        this.complete = true;
        this.resolver(response);
    };
    WebSocketRequest.prototype.reject = function (response) {
        this.complete = true;
        this.wasError = true;
        var ex = new default_1$1(this.reqObject, response);
        this.rejecter(ex);
    };
    WebSocketRequest.prototype.cancel = function () {
        this.complete = true;
        this.wasCancelled = true;
        this.rejecter(new default_1$2());
    };
    return WebSocketRequest;
}());

var QueueNode = /** @class */ (function () {
    function QueueNode(data) {
        this.data = data;
        this.next = null;
    }
    return QueueNode;
}());
var Queue = /** @class */ (function () {
    function Queue() {
        this.head = null;
        this.tail = null;
    }
    Queue.prototype.enqueue = function (data) {
        var newNode = new QueueNode(data);
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        }
        else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
    };
    Queue.prototype.dequeue = function () {
        var dqNode = null;
        if (this.head !== null) {
            dqNode = this.head.data;
            this.head = this.head.next;
        }
        return dqNode;
    };
    Queue.prototype.dequeueAll = function () {
        var arr = [];
        var item = this.dequeue();
        while (item !== null) {
            arr.push(item);
            item = this.dequeue();
        }
        return arr;
    };
    return Queue;
}());

var WebSocketConnectionStatus;
(function (WebSocketConnectionStatus) {
    WebSocketConnectionStatus[WebSocketConnectionStatus["Disconnected"] = 0] = "Disconnected";
    WebSocketConnectionStatus[WebSocketConnectionStatus["Connected"] = 15] = "Connected";
})(WebSocketConnectionStatus || (WebSocketConnectionStatus = {}));
var default_1$3 = /** @class */ (function () {
    function default_1$$1(connectionUrl, opts) {
        if (opts === void 0) { opts = {}; }
        this.status = WebSocketConnectionStatus.Disconnected;
        this.queueEnabled = true;
        this.processingQueue = false;
        this.isAuth = false;
        this.sessionReady = true;
        if (connectionUrl.startsWith('//')) {
            var scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
            connectionUrl = scheme + "://" + connectionUrl;
        }
        this.connectionUrl = connectionUrl;
        this.opts = opts;
        this.format = (opts.format ? opts.format.toLowerCase() : "json");
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
        this.onEvent();
    }
    default_1$$1.prototype.processQueue = function () {
        var _this = this;
        if (!this.sessionReady) {
            console.log("Skipping Queue Processing Until Session is Ready.");
            return Promise$1.resolve();
        }
        if (this.queueEnabled) {
            if (this.processingQueue) {
                return Promise$1.resolve();
            }
            var rq = this.requestQueue.dequeueAll();
            if (Array.isArray(rq) && rq.length > 0) {
                console.log("Processing WebSocket Queue");
                this.processingQueue = true;
                return Promise$1.each(rq, function (item) {
                    if (item.reqID && item.reqID !== "" && Emitter$1.hasRequest(item.reqID)) {
                        var req = (Emitter$1.getRequest(item.reqID));
                        if (req.complete || req.wasCancelled || req.wasError) {
                            return;
                        }
                        //we have a request...
                        return _this.sendRequest(req, true).catch(function (ex) {
                            return;
                        });
                    }
                    else if (item.msg && item.msg !== "") {
                        try {
                            _this.sendMessage(item.msg, true);
                        }
                        catch (ex) {
                        }
                        return;
                    }
                }).catch(function (ex) {
                    return;
                }).finally(function () {
                    console.log("Completed Processing WebSocket Queue");
                    _this.processingQueue = false;
                    //if there is anything still in the queue we need to process it so only once a "next tick" style que process will be done...
                    return _this.processQueue();
                }).thenReturn();
            }
        }
        return Promise$1.resolve();
    };
    default_1$$1.prototype.startSession = function () {
        var _this = this;
        //start by getting the JWTTicket from the auth handler...
        return default_1.postJSON("/_auth/_jwtAuth", {}).then(function (response) {
            //check the response for the tickets etc...
            if (response && response.hasOwnProperty("userUUID") && response.hasOwnProperty("jwtTicketID") &&
                typeof response.userUUID === "string" && response.userUUID !== "" &&
                typeof response.jwtTicketID === "string" && response.jwtTicketID !== "") {
                //now send the start session request...
                var req = WebSocketRequest.StartSession(response.userUUID, response.jwtTicketID);
                return _this.sendRequest(req, true).then(function (response) {
                    if (response && response.seshKey && response.seshKey !== "") {
                        console.log("Setting Session Key");
                        _this.seshKey = response.seshKey;
                        _this.isAuth = true;
                        _this.sessionReady = true;
                    }
                });
            }
            else {
                return Promise$1.reject(new Error("Error Attempting to Authenticate and Authorise the WebSocket Session."));
            }
        }).catch(function (ex) {
            window.location.replace("/_auth/logout?req_path=" + encodeURIComponent(window.location.pathname + window.location.search + window.location.hash));
            throw ex;
        });
    };
    default_1$$1.prototype.onConnected = function (event) {
        var _this = this;
        Promise$1.resolve().then(function () {
            if (_this.opts.hasOwnProperty("startSession") && _this.opts.startSession === true) {
                //immediately start a session with server (authorisation)
                return _this.startSession();
            }
        }).then(function () {
            return _this.processQueue();
        }).then(function () {
            _this.status = WebSocketConnectionStatus.Connected;
            if (_this.reconnection) {
                _this.opts.$setInstance(event.currentTarget);
                _this.reconnectionCount = 0;
            }
            console.log("WebSocket Connection Ready");
            Emitter$1.emit("onopen", event);
        });
    };
    default_1$$1.prototype.onDisconnected = function (event) {
        this.isAuth = false;
        this.sessionReady = false;
        this.seshKey = "";
        this.status = WebSocketConnectionStatus.Disconnected;
        if (this.reconnection) {
            this.reconnect();
        }
        console.log("WebSocket Connection Disconnected");
        Emitter$1.emit("onclose", event);
    };
    default_1$$1.prototype.sendMessage = function (msg, dontQueue) {
        var _this = this;
        if (dontQueue === void 0) { dontQueue = false; }
        if (!dontQueue && this.queueEnabled && this.status !== WebSocketConnectionStatus.Connected) {
            this.requestQueue.enqueue({ msg: msg });
        }
        else {
            this.processQueue().then(function () {
                _this.WebSocket.send(msg);
            });
        }
    };
    default_1$$1.prototype.sendRequest = function (req, dontQueue) {
        var _this = this;
        if (dontQueue === void 0) { dontQueue = false; }
        if (this.isAuth && this.seshKey && this.seshKey !== "") {
            req.setSeshKey(this.seshKey);
        }
        if (!dontQueue && this.queueEnabled && (this.status !== WebSocketConnectionStatus.Connected || !this.sessionReady)) {
            if (!req.queueable) {
                req.cancel();
                return req.internalPromise;
            }
            Emitter$1.addRequest(req);
            console.log("Queueing Request", req.id);
            this.requestQueue.enqueue({ reqID: req.id });
        }
        else {
            Emitter$1.addRequest(req);
            //if we are warned not to process queue then we just send the req...
            if (dontQueue) {
                this.WebSocket.send(req.makeMessage());
            }
            else {
                this.processQueue().then(function () {
                    console.log("Sending Request", req.id);
                    _this.WebSocket.send(req.makeMessage());
                });
            }
        }
        return req.internalPromise;
    };
    default_1$$1.prototype.connect = function (connectionUrl, opts) {
        if (opts === void 0) { opts = {}; }
        var protocol = opts.protocol || '';
        var self = this;
        this.WebSocket = opts.WebSocket || (protocol === '' ? new WebSocket(connectionUrl) : new WebSocket(connectionUrl, protocol));
        if (!('sendMessage' in this.WebSocket)) {
            // @ts-ignore
            this.WebSocket.sendMessage = function (msg) {
                self.sendMessage(msg);
            };
        }
        if (!('sendObj' in this.WebSocket)) {
            // @ts-ignore
            this.WebSocket.sendObj = function (obj) {
                self.sendMessage(JSON.stringify(obj));
            };
        }
        if (!('callRPC' in this.WebSocket)) {
            // @ts-ignore
            this.WebSocket.callRPC = function (cmd, payload, options) {
                //create the request object so we can get an id...
                var req = WebSocketRequest.RPC(cmd, payload, options);
                return self.sendRequest.call(self, req);
            };
        }
        return this.WebSocket;
    };
    default_1$$1.prototype.reconnect = function () {
        var _this = this;
        if (this.reconnectionCount <= this.reconnectionAttempts) {
            this.reconnectionCount++;
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = setTimeout(function () {
                if (_this.store) {
                    _this.passToStore('SOCKET_RECONNECT', _this.reconnectionCount);
                }
                _this.connect(_this.connectionUrl, _this.opts);
                _this.onEvent();
            }, this.reconnectionDelay);
        }
        else {
            if (this.store) {
                this.passToStore('SOCKET_RECONNECT_ERROR', true);
            }
        }
    };
    default_1$$1.prototype.onEvent = function () {
        var _this = this;
        ['onmessage', 'onclose', 'onerror', 'onopen'].forEach(function (eventType) {
            _this.WebSocket[eventType] = function (event) {
                switch (eventType) {
                    case "onmessage":
                        //attempt to parse the message...
                        try {
                            var parsed = event;
                            if (typeof parsed === "string") {
                                parsed = JSON.parse(parsed);
                            }
                            else if (parsed && parsed.data && typeof parsed.data === "string") {
                                parsed = JSON.parse(parsed.data);
                            }
                            console.log("Got message", parsed);
                            if (parsed && parsed.hasOwnProperty("messageType") && parsed.hasOwnProperty("id") &&
                                typeof parsed.id === "string" && parsed.id !== "") {
                                if (Emitter$1.hasRequest(parsed.id)) {
                                    var req = Emitter$1.getRequest(parsed.id);
                                    if (parsed.messageType === WebSocketMessageType.RPCStatusMessage) {
                                        //handle the response directly if a handler is registered... we will report it back as required...
                                        if (req.hasStatusHandler) {
                                            req.processStatusMessage(parsed);
                                        }
                                    }
                                    else if (parsed.statusCode > WebSocketMessageStatus.RPCStatusOK) {
                                        Emitter$1.removeRequest(parsed.id);
                                        if (parsed.statusCode === WebSocketMessageStatus.RPCStatusUnauthorised) {
                                            //try again!
                                            //we will attempt a reauth now...
                                            window.location.replace("/_auth/logout?req_path=" + encodeURIComponent(window.location.pathname + window.location.search + window.location.hash));
                                        }
                                        req.reject(parsed);
                                    }
                                    else {
                                        Emitter$1.removeRequest(parsed.id);
                                        console.log("Resolving Response");
                                        req.resolve(parsed);
                                    }
                                }
                                return;
                            }
                            //were unable to parse the request... pass the parsed item down to anything that is subscribed for onobject or onmessage events...
                            if (_this.store) {
                                _this.passToStore('SOCKET_' + eventType, event);
                            }
                            else {
                                Emitter$1.emit("onmessage", event);
                                Emitter$1.emit("onobject", parsed);
                            }
                        }
                        catch (ex) {
                            console.log("Error Processing inbound message", ex, event);
                            ex.payload = event;
                            Emitter$1.emit("onerror", ex);
                            return;
                        }
                        break;
                    case "onclose":
                        _this.onDisconnected(event);
                        return;
                    case "onopen":
                        _this.onConnected(event);
                        return;
                    default:
                        Emitter$1.emit(eventType, event);
                        return;
                }
            };
        });
    };
    default_1$$1.prototype.passToStore = function (eventName, event) {
        if (this.passToStoreHandler) {
            this.passToStoreHandler(eventName, event, this.defaultPassToStore.bind(this));
        }
        else {
            this.defaultPassToStore(eventName, event);
        }
    };
    default_1$$1.prototype.defaultPassToStore = function (eventName, event) {
        if (!eventName.startsWith('SOCKET_')) {
            return;
        }
        var method = 'commit';
        var target = eventName.toUpperCase();
        var msg = event;
        if (this.format === 'json' && event.data) {
            msg = JSON.parse(event.data);
            if (msg.mutation) {
                target = [msg.namespace || '', msg.mutation].filter(function (e) { return !!e; }).join('/');
            }
            else if (msg.action) {
                method = 'dispatch';
                target = [msg.namespace || '', msg.action].filter(function (e) { return !!e; }).join('/');
            }
        }
        if (this.mutations) {
            target = this.mutations[target] || target;
        }
        this.store[method](target, msg);
    };
    return default_1$$1;
}());

var default_1$4 = /** @class */ (function () {
    function default_1(namespace, alwaysProcessMessageWithDefaultHandler) {
        if (alwaysProcessMessageWithDefaultHandler === void 0) { alwaysProcessMessageWithDefaultHandler = false; }
        this.namespace = namespace;
        this.alwaysProcessMessageWithDefaultHandler = alwaysProcessMessageWithDefaultHandler;
        this.handlers = new Map();
    }
    default_1.prototype.addHandler = function (eventName, handler) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, handler);
        }
        return this;
    };
    default_1.prototype.hasHandler = function (eventName) {
        if (!this.handlers.has(eventName)) {
            return true;
        }
        return false;
    };
    default_1.prototype.handleMessage = function (payload) {
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
    };
    default_1.prototype.removeHandler = function (eventName) {
        if (this.handlers.has(eventName)) {
            this.handlers.delete(eventName);
        }
        return this;
    };
    return default_1;
}());

var default_1$5 = /** @class */ (function () {
    function default_1() {
    }
    default_1.install = function (Vue, url, opts) {
        var _this = this;
        if (opts === void 0) { opts = {}; }
        if (!url) {
            throw new Error('[vue-native-socket] cannot locate connection');
        }
        opts.$setInstance = function (wsInstance) {
            Vue.prototype.$socket = wsInstance;
        };
        if (opts.connectManually) {
            Vue.prototype.$connect = function (connectionUrl, connectionOpts) {
                if (connectionUrl === void 0) { connectionUrl = url; }
                if (connectionOpts === void 0) { connectionOpts = opts; }
                _this.observer = new default_1$3(connectionUrl, connectionOpts);
                Vue.prototype.$socket = _this.observer.WebSocket;
            };
            Vue.prototype.$disconnect = function () {
                if (_this.observer && _this.observer.reconnection) {
                    _this.observer.reconnection = false;
                }
                if (Vue.prototype.$socket) {
                    Vue.prototype.$socket.close();
                    delete Vue.prototype.$socket;
                }
            };
        }
        else {
            this.observer = new default_1$3(url, opts);
            Vue.prototype.$socket = this.observer.WebSocket;
        }
        var hasProxy = typeof Proxy !== 'undefined' && typeof Proxy === 'function' && /native code/.test(Proxy.toString());
        Vue.mixin({
            created: function () {
                var _this = this;
                var vm = this;
                var sockets = this.$options['sockets'];
                if (sockets && sockets.hasOwnProperty("scoped") && sockets.scoped instanceof default_1$4) ;
                if (hasProxy) {
                    this.$options.sockets = new Proxy({}, {
                        set: function (target, key, value) {
                            Emitter$1.addListener(key, value, vm);
                            target[key] = value;
                            return true;
                        },
                        deleteProperty: function (target, key) {
                            Emitter$1.removeListener(key, vm.$options.sockets[key], vm);
                            delete target[key];
                            return true;
                        }
                    });
                    if (sockets) {
                        Object.keys(sockets).forEach(function (key) {
                            _this.$options.sockets[key] = sockets[key];
                        });
                    }
                }
                else {
                    Object.seal(this.$options.sockets);
                    // if !hasProxy need addListener
                    if (sockets) {
                        Object.keys(sockets).forEach(function (key) {
                            Emitter$1.addListener(key, sockets[key], vm);
                        });
                    }
                }
            },
            beforeDestroy: function () {
                var _this = this;
                if (hasProxy) {
                    var sockets = this.$options['sockets'];
                    if (sockets) {
                        Object.keys(sockets).forEach(function (key) {
                            delete _this.$options.sockets[key];
                        });
                    }
                }
            }
        });
    };
    default_1.checkAddListener = function (target, eventName, eventHandler, vm) {
    };
    return default_1;
}());

module.exports = default_1$5;
