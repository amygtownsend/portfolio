// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearCache = clearCache;
exports.connectStreamSource = connectStreamSource;
exports.disconnectStreamSource = disconnectStreamSource;
exports.registerAdapter = registerAdapter;
exports.renderStreamMessage = renderStreamMessage;
exports.setProgressBarDelay = setProgressBarDelay;
exports.start = start;
exports.visit = visit;
exports.session = exports.navigator = exports.PageSnapshot = exports.PageRenderer = void 0;

/*
Turbo 7.0.0-rc.2
Copyright © 2021 Basecamp, LLC
 */
(function () {
  if (window.Reflect === undefined || window.customElements === undefined || window.customElements.polyfillWrapFlushCallback) {
    return;
  }

  const BuiltInHTMLElement = HTMLElement;
  const wrapperForTheName = {
    'HTMLElement': function HTMLElement() {
      return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
    }
  };
  window.HTMLElement = wrapperForTheName['HTMLElement'];
  HTMLElement.prototype = BuiltInHTMLElement.prototype;
  HTMLElement.prototype.constructor = HTMLElement;
  Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
})();

const submittersByForm = new WeakMap();

function findSubmitterFromClickTarget(target) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  const candidate = element ? element.closest("input, button") : null;
  return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
}

function clickCaptured(event) {
  const submitter = findSubmitterFromClickTarget(event.target);

  if (submitter && submitter.form) {
    submittersByForm.set(submitter.form, submitter);
  }
}

(function () {
  if ("SubmitEvent" in window) return;
  addEventListener("click", clickCaptured, true);
  Object.defineProperty(Event.prototype, "submitter", {
    get() {
      if (this.type == "submit" && this.target instanceof HTMLFormElement) {
        return submittersByForm.get(this.target);
      }
    }

  });
})();

var FrameLoadingStyle;

(function (FrameLoadingStyle) {
  FrameLoadingStyle["eager"] = "eager";
  FrameLoadingStyle["lazy"] = "lazy";
})(FrameLoadingStyle || (FrameLoadingStyle = {}));

class FrameElement extends HTMLElement {
  constructor() {
    super();
    this.loaded = Promise.resolve();
    this.delegate = new FrameElement.delegateConstructor(this);
  }

  static get observedAttributes() {
    return ["disabled", "loading", "src"];
  }

  connectedCallback() {
    this.delegate.connect();
  }

  disconnectedCallback() {
    this.delegate.disconnect();
  }

  reload() {
    const {
      src
    } = this;
    this.src = null;
    this.src = src;
  }

  attributeChangedCallback(name) {
    if (name == "loading") {
      this.delegate.loadingStyleChanged();
    } else if (name == "src") {
      this.delegate.sourceURLChanged();
    } else {
      this.delegate.disabledChanged();
    }
  }

  get src() {
    return this.getAttribute("src");
  }

  set src(value) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
  }

  get loading() {
    return frameLoadingStyleFromString(this.getAttribute("loading") || "");
  }

  set loading(value) {
    if (value) {
      this.setAttribute("loading", value);
    } else {
      this.removeAttribute("loading");
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  get autoscroll() {
    return this.hasAttribute("autoscroll");
  }

  set autoscroll(value) {
    if (value) {
      this.setAttribute("autoscroll", "");
    } else {
      this.removeAttribute("autoscroll");
    }
  }

  get complete() {
    return !this.delegate.isLoading;
  }

  get isActive() {
    return this.ownerDocument === document && !this.isPreview;
  }

  get isPreview() {
    var _a, _b;

    return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
  }

}

function frameLoadingStyleFromString(style) {
  switch (style.toLowerCase()) {
    case "lazy":
      return FrameLoadingStyle.lazy;

    default:
      return FrameLoadingStyle.eager;
  }
}

function expandURL(locatable) {
  return new URL(locatable.toString(), document.baseURI);
}

function getAnchor(url) {
  let anchorMatch;

  if (url.hash) {
    return url.hash.slice(1);
  } else if (anchorMatch = url.href.match(/#(.*)$/)) {
    return anchorMatch[1];
  }
}

function getExtension(url) {
  return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
}

function isHTML(url) {
  return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml))$/);
}

function isPrefixedBy(baseURL, url) {
  const prefix = getPrefix(url);
  return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
}

function getRequestURL(url) {
  const anchor = getAnchor(url);
  return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
}

function toCacheKey(url) {
  return getRequestURL(url);
}

function urlsAreEqual(left, right) {
  return expandURL(left).href == expandURL(right).href;
}

function getPathComponents(url) {
  return url.pathname.split("/").slice(1);
}

function getLastPathComponent(url) {
  return getPathComponents(url).slice(-1)[0];
}

function getPrefix(url) {
  return addTrailingSlash(url.origin + url.pathname);
}

function addTrailingSlash(value) {
  return value.endsWith("/") ? value : value + "/";
}

class FetchResponse {
  constructor(response) {
    this.response = response;
  }

  get succeeded() {
    return this.response.ok;
  }

  get failed() {
    return !this.succeeded;
  }

  get clientError() {
    return this.statusCode >= 400 && this.statusCode <= 499;
  }

  get serverError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }

  get redirected() {
    return this.response.redirected;
  }

  get location() {
    return expandURL(this.response.url);
  }

  get isHTML() {
    return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
  }

  get statusCode() {
    return this.response.status;
  }

  get contentType() {
    return this.header("Content-Type");
  }

  get responseText() {
    return this.response.text();
  }

  get responseHTML() {
    if (this.isHTML) {
      return this.response.text();
    } else {
      return Promise.resolve(undefined);
    }
  }

  header(name) {
    return this.response.headers.get(name);
  }

}

function dispatch(eventName, {
  target,
  cancelable,
  detail
} = {}) {
  const event = new CustomEvent(eventName, {
    cancelable,
    bubbles: true,
    detail
  });
  void (target || document.documentElement).dispatchEvent(event);
  return event;
}

function nextAnimationFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function nextEventLoopTick() {
  return new Promise(resolve => setTimeout(() => resolve(), 0));
}

function nextMicrotask() {
  return Promise.resolve();
}

function parseHTMLDocument(html = "") {
  return new DOMParser().parseFromString(html, "text/html");
}

function unindent(strings, ...values) {
  const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
  const match = lines[0].match(/^\s+/);
  const indent = match ? match[0].length : 0;
  return lines.map(line => line.slice(indent)).join("\n");
}

function interpolate(strings, values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] == undefined ? "" : values[i];
    return result + string + value;
  }, "");
}

function uuid() {
  return Array.apply(null, {
    length: 36
  }).map((_, i) => {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      return "-";
    } else if (i == 14) {
      return "4";
    } else if (i == 19) {
      return (Math.floor(Math.random() * 4) + 8).toString(16);
    } else {
      return Math.floor(Math.random() * 15).toString(16);
    }
  }).join("");
}

var FetchMethod;

(function (FetchMethod) {
  FetchMethod[FetchMethod["get"] = 0] = "get";
  FetchMethod[FetchMethod["post"] = 1] = "post";
  FetchMethod[FetchMethod["put"] = 2] = "put";
  FetchMethod[FetchMethod["patch"] = 3] = "patch";
  FetchMethod[FetchMethod["delete"] = 4] = "delete";
})(FetchMethod || (FetchMethod = {}));

function fetchMethodFromString(method) {
  switch (method.toLowerCase()) {
    case "get":
      return FetchMethod.get;

    case "post":
      return FetchMethod.post;

    case "put":
      return FetchMethod.put;

    case "patch":
      return FetchMethod.patch;

    case "delete":
      return FetchMethod.delete;
  }
}

class FetchRequest {
  constructor(delegate, method, location, body = new URLSearchParams()) {
    this.abortController = new AbortController();

    this.resolveRequestPromise = value => {};

    this.delegate = delegate;
    this.method = method;
    this.headers = this.defaultHeaders;

    if (this.isIdempotent) {
      this.url = mergeFormDataEntries(location, [...body.entries()]);
    } else {
      this.body = body;
      this.url = location;
    }
  }

  get location() {
    return this.url;
  }

  get params() {
    return this.url.searchParams;
  }

  get entries() {
    return this.body ? Array.from(this.body.entries()) : [];
  }

  cancel() {
    this.abortController.abort();
  }

  async perform() {
    var _a, _b;

    const {
      fetchOptions
    } = this;
    (_b = (_a = this.delegate).prepareHeadersForRequest) === null || _b === void 0 ? void 0 : _b.call(_a, this.headers, this);
    await this.allowRequestToBeIntercepted(fetchOptions);

    try {
      this.delegate.requestStarted(this);
      const response = await fetch(this.url.href, fetchOptions);
      return await this.receive(response);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.delegate.requestErrored(this, error);
        throw error;
      }
    } finally {
      this.delegate.requestFinished(this);
    }
  }

  async receive(response) {
    const fetchResponse = new FetchResponse(response);
    const event = dispatch("turbo:before-fetch-response", {
      cancelable: true,
      detail: {
        fetchResponse
      }
    });

    if (event.defaultPrevented) {
      this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
    } else if (fetchResponse.succeeded) {
      this.delegate.requestSucceededWithResponse(this, fetchResponse);
    } else {
      this.delegate.requestFailedWithResponse(this, fetchResponse);
    }

    return fetchResponse;
  }

  get fetchOptions() {
    var _a;

    return {
      method: FetchMethod[this.method].toUpperCase(),
      credentials: "same-origin",
      headers: this.headers,
      redirect: "follow",
      body: this.body,
      signal: this.abortSignal,
      referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
    };
  }

  get defaultHeaders() {
    return {
      "Accept": "text/html, application/xhtml+xml"
    };
  }

  get isIdempotent() {
    return this.method == FetchMethod.get;
  }

  get abortSignal() {
    return this.abortController.signal;
  }

  async allowRequestToBeIntercepted(fetchOptions) {
    const requestInterception = new Promise(resolve => this.resolveRequestPromise = resolve);
    const event = dispatch("turbo:before-fetch-request", {
      cancelable: true,
      detail: {
        fetchOptions,
        url: this.url.href,
        resume: this.resolveRequestPromise
      }
    });
    if (event.defaultPrevented) await requestInterception;
  }

}

function mergeFormDataEntries(url, entries) {
  const currentSearchParams = new URLSearchParams(url.search);

  for (const [name, value] of entries) {
    if (value instanceof File) continue;

    if (currentSearchParams.has(name)) {
      currentSearchParams.delete(name);
      url.searchParams.set(name, value);
    } else {
      url.searchParams.append(name, value);
    }
  }

  return url;
}

class AppearanceObserver {
  constructor(delegate, element) {
    this.started = false;

    this.intersect = entries => {
      const lastEntry = entries.slice(-1)[0];

      if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
        this.delegate.elementAppearedInViewport(this.element);
      }
    };

    this.delegate = delegate;
    this.element = element;
    this.intersectionObserver = new IntersectionObserver(this.intersect);
  }

  start() {
    if (!this.started) {
      this.started = true;
      this.intersectionObserver.observe(this.element);
    }
  }

  stop() {
    if (this.started) {
      this.started = false;
      this.intersectionObserver.unobserve(this.element);
    }
  }

}

class StreamMessage {
  constructor(html) {
    this.templateElement = document.createElement("template");
    this.templateElement.innerHTML = html;
  }

  static wrap(message) {
    if (typeof message == "string") {
      return new this(message);
    } else {
      return message;
    }
  }

  get fragment() {
    const fragment = document.createDocumentFragment();

    for (const element of this.foreignElements) {
      fragment.appendChild(document.importNode(element, true));
    }

    return fragment;
  }

  get foreignElements() {
    return this.templateChildren.reduce((streamElements, child) => {
      if (child.tagName.toLowerCase() == "turbo-stream") {
        return [...streamElements, child];
      } else {
        return streamElements;
      }
    }, []);
  }

  get templateChildren() {
    return Array.from(this.templateElement.content.children);
  }

}

StreamMessage.contentType = "text/vnd.turbo-stream.html";
var FormSubmissionState;

(function (FormSubmissionState) {
  FormSubmissionState[FormSubmissionState["initialized"] = 0] = "initialized";
  FormSubmissionState[FormSubmissionState["requesting"] = 1] = "requesting";
  FormSubmissionState[FormSubmissionState["waiting"] = 2] = "waiting";
  FormSubmissionState[FormSubmissionState["receiving"] = 3] = "receiving";
  FormSubmissionState[FormSubmissionState["stopping"] = 4] = "stopping";
  FormSubmissionState[FormSubmissionState["stopped"] = 5] = "stopped";
})(FormSubmissionState || (FormSubmissionState = {}));

var FormEnctype;

(function (FormEnctype) {
  FormEnctype["urlEncoded"] = "application/x-www-form-urlencoded";
  FormEnctype["multipart"] = "multipart/form-data";
  FormEnctype["plain"] = "text/plain";
})(FormEnctype || (FormEnctype = {}));

function formEnctypeFromString(encoding) {
  switch (encoding.toLowerCase()) {
    case FormEnctype.multipart:
      return FormEnctype.multipart;

    case FormEnctype.plain:
      return FormEnctype.plain;

    default:
      return FormEnctype.urlEncoded;
  }
}

class FormSubmission {
  constructor(delegate, formElement, submitter, mustRedirect = false) {
    this.state = FormSubmissionState.initialized;
    this.delegate = delegate;
    this.formElement = formElement;
    this.submitter = submitter;
    this.formData = buildFormData(formElement, submitter);
    this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body);
    this.mustRedirect = mustRedirect;
  }

  get method() {
    var _a;

    const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
    return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
  }

  get action() {
    var _a;

    const formElementAction = typeof this.formElement.action === 'string' ? this.formElement.action : null;
    return ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formaction")) || this.formElement.getAttribute("action") || formElementAction || "";
  }

  get location() {
    return expandURL(this.action);
  }

  get body() {
    if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
      return new URLSearchParams(this.stringFormData);
    } else {
      return this.formData;
    }
  }

  get enctype() {
    var _a;

    return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
  }

  get isIdempotent() {
    return this.fetchRequest.isIdempotent;
  }

  get stringFormData() {
    return [...this.formData].reduce((entries, [name, value]) => {
      return entries.concat(typeof value == "string" ? [[name, value]] : []);
    }, []);
  }

  async start() {
    const {
      initialized,
      requesting
    } = FormSubmissionState;

    if (this.state == initialized) {
      this.state = requesting;
      return this.fetchRequest.perform();
    }
  }

  stop() {
    const {
      stopping,
      stopped
    } = FormSubmissionState;

    if (this.state != stopping && this.state != stopped) {
      this.state = stopping;
      this.fetchRequest.cancel();
      return true;
    }
  }

  prepareHeadersForRequest(headers, request) {
    if (!request.isIdempotent) {
      const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");

      if (token) {
        headers["X-CSRF-Token"] = token;
      }

      headers["Accept"] = [StreamMessage.contentType, headers["Accept"]].join(", ");
    }
  }

  requestStarted(request) {
    this.state = FormSubmissionState.waiting;
    dispatch("turbo:submit-start", {
      target: this.formElement,
      detail: {
        formSubmission: this
      }
    });
    this.delegate.formSubmissionStarted(this);
  }

  requestPreventedHandlingResponse(request, response) {
    this.result = {
      success: response.succeeded,
      fetchResponse: response
    };
  }

  requestSucceededWithResponse(request, response) {
    if (response.clientError || response.serverError) {
      this.delegate.formSubmissionFailedWithResponse(this, response);
    } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
      const error = new Error("Form responses must redirect to another location");
      this.delegate.formSubmissionErrored(this, error);
    } else {
      this.state = FormSubmissionState.receiving;
      this.result = {
        success: true,
        fetchResponse: response
      };
      this.delegate.formSubmissionSucceededWithResponse(this, response);
    }
  }

  requestFailedWithResponse(request, response) {
    this.result = {
      success: false,
      fetchResponse: response
    };
    this.delegate.formSubmissionFailedWithResponse(this, response);
  }

  requestErrored(request, error) {
    this.result = {
      success: false,
      error
    };
    this.delegate.formSubmissionErrored(this, error);
  }

  requestFinished(request) {
    this.state = FormSubmissionState.stopped;
    dispatch("turbo:submit-end", {
      target: this.formElement,
      detail: Object.assign({
        formSubmission: this
      }, this.result)
    });
    this.delegate.formSubmissionFinished(this);
  }

  requestMustRedirect(request) {
    return !request.isIdempotent && this.mustRedirect;
  }

}

function buildFormData(formElement, submitter) {
  const formData = new FormData(formElement);
  const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
  const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");

  if (name && value != null && formData.get(name) != value) {
    formData.append(name, value);
  }

  return formData;
}

function getCookieValue(cookieName) {
  if (cookieName != null) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const cookie = cookies.find(cookie => cookie.startsWith(cookieName));

    if (cookie) {
      const value = cookie.split("=").slice(1).join("=");
      return value ? decodeURIComponent(value) : undefined;
    }
  }
}

function getMetaContent(name) {
  const element = document.querySelector(`meta[name="${name}"]`);
  return element && element.content;
}

function responseSucceededWithoutRedirect(response) {
  return response.statusCode == 200 && !response.redirected;
}

class Snapshot {
  constructor(element) {
    this.element = element;
  }

  get children() {
    return [...this.element.children];
  }

  hasAnchor(anchor) {
    return this.getElementForAnchor(anchor) != null;
  }

  getElementForAnchor(anchor) {
    return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
  }

  get isConnected() {
    return this.element.isConnected;
  }

  get firstAutofocusableElement() {
    return this.element.querySelector("[autofocus]");
  }

  get permanentElements() {
    return [...this.element.querySelectorAll("[id][data-turbo-permanent]")];
  }

  getPermanentElementById(id) {
    return this.element.querySelector(`#${id}[data-turbo-permanent]`);
  }

  getPermanentElementMapForSnapshot(snapshot) {
    const permanentElementMap = {};

    for (const currentPermanentElement of this.permanentElements) {
      const {
        id
      } = currentPermanentElement;
      const newPermanentElement = snapshot.getPermanentElementById(id);

      if (newPermanentElement) {
        permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
      }
    }

    return permanentElementMap;
  }

}

class FormInterceptor {
  constructor(delegate, element) {
    this.submitBubbled = event => {
      if (event.target instanceof HTMLFormElement) {
        const form = event.target;
        const submitter = event.submitter || undefined;

        if (this.delegate.shouldInterceptFormSubmission(form, submitter)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.delegate.formSubmissionIntercepted(form, submitter);
        }
      }
    };

    this.delegate = delegate;
    this.element = element;
  }

  start() {
    this.element.addEventListener("submit", this.submitBubbled);
  }

  stop() {
    this.element.removeEventListener("submit", this.submitBubbled);
  }

}

class View {
  constructor(delegate, element) {
    this.resolveRenderPromise = value => {};

    this.resolveInterceptionPromise = value => {};

    this.delegate = delegate;
    this.element = element;
  }

  scrollToAnchor(anchor) {
    const element = this.snapshot.getElementForAnchor(anchor);

    if (element) {
      this.scrollToElement(element);
      this.focusElement(element);
    } else {
      this.scrollToPosition({
        x: 0,
        y: 0
      });
    }
  }

  scrollToAnchorFromLocation(location) {
    this.scrollToAnchor(getAnchor(location));
  }

  scrollToElement(element) {
    element.scrollIntoView();
  }

