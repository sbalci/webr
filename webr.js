var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// webR/compat.ts
var IN_NODE = typeof process !== "undefined" && process.release && process.release.name === "node" && typeof process.browser === "undefined";
var loadScript;
if (globalThis.document) {
  loadScript = (url) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
} else if (globalThis.importScripts) {
  loadScript = async (url) => {
    try {
      globalThis.importScripts(url);
    } catch (e) {
      if (e instanceof TypeError) {
        await Promise.resolve().then(() => __toESM(__require(url)));
      } else {
        throw e;
      }
    }
  };
} else if (IN_NODE) {
  loadScript = async (url) => {
    const nodePathMod = (await Promise.resolve().then(() => __toESM(__require("path")))).default;
    await Promise.resolve().then(() => __toESM(__require(nodePathMod.resolve(url))));
  };
} else {
  throw new Error("Cannot determine runtime environment");
}

// webR/utils.ts
function promiseHandles() {
  const out = {
    resolve: (_value) => {
    },
    reject: (_reason) => {
    },
    promise: null
  };
  const promise = new Promise((resolve, reject) => {
    out.resolve = resolve;
    out.reject = reject;
  });
  out.promise = promise;
  return out;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function replaceInObject(obj, test, replacer, ...replacerArgs) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (test(obj)) {
    return replacer(obj, ...replacerArgs);
  }
  if (Array.isArray(obj) || ArrayBuffer.isView(obj)) {
    return obj.map(
      (v) => replaceInObject(v, test, replacer, ...replacerArgs)
    );
  }
  return Object.fromEntries(
    Object.entries(obj).map(([k, v], i) => [k, replaceInObject(v, test, replacer, ...replacerArgs)])
  );
}
function newCrossOriginWorker(url, cb) {
  const req = new XMLHttpRequest();
  req.open("get", url, true);
  req.onload = () => {
    const worker = new Worker(URL.createObjectURL(new Blob([req.responseText])));
    cb(worker);
  };
  req.send();
}
function isCrossOrigin(urlString) {
  if (IN_NODE)
    return false;
  const url1 = new URL(location.href);
  const url2 = new URL(urlString, location.origin);
  if (url1.host === url2.host && url1.port === url2.port && url1.protocol === url2.protocol) {
    return false;
  }
  return true;
}

// webR/chan/task-common.ts
var SZ_BUF_DOESNT_FIT = 0;
var SZ_BUF_FITS_IDX = 1;
var SZ_BUF_SIZE_IDX = 0;
var transferCache = /* @__PURE__ */ new WeakMap();
function transfer(obj, transfers) {
  transferCache.set(obj, transfers);
  return obj;
}
var UUID_LENGTH = 63;
function generateUUID() {
  const result = Array.from({ length: 4 }, randomSegment).join("-");
  if (result.length !== UUID_LENGTH) {
    throw new Error("comlink internal error: UUID has the wrong length");
  }
  return result;
}
function randomSegment() {
  let result = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
  const pad = 15 - result.length;
  if (pad > 0) {
    result = Array.from({ length: pad }, () => 0).join("") + result;
  }
  return result;
}

// webR/chan/message.ts
function newRequest(msg, transferables) {
  return newRequestResponseMessage(
    {
      type: "request",
      data: {
        uuid: generateUUID(),
        msg
      }
    },
    transferables
  );
}
function newResponse(uuid, resp, transferables) {
  return newRequestResponseMessage(
    {
      type: "response",
      data: {
        uuid,
        resp
      }
    },
    transferables
  );
}
function newRequestResponseMessage(msg, transferables) {
  if (transferables) {
    transfer(msg, transferables);
  }
  return msg;
}
function newSyncRequest(msg, data) {
  return {
    type: "sync-request",
    data: { msg, reqData: data }
  };
}
var encoder = new TextEncoder();
var decoder = new TextDecoder("utf-8");
function encodeData(data) {
  return encoder.encode(JSON.stringify(data));
}
function decodeData(data) {
  return JSON.parse(decoder.decode(data));
}

// webR/chan/task-main.ts
var encoder2 = new TextEncoder();
async function syncResponse(endpoint, data, response) {
  try {
    let { taskId, sizeBuffer, dataBuffer, signalBuffer } = data;
    const bytes = encodeData(response);
    const fits = bytes.length <= dataBuffer.length;
    Atomics.store(sizeBuffer, SZ_BUF_SIZE_IDX, bytes.length);
    Atomics.store(sizeBuffer, SZ_BUF_FITS_IDX, +fits);
    if (!fits) {
      const [uuid, dataPromise] = requestResponseMessage(endpoint);
      dataBuffer.set(encoder2.encode(uuid));
      await signalRequester(signalBuffer, taskId);
      dataBuffer = (await dataPromise).dataBuffer;
    }
    dataBuffer.set(bytes);
    Atomics.store(sizeBuffer, SZ_BUF_FITS_IDX, 1);
    await signalRequester(signalBuffer, taskId);
  } catch (e) {
    console.warn(e);
  }
}
function requestResponseMessage(ep) {
  const id = generateUUID();
  return [
    id,
    new Promise((resolve) => {
      if (IN_NODE) {
        ep.once("message", (message) => {
          if (!message.id || message.id !== id) {
            return;
          }
          resolve(message);
        });
      } else {
        ep.addEventListener("message", function l(ev) {
          if (!ev.data || !ev.data.id || ev.data.id !== id) {
            return;
          }
          ep.removeEventListener("message", l);
          resolve(ev.data);
        });
      }
      if (ep.start) {
        ep.start();
      }
    })
  ];
}
async function signalRequester(signalBuffer, taskId) {
  const index = (taskId >> 1) % 32;
  let sleepTime = 1;
  while (Atomics.compareExchange(signalBuffer, index + 1, 0, taskId) !== 0) {
    await sleep(sleepTime);
    if (sleepTime < 32) {
      sleepTime *= 2;
    }
  }
  Atomics.or(signalBuffer, 0, 1 << index);
  Atomics.notify(signalBuffer, 0);
}

// webR/chan/queue.ts
var _promises, _resolvers, _add, add_fn;
var AsyncQueue = class {
  constructor() {
    __privateAdd(this, _add);
    __privateAdd(this, _promises, void 0);
    __privateAdd(this, _resolvers, void 0);
    __privateSet(this, _resolvers, []);
    __privateSet(this, _promises, []);
  }
  put(t) {
    if (!__privateGet(this, _resolvers).length) {
      __privateMethod(this, _add, add_fn).call(this);
    }
    const resolve = __privateGet(this, _resolvers).shift();
    resolve(t);
  }
  async get() {
    if (!__privateGet(this, _promises).length) {
      __privateMethod(this, _add, add_fn).call(this);
    }
    const promise = __privateGet(this, _promises).shift();
    return promise;
  }
  isEmpty() {
    return !__privateGet(this, _promises).length;
  }
  isBlocked() {
    return !!__privateGet(this, _resolvers).length;
  }
  get length() {
    return __privateGet(this, _promises).length - __privateGet(this, _resolvers).length;
  }
};
_promises = new WeakMap();
_resolvers = new WeakMap();
_add = new WeakSet();
add_fn = function() {
  __privateGet(this, _promises).push(
    new Promise((resolve) => {
      __privateGet(this, _resolvers).push(resolve);
    })
  );
};

// webR/payload.ts
function webRPayloadError(payload) {
  const e = new Error(payload.obj.message);
  e.name = payload.obj.name;
  e.stack = payload.obj.stack;
  return e;
}
function isWebRPayload(value) {
  return value && typeof value === "object" && "payloadType" in value && "obj" in value;
}
function isWebRPayloadPtr(value) {
  return isWebRPayload(value) && value.payloadType === "ptr";
}

// webR/chan/channel.ts
var _parked;
var ChannelMain = class {
  constructor() {
    this.inputQueue = new AsyncQueue();
    this.outputQueue = new AsyncQueue();
    __privateAdd(this, _parked, /* @__PURE__ */ new Map());
  }
  async read() {
    return await this.outputQueue.get();
  }
  async flush() {
    const msg = [];
    while (!this.outputQueue.isEmpty()) {
      msg.push(await this.read());
    }
    return msg;
  }
  write(msg) {
    this.inputQueue.put(msg);
  }
  async request(msg, transferables) {
    const req = newRequest(msg, transferables);
    const { resolve, reject, promise } = promiseHandles();
    __privateGet(this, _parked).set(req.data.uuid, { resolve, reject });
    this.write(req);
    return promise;
  }
  resolveResponse(msg) {
    const uuid = msg.data.uuid;
    const handles = __privateGet(this, _parked).get(uuid);
    if (handles) {
      const payload = msg.data.resp;
      __privateGet(this, _parked).delete(uuid);
      if (payload.payloadType === "err") {
        handles.reject(webRPayloadError(payload));
      } else {
        handles.resolve(payload);
      }
    } else {
      console.warn("Can't find request.");
    }
  }
};
_parked = new WeakMap();

