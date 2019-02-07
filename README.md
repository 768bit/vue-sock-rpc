# vue-sock-rpc
Hard fork of [nathantsoi/vue-native-websocket](https://github.com/nathantsoi) that supports scoped/namespaced message capture. The aim here was to extend the functionality to support 
rpc calls over Socket.IO. The back end server needs to support the below message format but it is possible to make HTTP calls or RPC style calls
using this vue module. This module was not written to support Vuex like [nathantsoi/vue-native-websocket](https://github.com/nathantsoi) but could be extended to support it easily.

##Features
- Written in and Supports Typescript
- Uses bluebird Promises library
- Supports Sessions
- Pub/Sub Support

##Requirements
- Needs a supporting back end server. We used Go.

##Install
``` bash
yarn add @768bit/vue-sock-rpc

# or

npm install @768bit/vue-sock-rpc --save
```

##Vue API

###Configuration
``` js
import VueSockRPC from '@768bit/vue-sock-rpc'

const webSocketURL = "http://192.168.11.3:3000/_ws"; 

const socket_options = {
  format: 'json', //this is set for backwards compatability with nathantsoi/vue-native-websocket
  queueEnabled: false, //set to true to queue requests when the connection isn't available.
  startSession: false //
};

Vue.use(VueSockRPC, webSocketURL, socket_options);
```
###Additional Options
``` js
//Web Socket also supports the following options (these haven't been fully tested and are disabled by default)

const socket_options = {
  ...
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000)
};
```

###Using the API from a Vue component
```js
<script>

export default {
  name: "MyComponent",
  mounted() {
    
    //CALL AN RPC FUNCTION AND RESOLVE/REJECT THE RETURNED PROMISE WHEN A RESPONSE IS RECEIVED
    
    this.$socket.callRPC("nameOfRPCCommand", { ...payload object... }, { ...optional options payload... })
      .then((response) => {
        //process the response...
      });
    
    //CALL AN RPC FUNCTION AND SUPPLY A "STATUS" CALLBACK. THE SERVER CAN SEND BACK STATUS/PROGRESS 
    // PACKETS. WHEN THE FINAL MESSAGE/FAILURE IS RECEIVED THE PROMISE WILL BE FINALISED
    
    this.$socket.callRPC("nameOfRPCCommand", { ...payload object... }, { 
      StatusCallback: function (originalRequestMessage, statusPayload) {
        //process the status message
      }
    }).then((response) => {
      //process the response...
    });
    
  }
}

</script>

```

###Messaging Protocol
In order to support RPC calls and pub/sub functionality above the client builds messages that conform to the following format. 
####Message types
These message types are used in both requests and responses. 
```typescript
enum WebSocketMessageType {
  ServerHelloMessage = 0x00, //Message from server that will "ready" the connection for use
  RPCSessionStartMessage = 0x01, //Start of session
  RPCSessionEndMessage = 0x04, //End of session
  RPCMessage = 0x20, //An RPC Message
  RPCStatusMessage = 0x22, //An RPC Status message
  SubscribeMessage = 0x30, // A subscribe message
  PublishMessage = 0x31, //a publish message (usually from back end to front end only...
  UnSubscribeMessage = 0x32, //An unsubscribe message
  HTTPMessage = 0x40, //An http request
  ByteSessionStartMessage = 0xB0, //Begin a byte session
  ByteSessionEndMessage = 0xB4, //End a byte session
  //// we use byte sessions to allow for bytestreams to be processed - this web socket client doesnt support byte
  //// based messaeg streams at this time
  RPCSessionStartErrorMessage = 0xE0, // a special message type fro session start and end errors..
  RPCSessionEndErrorMessage = 0xE1,
  BasicMessage = 0xFF //a basic message - we only need an id and payload for this...
}
```
####Request Message Format
```typescript
declare type WebSocketRequestBody = {
  messageType: WebSocketMessageType //Message type
  cmd?: string  //the RPC command to run
  method?: string //the HTTP method to use
  path?: string  //the request path for HTTP requests
  moduleURI?: string //we use this for misroservices routing
  id: string  //the unique ID for the request
  seshKey?: string //a session key for the request - used by server to identify user
  topic?:   string // the topic being subscribed to or unsubscribed from
  headers?: any //Headers to be used for HTTP requests
  payload?: any //payload for RPC or HTTP POST/PUT requests
  options?: any //options object for RPC requests - we use this to specify sort fields or which 
                // page of results we want to return
}
```
####Message Response Status Codes
```typescript
enum WebSocketMessageStatus {
  RPCStatusOK = 0x00C8, //200
  RPCStatusUnauthorised = 0x0191, //401
  RPCStatusError = 0x01F4, //500
  RPCStatusLocalError = 0x0266, //550
  RPCStatusRequestCancelled = 0x029E  //670
}
```
####Response Message Format
```typescript
declare type WebSocketResponseBody = {
  messageType: WebSocketMessageType //Message type
  cmd?: string //The RPC command that was run
  method?: string //The HTTP Method used
  path?: string //The HTTP request path
  moduleURI?: string //As per the request object
  id: string //the unique id for the request
  seshKey?: string //the session key used for the request
  topic?:   string // the topic being subscribed to or unsubscribed from
  headers?: Map<string, string> //the http resonse headers
  payload: any //the response payload for all requests
  options?: Map<string, any> //the options object used for RPC requests
  statusCode: WebSocketMessageStatus //the status code for the request/response
  errors?: Error[] | string[] //any errors that occurred during the request
}
```
####HTTP Requests
The backend we built this client to talk to includes the option of running HTTP requests. This client doesn't currently support that but will do in the next release and will conform to the protocols outlined above.