  focusElement(element) {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute("tabindex")) {
        element.focus();
      } else {
        element.setAttribute("tabindex", "-1");
        element.focus();
        element.removeAttribute("tabindex");
      }
    }
  }

  scrollToPosition({
    x,
    y
  }) {
    this.scrollRoot.scrollTo(x, y);
  }

  scrollToTop() {
    this.scrollToPosition({
      x: 0,
      y: 0
    });
  }

  get scrollRoot() {
    return window;
  }

  async render(renderer) {
    const {
      isPreview,
      shouldRender,
      newSnapshot: snapshot
    } = renderer;

    if (shouldRender) {
      try {
        this.renderPromise = new Promise(resolve => this.resolveRenderPromise = resolve);
        this.renderer = renderer;
        this.prepareToRenderSnapshot(renderer);
        const renderInterception = new Promise(resolve => this.resolveInterceptionPromise = resolve);
        const immediateRender = this.delegate.allowsImmediateRender(snapshot, this.resolveInterceptionPromise);
        if (!immediateRender) await renderInterception;
        await this.renderSnapshot(renderer);
        this.delegate.viewRenderedSnapshot(snapshot, isPreview);
        this.finishRenderingSnapshot(renderer);
      } finally {
        delete this.renderer;
        this.resolveRenderPromise(undefined);
        delete this.renderPromise;
      }
    } else {
      this.invalidate();
    }
  }

  invalidate() {
    this.delegate.viewInvalidated();
  }

  prepareToRenderSnapshot(renderer) {
    this.markAsPreview(renderer.isPreview);
    renderer.prepareToRender();
  }

  markAsPreview(isPreview) {
    if (isPreview) {
      this.element.setAttribute("data-turbo-preview", "");
    } else {
      this.element.removeAttribute("data-turbo-preview");
    }
  }

  async renderSnapshot(renderer) {
    await renderer.render();
  }

  finishRenderingSnapshot(renderer) {
    renderer.finishRendering();
  }

}

class FrameView extends View {
  invalidate() {
    this.element.innerHTML = "";
  }

  get snapshot() {
    return new Snapshot(this.element);
  }

}

class LinkInterceptor {
  constructor(delegate, element) {
    this.clickBubbled = event => {
      if (this.respondsToEventTarget(event.target)) {
        this.clickEvent = event;
      } else {
        delete this.clickEvent;
      }
    };

    this.linkClicked = event => {
      if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
        if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url)) {
          this.clickEvent.preventDefault();
          event.preventDefault();
          this.delegate.linkClickIntercepted(event.target, event.detail.url);
        }
      }

      delete this.clickEvent;
    };

    this.willVisit = () => {
      delete this.clickEvent;
    };

    this.delegate = delegate;
    this.element = element;
  }

  start() {
    this.element.addEventListener("click", this.clickBubbled);
    document.addEventListener("turbo:click", this.linkClicked);
    document.addEventListener("turbo:before-visit", this.willVisit);
  }

  stop() {
    this.element.removeEventListener("click", this.clickBubbled);
    document.removeEventListener("turbo:click", this.linkClicked);
    document.removeEventListener("turbo:before-visit", this.willVisit);
  }

  respondsToEventTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    return element && element.closest("turbo-frame, html") == this.element;
  }

}

class Bardo {
  constructor(permanentElementMap) {
    this.permanentElementMap = permanentElementMap;
  }

  static preservingPermanentElements(permanentElementMap, callback) {
    const bardo = new this(permanentElementMap);
    bardo.enter();
    callback();
    bardo.leave();
  }

  enter() {
    for (const id in this.permanentElementMap) {
      const [, newPermanentElement] = this.permanentElementMap[id];
      this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
    }
  }

  leave() {
    for (const id in this.permanentElementMap) {
      const [currentPermanentElement] = this.permanentElementMap[id];
      this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
      this.replacePlaceholderWithPermanentElement(currentPermanentElement);
    }
  }

  replaceNewPermanentElementWithPlaceholder(permanentElement) {
    const placeholder = createPlaceholderForPermanentElement(permanentElement);
    permanentElement.replaceWith(placeholder);
  }

  replaceCurrentPermanentElementWithClone(permanentElement) {
    const clone = permanentElement.cloneNode(true);
    permanentElement.replaceWith(clone);
  }

  replacePlaceholderWithPermanentElement(permanentElement) {
    const placeholder = this.getPlaceholderById(permanentElement.id);
    placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
  }

  getPlaceholderById(id) {
    return this.placeholders.find(element => element.content == id);
  }

  get placeholders() {
    return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
  }

}

function createPlaceholderForPermanentElement(permanentElement) {
  const element = document.createElement("meta");
  element.setAttribute("name", "turbo-permanent-placeholder");
  element.setAttribute("content", permanentElement.id);
  return element;
}

class Renderer {
  constructor(currentSnapshot, newSnapshot, isPreview) {
    this.currentSnapshot = currentSnapshot;
    this.newSnapshot = newSnapshot;
    this.isPreview = isPreview;
    this.promise = new Promise((resolve, reject) => this.resolvingFunctions = {
      resolve,
      reject
    });
  }

  get shouldRender() {
    return true;
  }

  prepareToRender() {
    return;
  }

  finishRendering() {
    if (this.resolvingFunctions) {
      this.resolvingFunctions.resolve();
      delete this.resolvingFunctions;
    }
  }

  createScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");

      if (this.cspNonce) {
        createdScriptElement.nonce = this.cspNonce;
      }

      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }

  preservingPermanentElements(callback) {
    Bardo.preservingPermanentElements(this.permanentElementMap, callback);
  }

  focusFirstAutofocusableElement() {
    const element = this.connectedSnapshot.firstAutofocusableElement;

    if (elementIsFocusable(element)) {
      element.focus();
    }
  }

  get connectedSnapshot() {
    return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
  }

  get currentElement() {
    return this.currentSnapshot.element;
  }

  get newElement() {
    return this.newSnapshot.element;
  }

  get permanentElementMap() {
    return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
  }

  get cspNonce() {
    var _a;

    return (_a = document.head.querySelector('meta[name="csp-nonce"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content");
  }

}

function copyElementAttributes(destinationElement, sourceElement) {
  for (const {
    name,
    value
  } of [...sourceElement.attributes]) {
    destinationElement.setAttribute(name, value);
  }
}

function elementIsFocusable(element) {
  return element && typeof element.focus == "function";
}

class FrameRenderer extends Renderer {
  get shouldRender() {
    return true;
  }

  async render() {
    await nextAnimationFrame();
    this.preservingPermanentElements(() => {
      this.loadFrameElement();
    });
    this.scrollFrameIntoView();
    await nextAnimationFrame();
    this.focusFirstAutofocusableElement();
    await nextAnimationFrame();
    this.activateScriptElements();
  }

  loadFrameElement() {
    var _a;

    const destinationRange = document.createRange();
    destinationRange.selectNodeContents(this.currentElement);
    destinationRange.deleteContents();
    const frameElement = this.newElement;
    const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();

    if (sourceRange) {
      sourceRange.selectNodeContents(frameElement);
      this.currentElement.appendChild(sourceRange.extractContents());
    }
  }

  scrollFrameIntoView() {
    if (this.currentElement.autoscroll || this.newElement.autoscroll) {
      const element = this.currentElement.firstElementChild;
      const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");

      if (element) {
        element.scrollIntoView({
          block
        });
        return true;
      }
    }

    return false;
  }

  activateScriptElements() {
    for (const inertScriptElement of this.newScriptElements) {
      const activatedScriptElement = this.createScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }

  get newScriptElements() {
    return this.currentElement.querySelectorAll("script");
  }

}

function readScrollLogicalPosition(value, defaultValue) {
  if (value == "end" || value == "start" || value == "center" || value == "nearest") {
    return value;
  } else {
    return defaultValue;
  }
}

class ProgressBar {
  constructor() {
    this.hiding = false;
    this.value = 0;
    this.visible = false;

    this.trickle = () => {
      this.setValue(this.value + Math.random() / 100);
    };

    this.stylesheetElement = this.createStylesheetElement();
    this.progressElement = this.createProgressElement();
    this.installStylesheetElement();
    this.setValue(0);
  }

  static get defaultCSS() {
    return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 9999;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
  }

  show() {
    if (!this.visible) {
      this.visible = true;
      this.installProgressElement();
      this.startTrickling();
    }
  }

  hide() {
    if (this.visible && !this.hiding) {
      this.hiding = true;
      this.fadeProgressElement(() => {
        this.uninstallProgressElement();
        this.stopTrickling();
        this.visible = false;
        this.hiding = false;
      });
    }
  }

  setValue(value) {
    this.value = value;
    this.refresh();
  }

  installStylesheetElement() {
    document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
  }

  installProgressElement() {
    this.progressElement.style.width = "0";
    this.progressElement.style.opacity = "1";
    document.documentElement.insertBefore(this.progressElement, document.body);
    this.refresh();
  }

  fadeProgressElement(callback) {
    this.progressElement.style.opacity = "0";
    setTimeout(callback, ProgressBar.animationDuration * 1.5);
  }

  uninstallProgressElement() {
    if (this.progressElement.parentNode) {
      document.documentElement.removeChild(this.progressElement);
    }
  }

  startTrickling() {
    if (!this.trickleInterval) {
      this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
    }
  }

  stopTrickling() {
    window.clearInterval(this.trickleInterval);
    delete this.trickleInterval;
  }

  refresh() {
    requestAnimationFrame(() => {
      this.progressElement.style.width = `${10 + this.value * 90}%`;
    });
  }

  createStylesheetElement() {
    const element = document.createElement("style");
    element.type = "text/css";
    element.textContent = ProgressBar.defaultCSS;
    return element;
  }

  createProgressElement() {
    const element = document.createElement("div");
    element.className = "turbo-progress-bar";
    return element;
  }

}

ProgressBar.animationDuration = 300;

class HeadSnapshot extends Snapshot {
  constructor() {
    super(...arguments);
    this.detailsByOuterHTML = this.children.filter(element => !elementIsNoscript(element)).reduce((result, element) => {
      const {
        outerHTML
      } = element;
      const details = outerHTML in result ? result[outerHTML] : {
        type: elementType(element),
        tracked: elementIsTracked(element),
        elements: []
      };
      return Object.assign(Object.assign({}, result), {
        [outerHTML]: Object.assign(Object.assign({}, details), {
          elements: [...details.elements, element]
        })
      });
    }, {});
  }

  get trackedElementSignature() {
    return Object.keys(this.detailsByOuterHTML).filter(outerHTML => this.detailsByOuterHTML[outerHTML].tracked).join("");
  }

  getScriptElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
  }

  getStylesheetElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
  }

  getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
    return Object.keys(this.detailsByOuterHTML).filter(outerHTML => !(outerHTML in snapshot.detailsByOuterHTML)).map(outerHTML => this.detailsByOuterHTML[outerHTML]).filter(({
      type
    }) => type == matchedType).map(({
      elements: [element]
    }) => element);
  }

  get provisionalElements() {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const {
        type,
        tracked,
        elements
      } = this.detailsByOuterHTML[outerHTML];

      if (type == null && !tracked) {
        return [...result, ...elements];
      } else if (elements.length > 1) {
        return [...result, ...elements.slice(1)];
      } else {
        return result;
      }
    }, []);
  }

  getMetaValue(name) {
    const element = this.findMetaElementByName(name);
    return element ? element.getAttribute("content") : null;
  }

  findMetaElementByName(name) {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const {
        elements: [element]
      } = this.detailsByOuterHTML[outerHTML];
      return elementIsMetaElementWithName(element, name) ? element : result;
    }, undefined);
  }

}

function elementType(element) {
  if (elementIsScript(element)) {
    return "script";
  } else if (elementIsStylesheet(element)) {
    return "stylesheet";
  }
}

function elementIsTracked(element) {
  return element.getAttribute("data-turbo-track") == "reload";
}

function elementIsScript(element) {
  const tagName = element.tagName.toLowerCase();
  return tagName == "script";
}

function elementIsNoscript(element) {
  const tagName = element.tagName.toLowerCase();
  return tagName == "noscript";
}

function elementIsStylesheet(element) {
  const tagName = element.tagName.toLowerCase();
  return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
}

function elementIsMetaElementWithName(element, name) {
  const tagName = element.tagName.toLowerCase();
  return tagName == "meta" && element.getAttribute("name") == name;
}

class PageSnapshot extends Snapshot {
  constructor(element, headSnapshot) {
    super(element);
    this.headSnapshot = headSnapshot;
  }

  static fromHTMLString(html = "") {
    return this.fromDocument(parseHTMLDocument(html));
  }

  static fromElement(element) {
    return this.fromDocument(element.ownerDocument);
  }

  static fromDocument({
    head,
    body
  }) {
    return new this(body, new HeadSnapshot(head));
  }

  clone() {
    return new PageSnapshot(this.element.cloneNode(true), this.headSnapshot);
  }

  get headElement() {
    return this.headSnapshot.element;
  }

  get rootLocation() {
    var _a;

    const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
    return expandURL(root);
  }

  get cacheControlValue() {
    return this.getSetting("cache-control");
  }

  get isPreviewable() {
    return this.cacheControlValue != "no-preview";
  }

  get isCacheable() {
    return this.cacheControlValue != "no-cache";
  }

  get isVisitable() {
    return this.getSetting("visit-control") != "reload";
  }

  getSetting(name) {
    return this.headSnapshot.getMetaValue(`turbo-${name}`);
  }

}

exports.PageSnapshot = PageSnapshot;
var TimingMetric;

(function (TimingMetric) {
  TimingMetric["visitStart"] = "visitStart";
  TimingMetric["requestStart"] = "requestStart";
  TimingMetric["requestEnd"] = "requestEnd";
  TimingMetric["visitEnd"] = "visitEnd";
})(TimingMetric || (TimingMetric = {}));

var VisitState;

(function (VisitState) {
  VisitState["initialized"] = "initialized";
  VisitState["started"] = "started";
  VisitState["canceled"] = "canceled";
  VisitState["failed"] = "failed";
  VisitState["completed"] = "completed";
})(VisitState || (VisitState = {}));

const defaultOptions = {
  action: "advance",
  historyChanged: false
};
var SystemStatusCode;

(function (SystemStatusCode) {
  SystemStatusCode[SystemStatusCode["networkFailure"] = 0] = "networkFailure";
  SystemStatusCode[SystemStatusCode["timeoutFailure"] = -1] = "timeoutFailure";
  SystemStatusCode[SystemStatusCode["contentTypeMismatch"] = -2] = "contentTypeMismatch";
})(SystemStatusCode || (SystemStatusCode = {}));

class Visit {
  constructor(delegate, location, restorationIdentifier, options = {}) {
    this.identifier = uuid();
    this.timingMetrics = {};
    this.followedRedirect = false;
    this.historyChanged = false;
    this.scrolled = false;
    this.snapshotCached = false;
    this.state = VisitState.initialized;
    this.delegate = delegate;
    this.location = location;
    this.restorationIdentifier = restorationIdentifier || uuid();
    const {
      action,
      historyChanged,
      referrer,
      snapshotHTML,
      response
    } = Object.assign(Object.assign({}, defaultOptions), options);
    this.action = action;
    this.historyChanged = historyChanged;
    this.referrer = referrer;
    this.snapshotHTML = snapshotHTML;
    this.response = response;
    this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
  }

  get adapter() {
    return this.delegate.adapter;
  }

  get view() {
    return this.delegate.view;
  }

  get history() {
    return this.delegate.history;
  }

  get restorationData() {
    return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
  }

  get silent() {
    return this.isSamePage;
  }

  start() {
    if (this.state == VisitState.initialized) {
      this.recordTimingMetric(TimingMetric.visitStart);
      this.state = VisitState.started;
      this.adapter.visitStarted(this);
      this.delegate.visitStarted(this);
    }
  }

  cancel() {
    if (this.state == VisitState.started) {
      if (this.request) {
        this.request.cancel();
      }

      this.cancelRender();
      this.state = VisitState.canceled;
    }
  }

  complete() {
    if (this.state == VisitState.started) {
      this.recordTimingMetric(TimingMetric.visitEnd);
      this.state = VisitState.completed;
      this.adapter.visitCompleted(this);
      this.delegate.visitCompleted(this);
      this.followRedirect();
    }
  }

  fail() {
    if (this.state == VisitState.started) {
      this.state = VisitState.failed;
      this.adapter.visitFailed(this);
    }
  }

  changeHistory() {
    var _a;

    if (!this.historyChanged) {
      const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
      const method = this.getHistoryMethodForAction(actionForHistory);
      this.history.update(method, this.location, this.restorationIdentifier);
      this.historyChanged = true;
    }
  }

  issueRequest() {
    if (this.hasPreloadedResponse()) {
      this.simulateRequest();
    } else if (this.shouldIssueRequest() && !this.request) {
      this.request = new FetchRequest(this, FetchMethod.get, this.location);
      this.request.perform();
    }
  }

  simulateRequest() {
    if (this.response) {
      this.startRequest();
      this.recordResponse();
      this.finishRequest();
    }
  }

  startRequest() {
    this.recordTimingMetric(TimingMetric.requestStart);
    this.adapter.visitRequestStarted(this);
  }

  recordResponse(response = this.response) {
    this.response = response;

    if (response) {
      const {
        statusCode
      } = response;

      if (isSuccessful(statusCode)) {
        this.adapter.visitRequestCompleted(this);
      } else {
        this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
      }
    }
  }

  finishRequest() {
    this.recordTimingMetric(TimingMetric.requestEnd);
    this.adapter.visitRequestFinished(this);
  }

  loadResponse() {
    if (this.response) {
      const {
        statusCode,
        responseHTML
      } = this.response;
      this.render(async () => {
        this.cacheSnapshot();
        if (this.view.renderPromise) await this.view.renderPromise;

        if (isSuccessful(statusCode) && responseHTML != null) {
          await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML));
          this.adapter.visitRendered(this);
          this.complete();
        } else {
          await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML));
          this.adapter.visitRendered(this);
          this.fail();
        }
      });
    }
  }

  getCachedSnapshot() {
    const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();

    if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
      if (this.action == "restore" || snapshot.isPreviewable) {
        return snapshot;
      }
    }
  }

  getPreloadedSnapshot() {
    if (this.snapshotHTML) {
      return PageSnapshot.fromHTMLString(this.snapshotHTML);
    }
  }

  hasCachedSnapshot() {
    return this.getCachedSnapshot() != null;
  }

  loadCachedSnapshot() {
    const snapshot = this.getCachedSnapshot();

    if (snapshot) {
      const isPreview = this.shouldIssueRequest();
      this.render(async () => {
        this.cacheSnapshot();

        if (this.isSamePage) {
          this.adapter.visitRendered(this);
        } else {
          if (this.view.renderPromise) await this.view.renderPromise;
          await this.view.renderPage(snapshot, isPreview);
          this.adapter.visitRendered(this);

          if (!isPreview) {
            this.complete();
          }
        }
      });
    }
  }

  followRedirect() {
    if (this.redirectedToLocation && !this.followedRedirect) {
      this.adapter.visitProposedToLocation(this.redirectedToLocation, {
        action: 'replace',
        response: this.response
      });
      this.followedRedirect = true;
    }
  }

  goToSamePageAnchor() {
    if (this.isSamePage) {
      this.render(async () => {
        this.cacheSnapshot();
        this.adapter.visitRendered(this);
      });
    }
  }

  requestStarted() {
    this.startRequest();
  }

  requestPreventedHandlingResponse(request, response) {}

  async requestSucceededWithResponse(request, response) {
    const responseHTML = await response.responseHTML;

    if (responseHTML == undefined) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch
      });
    } else {
      this.redirectedToLocation = response.redirected ? response.location : undefined;
      this.recordResponse({
        statusCode: response.statusCode,
        responseHTML
      });
    }
  }

  async requestFailedWithResponse(request, response) {
    const responseHTML = await response.responseHTML;

    if (responseHTML == undefined) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch
      });
    } else {
      this.recordResponse({
        statusCode: response.statusCode,
        responseHTML
      });
    }
  }

  requestErrored(request, error) {
    this.recordResponse({
      statusCode: SystemStatusCode.networkFailure
    });
  }

  requestFinished() {
    this.finishRequest();
  }

  performScroll() {
    if (!this.scrolled) {
      if (this.action == "restore") {
        this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
      } else {
        this.scrollToAnchor() || this.view.scrollToTop();
      }

      if (this.isSamePage) {
        this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
      }

      this.scrolled = true;
    }
  }

  scrollToRestoredPosition() {
    const {
      scrollPosition
    } = this.restorationData;

    if (scrollPosition) {
      this.view.scrollToPosition(scrollPosition);
      return true;
    }
  }

  scrollToAnchor() {
    const anchor = getAnchor(this.location);

    if (anchor != null) {
      this.view.scrollToAnchor(anchor);
      return true;
    }
  }

  recordTimingMetric(metric) {
    this.timingMetrics[metric] = new Date().getTime();
  }

  getTimingMetrics() {
    return Object.assign({}, this.timingMetrics);
  }

  getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;

      case "advance":
      case "restore":
        return history.pushState;
    }
  }

  hasPreloadedResponse() {
    return typeof this.response == "object";
  }

  shouldIssueRequest() {
    if (this.isSamePage) {
      return false;
    } else if (this.action == "restore") {
      return !this.hasCachedSnapshot();
    } else {
      return true;
    }
  }

  cacheSnapshot() {
    if (!this.snapshotCached) {
      this.view.cacheSnapshot();
      this.snapshotCached = true;
    }
  }

  async render(callback) {
    this.cancelRender();
    await new Promise(resolve => {
      this.frame = requestAnimationFrame(() => resolve());
    });
    await callback();
    delete this.frame;
    this.performScroll();
  }

  cancelRender() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      delete this.frame;
    }
  }

}