// webR/chan/task-worker.ts
var decoder2 = new TextDecoder("utf-8");
var _scheduled, _resolved, _result, _exception, _syncGen;
var SyncTask = class {
  constructor(endpoint, msg, transfers = []) {
    __privateAdd(this, _scheduled, false);
    __privateAdd(this, _resolved, void 0);
    __privateAdd(this, _result, void 0);
    __privateAdd(this, _exception, void 0);
    __privateAdd(this, _syncGen, void 0);
    this.syncifier = new _Syncifier();
    this.endpoint = endpoint;
    this.msg = msg;
    this.transfers = transfers;
    __privateSet(this, _resolved, false);
  }
  scheduleSync() {
    if (__privateGet(this, _scheduled)) {
      return;
    }
    __privateSet(this, _scheduled, true);
    this.syncifier.scheduleTask(this);
    __privateSet(this, _syncGen, this.doSync());
    __privateGet(this, _syncGen).next();
    return this;
  }
  poll() {
    if (!__privateGet(this, _scheduled)) {
      throw new Error("Task not synchronously scheduled");
    }
    const { done, value } = __privateGet(this, _syncGen).next();
    if (!done) {
      return false;
    }
    __privateSet(this, _resolved, true);
    __privateSet(this, _result, value);
    return true;
  }
  *doSync() {
    const { endpoint, msg, transfers } = this;
    const sizeBuffer = new Int32Array(new SharedArrayBuffer(8));
    const signalBuffer = this.signalBuffer;
    const taskId = this.taskId;
    let dataBuffer = acquireDataBuffer(UUID_LENGTH);
    const syncMsg = newSyncRequest(msg, {
      sizeBuffer,
      dataBuffer,
      signalBuffer,
      taskId
    });
    endpoint.postMessage(syncMsg, transfers);
    yield;
    if (Atomics.load(sizeBuffer, SZ_BUF_FITS_IDX) === SZ_BUF_DOESNT_FIT) {
      const id = decoder2.decode(dataBuffer.slice(0, UUID_LENGTH));
      releaseDataBuffer(dataBuffer);
      const size2 = Atomics.load(sizeBuffer, SZ_BUF_SIZE_IDX);
      dataBuffer = acquireDataBuffer(size2);
      endpoint.postMessage({ id, dataBuffer });
      yield;
    }
    const size = Atomics.load(sizeBuffer, SZ_BUF_SIZE_IDX);
    return decodeData(dataBuffer.slice(0, size));
  }
  get result() {
    if (__privateGet(this, _exception)) {
      throw __privateGet(this, _exception);
    }
    if (__privateGet(this, _resolved)) {
      return __privateGet(this, _result);
    }
    throw new Error("Not ready.");
  }
  syncify() {
    this.scheduleSync();
    this.syncifier.syncifyTask(this);
    return this.result;
  }
};
_scheduled = new WeakMap();
_resolved = new WeakMap();
_result = new WeakMap();
_exception = new WeakMap();
_syncGen = new WeakMap();
var _Syncifier = class {
  constructor() {
    this.nextTaskId = new Int32Array([1]);
    this.signalBuffer = new Int32Array(new SharedArrayBuffer(32 * 4 + 4));
    this.tasks = /* @__PURE__ */ new Map();
  }
  scheduleTask(task) {
    task.taskId = this.nextTaskId[0];
    this.nextTaskId[0] += 2;
    task.signalBuffer = this.signalBuffer;
    this.tasks.set(task.taskId, task);
  }
  waitOnSignalBuffer() {
    const timeout = 50;
    for (; ; ) {
      const status = Atomics.wait(this.signalBuffer, 0, 0, timeout);
      switch (status) {
        case "ok":
        case "not-equal":
          return;
        case "timed-out":
          if (interruptBuffer[0] !== 0) {
            handleInterrupt();
          }
          break;
        default:
          throw new Error("Unreachable");
      }
    }
  }
  *tasksIdsToWakeup() {
    const flag = Atomics.load(this.signalBuffer, 0);
    for (let i = 0; i < 32; i++) {
      const bit = 1 << i;
      if (flag & bit) {
        Atomics.and(this.signalBuffer, 0, ~bit);
        const wokenTask = Atomics.exchange(this.signalBuffer, i + 1, 0);
        yield wokenTask;
      }
    }
  }
  pollTasks(task) {
    let result = false;
    for (const wokenTaskId of this.tasksIdsToWakeup()) {
      const wokenTask = this.tasks.get(wokenTaskId);
      if (!wokenTask) {
        throw new Error(`Assertion error: unknown taskId ${wokenTaskId}.`);
      }
      if (wokenTask.poll()) {
        this.tasks.delete(wokenTaskId);
        if (wokenTask === task) {
          result = true;
        }
      }
    }
    return result;
  }
  syncifyTask(task) {
    for (; ; ) {
      this.waitOnSignalBuffer();
      if (this.pollTasks(task)) {
        return;
      }
    }
  }
};
var dataBuffers = [];
function acquireDataBuffer(size) {
  const powerof2 = Math.ceil(Math.log2(size));
  if (!dataBuffers[powerof2]) {
    dataBuffers[powerof2] = [];
  }
  const result = dataBuffers[powerof2].pop();
  if (result) {
    result.fill(0);
    return result;
  }
  return new Uint8Array(new SharedArrayBuffer(2 ** powerof2));
}
function releaseDataBuffer(buffer) {
  const powerof2 = Math.ceil(Math.log2(buffer.byteLength));
  dataBuffers[powerof2].push(buffer);
}
var interruptBuffer = new Int32Array(new ArrayBuffer(4));
var handleInterrupt = () => {
  interruptBuffer[0] = 0;
  throw new Error("Interrupted!");
};
function setInterruptHandler(handler) {
  handleInterrupt = handler;
}
function setInterruptBuffer(buffer) {
  interruptBuffer = new Int32Array(buffer);
}

// webR/emscripten.ts
var Module = {};
function dictEmFree(dict) {
  Object.keys(dict).forEach((key) => Module._free(dict[key]));
}

// webR/chan/channel-shared.ts
if (IN_NODE) {
  globalThis.Worker = __require("worker_threads").Worker;
}
var _interruptBuffer, _handleEventsFromWorker, handleEventsFromWorker_fn, _onMessageFromWorker;
var SharedBufferChannelMain = class extends ChannelMain {
  constructor(config) {
    super();
    __privateAdd(this, _handleEventsFromWorker);
    __privateAdd(this, _interruptBuffer, void 0);
    this.close = () => {
    };
    __privateAdd(this, _onMessageFromWorker, async (worker, message) => {
      if (!message || !message.type) {
        return;
      }
      switch (message.type) {
        case "resolve":
          __privateSet(this, _interruptBuffer, new Int32Array(message.data));
          this.resolve();
          return;
        case "response":
          this.resolveResponse(message);
          return;
        default:
          this.outputQueue.put(message);
          return;
        case "sync-request": {
          const msg = message;
          const payload = msg.data.msg;
          const reqData = msg.data.reqData;
          switch (payload.type) {
            case "read": {
              const response = await this.inputQueue.get();
              await syncResponse(worker, reqData, response);
              break;
            }
            default:
              throw new TypeError(`Unsupported request type '${payload.type}'.`);
          }
          return;
        }
        case "request":
          throw new TypeError(
            "Can't send messages of type 'request' from a worker. Please Use 'sync-request' instead."
          );
      }
    });
    const initWorker = (worker) => {
      __privateMethod(this, _handleEventsFromWorker, handleEventsFromWorker_fn).call(this, worker);
      this.close = () => worker.terminate();
      const msg = {
        type: "init",
        data: { config, channelType: ChannelType.SharedArrayBuffer }
      };
      worker.postMessage(msg);
    };
    if (isCrossOrigin(config.WEBR_URL)) {
      newCrossOriginWorker(
        `${config.WEBR_URL}webr-worker.js`,
        (worker) => initWorker(worker)
      );
    } else {
      const worker = new Worker(`${config.WEBR_URL}webr-worker.js`);
      initWorker(worker);
    }
    ({ resolve: this.resolve, promise: this.initialised } = promiseHandles());
  }
  interrupt() {
    if (!__privateGet(this, _interruptBuffer)) {
      throw new Error("Failed attempt to interrupt before initialising interruptBuffer");
    }
    __privateGet(this, _interruptBuffer)[0] = 1;
  }
};
_interruptBuffer = new WeakMap();
_handleEventsFromWorker = new WeakSet();
handleEventsFromWorker_fn = function(worker) {
  if (IN_NODE) {
    worker.on("message", (message) => {
      __privateGet(this, _onMessageFromWorker).call(this, worker, message);
    });
  } else {
    worker.onmessage = (ev) => __privateGet(this, _onMessageFromWorker).call(this, worker, ev.data);
  }
};
_onMessageFromWorker = new WeakMap();
var _ep, _dispatch, _interruptBuffer2, _interrupt;
var SharedBufferChannelWorker = class {
  constructor() {
    __privateAdd(this, _ep, void 0);
    __privateAdd(this, _dispatch, () => 0);
    __privateAdd(this, _interruptBuffer2, new Int32Array(new SharedArrayBuffer(4)));
    __privateAdd(this, _interrupt, () => {
    });
    __privateSet(this, _ep, IN_NODE ? __require("worker_threads").parentPort : globalThis);
    setInterruptBuffer(__privateGet(this, _interruptBuffer2).buffer);
    setInterruptHandler(() => this.handleInterrupt());
  }
  resolve() {
    this.write({ type: "resolve", data: __privateGet(this, _interruptBuffer2).buffer });
  }
  write(msg, transfer2) {
    __privateGet(this, _ep).postMessage(msg, transfer2);
  }
  read() {
    const msg = { type: "read" };
    const task = new SyncTask(__privateGet(this, _ep), msg);
    return task.syncify();
  }
  inputOrDispatch() {
    for (; ; ) {
      const msg = this.read();
      if (msg.type === "stdin") {
        return Module.allocateUTF8(msg.data);
      }
      __privateGet(this, _dispatch).call(this, msg);
    }
  }
  run(args) {
    Module.callMain(args);
  }
  setInterrupt(interrupt) {
    __privateSet(this, _interrupt, interrupt);
  }
  handleInterrupt() {
    if (__privateGet(this, _interruptBuffer2)[0] !== 0) {
      __privateGet(this, _interruptBuffer2)[0] = 0;
      __privateGet(this, _interrupt).call(this);
    }
  }
  setDispatchHandler(dispatch) {
    __privateSet(this, _dispatch, dispatch);
  }
};
_ep = new WeakMap();
_dispatch = new WeakMap();
_interruptBuffer2 = new WeakMap();
_interrupt = new WeakMap();

