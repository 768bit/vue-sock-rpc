import Observer from './Observer';
import Emitter from './Emitter';
import ScopedHandler from "./ScopedHandler";

export default class {

  private static observer: Observer;

  static install(Vue: any, url: string, opts: any = {}) {

    if (!url) {
      throw new Error('[vue-native-socket] cannot locate connection')
    }

    opts.$setInstance = (wsInstance: any) => {
      Vue.prototype.$socket = wsInstance
    };

    if (opts.connectManually) {
      Vue.prototype.$connect = (connectionUrl = url, connectionOpts = opts) => {
        this.observer = new Observer(connectionUrl, connectionOpts);
        Vue.prototype.$socket = this.observer.WebSocket
      };

      Vue.prototype.$disconnect = () => {
        if (this.observer && this.observer.reconnection) {
          this.observer.reconnection = false;
        }
        if (Vue.prototype.$socket) {
          Vue.prototype.$socket.close();
          delete Vue.prototype.$socket;
        }
      }
    } else {
      this.observer = new Observer(url, opts);
      Vue.prototype.$socket = this.observer.WebSocket;
    }
    const hasProxy = typeof Proxy !== 'undefined' && typeof Proxy === 'function' && /native code/.test(Proxy.toString());

    Vue.mixin({
      created() {
        let vm = this;
        let sockets = this.$options['sockets'];

        if (sockets && sockets.hasOwnProperty("scoped") && sockets.scoped instanceof ScopedHandler) {

          //if we already have an "onmessaage" handler then we need to remap it so that the scoped handler can be checked first!


        }

        if (hasProxy) {
          this.$options.sockets = new Proxy({}, {
            set(target: any, key, value) {
              Emitter.addListener(key, value, vm);
              target[key] = value;
              return true;
            },
            deleteProperty(target: any, key) {
              Emitter.removeListener(key, vm.$options.sockets[key], vm);
              delete target[key];
              return true;
            }
          });
          if (sockets) {
            Object.keys(sockets).forEach((key) => {
              this.$options.sockets[key] = sockets[key];
            });
          }
        } else {
          Object.seal(this.$options.sockets);

          // if !hasProxy need addListener
          if (sockets) {
            Object.keys(sockets).forEach(key => {
              Emitter.addListener(key, sockets[key], vm);
            });
          }
        }
      },
      beforeDestroy() {
        if (hasProxy) {
          let sockets = this.$options['sockets'];

          if (sockets) {
            Object.keys(sockets).forEach((key) => {
              delete this.$options.sockets[key];
            });
          }
        }
      }
    });

  }

  private static checkAddListener(target: any, eventName: string, eventHandler: any, vm: any) {


  }

}