function isSuccessful(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}

class BrowserAdapter {
  constructor(session) {
    this.progressBar = new ProgressBar();

    this.showProgressBar = () => {
      this.progressBar.show();
    };

    this.session = session;
  }

  visitProposedToLocation(location, options) {
    this.navigator.startVisit(location, uuid(), options);
  }

  visitStarted(visit) {
    visit.issueRequest();
    visit.changeHistory();
    visit.goToSamePageAnchor();
    visit.loadCachedSnapshot();
  }

  visitRequestStarted(visit) {
    this.progressBar.setValue(0);

    if (visit.hasCachedSnapshot() || visit.action != "restore") {
      this.showProgressBarAfterDelay();
    } else {
      this.showProgressBar();
    }
  }

  visitRequestCompleted(visit) {
    visit.loadResponse();
  }

  visitRequestFailedWithStatusCode(visit, statusCode) {
    switch (statusCode) {
      case SystemStatusCode.networkFailure:
      case SystemStatusCode.timeoutFailure:
      case SystemStatusCode.contentTypeMismatch:
        return this.reload();

      default:
        return visit.loadResponse();
    }
  }

  visitRequestFinished(visit) {
    this.progressBar.setValue(1);
    this.hideProgressBar();
  }

  visitCompleted(visit) {}

  pageInvalidated() {
    this.reload();
  }

  visitFailed(visit) {}

  visitRendered(visit) {}

  formSubmissionStarted(formSubmission) {
    this.progressBar.setValue(0);
    this.showProgressBarAfterDelay();
  }

  formSubmissionFinished(formSubmission) {
    this.progressBar.setValue(1);
    this.hideProgressBar();
  }

  showProgressBarAfterDelay() {
    this.progressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
  }

  hideProgressBar() {
    this.progressBar.hide();

    if (this.progressBarTimeout != null) {
      window.clearTimeout(this.progressBarTimeout);
      delete this.progressBarTimeout;
    }
  }

  reload() {
    window.location.reload();
  }

  get navigator() {
    return this.session.navigator;
  }

}

class CacheObserver {
  constructor() {
    this.started = false;
  }

  start() {
    if (!this.started) {
      this.started = true;
      addEventListener("turbo:before-cache", this.removeStaleElements, false);
    }
  }

  stop() {
    if (this.started) {
      this.started = false;
      removeEventListener("turbo:before-cache", this.removeStaleElements, false);
    }
  }

  removeStaleElements() {
    const staleElements = [...document.querySelectorAll('[data-turbo-cache="false"]')];

    for (const element of staleElements) {
      element.remove();
    }
  }

}

class FormSubmitObserver {
  constructor(delegate) {
    this.started = false;

    this.submitCaptured = () => {
      removeEventListener("submit", this.submitBubbled, false);
      addEventListener("submit", this.submitBubbled, false);
    };

    this.submitBubbled = event => {
      if (!event.defaultPrevented) {
        const form = event.target instanceof HTMLFormElement ? event.target : undefined;
        const submitter = event.submitter || undefined;

        if (form) {
          const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.method;

          if (method != "dialog" && this.delegate.willSubmitForm(form, submitter)) {
            event.preventDefault();
            this.delegate.formSubmitted(form, submitter);
          }
        }
      }
    };

    this.delegate = delegate;
  }

  start() {
    if (!this.started) {
      addEventListener("submit", this.submitCaptured, true);
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      removeEventListener("submit", this.submitCaptured, true);
      this.started = false;
    }
  }

}

class FrameRedirector {
  constructor(element) {
    this.element = element;
    this.linkInterceptor = new LinkInterceptor(this, element);
    this.formInterceptor = new FormInterceptor(this, element);
  }

  start() {
    this.linkInterceptor.start();
    this.formInterceptor.start();
  }

  stop() {
    this.linkInterceptor.stop();
    this.formInterceptor.stop();
  }

  shouldInterceptLinkClick(element, url) {
    return this.shouldRedirect(element);
  }

  linkClickIntercepted(element, url) {
    const frame = this.findFrameElement(element);

    if (frame) {
      frame.src = url;
    }
  }

  shouldInterceptFormSubmission(element, submitter) {
    return this.shouldRedirect(element, submitter);
  }

  formSubmissionIntercepted(element, submitter) {
    const frame = this.findFrameElement(element);

    if (frame) {
      frame.delegate.formSubmissionIntercepted(element, submitter);
    }
  }

  shouldRedirect(element, submitter) {
    const frame = this.findFrameElement(element);
    return frame ? frame != element.closest("turbo-frame") : false;
  }

  findFrameElement(element) {
    const id = element.getAttribute("data-turbo-frame");

    if (id && id != "_top") {
      const frame = this.element.querySelector(`#${id}:not([disabled])`);

      if (frame instanceof FrameElement) {
        return frame;
      }
    }
  }

}

class History {
  constructor(delegate) {
    this.restorationIdentifier = uuid();
    this.restorationData = {};
    this.started = false;
    this.pageLoaded = false;

    this.onPopState = event => {
      if (this.shouldHandlePopState()) {
        const {
          turbo
        } = event.state || {};

        if (turbo) {
          this.location = new URL(window.location.href);
          const {
            restorationIdentifier
          } = turbo;
          this.restorationIdentifier = restorationIdentifier;
          this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
        }
      }
    };

    this.onPageLoad = async event => {
      await nextMicrotask();
      this.pageLoaded = true;
    };

    this.delegate = delegate;
  }

  start() {
    if (!this.started) {
      addEventListener("popstate", this.onPopState, false);
      addEventListener("load", this.onPageLoad, false);
      this.started = true;
      this.replace(new URL(window.location.href));
    }
  }

  stop() {
    if (this.started) {
      removeEventListener("popstate", this.onPopState, false);
      removeEventListener("load", this.onPageLoad, false);
      this.started = false;
    }
  }

  push(location, restorationIdentifier) {
    this.update(history.pushState, location, restorationIdentifier);
  }

  replace(location, restorationIdentifier) {
    this.update(history.replaceState, location, restorationIdentifier);
  }

  update(method, location, restorationIdentifier = uuid()) {
    const state = {
      turbo: {
        restorationIdentifier
      }
    };
    method.call(history, state, "", location.href);
    this.location = location;
    this.restorationIdentifier = restorationIdentifier;
  }

  getRestorationDataForIdentifier(restorationIdentifier) {
    return this.restorationData[restorationIdentifier] || {};
  }

  updateRestorationData(additionalData) {
    const {
      restorationIdentifier
    } = this;
    const restorationData = this.restorationData[restorationIdentifier];
    this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
  }

  assumeControlOfScrollRestoration() {
    var _a;

    if (!this.previousScrollRestoration) {
      this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
      history.scrollRestoration = "manual";
    }
  }

  relinquishControlOfScrollRestoration() {
    if (this.previousScrollRestoration) {
      history.scrollRestoration = this.previousScrollRestoration;
      delete this.previousScrollRestoration;
    }
  }

  shouldHandlePopState() {
    return this.pageIsLoaded();
  }

  pageIsLoaded() {
    return this.pageLoaded || document.readyState == "complete";
  }

}

class LinkClickObserver {
  constructor(delegate) {
    this.started = false;

    this.clickCaptured = () => {
      removeEventListener("click", this.clickBubbled, false);
      addEventListener("click", this.clickBubbled, false);
    };

    this.clickBubbled = event => {
      if (this.clickEventIsSignificant(event)) {
        const target = event.composedPath && event.composedPath()[0] || event.target;
        const link = this.findLinkFromClickTarget(target);

        if (link) {
          const location = this.getLocationForLink(link);

          if (this.delegate.willFollowLinkToLocation(link, location)) {
            event.preventDefault();
            this.delegate.followedLinkToLocation(link, location);
          }
        }
      }
    };

    this.delegate = delegate;
  }

  start() {
    if (!this.started) {
      addEventListener("click", this.clickCaptured, true);
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      removeEventListener("click", this.clickCaptured, true);
      this.started = false;
    }
  }

  clickEventIsSignificant(event) {
    return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
  }

  findLinkFromClickTarget(target) {
    if (target instanceof Element) {
      return target.closest("a[href]:not([target^=_]):not([download])");
    }
  }

  getLocationForLink(link) {
    return expandURL(link.getAttribute("href") || "");
  }

}

function isAction(action) {
  return action == "advance" || action == "replace" || action == "restore";
}

class Navigator {
  constructor(delegate) {
    this.delegate = delegate;
  }

  proposeVisit(location, options = {}) {
    if (this.delegate.allowsVisitingLocationWithAction(location, options.action)) {
      this.delegate.visitProposedToLocation(location, options);
    }
  }

  startVisit(locatable, restorationIdentifier, options = {}) {
    this.stop();
    this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({
      referrer: this.location
    }, options));
    this.currentVisit.start();
  }

  submitForm(form, submitter) {
    this.stop();
    this.formSubmission = new FormSubmission(this, form, submitter, true);

    if (this.formSubmission.isIdempotent) {
      this.proposeVisit(this.formSubmission.fetchRequest.url, {
        action: this.getActionForFormSubmission(this.formSubmission)
      });
    } else {
      this.formSubmission.start();
    }
  }

  stop() {
    if (this.formSubmission) {
      this.formSubmission.stop();
      delete this.formSubmission;
    }

    if (this.currentVisit) {
      this.currentVisit.cancel();
      delete this.currentVisit;
    }
  }

  get adapter() {
    return this.delegate.adapter;
  }

  get view() {
    return this.delegate.view;
  }

  get history() {
    return this.delegate.history;
  }

  formSubmissionStarted(formSubmission) {
    if (typeof this.adapter.formSubmissionStarted === 'function') {
      this.adapter.formSubmissionStarted(formSubmission);
    }
  }

  async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
    if (formSubmission == this.formSubmission) {
      const responseHTML = await fetchResponse.responseHTML;

      if (responseHTML) {
        if (formSubmission.method != FetchMethod.get) {
          this.view.clearSnapshotCache();
        }

        const {
          statusCode
        } = fetchResponse;
        const visitOptions = {
          response: {
            statusCode,
            responseHTML
          }
        };
        this.proposeVisit(fetchResponse.location, visitOptions);
      }
    }
  }

  async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    const responseHTML = await fetchResponse.responseHTML;

    if (responseHTML) {
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);

      if (fetchResponse.serverError) {
        await this.view.renderError(snapshot);
      } else {
        await this.view.renderPage(snapshot);
      }

      this.view.scrollToTop();
      this.view.clearSnapshotCache();
    }
  }

  formSubmissionErrored(formSubmission, error) {
    console.error(error);
  }

  formSubmissionFinished(formSubmission) {
    if (typeof this.adapter.formSubmissionFinished === 'function') {
      this.adapter.formSubmissionFinished(formSubmission);
    }
  }

  visitStarted(visit) {
    this.delegate.visitStarted(visit);
  }

  visitCompleted(visit) {
    this.delegate.visitCompleted(visit);
  }

  locationWithActionIsSamePage(location, action) {
    const anchor = getAnchor(location);
    const currentAnchor = getAnchor(this.view.lastRenderedLocation);
    const isRestorationToTop = action === 'restore' && typeof anchor === 'undefined';
    return action !== "replace" && getRequestURL(location) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
  }

  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
  }

  get location() {
    return this.history.location;
  }

  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }

  getActionForFormSubmission(formSubmission) {
    const {
      formElement,
      submitter
    } = formSubmission;
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-action")) || formElement.getAttribute("data-turbo-action");
    return isAction(action) ? action : "advance";
  }

}

var PageStage;

(function (PageStage) {
  PageStage[PageStage["initial"] = 0] = "initial";
  PageStage[PageStage["loading"] = 1] = "loading";
  PageStage[PageStage["interactive"] = 2] = "interactive";
  PageStage[PageStage["complete"] = 3] = "complete";
})(PageStage || (PageStage = {}));

class PageObserver {
  constructor(delegate) {
    this.stage = PageStage.initial;
    this.started = false;

    this.interpretReadyState = () => {
      const {
        readyState
      } = this;

      if (readyState == "interactive") {
        this.pageIsInteractive();
      } else if (readyState == "complete") {
        this.pageIsComplete();
      }
    };

    this.pageWillUnload = () => {
      this.delegate.pageWillUnload();
    };

    this.delegate = delegate;
  }

  start() {
    if (!this.started) {
      if (this.stage == PageStage.initial) {
        this.stage = PageStage.loading;
      }

      document.addEventListener("readystatechange", this.interpretReadyState, false);
      addEventListener("pagehide", this.pageWillUnload, false);
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      document.removeEventListener("readystatechange", this.interpretReadyState, false);
      removeEventListener("pagehide", this.pageWillUnload, false);
      this.started = false;
    }
  }

  pageIsInteractive() {
    if (this.stage == PageStage.loading) {
      this.stage = PageStage.interactive;
      this.delegate.pageBecameInteractive();
    }
  }

  pageIsComplete() {
    this.pageIsInteractive();

    if (this.stage == PageStage.interactive) {
      this.stage = PageStage.complete;
      this.delegate.pageLoaded();
    }
  }

  get readyState() {
    return document.readyState;
  }

}

class ScrollObserver {
  constructor(delegate) {
    this.started = false;

    this.onScroll = () => {
      this.updatePosition({
        x: window.pageXOffset,
        y: window.pageYOffset
      });
    };

    this.delegate = delegate;
  }

  start() {
    if (!this.started) {
      addEventListener("scroll", this.onScroll, false);
      this.onScroll();
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      removeEventListener("scroll", this.onScroll, false);
      this.started = false;
    }
  }

  updatePosition(position) {
    this.delegate.scrollPositionChanged(position);
  }

}

class StreamObserver {
  constructor(delegate) {
    this.sources = new Set();
    this.started = false;

    this.inspectFetchResponse = event => {
      const response = fetchResponseFromEvent(event);

      if (response && fetchResponseIsStream(response)) {
        event.preventDefault();
        this.receiveMessageResponse(response);
      }
    };

    this.receiveMessageEvent = event => {
      if (this.started && typeof event.data == "string") {
        this.receiveMessageHTML(event.data);
      }
    };

    this.delegate = delegate;
  }