// webR/chan/channel-service.ts
if (IN_NODE) {
  globalThis.Worker = __require("worker_threads").Worker;
}
var _syncMessageCache, _registration, _interrupted, _registerServiceWorker, registerServiceWorker_fn, _onMessageFromServiceWorker, onMessageFromServiceWorker_fn, _handleEventsFromWorker2, handleEventsFromWorker_fn2, _onMessageFromWorker2;
var ServiceWorkerChannelMain = class extends ChannelMain {
  constructor(config) {
    super();
    __privateAdd(this, _registerServiceWorker);
    __privateAdd(this, _onMessageFromServiceWorker);
    __privateAdd(this, _handleEventsFromWorker2);
    this.close = () => {
    };
    __privateAdd(this, _syncMessageCache, /* @__PURE__ */ new Map());
    __privateAdd(this, _registration, void 0);
    __privateAdd(this, _interrupted, false);
    __privateAdd(this, _onMessageFromWorker2, async (worker, message) => {
      if (!message || !message.type) {
        return;
      }
      switch (message.type) {
        case "resolve":
          this.resolve();
          return;
        case "response":
          this.resolveResponse(message);
          return;
        default:
          this.outputQueue.put(message);
          return;
        case "sync-request": {
          const request = message.data;
          __privateGet(this, _syncMessageCache).set(request.data.uuid, request.data.msg);
          return;
        }
        case "request":
          throw new TypeError(
            "Can't send messages of type 'request' from a worker.Use service worker fetch request instead."
          );
      }
    });
    const initWorker = (worker) => {
      __privateMethod(this, _handleEventsFromWorker2, handleEventsFromWorker_fn2).call(this, worker);
      this.close = () => worker.terminate();
      __privateMethod(this, _registerServiceWorker, registerServiceWorker_fn).call(this, `${config.SW_URL}webr-serviceworker.js`).then((clientId) => {
        const msg = {
          type: "init",
          data: {
            config,
            channelType: ChannelType.ServiceWorker,
            clientId,
            location: window.location.href
          }
        };
        worker.postMessage(msg);
      });
    };
    if (isCrossOrigin(config.SW_URL)) {
      newCrossOriginWorker(
        `${config.SW_URL}webr-worker.js`,
        (worker) => initWorker(worker)
      );
    } else {
      const worker = new Worker(`${config.SW_URL}webr-worker.js`);
      initWorker(worker);
    }
    ({ resolve: this.resolve, promise: this.initialised } = promiseHandles());
  }
  activeRegistration() {
    var _a;
    if (!((_a = __privateGet(this, _registration)) == null ? void 0 : _a.active)) {
      throw new Error("Attempted to obtain a non-existent active registration.");
    }
    return __privateGet(this, _registration).active;
  }
  interrupt() {
    __privateSet(this, _interrupted, true);
  }
};
_syncMessageCache = new WeakMap();
_registration = new WeakMap();
_interrupted = new WeakMap();
_registerServiceWorker = new WeakSet();
registerServiceWorker_fn = async function(url) {
  __privateSet(this, _registration, await navigator.serviceWorker.register(url));
  await navigator.serviceWorker.ready;
  window.addEventListener("beforeunload", () => {
    var _a;
    (_a = __privateGet(this, _registration)) == null ? void 0 : _a.unregister();
  });
  const clientId = await new Promise((resolve) => {
    navigator.serviceWorker.addEventListener(
      "message",
      function listener(event) {
        if (event.data.type === "registration-successful") {
          navigator.serviceWorker.removeEventListener("message", listener);
          resolve(event.data.clientId);
        }
      }
    );
    this.activeRegistration().postMessage({ type: "register-client-main" });
  });
  navigator.serviceWorker.addEventListener("message", (event) => {
    __privateMethod(this, _onMessageFromServiceWorker, onMessageFromServiceWorker_fn).call(this, event);
  });
  return clientId;
};
_onMessageFromServiceWorker = new WeakSet();
onMessageFromServiceWorker_fn = async function(event) {
  if (event.data.type === "request") {
    const uuid = event.data.data;
    const message = __privateGet(this, _syncMessageCache).get(uuid);
    if (!message) {
      throw new Error("Request not found during service worker XHR request");
    }
    __privateGet(this, _syncMessageCache).delete(uuid);
    switch (message.type) {
      case "read": {
        const response = await this.inputQueue.get();
        this.activeRegistration().postMessage({
          type: "wasm-webr-fetch-response",
          uuid,
          response: newResponse(uuid, response)
        });
        break;
      }
      case "interrupt": {
        const response = __privateGet(this, _interrupted);
        this.activeRegistration().postMessage({
          type: "wasm-webr-fetch-response",
          uuid,
          response: newResponse(uuid, response)
        });
        __privateSet(this, _interrupted, false);
        break;
      }
      default:
        throw new TypeError(`Unsupported request type '${message.type}'.`);
    }
    return;
  }
};
_handleEventsFromWorker2 = new WeakSet();
handleEventsFromWorker_fn2 = function(worker) {
  if (IN_NODE) {
    worker.on("message", (message) => {
      __privateGet(this, _onMessageFromWorker2).call(this, worker, message);
    });
  } else {
    worker.onmessage = (ev) => __privateGet(this, _onMessageFromWorker2).call(this, worker, ev.data);
  }
};
_onMessageFromWorker2 = new WeakMap();
var _ep2, _mainThreadId, _location, _dispatch2, _interrupt2;
var ServiceWorkerChannelWorker = class {
  constructor(data) {
    __privateAdd(this, _ep2, void 0);
    __privateAdd(this, _mainThreadId, void 0);
    __privateAdd(this, _location, void 0);
    __privateAdd(this, _dispatch2, () => 0);
    __privateAdd(this, _interrupt2, () => {
    });
    this.onMessageFromMainThread = () => {
    };
    if (!data.clientId || !data.location) {
      throw Error("Can't start service worker channel");
    }
    __privateSet(this, _mainThreadId, data.clientId);
    __privateSet(this, _location, data.location);
    __privateSet(this, _ep2, IN_NODE ? __require("worker_threads").parentPort : globalThis);
  }
  resolve() {
    this.write({ type: "resolve" });
  }
  write(msg, transfer2) {
    __privateGet(this, _ep2).postMessage(msg, transfer2);
  }
  syncRequest(message) {
    const request = newRequest(message);
    this.write({ type: "sync-request", data: request });
    let retryCount = 0;
    for (; ; ) {
      try {
        const url = new URL("__wasm__/webr-fetch-request/", __privateGet(this, _location));
        const xhr = new XMLHttpRequest();
        xhr.timeout = 6e4;
        xhr.responseType = "arraybuffer";
        xhr.open("POST", url, false);
        const fetchReqBody = {
          clientId: __privateGet(this, _mainThreadId),
          uuid: request.data.uuid
        };
        xhr.send(encodeData(fetchReqBody));
        return decodeData(new Uint8Array(xhr.response));
      } catch (e) {
        if (e instanceof DOMException && retryCount++ < 1e3) {
          console.log("Service worker request failed - resending request");
        } else {
          throw e;
        }
      }
    }
  }
  read() {
    const response = this.syncRequest({ type: "read" });
    return response.data.resp;
  }
  inputOrDispatch() {
    for (; ; ) {
      const msg = this.read();
      if (msg.type === "stdin") {
        return Module.allocateUTF8(msg.data);
      }
      __privateGet(this, _dispatch2).call(this, msg);
    }
  }
  run(args) {
    Module.callMain(args);
  }
  setInterrupt(interrupt) {
    __privateSet(this, _interrupt2, interrupt);
  }
  handleInterrupt() {
    const response = this.syncRequest({ type: "interrupt" });
    const interrupted = response.data.resp;
    if (interrupted) {
      __privateGet(this, _interrupt2).call(this);
    }
  }
  setDispatchHandler(dispatch) {
    __privateSet(this, _dispatch2, dispatch);
  }
};
_ep2 = new WeakMap();
_mainThreadId = new WeakMap();
_location = new WeakMap();
_dispatch2 = new WeakMap();
_interrupt2 = new WeakMap();