  start() {
    if (!this.started) {
      this.started = true;
      addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }

  stop() {
    if (this.started) {
      this.started = false;
      removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }

  connectStreamSource(source) {
    if (!this.streamSourceIsConnected(source)) {
      this.sources.add(source);
      source.addEventListener("message", this.receiveMessageEvent, false);
    }
  }

  disconnectStreamSource(source) {
    if (this.streamSourceIsConnected(source)) {
      this.sources.delete(source);
      source.removeEventListener("message", this.receiveMessageEvent, false);
    }
  }

  streamSourceIsConnected(source) {
    return this.sources.has(source);
  }

  async receiveMessageResponse(response) {
    const html = await response.responseHTML;

    if (html) {
      this.receiveMessageHTML(html);
    }
  }

  receiveMessageHTML(html) {
    this.delegate.receivedMessageFromStream(new StreamMessage(html));
  }

}

function fetchResponseFromEvent(event) {
  var _a;

  const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;

  if (fetchResponse instanceof FetchResponse) {
    return fetchResponse;
  }
}

function fetchResponseIsStream(response) {
  var _a;

  const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
  return contentType.startsWith(StreamMessage.contentType);
}

class ErrorRenderer extends Renderer {
  async render() {
    this.replaceHeadAndBody();
    this.activateScriptElements();
  }

  replaceHeadAndBody() {
    const {
      documentElement,
      head,
      body
    } = document;
    documentElement.replaceChild(this.newHead, head);
    documentElement.replaceChild(this.newElement, body);
  }

  activateScriptElements() {
    for (const replaceableElement of this.scriptElements) {
      const parentNode = replaceableElement.parentNode;

      if (parentNode) {
        const element = this.createScriptElement(replaceableElement);
        parentNode.replaceChild(element, replaceableElement);
      }
    }
  }

  get newHead() {
    return this.newSnapshot.headSnapshot.element;
  }

  get scriptElements() {
    return [...document.documentElement.querySelectorAll("script")];
  }

}

class PageRenderer extends Renderer {
  get shouldRender() {
    return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
  }

  prepareToRender() {
    this.mergeHead();
  }

  async render() {
    this.replaceBody();
  }

  finishRendering() {
    super.finishRendering();

    if (!this.isPreview) {
      this.focusFirstAutofocusableElement();
    }
  }

  get currentHeadSnapshot() {
    return this.currentSnapshot.headSnapshot;
  }

  get newHeadSnapshot() {
    return this.newSnapshot.headSnapshot;
  }

  get newElement() {
    return this.newSnapshot.element;
  }

  mergeHead() {
    this.copyNewHeadStylesheetElements();
    this.copyNewHeadScriptElements();
    this.removeCurrentHeadProvisionalElements();
    this.copyNewHeadProvisionalElements();
  }

  replaceBody() {
    this.preservingPermanentElements(() => {
      this.activateNewBody();
      this.assignNewBody();
    });
  }

  get trackedElementsAreIdentical() {
    return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
  }

  copyNewHeadStylesheetElements() {
    for (const element of this.newHeadStylesheetElements) {
      document.head.appendChild(element);
    }
  }

  copyNewHeadScriptElements() {
    for (const element of this.newHeadScriptElements) {
      document.head.appendChild(this.createScriptElement(element));
    }
  }

  removeCurrentHeadProvisionalElements() {
    for (const element of this.currentHeadProvisionalElements) {
      document.head.removeChild(element);
    }
  }

  copyNewHeadProvisionalElements() {
    for (const element of this.newHeadProvisionalElements) {
      document.head.appendChild(element);
    }
  }

  activateNewBody() {
    document.adoptNode(this.newElement);
    this.activateNewBodyScriptElements();
  }

  activateNewBodyScriptElements() {
    for (const inertScriptElement of this.newBodyScriptElements) {
      const activatedScriptElement = this.createScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }

  assignNewBody() {
    if (document.body && this.newElement instanceof HTMLBodyElement) {
      document.body.replaceWith(this.newElement);
    } else {
      document.documentElement.appendChild(this.newElement);
    }
  }

  get newHeadStylesheetElements() {
    return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
  }

  get newHeadScriptElements() {
    return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
  }

  get currentHeadProvisionalElements() {
    return this.currentHeadSnapshot.provisionalElements;
  }

  get newHeadProvisionalElements() {
    return this.newHeadSnapshot.provisionalElements;
  }

  get newBodyScriptElements() {
    return this.newElement.querySelectorAll("script");
  }

}

exports.PageRenderer = PageRenderer;

class SnapshotCache {
  constructor(size) {
    this.keys = [];
    this.snapshots = {};
    this.size = size;
  }

  has(location) {
    return toCacheKey(location) in this.snapshots;
  }

  get(location) {
    if (this.has(location)) {
      const snapshot = this.read(location);
      this.touch(location);
      return snapshot;
    }
  }

  put(location, snapshot) {
    this.write(location, snapshot);
    this.touch(location);
    return snapshot;
  }

  clear() {
    this.snapshots = {};
  }

  read(location) {
    return this.snapshots[toCacheKey(location)];
  }

  write(location, snapshot) {
    this.snapshots[toCacheKey(location)] = snapshot;
  }

  touch(location) {
    const key = toCacheKey(location);
    const index = this.keys.indexOf(key);
    if (index > -1) this.keys.splice(index, 1);
    this.keys.unshift(key);
    this.trim();
  }

  trim() {
    for (const key of this.keys.splice(this.size)) {
      delete this.snapshots[key];
    }
  }

}

class PageView extends View {
  constructor() {
    super(...arguments);
    this.snapshotCache = new SnapshotCache(10);
    this.lastRenderedLocation = new URL(location.href);
  }

  renderPage(snapshot, isPreview = false) {
    const renderer = new PageRenderer(this.snapshot, snapshot, isPreview);
    return this.render(renderer);
  }

  renderError(snapshot) {
    const renderer = new ErrorRenderer(this.snapshot, snapshot, false);
    return this.render(renderer);
  }

  clearSnapshotCache() {
    this.snapshotCache.clear();
  }

  async cacheSnapshot() {
    if (this.shouldCacheSnapshot) {
      this.delegate.viewWillCacheSnapshot();
      const {
        snapshot,
        lastRenderedLocation: location
      } = this;
      await nextEventLoopTick();
      this.snapshotCache.put(location, snapshot.clone());
    }
  }

  getCachedSnapshotForLocation(location) {
    return this.snapshotCache.get(location);
  }

  get snapshot() {
    return PageSnapshot.fromElement(this.element);
  }

  get shouldCacheSnapshot() {
    return this.snapshot.isCacheable;
  }

}

class Session {
  constructor() {
    this.navigator = new Navigator(this);
    this.history = new History(this);
    this.view = new PageView(this, document.documentElement);
    this.adapter = new BrowserAdapter(this);
    this.pageObserver = new PageObserver(this);
    this.cacheObserver = new CacheObserver();
    this.linkClickObserver = new LinkClickObserver(this);
    this.formSubmitObserver = new FormSubmitObserver(this);
    this.scrollObserver = new ScrollObserver(this);
    this.streamObserver = new StreamObserver(this);
    this.frameRedirector = new FrameRedirector(document.documentElement);
    this.drive = true;
    this.enabled = true;
    this.progressBarDelay = 500;
    this.started = false;
  }

  start() {
    if (!this.started) {
      this.pageObserver.start();
      this.cacheObserver.start();
      this.linkClickObserver.start();
      this.formSubmitObserver.start();
      this.scrollObserver.start();
      this.streamObserver.start();
      this.frameRedirector.start();
      this.history.start();
      this.started = true;
      this.enabled = true;
    }
  }

  disable() {
    this.enabled = false;
  }

  stop() {
    if (this.started) {
      this.pageObserver.stop();
      this.cacheObserver.stop();
      this.linkClickObserver.stop();
      this.formSubmitObserver.stop();
      this.scrollObserver.stop();
      this.streamObserver.stop();
      this.frameRedirector.stop();
      this.history.stop();
      this.started = false;
    }
  }

  registerAdapter(adapter) {
    this.adapter = adapter;
  }

  visit(location, options = {}) {
    this.navigator.proposeVisit(expandURL(location), options);
  }

  connectStreamSource(source) {
    this.streamObserver.connectStreamSource(source);
  }

  disconnectStreamSource(source) {
    this.streamObserver.disconnectStreamSource(source);
  }

  renderStreamMessage(message) {
    document.documentElement.appendChild(StreamMessage.wrap(message).fragment);
  }

  clearCache() {
    this.view.clearSnapshotCache();
  }

  setProgressBarDelay(delay) {
    this.progressBarDelay = delay;
  }

  get location() {
    return this.history.location;
  }

  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }

  historyPoppedToLocationWithRestorationIdentifier(location, restorationIdentifier) {
    if (this.enabled) {
      this.navigator.startVisit(location, restorationIdentifier, {
        action: "restore",
        historyChanged: true
      });
    } else {
      this.adapter.pageInvalidated();
    }
  }

  scrollPositionChanged(position) {
    this.history.updateRestorationData({
      scrollPosition: position
    });
  }

  willFollowLinkToLocation(link, location) {
    return this.elementDriveEnabled(link) && this.locationIsVisitable(location) && this.applicationAllowsFollowingLinkToLocation(link, location);
  }

  followedLinkToLocation(link, location) {
    const action = this.getActionForLink(link);
    this.convertLinkWithMethodClickToFormSubmission(link) || this.visit(location.href, {
      action
    });
  }

  convertLinkWithMethodClickToFormSubmission(link) {
    const linkMethod = link.getAttribute("data-turbo-method");

    if (linkMethod) {
      const form = document.createElement("form");
      form.method = linkMethod;
      form.action = link.getAttribute("href") || "undefined";
      document.body.appendChild(form);
      return dispatch("submit", {
        cancelable: true,
        target: form
      });
    } else {
      return false;
    }
  }

  allowsVisitingLocationWithAction(location, action) {
    return this.locationWithActionIsSamePage(location, action) || this.applicationAllowsVisitingLocation(location);
  }

  visitProposedToLocation(location, options) {
    extendURLWithDeprecatedProperties(location);
    this.adapter.visitProposedToLocation(location, options);
  }

  visitStarted(visit) {
    extendURLWithDeprecatedProperties(visit.location);

    if (!visit.silent) {
      this.notifyApplicationAfterVisitingLocation(visit.location, visit.action);
    }
  }

  visitCompleted(visit) {
    this.notifyApplicationAfterPageLoad(visit.getTimingMetrics());
  }

  locationWithActionIsSamePage(location, action) {
    return this.navigator.locationWithActionIsSamePage(location, action);
  }

  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
  }

  willSubmitForm(form, submitter) {
    return this.elementDriveEnabled(form) && this.elementDriveEnabled(submitter);
  }

  formSubmitted(form, submitter) {
    this.navigator.submitForm(form, submitter);
  }

  pageBecameInteractive() {
    this.view.lastRenderedLocation = this.location;
    this.notifyApplicationAfterPageLoad();
  }

  pageLoaded() {
    this.history.assumeControlOfScrollRestoration();
  }

  pageWillUnload() {
    this.history.relinquishControlOfScrollRestoration();
  }

  receivedMessageFromStream(message) {
    this.renderStreamMessage(message);
  }

  viewWillCacheSnapshot() {
    var _a;

    if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
      this.notifyApplicationBeforeCachingSnapshot();
    }
  }

  allowsImmediateRender({
    element
  }, resume) {
    const event = this.notifyApplicationBeforeRender(element, resume);
    return !event.defaultPrevented;
  }

  viewRenderedSnapshot(snapshot, isPreview) {
    this.view.lastRenderedLocation = this.history.location;
    this.notifyApplicationAfterRender();
  }

  viewInvalidated() {
    this.adapter.pageInvalidated();
  }

  frameLoaded(frame) {
    this.notifyApplicationAfterFrameLoad(frame);
  }

  frameRendered(fetchResponse, frame) {
    this.notifyApplicationAfterFrameRender(fetchResponse, frame);
  }

  applicationAllowsFollowingLinkToLocation(link, location) {
    const event = this.notifyApplicationAfterClickingLinkToLocation(link, location);
    return !event.defaultPrevented;
  }

  applicationAllowsVisitingLocation(location) {
    const event = this.notifyApplicationBeforeVisitingLocation(location);
    return !event.defaultPrevented;
  }

  notifyApplicationAfterClickingLinkToLocation(link, location) {
    return dispatch("turbo:click", {
      target: link,
      detail: {
        url: location.href
      },
      cancelable: true
    });
  }

  notifyApplicationBeforeVisitingLocation(location) {
    return dispatch("turbo:before-visit", {
      detail: {
        url: location.href
      },
      cancelable: true
    });
  }

  notifyApplicationAfterVisitingLocation(location, action) {
    return dispatch("turbo:visit", {
      detail: {
        url: location.href,
        action
      }
    });
  }

  notifyApplicationBeforeCachingSnapshot() {
    return dispatch("turbo:before-cache");
  }

  notifyApplicationBeforeRender(newBody, resume) {
    return dispatch("turbo:before-render", {
      detail: {
        newBody,
        resume
      },
      cancelable: true
    });
  }

  notifyApplicationAfterRender() {
    return dispatch("turbo:render");
  }

  notifyApplicationAfterPageLoad(timing = {}) {
    return dispatch("turbo:load", {
      detail: {
        url: this.location.href,
        timing
      }
    });
  }

  notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
    dispatchEvent(new HashChangeEvent("hashchange", {
      oldURL: oldURL.toString(),
      newURL: newURL.toString()
    }));
  }

  notifyApplicationAfterFrameLoad(frame) {
    return dispatch("turbo:frame-load", {
      target: frame
    });
  }

  notifyApplicationAfterFrameRender(fetchResponse, frame) {
    return dispatch("turbo:frame-render", {
      detail: {
        fetchResponse
      },
      target: frame,
      cancelable: true
    });
  }

  elementDriveEnabled(element) {
    const container = element === null || element === void 0 ? void 0 : element.closest("[data-turbo]");

    if (this.drive) {
      if (container) {
        return container.getAttribute("data-turbo") != "false";
      } else {
        return true;
      }
    } else {
      if (container) {
        return container.getAttribute("data-turbo") == "true";
      } else {
        return false;
      }
    }
  }

  getActionForLink(link) {
    const action = link.getAttribute("data-turbo-action");
    return isAction(action) ? action : "advance";
  }

  locationIsVisitable(location) {
    return isPrefixedBy(location, this.snapshot.rootLocation) && isHTML(location);
  }

  get snapshot() {
    return this.view.snapshot;
  }

}

function extendURLWithDeprecatedProperties(url) {
  Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
}

const deprecatedLocationPropertyDescriptors = {
  absoluteURL: {
    get() {
      return this.toString();
    }

  }
};
const session = new Session();
exports.session = session;
const {
  navigator
} = session;
exports.navigator = navigator;

function start() {
  session.start();
}

function registerAdapter(adapter) {
  session.registerAdapter(adapter);
}

function visit(location, options) {
  session.visit(location, options);
}

function connectStreamSource(source) {
  session.connectStreamSource(source);
}

function disconnectStreamSource(source) {
  session.disconnectStreamSource(source);
}

function renderStreamMessage(message) {
  session.renderStreamMessage(message);
}

function clearCache() {
  session.clearCache();
}

function setProgressBarDelay(delay) {
  session.setProgressBarDelay(delay);
}

var Turbo = /*#__PURE__*/Object.freeze({
  __proto__: null,
  navigator: navigator,
  session: session,
  PageRenderer: PageRenderer,
  PageSnapshot: PageSnapshot,
  start: start,
  registerAdapter: registerAdapter,
  visit: visit,
  connectStreamSource: connectStreamSource,
  disconnectStreamSource: disconnectStreamSource,
  renderStreamMessage: renderStreamMessage,
  clearCache: clearCache,
  setProgressBarDelay: setProgressBarDelay
});

class FrameController {
  constructor(element) {
    this.resolveVisitPromise = () => {};

    this.connected = false;
    this.hasBeenLoaded = false;
    this.settingSourceURL = false;
    this.element = element;
    this.view = new FrameView(this, this.element);
    this.appearanceObserver = new AppearanceObserver(this, this.element);
    this.linkInterceptor = new LinkInterceptor(this, this.element);
    this.formInterceptor = new FormInterceptor(this, this.element);
  }

  connect() {
    if (!this.connected) {
      this.connected = true;
      this.reloadable = false;

      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      }

      this.linkInterceptor.start();
      this.formInterceptor.start();
      this.sourceURLChanged();
    }
  }

  disconnect() {
    if (this.connected) {
      this.connected = false;
      this.appearanceObserver.stop();
      this.linkInterceptor.stop();
      this.formInterceptor.stop();
    }
  }

  disabledChanged() {
    if (this.loadingStyle == FrameLoadingStyle.eager) {
      this.loadSourceURL();
    }
  }

  sourceURLChanged() {
    if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
      this.loadSourceURL();
    }
  }

  loadingStyleChanged() {
    if (this.loadingStyle == FrameLoadingStyle.lazy) {
      this.appearanceObserver.start();
    } else {
      this.appearanceObserver.stop();
      this.loadSourceURL();
    }
  }

  async loadSourceURL() {
    if (!this.settingSourceURL && this.enabled && this.isActive && (this.reloadable || this.sourceURL != this.currentURL)) {
      const previousURL = this.currentURL;
      this.currentURL = this.sourceURL;

      if (this.sourceURL) {
        try {
          this.element.loaded = this.visit(this.sourceURL);
          this.appearanceObserver.stop();
          await this.element.loaded;
          this.hasBeenLoaded = true;
          session.frameLoaded(this.element);
        } catch (error) {
          this.currentURL = previousURL;
          throw error;
        }
      }
    }
  }

  async loadResponse(fetchResponse) {
    if (fetchResponse.redirected) {
      this.sourceURL = fetchResponse.response.url;
    }

    try {
      const html = await fetchResponse.responseHTML;

      if (html) {
        const {
          body
        } = parseHTMLDocument(html);
        const snapshot = new Snapshot(await this.extractForeignFrameElement(body));
        const renderer = new FrameRenderer(this.view.snapshot, snapshot, false);
        if (this.view.renderPromise) await this.view.renderPromise;
        await this.view.render(renderer);
        session.frameRendered(fetchResponse, this.element);
      }
    } catch (error) {
      console.error(error);
      this.view.invalidate();
    }
  }

  elementAppearedInViewport(element) {
    this.loadSourceURL();
  }

  shouldInterceptLinkClick(element, url) {
    if (element.hasAttribute("data-turbo-method")) {
      return false;
    } else {
      return this.shouldInterceptNavigation(element);
    }
  }

  linkClickIntercepted(element, url) {
    this.reloadable = true;
    this.navigateFrame(element, url);
  }

  shouldInterceptFormSubmission(element, submitter) {
    return this.shouldInterceptNavigation(element, submitter);
  }

  formSubmissionIntercepted(element, submitter) {
    if (this.formSubmission) {
      this.formSubmission.stop();
    }

    this.reloadable = false;
    this.formSubmission = new FormSubmission(this, element, submitter);

    if (this.formSubmission.fetchRequest.isIdempotent) {
      this.navigateFrame(element, this.formSubmission.fetchRequest.url.href);
    } else {
      const {
        fetchRequest
      } = this.formSubmission;
      this.prepareHeadersForRequest(fetchRequest.headers, fetchRequest);
      this.formSubmission.start();
    }
  }

  prepareHeadersForRequest(headers, request) {
    headers["Turbo-Frame"] = this.id;
  }

  requestStarted(request) {
    this.element.setAttribute("busy", "");
  }

  requestPreventedHandlingResponse(request, response) {
    this.resolveVisitPromise();
  }

  async requestSucceededWithResponse(request, response) {
    await this.loadResponse(response);
    this.resolveVisitPromise();
  }

  requestFailedWithResponse(request, response) {
    console.error(response);
    this.resolveVisitPromise();
  }

  requestErrored(request, error) {
    console.error(error);
    this.resolveVisitPromise();
  }

  requestFinished(request) {
    this.element.removeAttribute("busy");
  }

  formSubmissionStarted(formSubmission) {
    const frame = this.findFrameElement(formSubmission.formElement);
    frame.setAttribute("busy", "");
  }

  formSubmissionSucceededWithResponse(formSubmission, response) {
    const frame = this.findFrameElement(formSubmission.formElement);
    frame.delegate.loadResponse(response);
  }

  formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    this.element.delegate.loadResponse(fetchResponse);
  }

  formSubmissionErrored(formSubmission, error) {
    console.error(error);
  }

  formSubmissionFinished(formSubmission) {
    const frame = this.findFrameElement(formSubmission.formElement);
    frame.removeAttribute("busy");
  }

  allowsImmediateRender(snapshot, resume) {
    return true;
  }

  viewRenderedSnapshot(snapshot, isPreview) {}

  viewInvalidated() {}

  async visit(url) {
    const request = new FetchRequest(this, FetchMethod.get, expandURL(url));
    return new Promise(resolve => {
      this.resolveVisitPromise = () => {
        this.resolveVisitPromise = () => {};

        resolve();
      };

      request.perform();
    });
  }

  navigateFrame(element, url) {
    const frame = this.findFrameElement(element);
    frame.src = url;
  }

  findFrameElement(element) {
    var _a;

    const id = element.getAttribute("data-turbo-frame") || this.element.getAttribute("target");
    return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
  }

  async extractForeignFrameElement(container) {
    let element;
    const id = CSS.escape(this.id);

    try {
      if (element = activateElement(container.querySelector(`turbo-frame#${id}`), this.currentURL)) {
        return element;
      }

      if (element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.currentURL)) {
        await element.loaded;
        return await this.extractForeignFrameElement(element);
      }

      console.error(`Response has no matching <turbo-frame id="${id}"> element`);
    } catch (error) {
      console.error(error);
    }

    return new FrameElement();
  }

  shouldInterceptNavigation(element, submitter) {
    const id = element.getAttribute("data-turbo-frame") || this.element.getAttribute("target");

    if (!this.enabled || id == "_top") {
      return false;
    }

    if (id) {
      const frameElement = getFrameElementById(id);

      if (frameElement) {
        return !frameElement.disabled;
      }
    }

    if (!session.elementDriveEnabled(element)) {
      return false;
    }

    if (submitter && !session.elementDriveEnabled(submitter)) {
      return false;
    }

    return true;
  }

  get id() {
    return this.element.id;
  }

  get enabled() {
    return !this.element.disabled;
  }

  get sourceURL() {
    if (this.element.src) {
      return this.element.src;
    }
  }

  get reloadable() {
    const frame = this.findFrameElement(this.element);
    return frame.hasAttribute("reloadable");
  }

  set reloadable(value) {
    const frame = this.findFrameElement(this.element);

    if (value) {
      frame.setAttribute("reloadable", "");
    } else {
      frame.removeAttribute("reloadable");
    }
  }

  set sourceURL(sourceURL) {
    this.settingSourceURL = true;
    this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
    this.currentURL = this.element.src;
    this.settingSourceURL = false;
  }

  get loadingStyle() {
    return this.element.loading;
  }

  get isLoading() {
    return this.formSubmission !== undefined || this.resolveVisitPromise() !== undefined;
  }

  get isActive() {
    return this.element.isActive && this.connected;
  }

}

function getFrameElementById(id) {
  if (id != null) {
    const element = document.getElementById(id);

    if (element instanceof FrameElement) {
      return element;
    }
  }
}

function activateElement(element, currentURL) {
  if (element) {
    const src = element.getAttribute("src");

    if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
      throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
    }

    if (element.ownerDocument !== document) {
      element = document.importNode(element, true);
    }

    if (element instanceof FrameElement) {
      element.connectedCallback();
      return element;
    }
  }
}

const StreamActions = {
  after() {
    this.targetElements.forEach(e => {
      var _a;

      return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
    });
  },

  append() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach(e => e.append(this.templateContent));
  },

  before() {
    this.targetElements.forEach(e => {
      var _a;

      return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
    });
  },

  prepend() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach(e => e.prepend(this.templateContent));
  },

  remove() {
    this.targetElements.forEach(e => e.remove());
  },

  replace() {
    this.targetElements.forEach(e => e.replaceWith(this.templateContent));
  },

  update() {
    this.targetElements.forEach(e => {
      e.innerHTML = "";
      e.append(this.templateContent);
    });
  }

};

class StreamElement extends HTMLElement {
  async connectedCallback() {
    try {
      await this.render();
    } catch (error) {
      console.error(error);
    } finally {
      this.disconnect();
    }
  }

  async render() {
    var _a;

    return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
      if (this.dispatchEvent(this.beforeRenderEvent)) {
        await nextAnimationFrame();
        this.performAction();
      }
    })();
  }

  disconnect() {
    try {
      this.remove();
    } catch (_a) {}
  }

  removeDuplicateTargetChildren() {
    this.duplicateChildren.forEach(c => c.remove());
  }

  get duplicateChildren() {
    var _a;

    const existingChildren = this.targetElements.flatMap(e => [...e.children]).filter(c => !!c.id);
    const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children)].filter(c => !!c.id).map(c => c.id);
    return existingChildren.filter(c => newChildrenIds.includes(c.id));
  }

  get performAction() {
    if (this.action) {
      const actionFunction = StreamActions[this.action];

      if (actionFunction) {
        return actionFunction;
      }

      this.raise("unknown action");
    }

    this.raise("action attribute is missing");
  }

  get targetElements() {
    if (this.target) {
      return this.targetElementsById;
    } else if (this.targets) {
      return this.targetElementsByQuery;
    } else {
      this.raise("target or targets attribute is missing");
    }
  }

  get templateContent() {
    return this.templateElement.content.cloneNode(true);
  }

  get templateElement() {
    if (this.firstElementChild instanceof HTMLTemplateElement) {
      return this.firstElementChild;
    }

    this.raise("first child element must be a <template> element");
  }

  get action() {
    return this.getAttribute("action");
  }

  get target() {
    return this.getAttribute("target");
  }

  get targets() {
    return this.getAttribute("targets");
  }

  raise(message) {
    throw new Error(`${this.description}: ${message}`);
  }

  get description() {
    var _a, _b;

    return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
  }

  get beforeRenderEvent() {
    return new CustomEvent("turbo:before-stream-render", {
      bubbles: true,
      cancelable: true
    });
  }

  get targetElementsById() {
    var _a;

    const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);

    if (element !== null) {
      return [element];
    } else {
      return [];
    }
  }

  get targetElementsByQuery() {
    var _a;

    const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);

    if (elements.length !== 0) {
      return Array.prototype.slice.call(elements);
    } else {
      return [];
    }
  }

}

FrameElement.delegateConstructor = FrameController;
customElements.define("turbo-frame", FrameElement);
customElements.define("turbo-stream", StreamElement);

(() => {
  let element = document.currentScript;
  if (!element) return;
  if (element.hasAttribute("data-turbo-suppress-warning")) return;

  while (element = element.parentElement) {
    if (element == document.body) {
      return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
    }
  }
})();

window.Turbo = Turbo;
start();
},{}],"../node_modules/@stimulus/core/dist/event_listener.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventListener = void 0;

var EventListener = function () {
  function EventListener(eventTarget, eventName, eventOptions) {
    this.eventTarget = eventTarget;
    this.eventName = eventName;
    this.eventOptions = eventOptions;
    this.unorderedBindings = new Set();
  }

  EventListener.prototype.connect = function () {
    this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
  };

  EventListener.prototype.disconnect = function () {
    this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
  }; // Binding observer delegate

  /** @hidden */


  EventListener.prototype.bindingConnected = function (binding) {
    this.unorderedBindings.add(binding);
  };
  /** @hidden */


  EventListener.prototype.bindingDisconnected = function (binding) {
    this.unorderedBindings.delete(binding);
  };

  EventListener.prototype.handleEvent = function (event) {
    var extendedEvent = extendEvent(event);

    for (var _i = 0, _a = this.bindings; _i < _a.length; _i++) {
      var binding = _a[_i];

      if (extendedEvent.immediatePropagationStopped) {
        break;
      } else {
        binding.handleEvent(extendedEvent);
      }
    }
  };

  Object.defineProperty(EventListener.prototype, "bindings", {
    get: function () {
      return Array.from(this.unorderedBindings).sort(function (left, right) {
        var leftIndex = left.index,
            rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    },
    enumerable: false,
    configurable: true
  });
  return EventListener;
}();

exports.EventListener = EventListener;

function extendEvent(event) {
  if ("immediatePropagationStopped" in event) {
    return event;
  } else {
    var stopImmediatePropagation_1 = event.stopImmediatePropagation;
    return Object.assign(event, {
      immediatePropagationStopped: false,
      stopImmediatePropagation: function () {
        this.immediatePropagationStopped = true;
        stopImmediatePropagation_1.call(this);
      }
    });
  }
}
},{}],"../node_modules/@stimulus/core/dist/dispatcher.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dispatcher = void 0;

var _event_listener = require("./event_listener");

var Dispatcher = function () {
  function Dispatcher(application) {
    this.application = application;
    this.eventListenerMaps = new Map();
    this.started = false;
  }

  Dispatcher.prototype.start = function () {
    if (!this.started) {
      this.started = true;
      this.eventListeners.forEach(function (eventListener) {
        return eventListener.connect();
      });
    }
  };

  Dispatcher.prototype.stop = function () {
    if (this.started) {
      this.started = false;
      this.eventListeners.forEach(function (eventListener) {
        return eventListener.disconnect();
      });
    }
  };

  Object.defineProperty(Dispatcher.prototype, "eventListeners", {
    get: function () {
      return Array.from(this.eventListenerMaps.values()).reduce(function (listeners, map) {
        return listeners.concat(Array.from(map.values()));
      }, []);
    },
    enumerable: false,
    configurable: true
  }); // Binding observer delegate

  /** @hidden */

  Dispatcher.prototype.bindingConnected = function (binding) {
    this.fetchEventListenerForBinding(binding).bindingConnected(binding);
  };
  /** @hidden */


  Dispatcher.prototype.bindingDisconnected = function (binding) {
    this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
  }; // Error handling


  Dispatcher.prototype.handleError = function (error, message, detail) {
    if (detail === void 0) {
      detail = {};
    }

    this.application.handleError(error, "Error " + message, detail);
  };

  Dispatcher.prototype.fetchEventListenerForBinding = function (binding) {
    var eventTarget = binding.eventTarget,
        eventName = binding.eventName,
        eventOptions = binding.eventOptions;
    return this.fetchEventListener(eventTarget, eventName, eventOptions);
  };

  Dispatcher.prototype.fetchEventListener = function (eventTarget, eventName, eventOptions) {
    var eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    var cacheKey = this.cacheKey(eventName, eventOptions);
    var eventListener = eventListenerMap.get(cacheKey);

    if (!eventListener) {
      eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
      eventListenerMap.set(cacheKey, eventListener);
    }

    return eventListener;
  };

  Dispatcher.prototype.createEventListener = function (eventTarget, eventName, eventOptions) {
    var eventListener = new _event_listener.EventListener(eventTarget, eventName, eventOptions);

    if (this.started) {
      eventListener.connect();
    }

    return eventListener;
  };

  Dispatcher.prototype.fetchEventListenerMapForEventTarget = function (eventTarget) {
    var eventListenerMap = this.eventListenerMaps.get(eventTarget);

    if (!eventListenerMap) {
      eventListenerMap = new Map();
      this.eventListenerMaps.set(eventTarget, eventListenerMap);
    }

    return eventListenerMap;
  };

  Dispatcher.prototype.cacheKey = function (eventName, eventOptions) {
    var parts = [eventName];
    Object.keys(eventOptions).sort().forEach(function (key) {
      parts.push("" + (eventOptions[key] ? "" : "!") + key);
    });
    return parts.join(":");
  };

  return Dispatcher;
}();

exports.Dispatcher = Dispatcher;
},{"./event_listener":"../node_modules/@stimulus/core/dist/event_listener.js"}],"../node_modules/@stimulus/core/dist/action_descriptor.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseActionDescriptorString = parseActionDescriptorString;
exports.stringifyEventTarget = stringifyEventTarget;
// capture nos.:            12   23 4               43   1 5   56 7      768 9  98
var descriptorPattern = /^((.+?)(@(window|document))?->)?(.+?)(#([^:]+?))(:(.+))?$/;

function parseActionDescriptorString(descriptorString) {
  var source = descriptorString.trim();
  var matches = source.match(descriptorPattern) || [];
  return {
    eventTarget: parseEventTarget(matches[4]),
    eventName: matches[2],
    eventOptions: matches[9] ? parseEventOptions(matches[9]) : {},
    identifier: matches[5],
    methodName: matches[7]
  };
}

function parseEventTarget(eventTargetName) {
  if (eventTargetName == "window") {
    return window;
  } else if (eventTargetName == "document") {
    return document;
  }
}

function parseEventOptions(eventOptions) {
  return eventOptions.split(":").reduce(function (options, token) {
    var _a;

    return Object.assign(options, (_a = {}, _a[token.replace(/^!/, "")] = !/^!/.test(token), _a));
  }, {});
}

function stringifyEventTarget(eventTarget) {
  if (eventTarget == window) {
    return "window";
  } else if (eventTarget == document) {
    return "document";
  }
}
},{}],"../node_modules/@stimulus/core/dist/action.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultEventNameForElement = getDefaultEventNameForElement;
exports.Action = void 0;

var _action_descriptor = require("./action_descriptor");

var Action = function () {
  function Action(element, index, descriptor) {
    this.element = element;
    this.index = index;
    this.eventTarget = descriptor.eventTarget || element;
    this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
    this.eventOptions = descriptor.eventOptions || {};
    this.identifier = descriptor.identifier || error("missing identifier");
    this.methodName = descriptor.methodName || error("missing method name");
  }

  Action.forToken = function (token) {
    return new this(token.element, token.index, (0, _action_descriptor.parseActionDescriptorString)(token.content));
  };

  Action.prototype.toString = function () {
    var eventNameSuffix = this.eventTargetName ? "@" + this.eventTargetName : "";
    return "" + this.eventName + eventNameSuffix + "->" + this.identifier + "#" + this.methodName;
  };

  Object.defineProperty(Action.prototype, "eventTargetName", {
    get: function () {
      return (0, _action_descriptor.stringifyEventTarget)(this.eventTarget);
    },
    enumerable: false,
    configurable: true
  });
  return Action;
}();

exports.Action = Action;
var defaultEventNames = {
  "a": function (e) {
    return "click";
  },
  "button": function (e) {
    return "click";
  },
  "form": function (e) {
    return "submit";
  },
  "input": function (e) {
    return e.getAttribute("type") == "submit" ? "click" : "input";
  },
  "select": function (e) {
    return "change";
  },
  "textarea": function (e) {
    return "input";
  }
};

function getDefaultEventNameForElement(element) {
  var tagName = element.tagName.toLowerCase();

  if (tagName in defaultEventNames) {
    return defaultEventNames[tagName](element);
  }
}

function error(message) {
  throw new Error(message);
}
},{"./action_descriptor":"../node_modules/@stimulus/core/dist/action_descriptor.js"}],"../node_modules/@stimulus/core/dist/binding.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Binding = void 0;