// webR/chan/channel-common.ts
var ChannelType = {
  Automatic: 0,
  SharedArrayBuffer: 1,
  ServiceWorker: 2
};
function newChannelMain(data) {
  switch (data.channelType) {
    case ChannelType.SharedArrayBuffer:
      return new SharedBufferChannelMain(data);
    case ChannelType.ServiceWorker:
      return new ServiceWorkerChannelMain(data);
    case ChannelType.Automatic:
    default:
      if (IN_NODE || crossOriginIsolated) {
        return new SharedBufferChannelMain(data);
      }
      if ("serviceWorker" in navigator && !isCrossOrigin(data.SW_URL)) {
        return new ServiceWorkerChannelMain(data);
      }
      throw new Error("Can't initialise main thread communication channel");
  }
}

// webR/config.ts
var BASE_URL = "./";
var PKG_BASE_URL = "https://repo.r-wasm.org";

// webR/robj-main.ts
function isRObject(value) {
  return value && (typeof value === "object" || typeof value === "function") && "payloadType" in value && isWebRPayloadPtr(value._payload);
}
function isRFunction(value) {
  var _a;
  return Boolean(isRObject(value) && ((_a = value._payload.obj.methods) == null ? void 0 : _a.includes("exec")));
}

// webR/robj.ts
var RTypeMap = {
  null: 0,
  symbol: 1,
  pairlist: 2,
  closure: 3,
  environment: 4,
  promise: 5,
  call: 6,
  special: 7,
  builtin: 8,
  string: 9,
  logical: 10,
  integer: 13,
  double: 14,
  complex: 15,
  character: 16,
  dots: 17,
  any: 18,
  list: 19,
  expression: 20,
  bytecode: 21,
  pointer: 22,
  weakref: 23,
  raw: 24,
  s4: 25,
  new: 30,
  free: 31,
  function: 99
};
function isWebRDataJs(value) {
  return value && typeof value === "object" && Object.keys(RTypeMap).includes(value.type);
}
function isComplex(value) {
  return value && typeof value === "object" && "re" in value && "im" in value;
}

// webR/utils-r.ts
function protect(x) {
  Module._Rf_protect(handlePtr(x));
  return x;
}
function protectInc(x, prot) {
  Module._Rf_protect(handlePtr(x));
  ++prot.n;
  return x;
}
function protectWithIndex(x) {
  const pLoc = Module._malloc(4);
  Module._R_ProtectWithIndex(handlePtr(x), pLoc);
  const loc = Module.getValue(pLoc, "i32");
  return { loc, ptr: pLoc };
}
function unprotectIndex(index) {
  Module._Rf_unprotect(1);
  Module._free(index.ptr);
}
function reprotect(x, index) {
  Module._R_Reprotect(handlePtr(x), index.loc);
  return x;
}
function unprotect(n) {
  Module._Rf_unprotect(n);
}
function envPoke(env, sym, value) {
  Module._Rf_defineVar(handlePtr(sym), handlePtr(value), handlePtr(env));
}
function parseEvalBare(code, env) {
  const strings = {};
  const prot = { n: 0 };
  try {
    const envObj = new REnvironment(env);
    protectInc(envObj, prot);
    strings.code = Module.allocateUTF8(code);
    const out = Module._R_ParseEvalString(strings.code, envObj.ptr);
    return RObject.wrap(out);
  } finally {
    dictEmFree(strings);
    unprotect(prot.n);
  }
}
function safeEval(call, env) {
  return Module.LDSO.loadedLibsByName["/usr/lib/R/library/webr/libs/webr.so"].module.ffi_safe_eval(
    handlePtr(call),
    handlePtr(env)
  );
}