var Binding = function () {
  function Binding(context, action) {
    this.context = context;
    this.action = action;
  }

  Object.defineProperty(Binding.prototype, "index", {
    get: function () {
      return this.action.index;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Binding.prototype, "eventTarget", {
    get: function () {
      return this.action.eventTarget;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Binding.prototype, "eventOptions", {
    get: function () {
      return this.action.eventOptions;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Binding.prototype, "identifier", {
    get: function () {
      return this.context.identifier;
    },
    enumerable: false,
    configurable: true
  });

  Binding.prototype.handleEvent = function (event) {
    if (this.willBeInvokedByEvent(event)) {
      this.invokeWithEvent(event);
    }
  };

  Object.defineProperty(Binding.prototype, "eventName", {
    get: function () {
      return this.action.eventName;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Binding.prototype, "method", {
    get: function () {
      var method = this.controller[this.methodName];

      if (typeof method == "function") {
        return method;
      }

      throw new Error("Action \"" + this.action + "\" references undefined method \"" + this.methodName + "\"");
    },
    enumerable: false,
    configurable: true
  });

  Binding.prototype.invokeWithEvent = function (event) {
    try {
      this.method.call(this.controller, event);
    } catch (error) {
      var _a = this,
          identifier = _a.identifier,
          controller = _a.controller,
          element = _a.element,
          index = _a.index;

      var detail = {
        identifier: identifier,
        controller: controller,
        element: element,
        index: index,
        event: event
      };
      this.context.handleError(error, "invoking action \"" + this.action + "\"", detail);
    }
  };

  Binding.prototype.willBeInvokedByEvent = function (event) {
    var eventTarget = event.target;

    if (this.element === eventTarget) {
      return true;
    } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
      return this.scope.containsElement(eventTarget);
    } else {
      return this.scope.containsElement(this.action.element);
    }
  };

  Object.defineProperty(Binding.prototype, "controller", {
    get: function () {
      return this.context.controller;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Binding.prototype, "methodName", {
    get: function () {
      return this.action.methodName;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Binding.prototype, "element", {
    get: function () {
      return this.scope.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Binding.prototype, "scope", {
    get: function () {
      return this.context.scope;
    },
    enumerable: false,
    configurable: true
  });
  return Binding;
}();

exports.Binding = Binding;
},{}],"../node_modules/@stimulus/mutation-observers/dist/element_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ElementObserver = void 0;

var ElementObserver = function () {
  function ElementObserver(element, delegate) {
    var _this = this;

    this.element = element;
    this.started = false;
    this.delegate = delegate;
    this.elements = new Set();
    this.mutationObserver = new MutationObserver(function (mutations) {
      return _this.processMutations(mutations);
    });
  }

  ElementObserver.prototype.start = function () {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, {
        attributes: true,
        childList: true,
        subtree: true
      });
      this.refresh();
    }
  };

  ElementObserver.prototype.stop = function () {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  };

  ElementObserver.prototype.refresh = function () {
    if (this.started) {
      var matches = new Set(this.matchElementsInTree());

      for (var _i = 0, _a = Array.from(this.elements); _i < _a.length; _i++) {
        var element = _a[_i];

        if (!matches.has(element)) {
          this.removeElement(element);
        }
      }

      for (var _b = 0, _c = Array.from(matches); _b < _c.length; _b++) {
        var element = _c[_b];
        this.addElement(element);
      }
    }
  }; // Mutation record processing


  ElementObserver.prototype.processMutations = function (mutations) {
    if (this.started) {
      for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
        var mutation = mutations_1[_i];
        this.processMutation(mutation);
      }
    }
  };

  ElementObserver.prototype.processMutation = function (mutation) {
    if (mutation.type == "attributes") {
      this.processAttributeChange(mutation.target, mutation.attributeName);
    } else if (mutation.type == "childList") {
      this.processRemovedNodes(mutation.removedNodes);
      this.processAddedNodes(mutation.addedNodes);
    }
  };

  ElementObserver.prototype.processAttributeChange = function (node, attributeName) {
    var element = node;

    if (this.elements.has(element)) {
      if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
        this.delegate.elementAttributeChanged(element, attributeName);
      } else {
        this.removeElement(element);
      }
    } else if (this.matchElement(element)) {
      this.addElement(element);
    }
  };

  ElementObserver.prototype.processRemovedNodes = function (nodes) {
    for (var _i = 0, _a = Array.from(nodes); _i < _a.length; _i++) {
      var node = _a[_i];
      var element = this.elementFromNode(node);

      if (element) {
        this.processTree(element, this.removeElement);
      }
    }
  };

  ElementObserver.prototype.processAddedNodes = function (nodes) {
    for (var _i = 0, _a = Array.from(nodes); _i < _a.length; _i++) {
      var node = _a[_i];
      var element = this.elementFromNode(node);

      if (element && this.elementIsActive(element)) {
        this.processTree(element, this.addElement);
      }
    }
  }; // Element matching


  ElementObserver.prototype.matchElement = function (element) {
    return this.delegate.matchElement(element);
  };

  ElementObserver.prototype.matchElementsInTree = function (tree) {
    if (tree === void 0) {
      tree = this.element;
    }

    return this.delegate.matchElementsInTree(tree);
  };

  ElementObserver.prototype.processTree = function (tree, processor) {
    for (var _i = 0, _a = this.matchElementsInTree(tree); _i < _a.length; _i++) {
      var element = _a[_i];
      processor.call(this, element);
    }
  };

  ElementObserver.prototype.elementFromNode = function (node) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      return node;
    }
  };

  ElementObserver.prototype.elementIsActive = function (element) {
    if (element.isConnected != this.element.isConnected) {
      return false;
    } else {
      return this.element.contains(element);
    }
  }; // Element tracking


  ElementObserver.prototype.addElement = function (element) {
    if (!this.elements.has(element)) {
      if (this.elementIsActive(element)) {
        this.elements.add(element);

        if (this.delegate.elementMatched) {
          this.delegate.elementMatched(element);
        }
      }
    }
  };

  ElementObserver.prototype.removeElement = function (element) {
    if (this.elements.has(element)) {
      this.elements.delete(element);

      if (this.delegate.elementUnmatched) {
        this.delegate.elementUnmatched(element);
      }
    }
  };

  return ElementObserver;
}();

exports.ElementObserver = ElementObserver;
},{}],"../node_modules/@stimulus/mutation-observers/dist/attribute_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttributeObserver = void 0;

var _element_observer = require("./element_observer");

var AttributeObserver = function () {
  function AttributeObserver(element, attributeName, delegate) {
    this.attributeName = attributeName;
    this.delegate = delegate;
    this.elementObserver = new _element_observer.ElementObserver(element, this);
  }

  Object.defineProperty(AttributeObserver.prototype, "element", {
    get: function () {
      return this.elementObserver.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AttributeObserver.prototype, "selector", {
    get: function () {
      return "[" + this.attributeName + "]";
    },
    enumerable: false,
    configurable: true
  });

  AttributeObserver.prototype.start = function () {
    this.elementObserver.start();
  };

  AttributeObserver.prototype.stop = function () {
    this.elementObserver.stop();
  };

  AttributeObserver.prototype.refresh = function () {
    this.elementObserver.refresh();
  };

  Object.defineProperty(AttributeObserver.prototype, "started", {
    get: function () {
      return this.elementObserver.started;
    },
    enumerable: false,
    configurable: true
  }); // Element observer delegate

  AttributeObserver.prototype.matchElement = function (element) {
    return element.hasAttribute(this.attributeName);
  };

  AttributeObserver.prototype.matchElementsInTree = function (tree) {
    var match = this.matchElement(tree) ? [tree] : [];
    var matches = Array.from(tree.querySelectorAll(this.selector));
    return match.concat(matches);
  };

  AttributeObserver.prototype.elementMatched = function (element) {
    if (this.delegate.elementMatchedAttribute) {
      this.delegate.elementMatchedAttribute(element, this.attributeName);
    }
  };

  AttributeObserver.prototype.elementUnmatched = function (element) {
    if (this.delegate.elementUnmatchedAttribute) {
      this.delegate.elementUnmatchedAttribute(element, this.attributeName);
    }
  };

  AttributeObserver.prototype.elementAttributeChanged = function (element, attributeName) {
    if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
      this.delegate.elementAttributeValueChanged(element, attributeName);
    }
  };

  return AttributeObserver;
}();

exports.AttributeObserver = AttributeObserver;
},{"./element_observer":"../node_modules/@stimulus/mutation-observers/dist/element_observer.js"}],"../node_modules/@stimulus/mutation-observers/dist/string_map_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StringMapObserver = void 0;

var StringMapObserver = function () {
  function StringMapObserver(element, delegate) {
    var _this = this;

    this.element = element;
    this.delegate = delegate;
    this.started = false;
    this.stringMap = new Map();
    this.mutationObserver = new MutationObserver(function (mutations) {
      return _this.processMutations(mutations);
    });
  }

  StringMapObserver.prototype.start = function () {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, {
        attributes: true
      });
      this.refresh();
    }
  };

  StringMapObserver.prototype.stop = function () {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  };

  StringMapObserver.prototype.refresh = function () {
    if (this.started) {
      for (var _i = 0, _a = this.knownAttributeNames; _i < _a.length; _i++) {
        var attributeName = _a[_i];
        this.refreshAttribute(attributeName);
      }
    }
  }; // Mutation record processing


  StringMapObserver.prototype.processMutations = function (mutations) {
    if (this.started) {
      for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
        var mutation = mutations_1[_i];
        this.processMutation(mutation);
      }
    }
  };

  StringMapObserver.prototype.processMutation = function (mutation) {
    var attributeName = mutation.attributeName;

    if (attributeName) {
      this.refreshAttribute(attributeName);
    }
  }; // State tracking


  StringMapObserver.prototype.refreshAttribute = function (attributeName) {
    var key = this.delegate.getStringMapKeyForAttribute(attributeName);

    if (key != null) {
      if (!this.stringMap.has(attributeName)) {
        this.stringMapKeyAdded(key, attributeName);
      }

      var value = this.element.getAttribute(attributeName);

      if (this.stringMap.get(attributeName) != value) {
        this.stringMapValueChanged(value, key);
      }

      if (value == null) {
        this.stringMap.delete(attributeName);
        this.stringMapKeyRemoved(key, attributeName);
      } else {
        this.stringMap.set(attributeName, value);
      }
    }
  };

  StringMapObserver.prototype.stringMapKeyAdded = function (key, attributeName) {
    if (this.delegate.stringMapKeyAdded) {
      this.delegate.stringMapKeyAdded(key, attributeName);
    }
  };

  StringMapObserver.prototype.stringMapValueChanged = function (value, key) {
    if (this.delegate.stringMapValueChanged) {
      this.delegate.stringMapValueChanged(value, key);
    }
  };

  StringMapObserver.prototype.stringMapKeyRemoved = function (key, attributeName) {
    if (this.delegate.stringMapKeyRemoved) {
      this.delegate.stringMapKeyRemoved(key, attributeName);
    }
  };

  Object.defineProperty(StringMapObserver.prototype, "knownAttributeNames", {
    get: function () {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(StringMapObserver.prototype, "currentAttributeNames", {
    get: function () {
      return Array.from(this.element.attributes).map(function (attribute) {
        return attribute.name;
      });
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(StringMapObserver.prototype, "recordedAttributeNames", {
    get: function () {
      return Array.from(this.stringMap.keys());
    },
    enumerable: false,
    configurable: true
  });
  return StringMapObserver;
}();

exports.StringMapObserver = StringMapObserver;
},{}],"../node_modules/@stimulus/multimap/dist/set_operations.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;
exports.del = del;
exports.fetch = fetch;
exports.prune = prune;

function add(map, key, value) {
  fetch(map, key).add(value);
}

function del(map, key, value) {
  fetch(map, key).delete(value);
  prune(map, key);
}

function fetch(map, key) {
  var values = map.get(key);

  if (!values) {
    values = new Set();
    map.set(key, values);
  }

  return values;
}

function prune(map, key) {
  var values = map.get(key);

  if (values != null && values.size == 0) {
    map.delete(key);
  }
}
},{}],"../node_modules/@stimulus/multimap/dist/multimap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Multimap = void 0;

var _set_operations = require("./set_operations");

var Multimap = function () {
  function Multimap() {
    this.valuesByKey = new Map();
  }

  Object.defineProperty(Multimap.prototype, "values", {
    get: function () {
      var sets = Array.from(this.valuesByKey.values());
      return sets.reduce(function (values, set) {
        return values.concat(Array.from(set));
      }, []);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Multimap.prototype, "size", {
    get: function () {
      var sets = Array.from(this.valuesByKey.values());
      return sets.reduce(function (size, set) {
        return size + set.size;
      }, 0);
    },
    enumerable: false,
    configurable: true
  });

  Multimap.prototype.add = function (key, value) {
    (0, _set_operations.add)(this.valuesByKey, key, value);
  };

  Multimap.prototype.delete = function (key, value) {
    (0, _set_operations.del)(this.valuesByKey, key, value);
  };

  Multimap.prototype.has = function (key, value) {
    var values = this.valuesByKey.get(key);
    return values != null && values.has(value);
  };

  Multimap.prototype.hasKey = function (key) {
    return this.valuesByKey.has(key);
  };

  Multimap.prototype.hasValue = function (value) {
    var sets = Array.from(this.valuesByKey.values());
    return sets.some(function (set) {
      return set.has(value);
    });
  };

  Multimap.prototype.getValuesForKey = function (key) {
    var values = this.valuesByKey.get(key);
    return values ? Array.from(values) : [];
  };

  Multimap.prototype.getKeysForValue = function (value) {
    return Array.from(this.valuesByKey).filter(function (_a) {
      var key = _a[0],
          values = _a[1];
      return values.has(value);
    }).map(function (_a) {
      var key = _a[0],
          values = _a[1];
      return key;
    });
  };

  return Multimap;
}();

exports.Multimap = Multimap;
},{"./set_operations":"../node_modules/@stimulus/multimap/dist/set_operations.js"}],"../node_modules/@stimulus/multimap/dist/indexed_multimap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexedMultimap = void 0;

var _multimap = require("./multimap");

var _set_operations = require("./set_operations");

var __extends = void 0 && (void 0).__extends || function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    };

    return extendStatics(d, b);
  };

  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var IndexedMultimap = function (_super) {
  __extends(IndexedMultimap, _super);

  function IndexedMultimap() {
    var _this = _super.call(this) || this;

    _this.keysByValue = new Map();
    return _this;
  }

  Object.defineProperty(IndexedMultimap.prototype, "values", {
    get: function () {
      return Array.from(this.keysByValue.keys());
    },
    enumerable: false,
    configurable: true
  });

  IndexedMultimap.prototype.add = function (key, value) {
    _super.prototype.add.call(this, key, value);

    (0, _set_operations.add)(this.keysByValue, value, key);
  };

  IndexedMultimap.prototype.delete = function (key, value) {
    _super.prototype.delete.call(this, key, value);

    (0, _set_operations.del)(this.keysByValue, value, key);
  };

  IndexedMultimap.prototype.hasValue = function (value) {
    return this.keysByValue.has(value);
  };

  IndexedMultimap.prototype.getKeysForValue = function (value) {
    var set = this.keysByValue.get(value);
    return set ? Array.from(set) : [];
  };

  return IndexedMultimap;
}(_multimap.Multimap);

exports.IndexedMultimap = IndexedMultimap;
},{"./multimap":"../node_modules/@stimulus/multimap/dist/multimap.js","./set_operations":"../node_modules/@stimulus/multimap/dist/set_operations.js"}],"../node_modules/@stimulus/multimap/dist/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _indexed_multimap = require("./indexed_multimap");

Object.keys(_indexed_multimap).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _indexed_multimap[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _indexed_multimap[key];
    }
  });
});

var _multimap = require("./multimap");

Object.keys(_multimap).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _multimap[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _multimap[key];
    }
  });
});

var _set_operations = require("./set_operations");

Object.keys(_set_operations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _set_operations[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _set_operations[key];
    }
  });
});
},{"./indexed_multimap":"../node_modules/@stimulus/multimap/dist/indexed_multimap.js","./multimap":"../node_modules/@stimulus/multimap/dist/multimap.js","./set_operations":"../node_modules/@stimulus/multimap/dist/set_operations.js"}],"../node_modules/@stimulus/mutation-observers/dist/token_list_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenListObserver = void 0;

var _attribute_observer = require("./attribute_observer");

var _multimap = require("@stimulus/multimap");

var TokenListObserver = function () {
  function TokenListObserver(element, attributeName, delegate) {
    this.attributeObserver = new _attribute_observer.AttributeObserver(element, attributeName, this);
    this.delegate = delegate;
    this.tokensByElement = new _multimap.Multimap();
  }

  Object.defineProperty(TokenListObserver.prototype, "started", {
    get: function () {
      return this.attributeObserver.started;
    },
    enumerable: false,
    configurable: true
  });

  TokenListObserver.prototype.start = function () {
    this.attributeObserver.start();
  };

  TokenListObserver.prototype.stop = function () {
    this.attributeObserver.stop();
  };

  TokenListObserver.prototype.refresh = function () {
    this.attributeObserver.refresh();
  };

  Object.defineProperty(TokenListObserver.prototype, "element", {
    get: function () {
      return this.attributeObserver.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TokenListObserver.prototype, "attributeName", {
    get: function () {
      return this.attributeObserver.attributeName;
    },
    enumerable: false,
    configurable: true
  }); // Attribute observer delegate

  TokenListObserver.prototype.elementMatchedAttribute = function (element) {
    this.tokensMatched(this.readTokensForElement(element));
  };

  TokenListObserver.prototype.elementAttributeValueChanged = function (element) {
    var _a = this.refreshTokensForElement(element),
        unmatchedTokens = _a[0],
        matchedTokens = _a[1];

    this.tokensUnmatched(unmatchedTokens);
    this.tokensMatched(matchedTokens);
  };

  TokenListObserver.prototype.elementUnmatchedAttribute = function (element) {
    this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
  };

  TokenListObserver.prototype.tokensMatched = function (tokens) {
    var _this = this;

    tokens.forEach(function (token) {
      return _this.tokenMatched(token);
    });
  };

  TokenListObserver.prototype.tokensUnmatched = function (tokens) {
    var _this = this;

    tokens.forEach(function (token) {
      return _this.tokenUnmatched(token);
    });
  };

  TokenListObserver.prototype.tokenMatched = function (token) {
    this.delegate.tokenMatched(token);
    this.tokensByElement.add(token.element, token);
  };

  TokenListObserver.prototype.tokenUnmatched = function (token) {
    this.delegate.tokenUnmatched(token);
    this.tokensByElement.delete(token.element, token);
  };

  TokenListObserver.prototype.refreshTokensForElement = function (element) {
    var previousTokens = this.tokensByElement.getValuesForKey(element);
    var currentTokens = this.readTokensForElement(element);
    var firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(function (_a) {
      var previousToken = _a[0],
          currentToken = _a[1];
      return !tokensAreEqual(previousToken, currentToken);
    });

    if (firstDifferingIndex == -1) {
      return [[], []];
    } else {
      return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
    }
  };

  TokenListObserver.prototype.readTokensForElement = function (element) {
    var attributeName = this.attributeName;
    var tokenString = element.getAttribute(attributeName) || "";
    return parseTokenString(tokenString, element, attributeName);
  };

  return TokenListObserver;
}();

exports.TokenListObserver = TokenListObserver;

function parseTokenString(tokenString, element, attributeName) {
  return tokenString.trim().split(/\s+/).filter(function (content) {
    return content.length;
  }).map(function (content, index) {
    return {
      element: element,
      attributeName: attributeName,
      content: content,
      index: index
    };
  });
}

function zip(left, right) {
  var length = Math.max(left.length, right.length);
  return Array.from({
    length: length
  }, function (_, index) {
    return [left[index], right[index]];
  });
}

function tokensAreEqual(left, right) {
  return left && right && left.index == right.index && left.content == right.content;
}
},{"./attribute_observer":"../node_modules/@stimulus/mutation-observers/dist/attribute_observer.js","@stimulus/multimap":"../node_modules/@stimulus/multimap/dist/index.js"}],"../node_modules/@stimulus/mutation-observers/dist/value_list_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValueListObserver = void 0;

var _token_list_observer = require("./token_list_observer");

var ValueListObserver = function () {
  function ValueListObserver(element, attributeName, delegate) {
    this.tokenListObserver = new _token_list_observer.TokenListObserver(element, attributeName, this);
    this.delegate = delegate;
    this.parseResultsByToken = new WeakMap();
    this.valuesByTokenByElement = new WeakMap();
  }

  Object.defineProperty(ValueListObserver.prototype, "started", {
    get: function () {
      return this.tokenListObserver.started;
    },
    enumerable: false,
    configurable: true
  });

  ValueListObserver.prototype.start = function () {
    this.tokenListObserver.start();
  };

  ValueListObserver.prototype.stop = function () {
    this.tokenListObserver.stop();
  };

  ValueListObserver.prototype.refresh = function () {
    this.tokenListObserver.refresh();
  };

  Object.defineProperty(ValueListObserver.prototype, "element", {
    get: function () {
      return this.tokenListObserver.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ValueListObserver.prototype, "attributeName", {
    get: function () {
      return this.tokenListObserver.attributeName;
    },
    enumerable: false,
    configurable: true
  });

  ValueListObserver.prototype.tokenMatched = function (token) {
    var element = token.element;
    var value = this.fetchParseResultForToken(token).value;

    if (value) {
      this.fetchValuesByTokenForElement(element).set(token, value);
      this.delegate.elementMatchedValue(element, value);
    }
  };

  ValueListObserver.prototype.tokenUnmatched = function (token) {
    var element = token.element;
    var value = this.fetchParseResultForToken(token).value;

    if (value) {
      this.fetchValuesByTokenForElement(element).delete(token);
      this.delegate.elementUnmatchedValue(element, value);
    }
  };

  ValueListObserver.prototype.fetchParseResultForToken = function (token) {
    var parseResult = this.parseResultsByToken.get(token);

    if (!parseResult) {
      parseResult = this.parseToken(token);
      this.parseResultsByToken.set(token, parseResult);
    }

    return parseResult;
  };

  ValueListObserver.prototype.fetchValuesByTokenForElement = function (element) {
    var valuesByToken = this.valuesByTokenByElement.get(element);

    if (!valuesByToken) {
      valuesByToken = new Map();
      this.valuesByTokenByElement.set(element, valuesByToken);
    }

    return valuesByToken;
  };

  ValueListObserver.prototype.parseToken = function (token) {
    try {
      var value = this.delegate.parseValueForToken(token);
      return {
        value: value
      };
    } catch (error) {
      return {
        error: error
      };
    }
  };

  return ValueListObserver;
}();

exports.ValueListObserver = ValueListObserver;
},{"./token_list_observer":"../node_modules/@stimulus/mutation-observers/dist/token_list_observer.js"}],"../node_modules/@stimulus/mutation-observers/dist/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _attribute_observer = require("./attribute_observer");

Object.keys(_attribute_observer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _attribute_observer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _attribute_observer[key];
    }
  });
});

var _element_observer = require("./element_observer");

Object.keys(_element_observer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _element_observer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _element_observer[key];
    }
  });
});

var _string_map_observer = require("./string_map_observer");

Object.keys(_string_map_observer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _string_map_observer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _string_map_observer[key];
    }
  });
});

var _token_list_observer = require("./token_list_observer");

Object.keys(_token_list_observer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _token_list_observer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _token_list_observer[key];
    }
  });
});

var _value_list_observer = require("./value_list_observer");

Object.keys(_value_list_observer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _value_list_observer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _value_list_observer[key];
    }
  });
});
},{"./attribute_observer":"../node_modules/@stimulus/mutation-observers/dist/attribute_observer.js","./element_observer":"../node_modules/@stimulus/mutation-observers/dist/element_observer.js","./string_map_observer":"../node_modules/@stimulus/mutation-observers/dist/string_map_observer.js","./token_list_observer":"../node_modules/@stimulus/mutation-observers/dist/token_list_observer.js","./value_list_observer":"../node_modules/@stimulus/mutation-observers/dist/value_list_observer.js"}],"../node_modules/@stimulus/core/dist/binding_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BindingObserver = void 0;

var _action = require("./action");

var _binding = require("./binding");

var _mutationObservers = require("@stimulus/mutation-observers");

var BindingObserver = function () {
  function BindingObserver(context, delegate) {
    this.context = context;
    this.delegate = delegate;
    this.bindingsByAction = new Map();
  }

  BindingObserver.prototype.start = function () {
    if (!this.valueListObserver) {
      this.valueListObserver = new _mutationObservers.ValueListObserver(this.element, this.actionAttribute, this);
      this.valueListObserver.start();
    }
  };

  BindingObserver.prototype.stop = function () {
    if (this.valueListObserver) {
      this.valueListObserver.stop();
      delete this.valueListObserver;
      this.disconnectAllActions();
    }
  };

  Object.defineProperty(BindingObserver.prototype, "element", {
    get: function () {
      return this.context.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BindingObserver.prototype, "identifier", {
    get: function () {
      return this.context.identifier;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BindingObserver.prototype, "actionAttribute", {
    get: function () {
      return this.schema.actionAttribute;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BindingObserver.prototype, "schema", {
    get: function () {
      return this.context.schema;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BindingObserver.prototype, "bindings", {
    get: function () {
      return Array.from(this.bindingsByAction.values());
    },
    enumerable: false,
    configurable: true
  });

  BindingObserver.prototype.connectAction = function (action) {
    var binding = new _binding.Binding(this.context, action);
    this.bindingsByAction.set(action, binding);
    this.delegate.bindingConnected(binding);
  };

  BindingObserver.prototype.disconnectAction = function (action) {
    var binding = this.bindingsByAction.get(action);

    if (binding) {
      this.bindingsByAction.delete(action);
      this.delegate.bindingDisconnected(binding);
    }
  };

  BindingObserver.prototype.disconnectAllActions = function () {
    var _this = this;

    this.bindings.forEach(function (binding) {
      return _this.delegate.bindingDisconnected(binding);
    });
    this.bindingsByAction.clear();
  }; // Value observer delegate


  BindingObserver.prototype.parseValueForToken = function (token) {
    var action = _action.Action.forToken(token);

    if (action.identifier == this.identifier) {
      return action;
    }
  };

  BindingObserver.prototype.elementMatchedValue = function (element, action) {
    this.connectAction(action);
  };

  BindingObserver.prototype.elementUnmatchedValue = function (element, action) {
    this.disconnectAction(action);
  };

  return BindingObserver;
}();

exports.BindingObserver = BindingObserver;
},{"./action":"../node_modules/@stimulus/core/dist/action.js","./binding":"../node_modules/@stimulus/core/dist/binding.js","@stimulus/mutation-observers":"../node_modules/@stimulus/mutation-observers/dist/index.js"}],"../node_modules/@stimulus/core/dist/value_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValueObserver = void 0;

var _mutationObservers = require("@stimulus/mutation-observers");

var ValueObserver = function () {
  function ValueObserver(context, receiver) {
    this.context = context;
    this.receiver = receiver;
    this.stringMapObserver = new _mutationObservers.StringMapObserver(this.element, this);
    this.valueDescriptorMap = this.controller.valueDescriptorMap;
    this.invokeChangedCallbacksForDefaultValues();
  }

  ValueObserver.prototype.start = function () {
    this.stringMapObserver.start();
  };

  ValueObserver.prototype.stop = function () {
    this.stringMapObserver.stop();
  };

  Object.defineProperty(ValueObserver.prototype, "element", {
    get: function () {
      return this.context.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ValueObserver.prototype, "controller", {
    get: function () {
      return this.context.controller;
    },
    enumerable: false,
    configurable: true
  }); // String map observer delegate

  ValueObserver.prototype.getStringMapKeyForAttribute = function (attributeName) {
    if (attributeName in this.valueDescriptorMap) {
      return this.valueDescriptorMap[attributeName].name;
    }
  };

  ValueObserver.prototype.stringMapValueChanged = function (attributeValue, name) {
    this.invokeChangedCallbackForValue(name);
  };

  ValueObserver.prototype.invokeChangedCallbacksForDefaultValues = function () {
    for (var _i = 0, _a = this.valueDescriptors; _i < _a.length; _i++) {
      var _b = _a[_i],
          key = _b.key,
          name_1 = _b.name,
          defaultValue = _b.defaultValue;

      if (defaultValue != undefined && !this.controller.data.has(key)) {
        this.invokeChangedCallbackForValue(name_1);
      }
    }
  };

  ValueObserver.prototype.invokeChangedCallbackForValue = function (name) {
    var methodName = name + "Changed";
    var method = this.receiver[methodName];

    if (typeof method == "function") {
      var value = this.receiver[name];
      method.call(this.receiver, value);
    }
  };

  Object.defineProperty(ValueObserver.prototype, "valueDescriptors", {
    get: function () {
      var valueDescriptorMap = this.valueDescriptorMap;
      return Object.keys(valueDescriptorMap).map(function (key) {
        return valueDescriptorMap[key];
      });
    },
    enumerable: false,
    configurable: true
  });
  return ValueObserver;
}();

exports.ValueObserver = ValueObserver;
},{"@stimulus/mutation-observers":"../node_modules/@stimulus/mutation-observers/dist/index.js"}],"../node_modules/@stimulus/core/dist/context.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Context = void 0;

var _binding_observer = require("./binding_observer");

var _value_observer = require("./value_observer");

var Context = function () {
  function Context(module, scope) {
    this.module = module;
    this.scope = scope;
    this.controller = new module.controllerConstructor(this);
    this.bindingObserver = new _binding_observer.BindingObserver(this, this.dispatcher);
    this.valueObserver = new _value_observer.ValueObserver(this, this.controller);

    try {
      this.controller.initialize();
    } catch (error) {
      this.handleError(error, "initializing controller");
    }
  }

  Context.prototype.connect = function () {
    this.bindingObserver.start();
    this.valueObserver.start();

    try {
      this.controller.connect();
    } catch (error) {
      this.handleError(error, "connecting controller");
    }
  };

  Context.prototype.disconnect = function () {
    try {
      this.controller.disconnect();
    } catch (error) {
      this.handleError(error, "disconnecting controller");
    }

    this.valueObserver.stop();
    this.bindingObserver.stop();
  };

  Object.defineProperty(Context.prototype, "application", {
    get: function () {
      return this.module.application;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Context.prototype, "identifier", {
    get: function () {
      return this.module.identifier;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Context.prototype, "schema", {
    get: function () {
      return this.application.schema;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Context.prototype, "dispatcher", {
    get: function () {
      return this.application.dispatcher;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Context.prototype, "element", {
    get: function () {
      return this.scope.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Context.prototype, "parentElement", {
    get: function () {
      return this.element.parentElement;
    },
    enumerable: false,
    configurable: true
  }); // Error handling

  Context.prototype.handleError = function (error, message, detail) {
    if (detail === void 0) {
      detail = {};
    }

    var _a = this,
        identifier = _a.identifier,
        controller = _a.controller,
        element = _a.element;

    detail = Object.assign({
      identifier: identifier,
      controller: controller,
      element: element
    }, detail);
    this.application.handleError(error, "Error " + message, detail);
  };

  return Context;
}();

exports.Context = Context;
},{"./binding_observer":"../node_modules/@stimulus/core/dist/binding_observer.js","./value_observer":"../node_modules/@stimulus/core/dist/value_observer.js"}],"../node_modules/@stimulus/core/dist/inheritable_statics.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readInheritableStaticArrayValues = readInheritableStaticArrayValues;
exports.readInheritableStaticObjectPairs = readInheritableStaticObjectPairs;

function readInheritableStaticArrayValues(constructor, propertyName) {
  var ancestors = getAncestorsForConstructor(constructor);
  return Array.from(ancestors.reduce(function (values, constructor) {
    getOwnStaticArrayValues(constructor, propertyName).forEach(function (name) {
      return values.add(name);
    });
    return values;
  }, new Set()));
}

function readInheritableStaticObjectPairs(constructor, propertyName) {
  var ancestors = getAncestorsForConstructor(constructor);
  return ancestors.reduce(function (pairs, constructor) {
    pairs.push.apply(pairs, getOwnStaticObjectPairs(constructor, propertyName));
    return pairs;
  }, []);
}

function getAncestorsForConstructor(constructor) {
  var ancestors = [];

  while (constructor) {
    ancestors.push(constructor);
    constructor = Object.getPrototypeOf(constructor);
  }

  return ancestors.reverse();
}

function getOwnStaticArrayValues(constructor, propertyName) {
  var definition = constructor[propertyName];
  return Array.isArray(definition) ? definition : [];
}

function getOwnStaticObjectPairs(constructor, propertyName) {
  var definition = constructor[propertyName];
  return definition ? Object.keys(definition).map(function (key) {
    return [key, definition[key]];
  }) : [];
}
},{}],"../node_modules/@stimulus/core/dist/blessing.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bless = bless;

var _inheritable_statics = require("./inheritable_statics");

var __extends = void 0 && (void 0).__extends || function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    };

    return extendStatics(d, b);
  };

  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
};

/** @hidden */
function bless(constructor) {
  return shadow(constructor, getBlessedProperties(constructor));
}

function shadow(constructor, properties) {
  var shadowConstructor = extend(constructor);
  var shadowProperties = getShadowProperties(constructor.prototype, properties);
  Object.defineProperties(shadowConstructor.prototype, shadowProperties);
  return shadowConstructor;
}

function getBlessedProperties(constructor) {
  var blessings = (0, _inheritable_statics.readInheritableStaticArrayValues)(constructor, "blessings");
  return blessings.reduce(function (blessedProperties, blessing) {
    var properties = blessing(constructor);

    for (var key in properties) {
      var descriptor = blessedProperties[key] || {};
      blessedProperties[key] = Object.assign(descriptor, properties[key]);
    }

    return blessedProperties;
  }, {});
}

function getShadowProperties(prototype, properties) {
  return getOwnKeys(properties).reduce(function (shadowProperties, key) {
    var _a;

    var descriptor = getShadowedDescriptor(prototype, properties, key);

    if (descriptor) {
      Object.assign(shadowProperties, (_a = {}, _a[key] = descriptor, _a));
    }

    return shadowProperties;
  }, {});
}

function getShadowedDescriptor(prototype, properties, key) {
  var shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
  var shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;

  if (!shadowedByValue) {
    var descriptor = Object.getOwnPropertyDescriptor(properties, key).value;

    if (shadowingDescriptor) {
      descriptor.get = shadowingDescriptor.get || descriptor.get;
      descriptor.set = shadowingDescriptor.set || descriptor.set;
    }

    return descriptor;
  }
}

var getOwnKeys = function () {
  if (typeof Object.getOwnPropertySymbols == "function") {
    return function (object) {
      return __spreadArrays(Object.getOwnPropertyNames(object), Object.getOwnPropertySymbols(object));
    };
  } else {
    return Object.getOwnPropertyNames;
  }
}();

var extend = function () {
  function extendWithReflect(constructor) {
    function extended() {
      var _newTarget = this && this instanceof extended ? this.constructor : void 0;

      return Reflect.construct(constructor, arguments, _newTarget);
    }

    extended.prototype = Object.create(constructor.prototype, {
      constructor: {
        value: extended
      }
    });
    Reflect.setPrototypeOf(extended, constructor);
    return extended;
  }

  function testReflectExtension() {
    var a = function () {
      this.a.call(this);
    };

    var b = extendWithReflect(a);

    b.prototype.a = function () {};

    return new b();
  }

  try {
    testReflectExtension();
    return extendWithReflect;
  } catch (error) {
    return function (constructor) {
      return function (_super) {
        __extends(extended, _super);

        function extended() {
          return _super !== null && _super.apply(this, arguments) || this;
        }

        return extended;
      }(constructor);
    };
  }
}();
},{"./inheritable_statics":"../node_modules/@stimulus/core/dist/inheritable_statics.js"}],"../node_modules/@stimulus/core/dist/definition.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blessDefinition = blessDefinition;

var _blessing = require("./blessing");

/** @hidden */
function blessDefinition(definition) {
  return {
    identifier: definition.identifier,
    controllerConstructor: (0, _blessing.bless)(definition.controllerConstructor)
  };
}
},{"./blessing":"../node_modules/@stimulus/core/dist/blessing.js"}],"../node_modules/@stimulus/core/dist/module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Module = void 0;

var _context = require("./context");

var _definition = require("./definition");

var Module = function () {
  function Module(application, definition) {
    this.application = application;
    this.definition = (0, _definition.blessDefinition)(definition);
    this.contextsByScope = new WeakMap();
    this.connectedContexts = new Set();
  }

  Object.defineProperty(Module.prototype, "identifier", {
    get: function () {
      return this.definition.identifier;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Module.prototype, "controllerConstructor", {
    get: function () {
      return this.definition.controllerConstructor;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Module.prototype, "contexts", {
    get: function () {
      return Array.from(this.connectedContexts);
    },
    enumerable: false,
    configurable: true
  });

  Module.prototype.connectContextForScope = function (scope) {
    var context = this.fetchContextForScope(scope);
    this.connectedContexts.add(context);
    context.connect();
  };

  Module.prototype.disconnectContextForScope = function (scope) {
    var context = this.contextsByScope.get(scope);

    if (context) {
      this.connectedContexts.delete(context);
      context.disconnect();
    }
  };

  Module.prototype.fetchContextForScope = function (scope) {
    var context = this.contextsByScope.get(scope);

    if (!context) {
      context = new _context.Context(this, scope);
      this.contextsByScope.set(scope, context);
    }

    return context;
  };

  return Module;
}();

exports.Module = Module;
},{"./context":"../node_modules/@stimulus/core/dist/context.js","./definition":"../node_modules/@stimulus/core/dist/definition.js"}],"../node_modules/@stimulus/core/dist/class_map.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClassMap = void 0;

var ClassMap = function () {
  function ClassMap(scope) {
    this.scope = scope;
  }

  ClassMap.prototype.has = function (name) {
    return this.data.has(this.getDataKey(name));
  };

  ClassMap.prototype.get = function (name) {
    return this.data.get(this.getDataKey(name));
  };

  ClassMap.prototype.getAttributeName = function (name) {
    return this.data.getAttributeNameForKey(this.getDataKey(name));
  };

  ClassMap.prototype.getDataKey = function (name) {
    return name + "-class";
  };

  Object.defineProperty(ClassMap.prototype, "data", {
    get: function () {
      return this.scope.data;
    },
    enumerable: false,
    configurable: true
  });
  return ClassMap;
}();

exports.ClassMap = ClassMap;
},{}],"../node_modules/@stimulus/core/dist/string_helpers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.camelize = camelize;
exports.capitalize = capitalize;
exports.dasherize = dasherize;

function camelize(value) {
  return value.replace(/(?:[_-])([a-z0-9])/g, function (_, char) {
    return char.toUpperCase();
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function dasherize(value) {
  return value.replace(/([A-Z])/g, function (_, char) {
    return "-" + char.toLowerCase();
  });
}
},{}],"../node_modules/@stimulus/core/dist/data_map.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataMap = void 0;

var _string_helpers = require("./string_helpers");

var DataMap = function () {
  function DataMap(scope) {
    this.scope = scope;
  }

  Object.defineProperty(DataMap.prototype, "element", {
    get: function () {
      return this.scope.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DataMap.prototype, "identifier", {
    get: function () {
      return this.scope.identifier;
    },
    enumerable: false,
    configurable: true
  });

  DataMap.prototype.get = function (key) {
    var name = this.getAttributeNameForKey(key);
    return this.element.getAttribute(name);
  };

  DataMap.prototype.set = function (key, value) {
    var name = this.getAttributeNameForKey(key);
    this.element.setAttribute(name, value);
    return this.get(key);
  };

  DataMap.prototype.has = function (key) {
    var name = this.getAttributeNameForKey(key);
    return this.element.hasAttribute(name);
  };

  DataMap.prototype.delete = function (key) {
    if (this.has(key)) {
      var name_1 = this.getAttributeNameForKey(key);
      this.element.removeAttribute(name_1);
      return true;
    } else {
      return false;
    }
  };

  DataMap.prototype.getAttributeNameForKey = function (key) {
    return "data-" + this.identifier + "-" + (0, _string_helpers.dasherize)(key);
  };

  return DataMap;
}();

exports.DataMap = DataMap;
},{"./string_helpers":"../node_modules/@stimulus/core/dist/string_helpers.js"}],"../node_modules/@stimulus/core/dist/guide.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Guide = void 0;

var Guide = function () {
  function Guide(logger) {
    this.warnedKeysByObject = new WeakMap();
    this.logger = logger;
  }

  Guide.prototype.warn = function (object, key, message) {
    var warnedKeys = this.warnedKeysByObject.get(object);

    if (!warnedKeys) {
      warnedKeys = new Set();
      this.warnedKeysByObject.set(object, warnedKeys);
    }

    if (!warnedKeys.has(key)) {
      warnedKeys.add(key);
      this.logger.warn(message, object);
    }
  };

  return Guide;
}();

exports.Guide = Guide;
},{}],"../node_modules/@stimulus/core/dist/selectors.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attributeValueContainsToken = attributeValueContainsToken;

/** @hidden */
function attributeValueContainsToken(attributeName, token) {
  return "[" + attributeName + "~=\"" + token + "\"]";
}
},{}],"../node_modules/@stimulus/core/dist/target_set.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TargetSet = void 0;

var _selectors = require("./selectors");

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
};

var TargetSet = function () {
  function TargetSet(scope) {
    this.scope = scope;
  }

  Object.defineProperty(TargetSet.prototype, "element", {
    get: function () {
      return this.scope.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TargetSet.prototype, "identifier", {
    get: function () {
      return this.scope.identifier;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TargetSet.prototype, "schema", {
    get: function () {
      return this.scope.schema;
    },
    enumerable: false,
    configurable: true
  });

  TargetSet.prototype.has = function (targetName) {
    return this.find(targetName) != null;
  };

  TargetSet.prototype.find = function () {
    var _this = this;

    var targetNames = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      targetNames[_i] = arguments[_i];
    }

    return targetNames.reduce(function (target, targetName) {
      return target || _this.findTarget(targetName) || _this.findLegacyTarget(targetName);
    }, undefined);
  };

  TargetSet.prototype.findAll = function () {
    var _this = this;

    var targetNames = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      targetNames[_i] = arguments[_i];
    }

    return targetNames.reduce(function (targets, targetName) {
      return __spreadArrays(targets, _this.findAllTargets(targetName), _this.findAllLegacyTargets(targetName));
    }, []);
  };

  TargetSet.prototype.findTarget = function (targetName) {
    var selector = this.getSelectorForTargetName(targetName);
    return this.scope.findElement(selector);
  };

  TargetSet.prototype.findAllTargets = function (targetName) {
    var selector = this.getSelectorForTargetName(targetName);
    return this.scope.findAllElements(selector);
  };

  TargetSet.prototype.getSelectorForTargetName = function (targetName) {
    var attributeName = "data-" + this.identifier + "-target";
    return (0, _selectors.attributeValueContainsToken)(attributeName, targetName);
  };

  TargetSet.prototype.findLegacyTarget = function (targetName) {
    var selector = this.getLegacySelectorForTargetName(targetName);
    return this.deprecate(this.scope.findElement(selector), targetName);
  };

  TargetSet.prototype.findAllLegacyTargets = function (targetName) {
    var _this = this;

    var selector = this.getLegacySelectorForTargetName(targetName);
    return this.scope.findAllElements(selector).map(function (element) {
      return _this.deprecate(element, targetName);
    });
  };

  TargetSet.prototype.getLegacySelectorForTargetName = function (targetName) {
    var targetDescriptor = this.identifier + "." + targetName;
    return (0, _selectors.attributeValueContainsToken)(this.schema.targetAttribute, targetDescriptor);
  };

  TargetSet.prototype.deprecate = function (element, targetName) {
    if (element) {
      var identifier = this.identifier;
      var attributeName = this.schema.targetAttribute;
      this.guide.warn(element, "target:" + targetName, "Please replace " + attributeName + "=\"" + identifier + "." + targetName + "\" with data-" + identifier + "-target=\"" + targetName + "\". " + ("The " + attributeName + " attribute is deprecated and will be removed in a future version of Stimulus."));
    }

    return element;
  };

  Object.defineProperty(TargetSet.prototype, "guide", {
    get: function () {
      return this.scope.guide;
    },
    enumerable: false,
    configurable: true
  });
  return TargetSet;
}();

exports.TargetSet = TargetSet;
},{"./selectors":"../node_modules/@stimulus/core/dist/selectors.js"}],"../node_modules/@stimulus/core/dist/scope.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scope = void 0;

var _class_map = require("./class_map");

var _data_map = require("./data_map");

var _guide = require("./guide");

var _selectors = require("./selectors");

var _target_set = require("./target_set");

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
};

var Scope = function () {
  function Scope(schema, element, identifier, logger) {
    var _this = this;

    this.targets = new _target_set.TargetSet(this);
    this.classes = new _class_map.ClassMap(this);
    this.data = new _data_map.DataMap(this);

    this.containsElement = function (element) {
      return element.closest(_this.controllerSelector) === _this.element;
    };

    this.schema = schema;
    this.element = element;
    this.identifier = identifier;
    this.guide = new _guide.Guide(logger);
  }

  Scope.prototype.findElement = function (selector) {
    return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
  };

  Scope.prototype.findAllElements = function (selector) {
    return __spreadArrays(this.element.matches(selector) ? [this.element] : [], this.queryElements(selector).filter(this.containsElement));
  };

  Scope.prototype.queryElements = function (selector) {
    return Array.from(this.element.querySelectorAll(selector));
  };

  Object.defineProperty(Scope.prototype, "controllerSelector", {
    get: function () {
      return (0, _selectors.attributeValueContainsToken)(this.schema.controllerAttribute, this.identifier);
    },
    enumerable: false,
    configurable: true
  });
  return Scope;
}();

exports.Scope = Scope;
},{"./class_map":"../node_modules/@stimulus/core/dist/class_map.js","./data_map":"../node_modules/@stimulus/core/dist/data_map.js","./guide":"../node_modules/@stimulus/core/dist/guide.js","./selectors":"../node_modules/@stimulus/core/dist/selectors.js","./target_set":"../node_modules/@stimulus/core/dist/target_set.js"}],"../node_modules/@stimulus/core/dist/scope_observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScopeObserver = void 0;

var _mutationObservers = require("@stimulus/mutation-observers");