// webR/robj-worker.ts
function handlePtr(x) {
  if (isRObject2(x)) {
    return x.ptr;
  } else {
    return x;
  }
}
function assertRType(obj, type) {
  if (Module._TYPEOF(obj.ptr) !== RTypeMap[type]) {
    throw new Error(`Unexpected object type "${obj.type()}" when expecting type "${type}"`);
  }
}
function newObjectFromData(obj) {
  if (isWebRDataJs(obj)) {
    return new (getRWorkerClass(RTypeMap[obj.type]))(obj);
  }
  if (obj && typeof obj === "object" && "type" in obj && obj.type === "null") {
    return new RNull();
  }
  if (obj === null) {
    return new RLogical({ type: "logical", names: null, values: [null] });
  }
  if (typeof obj === "boolean") {
    return new RLogical(obj);
  }
  if (typeof obj === "number") {
    return new RDouble(obj);
  }
  if (typeof obj === "string") {
    return new RCharacter(obj);
  }
  if (isComplex(obj)) {
    return new RComplex(obj);
  }
  if (Array.isArray(obj)) {
    return newObjectFromArray(obj);
  }
  throw new Error("Robj construction for this JS object is not yet supported");
}
function newObjectFromArray(arr) {
  const prot = { n: 0 };
  try {
    const call = new RCall([new RSymbol("c"), ...arr]);
    protectInc(call, prot);
    return call.eval();
  } finally {
    unprotect(prot.n);
  }
}
var RObjectBase = class {
  constructor(ptr) {
    this.ptr = ptr;
  }
  type() {
    const typeNumber = Module._TYPEOF(this.ptr);
    const type = Object.keys(RTypeMap).find(
      (typeName) => RTypeMap[typeName] === typeNumber
    );
    return type;
  }
};
var _slice, slice_fn;
var _RObject = class extends RObjectBase {
  constructor(data) {
    if (!(data instanceof RObjectBase)) {
      return newObjectFromData(data);
    }
    super(data.ptr);
    __privateAdd(this, _slice);
  }
  static wrap(ptr) {
    const type = Module._TYPEOF(ptr);
    return new (getRWorkerClass(type))(new RObjectBase(ptr));
  }
  get [Symbol.toStringTag]() {
    return `RObject:${this.type()}`;
  }
  static getPersistentObject(prop) {
    return objs[prop];
  }
  getPropertyValue(prop) {
    return this[prop];
  }
  inspect() {
    parseEvalBare(".Internal(inspect(x))", { x: this });
  }
  isNull() {
    return Module._TYPEOF(this.ptr) === RTypeMap.null;
  }
  isUnbound() {
    return this.ptr === objs.unboundValue.ptr;
  }
  attrs() {
    return RPairlist.wrap(Module._ATTRIB(this.ptr));
  }
  setNames(values) {
    let namesObj;
    if (values === null) {
      namesObj = objs.null;
    } else if (Array.isArray(values) && values.every((v) => typeof v === "string" || v === null)) {
      namesObj = new RCharacter(values);
    } else {
      throw new Error("Argument to setNames must be null or an Array of strings or null");
    }
    Module._Rf_setAttrib(this.ptr, objs.namesSymbol.ptr, namesObj.ptr);
    return this;
  }
  names() {
    const names = RCharacter.wrap(Module._Rf_getAttrib(this.ptr, objs.namesSymbol.ptr));
    if (names.isNull()) {
      return null;
    } else {
      return names.toArray();
    }
  }
  includes(name) {
    const names = this.names();
    return names && names.includes(name);
  }
  toJs(options = { depth: 0 }, depth = 1) {
    throw new Error("This R object cannot be converted to JS");
  }
  subset(prop) {
    return __privateMethod(this, _slice, slice_fn).call(this, prop, objs.bracketSymbol.ptr);
  }
  get(prop) {
    return __privateMethod(this, _slice, slice_fn).call(this, prop, objs.bracket2Symbol.ptr);
  }
  getDollar(prop) {
    return __privateMethod(this, _slice, slice_fn).call(this, prop, objs.dollarSymbol.ptr);
  }
  pluck(...path) {
    const index = protectWithIndex(objs.null);
    try {
      const getter = (obj, prop) => {
        const out = obj.get(prop);
        return reprotect(out, index);
      };
      const result = path.reduce(getter, this);
      return result.isNull() ? void 0 : result;
    } finally {
      unprotectIndex(index);
    }
  }
  set(prop, value) {
    const prot = { n: 0 };
    try {
      const idx = new _RObject(prop);
      protectInc(idx, prot);
      const valueObj = new _RObject(value);
      protectInc(valueObj, prot);
      const assign = new RSymbol("[[<-");
      const call = Module._Rf_lang4(assign.ptr, this.ptr, idx.ptr, valueObj.ptr);
      protectInc(call, prot);
      return _RObject.wrap(safeEval(call, objs.baseEnv));
    } finally {
      unprotect(prot.n);
    }
  }
  static getMethods(obj) {
    const props = /* @__PURE__ */ new Set();
    let cur = obj;
    do {
      Object.getOwnPropertyNames(cur).map((p) => props.add(p));
    } while (cur = Object.getPrototypeOf(cur));
    return [...props.keys()].filter((i) => typeof obj[i] === "function");
  }
};
var RObject = _RObject;
_slice = new WeakSet();
slice_fn = function(prop, op) {
  const prot = { n: 0 };
  try {
    const idx = new _RObject(prop);
    protectInc(idx, prot);
    const call = Module._Rf_lang3(op, this.ptr, idx.ptr);
    protectInc(call, prot);
    return _RObject.wrap(safeEval(call, objs.baseEnv));
  } finally {
    unprotect(prot.n);
  }
};
var RNull = class extends RObject {
  constructor() {
    super(new RObjectBase(Module.getValue(Module._R_NilValue, "*")));
    return this;
  }
  toJs() {
    return { type: "null" };
  }
};
var RSymbol = class extends RObject {
  constructor(x) {
    if (x instanceof RObjectBase) {
      assertRType(x, "symbol");
      super(x);
      return;
    }
    const name = Module.allocateUTF8(x);
    try {
      super(new RObjectBase(Module._Rf_install(name)));
    } finally {
      Module._free(name);
    }
  }
  toJs() {
    const obj = this.toObject();
    return {
      type: "symbol",
      printname: obj.printname,
      symvalue: obj.symvalue,
      internal: obj.internal
    };
  }
  toObject() {
    return {
      printname: this.printname().isUnbound() ? null : this.printname().toString(),
      symvalue: this.symvalue().isUnbound() ? null : this.symvalue().ptr,
      internal: this.internal().isNull() ? null : this.internal().ptr
    };
  }
  toString() {
    return this.printname().toString();
  }
  printname() {
    return RString.wrap(Module._PRINTNAME(this.ptr));
  }
  symvalue() {
    return RObject.wrap(Module._SYMVALUE(this.ptr));
  }
  internal() {
    return RObject.wrap(Module._INTERNAL(this.ptr));
  }
};
var RPairlist = class extends RObject {
  constructor(val) {
    if (val instanceof RObjectBase) {
      assertRType(val, "pairlist");
      super(val);
      return this;
    }
    const prot = { n: 0 };
    try {
      const { names, values } = toWebRData(val);
      const list = RPairlist.wrap(Module._Rf_allocList(values.length));
      protectInc(list, prot);
      for (let [i, next] = [0, list]; !next.isNull(); [i, next] = [i + 1, next.cdr()]) {
        next.setcar(new RObject(values[i]));
      }
      list.setNames(names);
      super(list);
    } finally {
      unprotect(prot.n);
    }
  }
  get length() {
    return this.toArray().length;
  }
  toArray(options = { depth: 1 }) {
    return this.toJs(options).values;
  }
  toObject({
    allowDuplicateKey = true,
    allowEmptyKey = false,
    depth = 1
  } = {}) {
    const entries = this.entries({ depth });
    const keys = entries.map(([k, v]) => k);
    if (!allowDuplicateKey && new Set(keys).size !== keys.length) {
      throw new Error("Duplicate key when converting pairlist without allowDuplicateKey enabled");
    }
    if (!allowEmptyKey && keys.some((k) => !k)) {
      throw new Error("Empty or null key when converting pairlist without allowEmptyKey enabled");
    }
    return Object.fromEntries(
      entries.filter((u, idx) => entries.findIndex((v) => v[0] === u[0]) === idx)
    );
  }
  entries(options = { depth: 1 }) {
    const obj = this.toJs(options);
    return obj.values.map((v, i) => [obj.names ? obj.names[i] : null, v]);
  }
  toJs(options = { depth: 0 }, depth = 1) {
    const namesArray = [];
    let hasNames = false;
    const values = [];
    for (let next = this; !next.isNull(); next = next.cdr()) {
      const symbol = next.tag();
      if (symbol.isNull()) {
        namesArray.push("");
      } else {
        hasNames = true;
        namesArray.push(symbol.toString());
      }
      if (options.depth && depth >= options.depth) {
        values.push(next.car());
      } else {
        values.push(next.car().toJs(options, depth + 1));
      }
    }
    const names = hasNames ? namesArray : null;
    return { type: "pairlist", names, values };
  }
  includes(name) {
    return name in this.toObject();
  }
  setcar(obj) {
    Module._SETCAR(this.ptr, obj.ptr);
  }
  car() {
    return RObject.wrap(Module._CAR(this.ptr));
  }
  cdr() {
    return RObject.wrap(Module._CDR(this.ptr));
  }
  tag() {
    return RObject.wrap(Module._TAG(this.ptr));
  }
};
var RCall = class extends RObject {
  constructor(val) {
    if (val instanceof RObjectBase) {
      assertRType(val, "call");
      super(val);
      return this;
    }
    const prot = { n: 0 };
    try {
      const { values } = toWebRData(val);
      const objs2 = values.map((value) => protectInc(new RObject(value), prot));
      const call = RCall.wrap(Module._Rf_allocVector(RTypeMap.call, values.length));
      protectInc(call, prot);
      for (let [i, next] = [0, call]; !next.isNull(); [i, next] = [i + 1, next.cdr()]) {
        next.setcar(objs2[i]);
      }
      super(call);
    } finally {
      unprotect(prot.n);
    }
  }
  setcar(obj) {
    Module._SETCAR(this.ptr, obj.ptr);
  }
  car() {
    return RObject.wrap(Module._CAR(this.ptr));
  }
  cdr() {
    return RObject.wrap(Module._CDR(this.ptr));
  }
  eval() {
    return RObject.wrap(safeEval(this.ptr, objs.baseEnv));
  }
};
var RList = class extends RObject {
  constructor(val) {
    if (val instanceof RObjectBase) {
      assertRType(val, "list");
      super(val);
      return this;
    }
    const prot = { n: 0 };
    try {
      const { names, values } = toWebRData(val);
      const ptr = Module._Rf_allocVector(RTypeMap.list, values.length);
      protectInc(ptr, prot);
      values.forEach((v, i) => {
        Module._SET_VECTOR_ELT(ptr, i, new RObject(v).ptr);
      });
      RObject.wrap(ptr).setNames(names);
      super(new RObjectBase(ptr));
    } finally {
      unprotect(prot.n);
    }
  }
  get length() {
    return Module._LENGTH(this.ptr);
  }
  toArray(options = { depth: 1 }) {
    return this.toJs(options).values;
  }
  toObject({
    allowDuplicateKey = true,
    allowEmptyKey = false,
    depth = 1
  } = {}) {
    const entries = this.entries({ depth });
    const keys = entries.map(([k, v]) => k);
    if (!allowDuplicateKey && new Set(keys).size !== keys.length) {
      throw new Error("Duplicate key when converting list without allowDuplicateKey enabled");
    }
    if (!allowEmptyKey && keys.some((k) => !k)) {
      throw new Error("Empty or null key when converting list without allowEmptyKey enabled");
    }
    return Object.fromEntries(
      entries.filter((u, idx) => entries.findIndex((v) => v[0] === u[0]) === idx)
    );
  }
  entries(options = { depth: 1 }) {
    const obj = this.toJs(options);
    return obj.values.map((v, i) => [obj.names ? obj.names[i] : null, v]);
  }
  toJs(options = { depth: 0 }, depth = 1) {
    return {
      type: "list",
      names: this.names(),
      values: [...Array(this.length).keys()].map((i) => {
        if (options.depth && depth >= options.depth) {
          return this.get(i + 1);
        } else {
          return this.get(i + 1).toJs(options, depth + 1);
        }
      })
    };
  }
};
var RFunction = class extends RObject {
  exec(...args) {
    const prot = { n: 0 };
    try {
      const call = new RCall([this, ...args]);
      protectInc(call, prot);
      return call.eval();
    } finally {
      unprotect(prot.n);
    }
  }
};
var RString = class extends RObject {
  constructor(x) {
    if (x instanceof RObjectBase) {
      assertRType(x, "string");
      super(x);
      return;
    }
    const name = Module.allocateUTF8(x);
    try {
      super(new RObjectBase(Module._Rf_mkChar(name)));
    } finally {
      Module._free(name);
    }
  }
  toString() {
    return Module.UTF8ToString(Module._R_CHAR(this.ptr));
  }
  toJs() {
    return {
      type: "string",
      value: this.toString()
    };
  }
};
var REnvironment = class extends RObject {
  constructor(val = {}) {
    if (val instanceof RObjectBase) {
      assertRType(val, "environment");
      super(val);
      return this;
    }
    let nProt = 0;
    try {
      const { names, values } = toWebRData(val);
      const ptr = protect(Module._R_NewEnv(objs.globalEnv.ptr, 0, 0));
      ++nProt;
      values.forEach((v, i) => {
        const name = names ? names[i] : null;
        if (!name) {
          throw new Error("Can't create object in new environment with empty symbol name");
        }
        const sym = new RSymbol(name);
        const vObj = protect(new RObject(v));
        try {
          envPoke(ptr, sym, vObj);
        } finally {
          unprotect(1);
        }
      });
      super(new RObjectBase(ptr));
    } finally {
      unprotect(nProt);
    }
  }
  ls(all = false, sorted = true) {
    const ls = RCharacter.wrap(Module._R_lsInternal3(this.ptr, Number(all), Number(sorted)));
    return ls.toArray();
  }
  bind(name, value) {
    const sym = new RSymbol(name);
    const valueObj = protect(new RObject(value));
    try {
      envPoke(this, sym, valueObj);
    } finally {
      unprotect(1);
    }
  }
  names() {
    return this.ls(true, true);
  }
  frame() {
    return RObject.wrap(Module._FRAME(this.ptr));
  }
  subset(prop) {
    if (typeof prop === "number") {
      throw new Error("Object of type environment is not subsettable");
    }
    return this.getDollar(prop);
  }
  toObject({ depth = 0 } = {}) {
    const symbols = this.names();
    return Object.fromEntries(
      [...Array(symbols.length).keys()].map((i) => {
        return [symbols[i], this.getDollar(symbols[i]).toJs({ depth })];
      })
    );
  }
  toJs(options = { depth: 0 }, depth = 1) {
    const names = this.names();
    const values = [...Array(names.length).keys()].map((i) => {
      if (options.depth && depth >= options.depth) {
        return this.getDollar(names[i]);
      } else {
        return this.getDollar(names[i]).toJs(options, depth + 1);
      }
    });
    return {
      type: "environment",
      names,
      values
    };
  }
};
var RVectorAtomic = class extends RObject {
  constructor(val, kind, newSetter) {
    if (val instanceof RObjectBase) {
      assertRType(val, kind);
      super(val);
      return this;
    }
    const prot = { n: 0 };
    try {
      const { names, values } = toWebRData(val);
      const ptr = Module._Rf_allocVector(RTypeMap[kind], values.length);
      protectInc(ptr, prot);
      values.forEach(newSetter(ptr));
      RObject.wrap(ptr).setNames(names);
      super(new RObjectBase(ptr));
    } finally {
      unprotect(prot.n);
    }
  }
  get length() {
    return Module._LENGTH(this.ptr);
  }
  get(prop) {
    return super.get(prop);
  }
  subset(prop) {
    return super.subset(prop);
  }
  getDollar(prop) {
    throw new Error("$ operator is invalid for atomic vectors");
  }
  detectMissing() {
    const prot = { n: 0 };
    try {
      const call = Module._Rf_lang2(new RSymbol("is.na").ptr, this.ptr);
      protectInc(call, prot);
      const val = RLogical.wrap(safeEval(call, objs.baseEnv));
      protectInc(val, prot);
      const ret = val.toTypedArray();
      return Array.from(ret).map((elt) => Boolean(elt));
    } finally {
      unprotect(prot.n);
    }
  }
  toArray() {
    const arr = this.toTypedArray();
    return this.detectMissing().map((m, idx) => m ? null : arr[idx]);
  }
  toObject({ allowDuplicateKey = true, allowEmptyKey = false } = {}) {
    const entries = this.entries();
    const keys = entries.map(([k, v]) => k);
    if (!allowDuplicateKey && new Set(keys).size !== keys.length) {
      throw new Error(
        "Duplicate key when converting atomic vector without allowDuplicateKey enabled"
      );
    }
    if (!allowEmptyKey && keys.some((k) => !k)) {
      throw new Error(
        "Empty or null key when converting atomic vector without allowEmptyKey enabled"
      );
    }
    return Object.fromEntries(
      entries.filter((u, idx) => entries.findIndex((v) => v[0] === u[0]) === idx)
    );
  }
  entries() {
    const values = this.toArray();
    const names = this.names();
    return values.map((v, i) => [names ? names[i] : null, v]);
  }
  toJs() {
    return {
      type: this.type(),
      names: this.names(),
      values: this.toArray()
    };
  }
};
var _newSetter;
var _RLogical = class extends RVectorAtomic {
  constructor(val) {
    super(val, "logical", __privateGet(_RLogical, _newSetter));
  }
  getBoolean(idx) {
    return this.get(idx).toArray()[0];
  }
  toBoolean() {
    if (this.length !== 1) {
      throw new Error("Can't convert atomic vector of length > 1 to a scalar JS value");
    }
    const val = this.getBoolean(1);
    if (val === null) {
      throw new Error("Can't convert missing value `NA` to a JS boolean");
    }
    return val;
  }
  toTypedArray() {
    return new Int32Array(
      Module.HEAP32.subarray(
        Module._LOGICAL(this.ptr) / 4,
        Module._LOGICAL(this.ptr) / 4 + this.length
      )
    );
  }
  toArray() {
    const arr = this.toTypedArray();
    return this.detectMissing().map((m, idx) => m ? null : Boolean(arr[idx]));
  }
};
var RLogical = _RLogical;
_newSetter = new WeakMap();
__privateAdd(RLogical, _newSetter, (ptr) => {
  const data = Module._LOGICAL(ptr);
  const naLogical = Module.getValue(Module._R_NaInt, "i32");
  return (v, i) => {
    Module.setValue(data + 4 * i, v === null ? naLogical : Boolean(v), "i32");
  };
});
var _newSetter2;
var _RInteger = class extends RVectorAtomic {
  constructor(val) {
    super(val, "integer", __privateGet(_RInteger, _newSetter2));
  }
  getNumber(idx) {
    return this.get(idx).toArray()[0];
  }
  toNumber() {
    if (this.length !== 1) {
      throw new Error("Can't convert atomic vector of length > 1 to a scalar JS value");
    }
    const val = this.getNumber(1);
    if (val === null) {
      throw new Error("Can't convert missing value `NA` to a JS number");
    }
    return val;
  }
  toTypedArray() {
    return new Int32Array(
      Module.HEAP32.subarray(
        Module._INTEGER(this.ptr) / 4,
        Module._INTEGER(this.ptr) / 4 + this.length
      )
    );
  }
};
var RInteger = _RInteger;
_newSetter2 = new WeakMap();
__privateAdd(RInteger, _newSetter2, (ptr) => {
  const data = Module._INTEGER(ptr);
  const naInteger = Module.getValue(Module._R_NaInt, "i32");
  return (v, i) => {
    Module.setValue(data + 4 * i, v === null ? naInteger : Math.round(Number(v)), "i32");
  };
});
var _newSetter3;
var _RDouble = class extends RVectorAtomic {
  constructor(val) {
    super(val, "double", __privateGet(_RDouble, _newSetter3));
  }
  getNumber(idx) {
    return this.get(idx).toArray()[0];
  }
  toNumber() {
    if (this.length !== 1) {
      throw new Error("Can't convert atomic vector of length > 1 to a scalar JS value");
    }
    const val = this.getNumber(1);
    if (val === null) {
      throw new Error("Can't convert missing value `NA` to a JS number");
    }
    return val;
  }
  toTypedArray() {
    return new Float64Array(
      Module.HEAPF64.subarray(Module._REAL(this.ptr) / 8, Module._REAL(this.ptr) / 8 + this.length)
    );
  }
};
var RDouble = _RDouble;
_newSetter3 = new WeakMap();
__privateAdd(RDouble, _newSetter3, (ptr) => {
  const data = Module._REAL(ptr);
  const naDouble = Module.getValue(Module._R_NaReal, "double");
  return (v, i) => {
    Module.setValue(data + 8 * i, v === null ? naDouble : v, "double");
  };
});
var _newSetter4;
var _RComplex = class extends RVectorAtomic {
  constructor(val) {
    super(val, "complex", __privateGet(_RComplex, _newSetter4));
  }
  getComplex(idx) {
    return this.get(idx).toArray()[0];
  }
  toComplex() {
    if (this.length !== 1) {
      throw new Error("Can't convert atomic vector of length > 1 to a scalar JS value");
    }
    const val = this.getComplex(1);
    if (val === null) {
      throw new Error("Can't convert missing value `NA` to a JS object");
    }
    return val;
  }
  toTypedArray() {
    return new Float64Array(
      Module.HEAPF64.subarray(
        Module._COMPLEX(this.ptr) / 8,
        Module._COMPLEX(this.ptr) / 8 + 2 * this.length
      )
    );
  }
  toArray() {
    const arr = this.toTypedArray();
    return this.detectMissing().map(
      (m, idx) => m ? null : { re: arr[2 * idx], im: arr[2 * idx + 1] }
    );
  }
};
var RComplex = _RComplex;
_newSetter4 = new WeakMap();
__privateAdd(RComplex, _newSetter4, (ptr) => {
  const data = Module._COMPLEX(ptr);
  const naDouble = Module.getValue(Module._R_NaReal, "double");
  return (v, i) => {
    Module.setValue(data + 8 * (2 * i), v === null ? naDouble : v.re, "double");
    Module.setValue(data + 8 * (2 * i + 1), v === null ? naDouble : v.im, "double");
  };
});
var _newSetter5;
var _RCharacter = class extends RVectorAtomic {
  constructor(val) {
    super(val, "character", __privateGet(_RCharacter, _newSetter5));
  }
  getString(idx) {
    return this.get(idx).toArray()[0];
  }
  toString() {
    if (this.length !== 1) {
      throw new Error("Can't convert atomic vector of length > 1 to a scalar JS value");
    }
    const val = this.getString(1);
    if (val === null) {
      throw new Error("Can't convert missing value `NA` to a JS string");
    }
    return val;
  }
  toTypedArray() {
    return new Uint32Array(
      Module.HEAPU32.subarray(
        Module._STRING_PTR(this.ptr) / 4,
        Module._STRING_PTR(this.ptr) / 4 + this.length
      )
    );
  }
  toArray() {
    return this.detectMissing().map(
      (m, idx) => m ? null : Module.UTF8ToString(Module._R_CHAR(Module._STRING_ELT(this.ptr, idx)))
    );
  }
};
var RCharacter = _RCharacter;
_newSetter5 = new WeakMap();
__privateAdd(RCharacter, _newSetter5, (ptr) => {
  return (v, i) => {
    if (v === null) {
      Module._SET_STRING_ELT(ptr, i, objs.naString.ptr);
    } else {
      Module._SET_STRING_ELT(ptr, i, new RString(v).ptr);
    }
  };
});
var _newSetter6;
var _RRaw = class extends RVectorAtomic {
  constructor(val) {
    super(val, "raw", __privateGet(_RRaw, _newSetter6));
  }
  getNumber(idx) {
    return this.get(idx).toArray()[0];
  }
  toNumber() {
    if (this.length !== 1) {
      throw new Error("Can't convert atomic vector of length > 1 to a scalar JS value");
    }
    const val = this.getNumber(1);
    if (val === null) {
      throw new Error("Can't convert missing value `NA` to a JS number");
    }
    return val;
  }
  toTypedArray() {
    return new Uint8Array(
      Module.HEAPU8.subarray(Module._RAW(this.ptr), Module._RAW(this.ptr) + this.length)
    );
  }
};
var RRaw = _RRaw;
_newSetter6 = new WeakMap();
__privateAdd(RRaw, _newSetter6, (ptr) => {
  const data = Module._RAW(ptr);
  return (v, i) => {
    Module.setValue(data + i, Number(v), "i8");
  };
});
function toWebRData(jsObj) {
  if (isWebRDataJs(jsObj)) {
    return jsObj;
  } else if (Array.isArray(jsObj)) {
    return { names: null, values: jsObj };
  } else if (jsObj && typeof jsObj === "object" && !isComplex(jsObj)) {
    return {
      names: Object.keys(jsObj),
      values: Object.values(jsObj)
    };
  }
  return { names: null, values: [jsObj] };
}
function getRWorkerClass(type) {
  const typeClasses = {
    [RTypeMap.null]: RNull,
    [RTypeMap.symbol]: RSymbol,
    [RTypeMap.pairlist]: RPairlist,
    [RTypeMap.closure]: RFunction,
    [RTypeMap.environment]: REnvironment,
    [RTypeMap.call]: RCall,
    [RTypeMap.special]: RFunction,
    [RTypeMap.builtin]: RFunction,
    [RTypeMap.string]: RString,
    [RTypeMap.logical]: RLogical,
    [RTypeMap.integer]: RInteger,
    [RTypeMap.double]: RDouble,
    [RTypeMap.complex]: RComplex,
    [RTypeMap.character]: RCharacter,
    [RTypeMap.list]: RList,
    [RTypeMap.raw]: RRaw,
    [RTypeMap.function]: RFunction
  };
  if (type in typeClasses) {
    return typeClasses[type];
  }
  return RObject;
}
function isRObject2(value) {
  return value instanceof RObject;
}
var objs;

// webR/proxy.ts
function empty() {
}
function targetAsyncIterator(chan, proxy) {
  return async function* () {
    const msg = {
      type: "callRObjectMethod",
      data: {
        payload: proxy._payload,
        prop: "getPropertyValue",
        args: [{ payloadType: "raw", obj: "length" }],
        shelter: void 0
      }
    };
    const reply = await chan.request(msg);
    if (typeof reply.obj !== "number") {
      throw new Error("Cannot iterate over object, unexpected type for length property.");
    }
    for (let i = 1; i <= reply.obj; i++) {
      yield proxy.get(i);
    }
  };
}
function targetMethod(chan, prop, payload) {
  return async (..._args) => {
    const args = _args.map((arg) => {
      if (isRObject(arg)) {
        return arg._payload;
      }
      return {
        obj: replaceInObject(arg, isRObject, (obj) => obj._payload),
        payloadType: "raw"
      };
    });
    const msg = {
      type: "callRObjectMethod",
      data: { payload, prop, args }
    };
    const reply = await chan.request(msg);
    switch (reply.payloadType) {
      case "ptr":
        return newRProxy(chan, reply);
      case "raw": {
        const proxyReply = replaceInObject(
          reply,
          isWebRPayloadPtr,
          (obj, chan2) => newRProxy(chan2, obj),
          chan
        );
        return proxyReply.obj;
      }
    }
  };
}
async function newRObject(chan, objType, shelter, value) {
  const msg = {
    type: "newRObject",
    data: {
      objType,
      obj: replaceInObject(value, isRObject, (obj) => obj._payload),
      shelter
    }
  };
  const payload = await chan.request(msg);
  switch (payload.payloadType) {
    case "raw":
      throw new Error("Unexpected raw payload type returned from newRObject");
    case "ptr":
      return newRProxy(chan, payload);
  }
}
function newRProxy(chan, payload) {
  var _a;
  const proxy = new Proxy(
    ((_a = payload.obj.methods) == null ? void 0 : _a.includes("exec")) ? Object.assign(empty, { ...payload }) : payload,
    {
      get: (_, prop) => {
        var _a2;
        if (prop === "_payload") {
          return payload;
        } else if (prop === Symbol.asyncIterator) {
          return targetAsyncIterator(chan, proxy);
        } else if ((_a2 = payload.obj.methods) == null ? void 0 : _a2.includes(prop.toString())) {
          return targetMethod(chan, prop.toString(), payload);
        }
      },
      apply: async (_, _thisArg, args) => {
        const res = await newRProxy(chan, payload).exec(...args);
        return isRFunction(res) ? res : res.toJs();
      }
    }
  );
  return proxy;
}
function newRClassProxy(chan, shelter, objType) {
  return new Proxy(RObject, {
    construct: (_, args) => newRObject(chan, objType, shelter, ...args),
    get: (_, prop) => {
      return targetMethod(chan, prop.toString());
    }
  });
}