var ScopeObserver = function () {
  function ScopeObserver(element, schema, delegate) {
    this.element = element;
    this.schema = schema;
    this.delegate = delegate;
    this.valueListObserver = new _mutationObservers.ValueListObserver(this.element, this.controllerAttribute, this);
    this.scopesByIdentifierByElement = new WeakMap();
    this.scopeReferenceCounts = new WeakMap();
  }

  ScopeObserver.prototype.start = function () {
    this.valueListObserver.start();
  };

  ScopeObserver.prototype.stop = function () {
    this.valueListObserver.stop();
  };

  Object.defineProperty(ScopeObserver.prototype, "controllerAttribute", {
    get: function () {
      return this.schema.controllerAttribute;
    },
    enumerable: false,
    configurable: true
  }); // Value observer delegate

  /** @hidden */

  ScopeObserver.prototype.parseValueForToken = function (token) {
    var element = token.element,
        identifier = token.content;
    var scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
    var scope = scopesByIdentifier.get(identifier);

    if (!scope) {
      scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
      scopesByIdentifier.set(identifier, scope);
    }

    return scope;
  };
  /** @hidden */


  ScopeObserver.prototype.elementMatchedValue = function (element, value) {
    var referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
    this.scopeReferenceCounts.set(value, referenceCount);

    if (referenceCount == 1) {
      this.delegate.scopeConnected(value);
    }
  };
  /** @hidden */


  ScopeObserver.prototype.elementUnmatchedValue = function (element, value) {
    var referenceCount = this.scopeReferenceCounts.get(value);

    if (referenceCount) {
      this.scopeReferenceCounts.set(value, referenceCount - 1);

      if (referenceCount == 1) {
        this.delegate.scopeDisconnected(value);
      }
    }
  };

  ScopeObserver.prototype.fetchScopesByIdentifierForElement = function (element) {
    var scopesByIdentifier = this.scopesByIdentifierByElement.get(element);

    if (!scopesByIdentifier) {
      scopesByIdentifier = new Map();
      this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
    }

    return scopesByIdentifier;
  };

  return ScopeObserver;
}();

exports.ScopeObserver = ScopeObserver;
},{"@stimulus/mutation-observers":"../node_modules/@stimulus/mutation-observers/dist/index.js"}],"../node_modules/@stimulus/core/dist/router.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Router = void 0;

var _module = require("./module");

var _multimap = require("@stimulus/multimap");

var _scope = require("./scope");

var _scope_observer = require("./scope_observer");

var Router = function () {
  function Router(application) {
    this.application = application;
    this.scopeObserver = new _scope_observer.ScopeObserver(this.element, this.schema, this);
    this.scopesByIdentifier = new _multimap.Multimap();
    this.modulesByIdentifier = new Map();
  }

  Object.defineProperty(Router.prototype, "element", {
    get: function () {
      return this.application.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Router.prototype, "schema", {
    get: function () {
      return this.application.schema;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Router.prototype, "logger", {
    get: function () {
      return this.application.logger;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Router.prototype, "controllerAttribute", {
    get: function () {
      return this.schema.controllerAttribute;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Router.prototype, "modules", {
    get: function () {
      return Array.from(this.modulesByIdentifier.values());
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Router.prototype, "contexts", {
    get: function () {
      return this.modules.reduce(function (contexts, module) {
        return contexts.concat(module.contexts);
      }, []);
    },
    enumerable: false,
    configurable: true
  });

  Router.prototype.start = function () {
    this.scopeObserver.start();
  };

  Router.prototype.stop = function () {
    this.scopeObserver.stop();
  };

  Router.prototype.loadDefinition = function (definition) {
    this.unloadIdentifier(definition.identifier);
    var module = new _module.Module(this.application, definition);
    this.connectModule(module);
  };

  Router.prototype.unloadIdentifier = function (identifier) {
    var module = this.modulesByIdentifier.get(identifier);

    if (module) {
      this.disconnectModule(module);
    }
  };

  Router.prototype.getContextForElementAndIdentifier = function (element, identifier) {
    var module = this.modulesByIdentifier.get(identifier);

    if (module) {
      return module.contexts.find(function (context) {
        return context.element == element;
      });
    }
  }; // Error handler delegate

  /** @hidden */


  Router.prototype.handleError = function (error, message, detail) {
    this.application.handleError(error, message, detail);
  }; // Scope observer delegate

  /** @hidden */


  Router.prototype.createScopeForElementAndIdentifier = function (element, identifier) {
    return new _scope.Scope(this.schema, element, identifier, this.logger);
  };
  /** @hidden */


  Router.prototype.scopeConnected = function (scope) {
    this.scopesByIdentifier.add(scope.identifier, scope);
    var module = this.modulesByIdentifier.get(scope.identifier);

    if (module) {
      module.connectContextForScope(scope);
    }
  };
  /** @hidden */


  Router.prototype.scopeDisconnected = function (scope) {
    this.scopesByIdentifier.delete(scope.identifier, scope);
    var module = this.modulesByIdentifier.get(scope.identifier);

    if (module) {
      module.disconnectContextForScope(scope);
    }
  }; // Modules


  Router.prototype.connectModule = function (module) {
    this.modulesByIdentifier.set(module.identifier, module);
    var scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach(function (scope) {
      return module.connectContextForScope(scope);
    });
  };

  Router.prototype.disconnectModule = function (module) {
    this.modulesByIdentifier.delete(module.identifier);
    var scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach(function (scope) {
      return module.disconnectContextForScope(scope);
    });
  };

  return Router;
}();

exports.Router = Router;
},{"./module":"../node_modules/@stimulus/core/dist/module.js","@stimulus/multimap":"../node_modules/@stimulus/multimap/dist/index.js","./scope":"../node_modules/@stimulus/core/dist/scope.js","./scope_observer":"../node_modules/@stimulus/core/dist/scope_observer.js"}],"../node_modules/@stimulus/core/dist/schema.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultSchema = void 0;
var defaultSchema = {
  controllerAttribute: "data-controller",
  actionAttribute: "data-action",
  targetAttribute: "data-target"
};
exports.defaultSchema = defaultSchema;
},{}],"../node_modules/@stimulus/core/dist/application.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Application = void 0;

var _dispatcher = require("./dispatcher");

var _router = require("./router");

var _schema = require("./schema");

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
};

var Application = function () {
  function Application(element, schema) {
    if (element === void 0) {
      element = document.documentElement;
    }

    if (schema === void 0) {
      schema = _schema.defaultSchema;
    }

    this.logger = console;
    this.element = element;
    this.schema = schema;
    this.dispatcher = new _dispatcher.Dispatcher(this);
    this.router = new _router.Router(this);
  }

  Application.start = function (element, schema) {
    var application = new Application(element, schema);
    application.start();
    return application;
  };

  Application.prototype.start = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , domReady()];

          case 1:
            _a.sent();

            this.dispatcher.start();
            this.router.start();
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  Application.prototype.stop = function () {
    this.dispatcher.stop();
    this.router.stop();
  };

  Application.prototype.register = function (identifier, controllerConstructor) {
    this.load({
      identifier: identifier,
      controllerConstructor: controllerConstructor
    });
  };

  Application.prototype.load = function (head) {
    var _this = this;

    var rest = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      rest[_i - 1] = arguments[_i];
    }

    var definitions = Array.isArray(head) ? head : __spreadArrays([head], rest);
    definitions.forEach(function (definition) {
      return _this.router.loadDefinition(definition);
    });
  };

  Application.prototype.unload = function (head) {
    var _this = this;

    var rest = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      rest[_i - 1] = arguments[_i];
    }

    var identifiers = Array.isArray(head) ? head : __spreadArrays([head], rest);
    identifiers.forEach(function (identifier) {
      return _this.router.unloadIdentifier(identifier);
    });
  };

  Object.defineProperty(Application.prototype, "controllers", {
    // Controllers
    get: function () {
      return this.router.contexts.map(function (context) {
        return context.controller;
      });
    },
    enumerable: false,
    configurable: true
  });

  Application.prototype.getControllerForElementAndIdentifier = function (element, identifier) {
    var context = this.router.getContextForElementAndIdentifier(element, identifier);
    return context ? context.controller : null;
  }; // Error handling


  Application.prototype.handleError = function (error, message, detail) {
    this.logger.error("%s\n\n%o\n\n%o", message, error, detail);
  };

  return Application;
}();

exports.Application = Application;

function domReady() {
  return new Promise(function (resolve) {
    if (document.readyState == "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });
}
},{"./dispatcher":"../node_modules/@stimulus/core/dist/dispatcher.js","./router":"../node_modules/@stimulus/core/dist/router.js","./schema":"../node_modules/@stimulus/core/dist/schema.js"}],"../node_modules/@stimulus/core/dist/class_properties.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClassPropertiesBlessing = ClassPropertiesBlessing;

var _inheritable_statics = require("./inheritable_statics");

var _string_helpers = require("./string_helpers");

/** @hidden */
function ClassPropertiesBlessing(constructor) {
  var classes = (0, _inheritable_statics.readInheritableStaticArrayValues)(constructor, "classes");
  return classes.reduce(function (properties, classDefinition) {
    return Object.assign(properties, propertiesForClassDefinition(classDefinition));
  }, {});
}

function propertiesForClassDefinition(key) {
  var _a;

  var name = key + "Class";
  return _a = {}, _a[name] = {
    get: function () {
      var classes = this.classes;

      if (classes.has(key)) {
        return classes.get(key);
      } else {
        var attribute = classes.getAttributeName(key);
        throw new Error("Missing attribute \"" + attribute + "\"");
      }
    }
  }, _a["has" + (0, _string_helpers.capitalize)(name)] = {
    get: function () {
      return this.classes.has(key);
    }
  }, _a;
}
},{"./inheritable_statics":"../node_modules/@stimulus/core/dist/inheritable_statics.js","./string_helpers":"../node_modules/@stimulus/core/dist/string_helpers.js"}],"../node_modules/@stimulus/core/dist/target_properties.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TargetPropertiesBlessing = TargetPropertiesBlessing;

var _inheritable_statics = require("./inheritable_statics");

var _string_helpers = require("./string_helpers");

/** @hidden */
function TargetPropertiesBlessing(constructor) {
  var targets = (0, _inheritable_statics.readInheritableStaticArrayValues)(constructor, "targets");
  return targets.reduce(function (properties, targetDefinition) {
    return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
  }, {});
}

function propertiesForTargetDefinition(name) {
  var _a;

  return _a = {}, _a[name + "Target"] = {
    get: function () {
      var target = this.targets.find(name);

      if (target) {
        return target;
      } else {
        throw new Error("Missing target element \"" + this.identifier + "." + name + "\"");
      }
    }
  }, _a[name + "Targets"] = {
    get: function () {
      return this.targets.findAll(name);
    }
  }, _a["has" + (0, _string_helpers.capitalize)(name) + "Target"] = {
    get: function () {
      return this.targets.has(name);
    }
  }, _a;
}
},{"./inheritable_statics":"../node_modules/@stimulus/core/dist/inheritable_statics.js","./string_helpers":"../node_modules/@stimulus/core/dist/string_helpers.js"}],"../node_modules/@stimulus/core/dist/value_properties.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValuePropertiesBlessing = ValuePropertiesBlessing;
exports.propertiesForValueDefinitionPair = propertiesForValueDefinitionPair;

var _inheritable_statics = require("./inheritable_statics");

var _string_helpers = require("./string_helpers");

/** @hidden */
function ValuePropertiesBlessing(constructor) {
  var valueDefinitionPairs = (0, _inheritable_statics.readInheritableStaticObjectPairs)(constructor, "values");
  var propertyDescriptorMap = {
    valueDescriptorMap: {
      get: function () {
        var _this = this;

        return valueDefinitionPairs.reduce(function (result, valueDefinitionPair) {
          var _a;

          var valueDescriptor = parseValueDefinitionPair(valueDefinitionPair);

          var attributeName = _this.data.getAttributeNameForKey(valueDescriptor.key);

          return Object.assign(result, (_a = {}, _a[attributeName] = valueDescriptor, _a));
        }, {});
      }
    }
  };
  return valueDefinitionPairs.reduce(function (properties, valueDefinitionPair) {
    return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
  }, propertyDescriptorMap);
}
/** @hidden */


function propertiesForValueDefinitionPair(valueDefinitionPair) {
  var _a;

  var definition = parseValueDefinitionPair(valueDefinitionPair);
  var type = definition.type,
      key = definition.key,
      name = definition.name;
  var read = readers[type],
      write = writers[type] || writers.default;
  return _a = {}, _a[name] = {
    get: function () {
      var value = this.data.get(key);

      if (value !== null) {
        return read(value);
      } else {
        return definition.defaultValue;
      }
    },
    set: function (value) {
      if (value === undefined) {
        this.data.delete(key);
      } else {
        this.data.set(key, write(value));
      }
    }
  }, _a["has" + (0, _string_helpers.capitalize)(name)] = {
    get: function () {
      return this.data.has(key);
    }
  }, _a;
}

function parseValueDefinitionPair(_a) {
  var token = _a[0],
      typeConstant = _a[1];
  var type = parseValueTypeConstant(typeConstant);
  return valueDescriptorForTokenAndType(token, type);
}

function parseValueTypeConstant(typeConstant) {
  switch (typeConstant) {
    case Array:
      return "array";

    case Boolean:
      return "boolean";

    case Number:
      return "number";

    case Object:
      return "object";

    case String:
      return "string";
  }

  throw new Error("Unknown value type constant \"" + typeConstant + "\"");
}

function valueDescriptorForTokenAndType(token, type) {
  var key = (0, _string_helpers.dasherize)(token) + "-value";
  return {
    type: type,
    key: key,
    name: (0, _string_helpers.camelize)(key),

    get defaultValue() {
      return defaultValuesByType[type];
    }

  };
}

var defaultValuesByType = {
  get array() {
    return [];
  },

  boolean: false,
  number: 0,

  get object() {
    return {};
  },

  string: ""
};
var readers = {
  array: function (value) {
    var array = JSON.parse(value);

    if (!Array.isArray(array)) {
      throw new TypeError("Expected array");
    }

    return array;
  },
  boolean: function (value) {
    return !(value == "0" || value == "false");
  },
  number: function (value) {
    return parseFloat(value);
  },
  object: function (value) {
    var object = JSON.parse(value);

    if (object === null || typeof object != "object" || Array.isArray(object)) {
      throw new TypeError("Expected object");
    }

    return object;
  },
  string: function (value) {
    return value;
  }
};
var writers = {
  default: writeString,
  array: writeJSON,
  object: writeJSON
};

function writeJSON(value) {
  return JSON.stringify(value);
}

function writeString(value) {
  return "" + value;
}
},{"./inheritable_statics":"../node_modules/@stimulus/core/dist/inheritable_statics.js","./string_helpers":"../node_modules/@stimulus/core/dist/string_helpers.js"}],"../node_modules/@stimulus/core/dist/controller.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = void 0;

var _class_properties = require("./class_properties");

var _target_properties = require("./target_properties");

var _value_properties = require("./value_properties");

var Controller = function () {
  function Controller(context) {
    this.context = context;
  }

  Object.defineProperty(Controller.prototype, "application", {
    get: function () {
      return this.context.application;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Controller.prototype, "scope", {
    get: function () {
      return this.context.scope;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Controller.prototype, "element", {
    get: function () {
      return this.scope.element;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Controller.prototype, "identifier", {
    get: function () {
      return this.scope.identifier;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Controller.prototype, "targets", {
    get: function () {
      return this.scope.targets;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Controller.prototype, "classes", {
    get: function () {
      return this.scope.classes;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Controller.prototype, "data", {
    get: function () {
      return this.scope.data;
    },
    enumerable: false,
    configurable: true
  });

  Controller.prototype.initialize = function () {// Override in your subclass to set up initial controller state
  };

  Controller.prototype.connect = function () {// Override in your subclass to respond when the controller is connected to the DOM
  };

  Controller.prototype.disconnect = function () {// Override in your subclass to respond when the controller is disconnected from the DOM
  };

  Controller.blessings = [_class_properties.ClassPropertiesBlessing, _target_properties.TargetPropertiesBlessing, _value_properties.ValuePropertiesBlessing];
  Controller.targets = [];
  Controller.values = {};
  return Controller;
}();

exports.Controller = Controller;
},{"./class_properties":"../node_modules/@stimulus/core/dist/class_properties.js","./target_properties":"../node_modules/@stimulus/core/dist/target_properties.js","./value_properties":"../node_modules/@stimulus/core/dist/value_properties.js"}],"../node_modules/@stimulus/core/dist/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Application", {
  enumerable: true,
  get: function () {
    return _application.Application;
  }
});
Object.defineProperty(exports, "Context", {
  enumerable: true,
  get: function () {
    return _context.Context;
  }
});
Object.defineProperty(exports, "Controller", {
  enumerable: true,
  get: function () {
    return _controller.Controller;
  }
});
Object.defineProperty(exports, "defaultSchema", {
  enumerable: true,
  get: function () {
    return _schema.defaultSchema;
  }
});

var _application = require("./application");

var _context = require("./context");

var _controller = require("./controller");

var _schema = require("./schema");
},{"./application":"../node_modules/@stimulus/core/dist/application.js","./context":"../node_modules/@stimulus/core/dist/context.js","./controller":"../node_modules/@stimulus/core/dist/controller.js","./schema":"../node_modules/@stimulus/core/dist/schema.js"}],"../node_modules/stimulus/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require("@stimulus/core");

Object.keys(_core).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _core[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _core[key];
    }
  });
});
},{"@stimulus/core":"../node_modules/@stimulus/core/dist/index.js"}],"../node_modules/@stimulus/webpack-helpers/dist/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.definitionsFromContext = definitionsFromContext;
exports.identifierForContextKey = identifierForContextKey;

function definitionsFromContext(context) {
  return context.keys().map(function (key) {
    return definitionForModuleWithContextAndKey(context, key);
  }).filter(function (value) {
    return value;
  });
}

function definitionForModuleWithContextAndKey(context, key) {
  var identifier = identifierForContextKey(key);

  if (identifier) {
    return definitionForModuleAndIdentifier(context(key), identifier);
  }
}

function definitionForModuleAndIdentifier(module, identifier) {
  var controllerConstructor = module.default;

  if (typeof controllerConstructor == "function") {
    return {
      identifier: identifier,
      controllerConstructor: controllerConstructor
    };
  }
}

function identifierForContextKey(key) {
  var logicalName = (key.match(/^(?:\.\/)?(.+)(?:[_-]controller\..+?)$/) || [])[1];

  if (logicalName) {
    return logicalName.replace(/_/g, "-").replace(/\//g, "--");
  }
}
},{}],"../node_modules/stimulus/webpack-helpers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webpackHelpers = require("@stimulus/webpack-helpers");

Object.keys(_webpackHelpers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _webpackHelpers[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _webpackHelpers[key];
    }
  });
});
},{"@stimulus/webpack-helpers":"../node_modules/@stimulus/webpack-helpers/dist/index.js"}],"../src/js/app.js":[function(require,module,exports) {
"use strict";

var Turbo = _interopRequireWildcard(require("@hotwired/turbo"));

var _stimulus = require("stimulus");

var _webpackHelpers = require("stimulus/webpack-helpers");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// eslint-disable-next-line
var application = _stimulus.Application.start();

var context = require.context('./controllers', true, /\.js$/);

application.load((0, _webpackHelpers.definitionsFromContext)(context));
},{"@hotwired/turbo":"../node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js","stimulus":"../node_modules/stimulus/index.js","stimulus/webpack-helpers":"../node_modules/stimulus/webpack-helpers.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61359" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","../src/js/app.js"], null)
//# sourceMappingURL=/app.5f3f5240.js.map