// console/console.ts
var _stdout, _stderr, _prompt, _canvasExec, _defaultStdout, _defaultStderr, _defaultPrompt, _defaultCanvasExec, _run, run_fn;
var Console = class {
  constructor(callbacks = {}, options = {
    REnv: {
      R_HOME: "/usr/lib/R",
      R_ENABLE_JIT: "0",
      R_DEFAULT_DEVICE: "canvas"
    }
  }) {
    __privateAdd(this, _run);
    __privateAdd(this, _stdout, void 0);
    __privateAdd(this, _stderr, void 0);
    __privateAdd(this, _prompt, void 0);
    __privateAdd(this, _canvasExec, void 0);
    __privateAdd(this, _defaultStdout, (text) => {
      console.log(text);
    });
    __privateAdd(this, _defaultStderr, (text) => {
      console.error(text);
    });
    __privateAdd(this, _defaultPrompt, (text) => {
      const input = prompt(text);
      if (input)
        this.stdin(`${input}
`);
    });
    __privateAdd(this, _defaultCanvasExec, (exec) => {
      if (IN_NODE) {
        throw new Error("Plotting with HTML canvas is not yet supported under Node");
      }
      Function(`this.getContext('2d').${exec}`).bind(this.canvas)();
    });
    this.webR = new WebR(options);
    if (!IN_NODE) {
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("width", "1008");
      this.canvas.setAttribute("height", "1008");
    }
    __privateSet(this, _stdout, callbacks.stdout || __privateGet(this, _defaultStdout));
    __privateSet(this, _stderr, callbacks.stderr || __privateGet(this, _defaultStderr));
    __privateSet(this, _prompt, callbacks.prompt || __privateGet(this, _defaultPrompt));
    __privateSet(this, _canvasExec, callbacks.canvasExec || __privateGet(this, _defaultCanvasExec));
  }
  stdin(input) {
    this.webR.writeConsole(input);
  }
  interrupt() {
    this.webR.interrupt();
  }
  run() {
    __privateMethod(this, _run, run_fn).call(this);
  }
};
_stdout = new WeakMap();
_stderr = new WeakMap();
_prompt = new WeakMap();
_canvasExec = new WeakMap();
_defaultStdout = new WeakMap();
_defaultStderr = new WeakMap();
_defaultPrompt = new WeakMap();
_defaultCanvasExec = new WeakMap();
_run = new WeakSet();
run_fn = async function() {
  for (; ; ) {
    const output = await this.webR.read();
    switch (output.type) {
      case "stdout":
        __privateGet(this, _stdout).call(this, output.data);
        break;
      case "stderr":
        __privateGet(this, _stderr).call(this, output.data);
        break;
      case "prompt":
        __privateGet(this, _prompt).call(this, output.data);
        break;
      case "canvasExec":
        __privateGet(this, _canvasExec).call(this, output.data);
        break;
      default:
        console.warn(`Unhandled output type for webR Console: ${output.type}.`);
    }
  }
};

// webR/webr-main.ts
var defaultEnv = {
  R_HOME: "/usr/lib/R",
  R_ENABLE_JIT: "0"
};
var defaultOptions = {
  RArgs: [],
  REnv: defaultEnv,
  WEBR_URL: BASE_URL,
  SW_URL: "",
  PKG_URL: PKG_BASE_URL,
  homedir: "/home/web_user",
  interactive: true,
  channelType: ChannelType.Automatic
};
var _chan;
var WebR = class {
  constructor(options = {}) {
    __privateAdd(this, _chan, void 0);
    this.FS = {
      lookupPath: async (path) => {
        const msg = { type: "lookupPath", data: { path } };
        const payload = await __privateGet(this, _chan).request(msg);
        return payload.obj;
      },
      mkdir: async (path) => {
        const msg = { type: "mkdir", data: { path } };
        const payload = await __privateGet(this, _chan).request(msg);
        return payload.obj;
      },
      readFile: async (path, flags) => {
        const msg = { type: "readFile", data: { path, flags } };
        const payload = await __privateGet(this, _chan).request(msg);
        return payload.obj;
      },
      rmdir: async (path) => {
        const msg = { type: "rmdir", data: { path } };
        await __privateGet(this, _chan).request(msg);
      },
      writeFile: async (path, data, flags) => {
        const msg = { type: "writeFile", data: { path, data, flags } };
        await __privateGet(this, _chan).request(msg);
      },
      unlink: async (path) => {
        const msg = { type: "unlink", data: { path } };
        await __privateGet(this, _chan).request(msg);
      }
    };
    const config = Object.assign(defaultOptions, options);
    __privateSet(this, _chan, newChannelMain(config));
    this.objs = {};
    this.Shelter = newShelterProxy(__privateGet(this, _chan));
  }
  async init() {
    const init = await __privateGet(this, _chan).initialised;
    this.globalShelter = await new this.Shelter();
    this.RObject = this.globalShelter.RObject;
    this.RLogical = this.globalShelter.RLogical;
    this.RInteger = this.globalShelter.RInteger;
    this.RDouble = this.globalShelter.RDouble;
    this.RComplex = this.globalShelter.RComplex;
    this.RCharacter = this.globalShelter.RCharacter;
    this.RRaw = this.globalShelter.RRaw;
    this.RList = this.globalShelter.RList;
    this.RPairlist = this.globalShelter.RPairlist;
    this.REnvironment = this.globalShelter.REnvironment;
    this.RSymbol = this.globalShelter.RSymbol;
    this.RString = this.globalShelter.RString;
    this.RCall = this.globalShelter.RCall;
    this.objs = {
      baseEnv: await this.RObject.getPersistentObject("baseEnv"),
      globalEnv: await this.RObject.getPersistentObject("globalEnv"),
      null: await this.RObject.getPersistentObject("null"),
      true: await this.RObject.getPersistentObject("true"),
      false: await this.RObject.getPersistentObject("false"),
      na: await this.RObject.getPersistentObject("na")
    };
    return init;
  }
  close() {
    __privateGet(this, _chan).close();
  }
  async read() {
    return await __privateGet(this, _chan).read();
  }
  async flush() {
    return await __privateGet(this, _chan).flush();
  }
  write(msg) {
    __privateGet(this, _chan).write(msg);
  }
  writeConsole(input) {
    this.write({ type: "stdin", data: input + "\n" });
  }
  interrupt() {
    __privateGet(this, _chan).interrupt();
  }
  async installPackages(packages) {
    for (const pkg of packages) {
      const msg = { type: "installPackage", data: { name: pkg } };
      await __privateGet(this, _chan).request(msg);
    }
  }
  async destroy(x) {
    await this.globalShelter.destroy(x);
  }
  async evalR(code, options) {
    return this.globalShelter.evalR(code, options);
  }
  async evalRVoid(code, options) {
    return this.evalRRaw(code, "void", options);
  }
  async evalRBoolean(code, options) {
    return this.evalRRaw(code, "boolean", options);
  }
  async evalRNumber(code, options) {
    return this.evalRRaw(code, "number", options);
  }
  async evalRString(code, options) {
    return this.evalRRaw(code, "string", options);
  }
  async evalRRaw(code, outputType, options = {}) {
    const opts = replaceInObject(options, isRObject, (obj) => obj._payload);
    const msg = {
      type: "evalRRaw",
      data: { code, options: opts, outputType }
    };
    const payload = await __privateGet(this, _chan).request(msg);
    switch (payload.payloadType) {
      case "raw":
        return payload.obj;
      case "ptr":
        throw new Error("Unexpected ptr payload type returned from evalRVoid");
    }
  }
};
_chan = new WeakMap();
var _id, _chan2, _initialised;
var Shelter = class {
  constructor(chan) {
    __privateAdd(this, _id, "");
    __privateAdd(this, _chan2, void 0);
    __privateAdd(this, _initialised, false);
    __privateSet(this, _chan2, chan);
  }
  async init() {
    if (__privateGet(this, _initialised)) {
      return;
    }
    const msg = { type: "newShelter" };
    const payload = await __privateGet(this, _chan2).request(msg);
    __privateSet(this, _id, payload.obj);
    this.RObject = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "object");
    this.RLogical = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "logical");
    this.RInteger = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "integer");
    this.RDouble = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "double");
    this.RComplex = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "complex");
    this.RCharacter = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "character");
    this.RRaw = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "raw");
    this.RList = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "list");
    this.RPairlist = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "pairlist");
    this.REnvironment = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "environment");
    this.RSymbol = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "symbol");
    this.RString = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "string");
    this.RCall = newRClassProxy(__privateGet(this, _chan2), __privateGet(this, _id), "call");
    __privateSet(this, _initialised, true);
  }
  async purge() {
    const msg = {
      type: "shelterPurge",
      data: __privateGet(this, _id)
    };
    await __privateGet(this, _chan2).request(msg);
  }
  async destroy(x) {
    const msg = {
      type: "shelterDestroy",
      data: { id: __privateGet(this, _id), obj: x._payload }
    };
    await __privateGet(this, _chan2).request(msg);
  }
  async size() {
    const msg = {
      type: "shelterSize",
      data: __privateGet(this, _id)
    };
    const payload = await __privateGet(this, _chan2).request(msg);
    return payload.obj;
  }
  async evalR(code, options = {}) {
    const opts = replaceInObject(options, isRObject, (obj) => obj._payload);
    const msg = {
      type: "evalR",
      data: { code, options: opts, shelter: __privateGet(this, _id) }
    };
    const payload = await __privateGet(this, _chan2).request(msg);
    switch (payload.payloadType) {
      case "raw":
        throw new Error("Unexpected payload type returned from evalR");
      default:
        return newRProxy(__privateGet(this, _chan2), payload);
    }
  }
  async captureR(code, options = {}) {
    const opts = replaceInObject(options, isRObject, (obj) => obj._payload);
    const msg = {
      type: "captureR",
      data: {
        code,
        options: opts,
        shelter: __privateGet(this, _id)
      }
    };
    const payload = await __privateGet(this, _chan2).request(msg);
    switch (payload.payloadType) {
      case "ptr":
        throw new Error("Unexpected payload type returned from evalR");
      case "raw": {
        const data = payload.obj;
        const result = newRProxy(__privateGet(this, _chan2), data.result);
        const output = data.output;
        for (let i = 0; i < output.length; ++i) {
          if (output[i].type !== "stdout" && output[i].type !== "stderr") {
            output[i].data = newRProxy(__privateGet(this, _chan2), output[i].data);
          }
        }
        return { result, output };
      }
    }
  }
};
_id = new WeakMap();
_chan2 = new WeakMap();
_initialised = new WeakMap();
function newShelterProxy(chan) {
  return new Proxy(Shelter, {
    construct: async () => {
      const out = new Shelter(chan);
      await out.init();
      return out;
    }
  });
}
export {
  Console,
  Shelter,
  WebR
};
//# sourceMappingURL=webr.mjs.map
