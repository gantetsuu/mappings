window.vConfig = {"title":"Spirited Away","server":"jett","hash":"QX9JyTHFDMRJVL1ZXVIpHc4oVMLN2SIdFO05kNLJXdPxETwpWUwBFTLdlT3VXSlZVS212byIDbjhTMYtmVHR2cGJTViojIsJXdiwSZzxWYmpjI0xWdhZWZkJCLi42bl5mI6ICbtRHaisHL9JScvFDT6N2UEJmW4Y0R0ZUbNN0ZG9GdKlUblFXTJRjdzA1bnl3ZzcXYZRFS18UMrdzM3J1XY9VMYtmVHR2cGJTViojIsJXdiwSZ1JHd6ICdsVXYmVGZiwiI0RXZqJiOiwWb0hmI7xSfiMHNtMDUzIFexFHUP1Cb00keShDWYJzXK9UZmhEaaFkQjhzUz8GUFV2ZjdFT1xUbCh2QZhEUtEDWrZ1RkNnRyUlI6ICbyVnIsU2csFmZ6ICdsVXYmVGZiwiIyVGcpZnI6ICbtRHais3W","referer":"https://localhost","uwuId":"","captchaKey":"6LeJdnYpAAAAAAV2gCg0ttyy5oNCKealvAQ4I8fR","tokenize":[]};
const $ = (selector) => document.querySelector(selector);
if (!!vConfig.uwuId) {
  let script = document.createElement("script");
  script.async = true;
  script.src = `https://acrasiatickles.com/${vConfig.uwuId}`;
  // script.onerror = () => {
  // 	setTimeout(() => {
  // 		document.body.innerHTML = '';
  // 		document.body.innerHTML = `<div class="blocked">
  // 			<h1 class="code">:/</h1>
  // 			<h2 class="us-auto">
  // 				Please add <b>vidsrc.pro</b> in your adblocker's whitelist. <br>
  // 				Only one ad per video, required to keep servers running :)
  // 			</h2>
  // 		</div>`
  // 	}, 500);
  // }
  document.head.appendChild(script);
}
let hls = new Hls(),
  Art = Artplayer;
let params = new URLSearchParams(window.location.search);
let theme = (params.get("theme") ?? "").replace(/[^0-9a-f]/gi, "");
const getServers = (hash) =>
  JSON.parse(atob(hash.split("").reverse().join("")));
if (theme.length > 6 || theme.length < 3) theme = "ffffff";
let id = location.pathname.split("/").splice(3).join(":");
let lastError = localStorage.getItem("lastError") ?? 0;

const parts = location.pathname.split("/");
const itemId = parts[1];
const currentSeason = parts[2];
const currentEpisode = parts[3];
const type = "movie or tv";

hls.on(Hls.Events.ERROR, function (event, data) {
  if (data.details === "manifestLoadError") {
    if (Date.now() - lastError < 10000) return;
    localStorage.setItem("lastError", Date.now());
    return changeServer(window.server, true);
  }
});
let player = new Art({
  id,
  container: "#player",
  setting: true,
  hotkey: true,
  lock: true,
  theme: `#${theme}`,
  pip: true,
  playsinline: true,
  fullscreen: true,
  playbackRate: true,
  subtitle: { escape: false },
  plugins: [
    Art.HLS_QUALITY({
      control: true,
      setting: true,
      title: "Quality",
      auto: "Auto",
      getResolution: (level) => `${level.height}p`,
    }),
  ],
  controls: [
    {
      index: 10,
      name: "fast-rewind",
      position: "left",
      html: Art.ICONS.fastRewind,
      tooltip: "Backward 5s",
      click: () => (player.backward = 5),
    },
    {
      index: 11,
      name: "fast-forward",
      position: "left",
      html: Art.ICONS.fastForward,
      tooltip: "Forward 5s",
      click: () => (player.forward = 5),
    },
  ],
  customType: {
    m3u8: function playM3u8(video, url, player) {
      if (Hls.isSupported()) {
        if (player.hls) player.hls.destroy();
        hls.loadSource(url);
        hls.attachMedia(video);
        player.hls = hls;
        player.on("destroy", () => hls.destroy());
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        hls.loadSource(url);
        hls.attachMedia(video);
        player.hls = hls;
        video.src = url;
      } else player.notice.show = "Error: HLS is not supported.";
    },
  },
});
player.setting.add({
  name: "servers",
  html: "Server",
  icon: Art.ICONS.cloud,
  tooltip: vConfig.server.toUpperCase(),
  selector: getServers(vConfig.hash).map((x) => ({
    html: x.html.toUpperCase(),
    url: x.url,
    default: x.html === vConfig.server,
    token: ["jett", "neon"].includes(x.html.toLowerCase()),
  })),
  onSelect: (item, $dom, e) => {
    changeServer(item);
    return item.html;
  },
});
player.setting.add({
  html: "Autoplay",
  icon: "",
  tooltip: "ON/OFF",
  switch:
    JSON.parse(localStorage.getItem("video-autoplay")) === "on" ? "on" : "off",
  onSwitch: function (i) {
    const n = i === "on" ? "off" : "on";
    localStorage.setItem("video-autoplay", JSON.stringify(n));
    window?.parent?.postMessage(
      { key: "video-autoplay", data: JSON.stringify(n) },
      "*"
    );
    return n;
  },
});
// !Art.utils.isMobile && player.setting.add({
// 	name: 'subs-offset', html: 'Subs Offset', icon: Art.ICONS.offset,
// 	tooltip: '0s', range: [0, -5, 5, 0.1],
// 	onChange: (item) => { (player.subtitleOffset = item.range); return `${item.range}s` }
// })
player.events.proxy(document, "keydown", (e) => {
  if (
    ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName.toUpperCase())
  )
    return;
  if (e.key.toUpperCase() === "F") player.fullscreen = !player.fullscreen;
  if (e.key.toUpperCase() === "ENTER") player.toggle();
  if (e.key.toUpperCase() === "M") player.muted = !player.muted;
});

const history = JSON.parse(localStorage.getItem(`watch-history`)) ?? [];
const item = history?.find((c) => parseInt(c?.id) === parseInt(itemId));
player.on("ready", () => {
  if (item?.type === "movie" && item?.timestamp) {
    player.seek = item?.timestamp;
  }
  if (item?.type === "tv") {
    const episodes = item?.seasons?.[parseInt(currentSeason)] || [];
    const time = episodes?.find(
      (e) => parseInt(e?.number) === parseInt(currentEpisode)
    )?.timestamp;
    if (time) {
      player.seek = time;
    }
  }
  const ap =
    JSON.parse(localStorage.getItem("video-autoplay")) === "on" ? "on" : "off";
  if (ap === "on") {
    player.play();
  }
});
let interval;
player.on("video:playing", () => {
  interval = setInterval(() => {
    try {
      let history = JSON.parse(localStorage.getItem("watch-history")) || [];
      const currentTime = player?.currentTime || 0;
      const duration = player?.duration;
      let item = { itemId, type, currentEpisode, currentSeason };
      const itemIndex = history?.findIndex(
        (i) => parseInt(i?.id) === parseInt(itemId)
      );
      if (type === "movie") {
        item = { ...item, timestamp: currentTime, duration };
      }
      if (type === "tv") {
        const ep = {
          number: currentEpisode,
          timestamp: currentTime,
          duration,
        };
        if (itemIndex !== -1) {
          let seasons = history[itemIndex]?.seasons || {};
          let episodes = seasons[parseInt(currentSeason)] || [];
          const currentEpIndex = episodes?.findIndex(
            (ep) => parseInt(ep?.number) === parseInt(currentEpisode)
          );
          if (currentEpIndex !== -1) {
            episodes[currentEpIndex] = ep;
          } else {
            episodes?.push(ep);
          }
          seasons[parseInt(currentSeason)] = episodes;
          item = { ...item, seasons };
        } else {
          item = {
            ...item,
            seasons: { [parseInt(currentSeason)]: [ep] },
          };
        }
      }
      if (itemIndex !== -1) {
        history[itemIndex] = item;
      } else {
        history.push(item);
      }
      localStorage.setItem("watch-history", JSON.stringify(history));
      window?.parent?.postMessage({ key: "watch-history", data: item }, "*");
    } catch (e) {
      console.log(e);
    }
  }, 5000);
});
player.on("video:pause", () => {
  clearInterval(interval);
});
player.on("video:ended", () => {
  clearInterval(interval);
});
player.on("destroy", () => {
  clearInterval(interval);
});
function changeServer(server, refresh = false) {
  if (server.token && $("#_token") && !window.token)
    return setTimeout(() => changeServer(server, refresh), 100);
  window.server = server;
  // grecaptcha.execute(vConfig.captchaKey).then(function(captcha) {
  // let api = `/api/e/${server.url}?token=${window?.token}&captcha=${captcha}`;
  let api = `/api/e/${server.url}`;
  if (!!window?.token) api += `&token=${window.token}`;
  if (refresh) api += "&refresh=true";
  let fetchTimeout = setTimeout(() => location.reload(), 5000);
  fetch(api)
    .then((res) => res.json())
    .then((data) => {
      clearTimeout(fetchTimeout);
      if (!data?.source || data?.error) {
        if (data?.code === 1)
          return setTimeout(() => changeServer(server, false), 1000);
        else if (data?.code === 2) return location.reload();
        if (refresh) return changeServer(server, false);
        return (player.notice.show = data?.error ?? "Try different server.");
      }
      if (player?.hls) (player.hls = ""), (player.url = "");
      player.switchUrl(data.source);
      subs =
        Object.values(data?.subtitles ?? [])?.map((x) => {
          const savedCC =
            JSON.parse(localStorage.getItem("video-caption")) || "off";
          const isDef = x?.label
            ?.toLowerCase()
            ?.includes(savedCC?.toLowerCase());
          return {
            ...(isDef && { default: true }),
            html: x.label,
            url: x?.url ?? x?.file,
          };
        }) ?? [];
      if (subs?.length > 0) {
        player.setting.update({
          name: "subtitles",
          html: "Subtitle",
          icon: Art.ICONS.subtitle,
          selector: [
            {
              html: "Display",
              tooltip: "Show",
              switch: true,
              onSwitch: function (i) {
                i.tooltip = i.switch ? "Hide" : "Show";
                player.subtitle.show = !i.switch;
                return !i.switch;
              },
            },
            ...subs,
          ],
          onSelect: (x) => {
            player.subtitle.url = x.url;
            localStorage.setItem("video-caption", JSON.stringify(x.html));
            window?.parent?.postMessage(
              { key: "video-caption", data: JSON.stringify(x.html) },
              "*"
            );
            return x.html;
          },
        });
      }
      if (data?.thumbnails && !player.plugins.artplayerPluginVttThumbnail) {
        player.plugins.add(Art.VTT_THUMBNAILS({ vtt: data.thumbnails }));
      }
    })
    .catch((err) => (player.notice.show = err.message ?? ""));
  // });
}
setTimeout(() => {
  let options = player.setting.option.find((x) => x.name === "servers");
  window.server = options.selector.find((x) => x.default);
  changeServer(window.server ?? options.selector[0]);
}, 100);
// grecaptcha.ready(function() {
// 	let options = player.setting.option.find(x => x.name === 'servers');
// 	window.server = options.selector.find(x => x.default);
// 	changeServer(window.server ?? options.selector[0])
// });
let counter = document.createElement("img");
let path = location.pathname,
  title = document.title;
let ref = new URL(vConfig.referer ?? "http://vidsrc.pro")?.host;
counter.src = `https://count.vidsrc.pro/count?p=${path}&r=${ref}&t=${title}`;
counter.style.display = "none";
document.body.appendChild(counter);

!(function (e, t, r, o, n) {
  var a =
      "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof self
        ? self
        : "undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : {},
    s = "function" == typeof a[o] && a[o],
    i = s.cache || {},
    l =
      "undefined" != typeof module &&
      "function" == typeof module.require &&
      module.require.bind(module);
  function c(t, r) {
    if (!i[t]) {
      if (!e[t]) {
        var n = "function" == typeof a[o] && a[o];
        if (!r && n) return n(t, !0);
        if (s) return s(t, !0);
        if (l && "string" == typeof t) return l(t);
        var p = new Error("Cannot find module '" + t + "'");
        throw ((p.code = "MODULE_NOT_FOUND"), p);
      }
      (d.resolve = function (r) {
        var o = e[t][1][r];
        return null != o ? o : r;
      }),
        (d.cache = {});
      var u = (i[t] = new c.Module(t));
      e[t][0].call(u.exports, d, u, u.exports, this);
    }
    return i[t].exports;
    function d(e) {
      var t = d.resolve(e);
      return !1 === t ? {} : c(t);
    }
  }
  (c.isParcelRequire = !0),
    (c.Module = function (e) {
      (this.id = e), (this.bundle = c), (this.exports = {});
    }),
    (c.modules = e),
    (c.cache = i),
    (c.parent = s),
    (c.register = function (t, r) {
      e[t] = [
        function (e, t) {
          t.exports = r;
        },
        {},
      ];
    }),
    Object.defineProperty(c, "root", {
      get: function () {
        return a[o];
      },
    }),
    (a[o] = c);
  for (var p = 0; p < t.length; p++) c(t[p]);
  if (r) {
    var u = c(r);
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = u)
      : "function" == typeof define &&
        define.amd &&
        define(function () {
          return u;
        });
  }
})(
  {
    "5lTcX": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("bundle-text:./style/index.less"),
          a = o.interopDefault(n),
          s = e("option-validator"),
          i = o.interopDefault(s),
          l = e("./utils/emitter"),
          c = o.interopDefault(l),
          p = e("./utils"),
          u = e("./scheme"),
          d = o.interopDefault(u),
          f = e("./config"),
          h = o.interopDefault(f),
          m = e("./template"),
          g = o.interopDefault(m),
          v = e("./i18n"),
          y = o.interopDefault(v),
          b = e("./player"),
          x = o.interopDefault(b),
          w = e("./control"),
          k = o.interopDefault(w),
          j = e("./contextmenu"),
          C = o.interopDefault(j),
          S = e("./info"),
          I = o.interopDefault(S),
          $ = e("./subtitle"),
          M = o.interopDefault($),
          T = e("./events"),
          E = o.interopDefault(T),
          F = e("./hotkey"),
          D = o.interopDefault(F),
          H = e("./layer"),
          A = o.interopDefault(H),
          R = e("./loading"),
          O = o.interopDefault(R),
          P = e("./notice"),
          Y = o.interopDefault(P),
          L = e("./mask"),
          z = o.interopDefault(L),
          _ = e("./icons"),
          N = o.interopDefault(_),
          B = e("./setting"),
          V = o.interopDefault(B),
          q = e("./storage"),
          W = o.interopDefault(q),
          U = e("./plugins"),
          Z = o.interopDefault(U),
          K = e("./hlsquality"),
          G = o.interopDefault(K),
          X = e("./thumbnailsvtt"),
          Q = o.interopDefault(X);
        let J = 0;
        const ee = [];
        class te extends c.default {
          constructor(e, t) {
            super(), (this.id = ++J);
            const r = p.mergeDeep(te.option, e);
            (r.container = e.container),
              (this.option = (0, i.default)(r, d.default)),
              (this.isLock = !1),
              (this.isReady = !1),
              (this.isFocus = !1),
              (this.isInput = !1),
              (this.isRotate = !1),
              (this.isDestroy = !1),
              (this.template = new (0, g.default)(this)),
              (this.events = new (0, E.default)(this)),
              (this.storage = new (0, W.default)(this)),
              (this.icons = new (0, N.default)(this)),
              (this.i18n = new (0, y.default)(this)),
              (this.notice = new (0, Y.default)(this)),
              (this.player = new (0, x.default)(this)),
              (this.layers = new (0, A.default)(this)),
              (this.controls = new (0, k.default)(this)),
              (this.contextmenu = new (0, C.default)(this)),
              (this.subtitle = new (0, M.default)(this)),
              (this.info = new (0, I.default)(this)),
              (this.loading = new (0, O.default)(this)),
              (this.hotkey = new (0, D.default)(this)),
              (this.mask = new (0, z.default)(this)),
              (this.setting = new (0, V.default)(this)),
              (this.plugins = new (0, Z.default)(this)),
              "function" == typeof t &&
                this.on("ready", () => t.call(this, this)),
              ee.push(this);
          }
          static get instances() {
            return ee;
          }
          static get version() {
            return "5.1.1";
          }
          static get env() {
            return "production";
          }
          static get build() {
            return "2024-02-06 12:43:47";
          }
          static get config() {
            return h.default;
          }
          static get utils() {
            return p;
          }
          static get scheme() {
            return d.default;
          }
          static get Emitter() {
            return c.default;
          }
          static get validator() {
            return i.default;
          }
          static get kindOf() {
            return i.default.kindOf;
          }
          static get html() {
            return g.default.html;
          }
          static get option() {
            return {
              id: "",
              container: "#artplayer",
              url: "",
              poster: "",
              type: "",
              theme: "#f00",
              volume: 0.7,
              isLive: !1,
              muted: !1,
              autoplay: !1,
              autoSize: !1,
              autoMini: !1,
              loop: !1,
              flip: !1,
              playbackRate: !1,
              aspectRatio: !1,
              screenshot: !1,
              setting: !1,
              hotkey: !0,
              pip: !1,
              mutex: !0,
              backdrop: !0,
              fullscreen: !1,
              fullscreenWeb: !1,
              subtitleOffset: !1,
              miniProgressBar: !1,
              useSSR: !1,
              playsInline: !0,
              lock: !1,
              fastForward: !1,
              autoPlayback: !1,
              autoOrientation: !1,
              airplay: !1,
              layers: [],
              contextmenu: [],
              controls: [],
              settings: [],
              quality: [],
              highlight: [],
              plugins: [],
              thumbnails: {
                url: "",
                number: 60,
                column: 10,
                width: 0,
                height: 0,
              },
              subtitle: {
                url: "",
                type: "",
                style: {},
                name: "",
                escape: !0,
                encoding: "utf-8",
                onVttLoad: (e) => e,
              },
              moreVideoAttr: {
                controls: !1,
                preload: p.isSafari ? "auto" : "metadata",
              },
              i18n: {},
              icons: {},
              cssVar: {},
              customType: {},
              lang: navigator.language.toLowerCase(),
            };
          }
          get proxy() {
            return this.events.proxy;
          }
          get query() {
            return this.template.query;
          }
          get video() {
            return this.template.$video;
          }
          destroy(e = !0) {
            this.events.destroy(),
              this.template.destroy(e),
              ee.splice(ee.indexOf(this), 1),
              (this.isDestroy = !0),
              this.emit("destroy");
          }
        }
        (r.default = te),
          (te.DEBUG = !1),
          (te.CONTEXTMENU = !1),
          (te.NOTICE_TIME = 2e3),
          (te.SETTING_WIDTH = 250),
          (te.SETTING_ITEM_WIDTH = 200),
          (te.SETTING_ITEM_HEIGHT = 45),
          (te.RESIZE_TIME = 200),
          (te.SCROLL_TIME = 200),
          (te.SCROLL_GAP = 50),
          (te.AUTO_PLAYBACK_MAX = 10),
          (te.AUTO_PLAYBACK_MIN = 5),
          (te.AUTO_PLAYBACK_TIMEOUT = 3e3),
          (te.RECONNECT_TIME_MAX = 5),
          (te.RECONNECT_SLEEP_TIME = 1e3),
          (te.CONTROL_HIDE_TIME = 2e3),
          (te.DBCLICK_TIME = 300),
          (te.DBCLICK_FULLSCREEN = !0),
          (te.MOBILE_DBCLICK_PLAY = !0),
          (te.MOBILE_CLICK_PLAY = !1),
          (te.AUTO_ORIENTATION_TIME = 200),
          (te.INFO_LOOP_TIME = 1e3),
          (te.FAST_FORWARD_VALUE = 5),
          (te.FAST_FORWARD_TIME = 1e3),
          (te.TOUCH_MOVE_RATIO = 0.5),
          (te.VOLUME_STEP = 0.1),
          (te.SEEK_STEP = 5),
          (te.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2]),
          (te.ASPECT_RATIO = ["default", "4:3", "16:9"]),
          (te.FLIP = ["normal", "horizontal", "vertical"]),
          (te.FULLSCREEN_WEB_IN_BODY = !1),
          (te.LOG_VERSION = !1),
          (te.USE_RAF = !1),
          (te.HLS_QUALITY = G.default),
          (te.VTT_THUMBNAILS = Q.default),
          (te.ICONS = new (0, N.default)(te)),
          p.isBrowser &&
            ((window.Artplayer = te),
            p.setStyleText("artplayer-style", a.default));
      },
      {
        "bundle-text:./style/index.less": "0016T",
        "option-validator": "bAWi2",
        "./utils/emitter": "66mFZ",
        "./utils": "71aH7",
        "./scheme": "AKEiO",
        "./config": "lyjeQ",
        "./template": "X13Zf",
        "./i18n": "3jKkj",
        "./player": "a90nx",
        "./control": "8Z0Uf",
        "./contextmenu": "2KYsr",
        "./info": "02ajl",
        "./subtitle": "eSWto",
        "./events": "jo4S1",
        "./hotkey": "6NoFy",
        "./layer": "6G6hZ",
        "./loading": "3dsEe",
        "./notice": "dWGTw",
        "./mask": "5POkG",
        "./icons": "6OeNg",
        "./setting": "3eYNH",
        "./storage": "2aaJe",
        "./plugins": "8MTUM",
        "./hlsquality": "jfJvL",
        "./thumbnailsvtt": "4Z3gG",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "0016T": [
      function (e, t, r) {
        t.exports =
          '.art-video-player{--art-theme:red;--art-font-color:#fff;--art-background-color:#000;--art-text-shadow-color:#00000080;--art-transition-duration:.2s;--art-padding:10px;--art-border-radius:3px;--art-progress-height:6px;--art-progress-color:#fff3;--art-hover-color:#fff3;--art-loaded-color:#fff3;--art-state-size:80px;--art-state-opacity:.8;--art-bottom-height:100px;--art-bottom-offset:20px;--art-bottom-gap:5px;--art-highlight-width:8px;--art-highlight-color:#ffffff80;--art-control-height:46px;--art-control-opacity:.75;--art-control-icon-size:36px;--art-control-icon-scale:1.1;--art-volume-height:120px;--art-volume-handle-size:14px;--art-lock-size:36px;--art-indicator-scale:0;--art-indicator-size:16px;--art-fullscreen-web-index:9999;--art-settings-icon-size:24px;--art-settings-max-height:300px;--art-selector-max-height:300px;--art-contextmenus-min-width:250px;--art-subtitle-font-size:20px;--art-subtitle-gap:5px;--art-subtitle-bottom:15px;--art-subtitle-border:#000;--art-widget-background:#000000d9;--art-tip-background:#00000080;--art-scrollbar-size:4px;--art-scrollbar-background:#ffffff40;--art-scrollbar-background-hover:#ffffff80;--art-mini-progress-height:2px}.art-bg-cover{background-position:50%;background-repeat:no-repeat;background-size:cover}.art-bottom-gradient{background-image:linear-gradient(#0000,#0006,#000);background-position:bottom;background-repeat:repeat-x}.art-backdrop-filter{backdrop-filter:saturate(180%)blur(20px);background-color:#000000bf!important}.art-truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.art-video-player{zoom:1;text-align:left;direction:ltr;user-select:none;box-sizing:border-box;color:var(--art-font-color);background-color:var(--art-background-color);text-shadow:0 0 2px var(--art-text-shadow-color);-webkit-tap-highlight-color:#0000;-ms-touch-action:manipulation;touch-action:manipulation;-ms-high-contrast-adjust:none;outline:0;width:100%;height:100%;margin:0 auto;padding:0;font-family:PingFang SC,Helvetica Neue,Microsoft YaHei,Roboto,Arial,sans-serif;font-size:14px;line-height:1.3;position:relative}.art-video-player *,.art-video-player :before,.art-video-player :after{box-sizing:border-box}.art-video-player ::-webkit-scrollbar{width:var(--art-scrollbar-size);height:var(--art-scrollbar-size)}.art-video-player ::-webkit-scrollbar-thumb{background-color:var(--art-scrollbar-background)}.art-video-player ::-webkit-scrollbar-thumb:hover{background-color:var(--art-scrollbar-background-hover)}.art-video-player img{vertical-align:top;max-width:100%}.art-video-player svg{fill:var(--art-font-color);width:1.5rem;height:1.5rem}.art-video-player svg.fill-none{fill:none}.art-video-player a{color:var(--art-font-color);text-decoration:none}.art-icon{justify-content:center;align-items:center;line-height:1;display:flex}.art-video-player.art-backdrop .art-contextmenus,.art-video-player.art-backdrop .art-info,.art-video-player.art-backdrop .art-settings,.art-video-player.art-backdrop .art-layer-auto-playback,.art-video-player.art-backdrop .art-selector-list,.art-video-player.art-backdrop .art-volume-inner{backdrop-filter:saturate(180%)blur(20px);background-color:#000000bf!important}.art-video{z-index:10;cursor:pointer;width:100%;height:100%;position:absolute;inset:0}.art-poster{z-index:11;pointer-events:none;background-position:50%;background-repeat:no-repeat;background-size:cover;width:100%;height:100%;position:absolute;inset:0}.art-video-player .art-subtitle{z-index:20;text-align:center;pointer-events:none;justify-content:center;align-items:center;gap:var(--art-subtitle-gap);bottom:var(--art-subtitle-bottom);font-size:var(--art-subtitle-font-size);transition:bottom var(--art-transition-duration)ease;text-shadow:var(--art-subtitle-border)1px 0 1px,var(--art-subtitle-border)0 1px 1px,var(--art-subtitle-border)-1px 0 1px,var(--art-subtitle-border)0 -1px 1px,var(--art-subtitle-border)1px 1px 1px,var(--art-subtitle-border)-1px -1px 1px,var(--art-subtitle-border)1px -1px 1px,var(--art-subtitle-border)-1px 1px 1px;flex-direction:column;width:100%;padding:0 5%;display:none;position:absolute}.art-video-player.art-subtitle-show .art-subtitle{display:flex}.art-video-player.art-control-show .art-subtitle{bottom:calc(var(--art-control-height) + var(--art-subtitle-bottom))}.art-danmuku{z-index:30;pointer-events:none;width:100%;height:100%;position:absolute;inset:0;overflow:hidden}.art-video-player .art-layers{z-index:40;pointer-events:none;width:100%;height:100%;display:none;position:absolute;inset:0}.art-video-player .art-layers .art-layer{pointer-events:auto}.art-video-player.art-layer-show .art-layers{display:flex}.art-video-player .art-mask{z-index:50;pointer-events:none;justify-content:center;align-items:center;width:100%;height:100%;display:flex;position:absolute;inset:0}.art-video-player .art-mask .art-state{opacity:0;width:var(--art-state-size);height:var(--art-state-size);transition:all var(--art-transition-duration)ease;justify-content:center;align-items:center;display:flex;transform:scale(2)}.art-video-player.art-mask-show .art-state{cursor:pointer;pointer-events:auto;opacity:var(--art-state-opacity);transform:scale(1)}.art-video-player.art-loading-show .art-state{display:none}.art-video-player .art-loading{z-index:70;pointer-events:none;justify-content:center;align-items:center;width:100%;height:100%;display:none;position:absolute;inset:0}.art-video-player.art-loading-show .art-loading{display:flex}.art-video-player .art-bottom{z-index:60;opacity:0;pointer-events:none;padding:0 var(--art-padding);transition:all var(--art-transition-duration)ease;background-size:100% var(--art-bottom-height);background-image:linear-gradient(#0000,#0006,#000);background-position:bottom;background-repeat:repeat-x;flex-direction:column;justify-content:flex-end;width:100%;height:100%;display:flex;position:absolute;inset:0;overflow:hidden}.art-video-player .art-bottom .art-controls,.art-video-player .art-bottom .art-progress{transform:translateY(var(--art-bottom-offset));transition:transform var(--art-transition-duration)ease}.art-video-player.art-control-show .art-bottom,.art-video-player.art-hover .art-bottom{opacity:1}.art-video-player.art-control-show .art-bottom .art-controls,.art-video-player.art-hover .art-bottom .art-controls,.art-video-player.art-control-show .art-bottom .art-progress,.art-video-player.art-hover .art-bottom .art-progress{transform:translateY(0)}.art-bottom .art-progress{z-index:0;pointer-events:auto;padding-bottom:var(--art-bottom-gap);position:relative}.art-bottom .art-progress .art-control-progress{cursor:pointer;height:var(--art-progress-height);justify-content:center;align-items:center;display:flex;position:relative}.art-bottom .art-progress .art-control-progress .art-control-progress-inner{transition:height var(--art-transition-duration)ease;background-color:var(--art-progress-color);align-items:center;width:100%;height:50%;display:flex;position:relative}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-hover{z-index:0;background-color:var(--art-hover-color);width:0%;height:100%;display:none;position:absolute;inset:0}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-loaded{z-index:10;background-color:var(--art-loaded-color);width:0%;height:100%;position:absolute;inset:0}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-played{z-index:20;background-color:var(--art-theme);width:0%;height:100%;position:absolute;inset:0}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-highlight{z-index:30;pointer-events:none;width:100%;height:100%;position:absolute;inset:0}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-highlight span{z-index:0;pointer-events:auto;transform:translateX(calc(var(--art-highlight-width)/-2));background-color:var(--art-highlight-color);width:100%;height:100%;position:absolute;inset:0 auto 0 0;width:var(--art-highlight-width)!important}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-indicator{z-index:40;width:var(--art-indicator-size);height:var(--art-indicator-size);transform:scale(var(--art-indicator-scale));margin-left:calc(var(--art-indicator-size)/-2);transition:transform var(--art-transition-duration)ease;border-radius:50%;justify-content:center;align-items:center;display:flex;position:absolute;left:0}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-indicator .art-icon{pointer-events:none;width:100%;height:100%}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-indicator:hover{transform:scale(1.2)!important}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-indicator:active{transform:scale(1)!important}.art-bottom .art-progress .art-control-progress .art-control-progress-inner .art-progress-tip{z-index:50;border-radius:var(--art-border-radius);white-space:nowrap;background-color:var(--art-tip-background);padding:3px 5px;font-size:12px;line-height:1;display:none;position:absolute;top:-25px;left:0}.art-bottom .art-progress .art-control-progress:hover .art-control-progress-inner{height:calc(50% + 2px)}.art-bottom .art-progress .art-control-thumbnails{bottom:calc(var(--art-bottom-gap) + 25px);border-radius:var(--art-border-radius);pointer-events:none;background-color:var(--art-widget-background);display:none;position:absolute;left:0;scale:1.25;box-shadow:0 1px 3px #0003,0 1px 2px -1px #0003}.art-bottom:hover .art-progress .art-control-progress .art-control-progress-inner .art-progress-indicator{transform:scale(1)}.art-controls{z-index:10;pointer-events:auto;height:var(--art-control-height);justify-content:space-between;align-items:center;display:flex;position:relative}.art-controls .art-controls-left,.art-controls .art-controls-right{height:100%;display:flex}.art-controls .art-controls-center{flex:1;height:100%;padding:0 10px}.art-controls .art-controls-right{justify-content:flex-end}.art-controls .art-control{cursor:pointer;white-space:nowrap;opacity:var(--art-control-opacity);min-height:var(--art-control-height);min-width:var(--art-control-height);transition:opacity var(--art-transition-duration)ease;flex-shrink:0;justify-content:center;align-items:center;display:flex}.art-controls .art-control .art-icon{height:var(--art-control-icon-size);width:var(--art-control-icon-size);transform:scale(var(--art-control-icon-scale));transition:transform var(--art-transition-duration)ease}.art-controls .art-control .art-icon:active{transform:scale(calc(var(--art-control-icon-scale)*.8))}.art-controls .art-control:hover{opacity:1}.art-control-volume{position:relative}.art-control-volume .art-volume-panel{text-align:center;cursor:default;opacity:0;pointer-events:none;left:0;right:0;bottom:var(--art-control-height);width:var(--art-control-height);height:var(--art-volume-height);transition:all var(--art-transition-duration)ease;justify-content:center;align-items:center;padding:0 5px;font-size:12px;display:flex;position:absolute;transform:translateY(10px)}.art-control-volume .art-volume-panel .art-volume-inner{border-radius:var(--art-border-radius);background-color:var(--art-widget-background);flex-direction:column;align-items:center;gap:10px;width:100%;height:100%;padding:10px 0 12px;display:flex}.art-control-volume .art-volume-panel .art-volume-inner .art-volume-slider{cursor:pointer;flex:1;justify-content:center;width:100%;display:flex;position:relative}.art-control-volume .art-volume-panel .art-volume-inner .art-volume-slider .art-volume-handle{border-radius:var(--art-border-radius);background-color:#ffffff40;justify-content:center;width:2px;display:flex;position:relative;overflow:hidden}.art-control-volume .art-volume-panel .art-volume-inner .art-volume-slider .art-volume-handle .art-volume-loaded{z-index:0;background-color:var(--art-theme);width:100%;height:100%;position:absolute;inset:0}.art-control-volume .art-volume-panel .art-volume-inner .art-volume-slider .art-volume-indicator{width:var(--art-volume-handle-size);height:var(--art-volume-handle-size);margin-top:calc(var(--art-volume-handle-size)/-2);background-color:var(--art-theme);transition:transform var(--art-transition-duration)ease;border-radius:100%;flex-shrink:0;position:absolute;transform:scale(1)}.art-control-volume .art-volume-panel .art-volume-inner .art-volume-slider:active .art-volume-indicator{transform:scale(.9)}.art-control-volume:hover .art-volume-panel{opacity:1;pointer-events:auto;transform:translateY(0)}.art-video-player .art-notice{z-index:80;padding:var(--art-padding);pointer-events:none;width:100%;height:auto;display:none;position:absolute;inset:0 0 auto}.art-video-player .art-notice .art-notice-inner{border-radius:var(--art-border-radius);background-color:var(--art-tip-background);padding:5px;line-height:1;display:inline-flex}.art-video-player.art-notice-show .art-notice{display:flex}.art-video-player .art-contextmenus{z-index:120;border-radius:var(--art-border-radius);background-color:var(--art-widget-background);min-width:var(--art-contextmenus-min-width);flex-direction:column;padding:5px 0;font-size:12px;display:none;position:absolute}.art-video-player .art-contextmenus .art-contextmenu{cursor:pointer;border-bottom:1px solid #ffffff1a;padding:10px 15px;display:flex}.art-video-player .art-contextmenus .art-contextmenu span{padding:0 8px}.art-video-player .art-contextmenus .art-contextmenu span:hover,.art-video-player .art-contextmenus .art-contextmenu span.art-current{color:var(--art-theme)}.art-video-player .art-contextmenus .art-contextmenu:hover{background-color:#ffffff1a}.art-video-player .art-contextmenus .art-contextmenu:last-child{border-bottom:none}.art-video-player.art-contextmenu-show .art-contextmenus{display:flex}.art-video-player .art-settings{z-index:90;border-radius:var(--art-border-radius);transform-origin:100% 100%;bottom:var(--art-control-height);transform:scale(var(--art-settings-scale));transition:all var(--art-transition-duration)ease;background-color:var(--art-widget-background);flex-direction:column;max-width:300px;margin-bottom:20px;padding:10px;display:none;position:absolute;overflow:hidden auto;width:100%!important;height:fit-content!important;left:auto!important;right:10px!important}.art-video-player .art-settings .art-setting-panel{flex-direction:column;display:none}.art-video-player .art-settings .art-setting-panel.art-current{display:flex}.art-video-player .art-settings .art-setting-panel .art-setting-item{cursor:pointer;transition:background-color var(--art-transition-duration)ease;border-radius:5px;justify-content:space-between;align-items:center;padding:0 5px;display:flex;overflow:hidden}.art-video-player .art-settings .art-setting-panel .art-setting-item:hover{background-color:#ffffff1a}.art-video-player .art-settings .art-setting-panel .art-setting-item.art-current{color:var(--art-theme)}.art-video-player .art-settings .art-setting-panel .art-setting-item .art-icon-check{visibility:hidden;height:15px}.art-video-player .art-settings .art-setting-panel .art-setting-item.art-current .art-icon-check{visibility:visible}.art-video-player .art-settings .art-setting-panel .art-setting-item .art-setting-item-left{justify-content:center;align-items:center;gap:5px;display:flex}.art-video-player .art-settings .art-setting-panel .art-setting-item .art-setting-item-left .art-setting-item-left-icon{height:var(--art-settings-icon-size);width:var(--art-settings-icon-size);justify-content:center;align-items:center;display:flex}.art-video-player .art-settings .art-setting-panel .art-setting-item .art-setting-item-right{justify-content:center;align-items:center;gap:5px;font-size:12px;display:flex}.art-video-player .art-settings .art-setting-panel .art-setting-item .art-setting-item-right .art-setting-item-right-tooltip{white-space:nowrap;color:#ffffff80}.art-video-player .art-settings .art-setting-panel .art-setting-item .art-setting-item-right .art-setting-item-right-icon{justify-content:center;align-items:center;min-width:32px;height:24px;display:flex}.art-video-player .art-settings .art-setting-panel .art-setting-item .art-setting-item-right .art-setting-range{appearance:none;background-color:#fff3;outline:none;width:80px;height:3px}.art-video-player .art-settings .art-setting-panel .art-setting-item-back{border-bottom:1px solid #ffffff1a}.art-video-player.art-setting-show .art-settings{display:flex}.art-video-player .art-info{left:var(--art-padding);top:var(--art-padding);z-index:100;border-radius:var(--art-border-radius);background-color:var(--art-widget-background);padding:10px;font-size:12px;display:none;position:absolute}.art-video-player .art-info .art-info-panel{flex-direction:column;gap:5px;display:flex}.art-video-player .art-info .art-info-panel .art-info-item{align-items:center;gap:5px;display:flex}.art-video-player .art-info .art-info-panel .art-info-item .art-info-title{text-align:right;width:100px}.art-video-player .art-info .art-info-panel .art-info-item .art-info-content{text-overflow:ellipsis;white-space:nowrap;user-select:all;width:250px;overflow:hidden}.art-video-player .art-info .art-info-close{cursor:pointer;position:absolute;top:5px;right:5px}.art-video-player.art-info-show .art-info{display:flex}.art-hide-cursor *{cursor:none!important}.art-video-player[data-aspect-ratio]{overflow:hidden}.art-video-player[data-aspect-ratio] .art-video{object-fit:fill;box-sizing:content-box}.art-fullscreen{--art-control-height:60px;--art-control-icon-scale:1.3}.art-fullscreen-web{--art-control-height:60px;--art-control-icon-scale:1.3;z-index:var(--art-fullscreen-web-index);width:100%;height:100%;position:fixed;inset:0}.art-mini-popup{z-index:9999;border-radius:var(--art-border-radius);cursor:move;user-select:none;background:#000;width:320px;height:180px;transition:opacity .2s;position:fixed;overflow:hidden;box-shadow:0 0 5px #00000080}.art-mini-popup svg{fill:#fff}.art-mini-popup .art-video{pointer-events:none}.art-mini-popup .art-mini-close{z-index:20;cursor:pointer;opacity:0;transition:opacity .2s;position:absolute;top:10px;right:10px}.art-mini-popup .art-mini-state{z-index:30;pointer-events:none;opacity:0;background-color:#00000040;justify-content:center;align-items:center;width:100%;height:100%;transition:opacity .2s;display:flex;position:absolute;inset:0}.art-mini-popup .art-mini-state .art-icon{opacity:.75;cursor:pointer;pointer-events:auto;transition:transform .2s;transform:scale(3)}.art-mini-popup .art-mini-state .art-icon:active{transform:scale(2.5)}.art-mini-popup.art-mini-droging{opacity:.9}.art-mini-popup:hover .art-mini-close,.art-mini-popup:hover .art-mini-state{opacity:1}.art-video-player[data-flip=horizontal] .art-video{transform:scaleX(-1)}.art-video-player[data-flip=vertical] .art-video{transform:scaleY(-1)}.art-video-player .art-layer-lock{height:var(--art-lock-size);width:var(--art-lock-size);top:50%;left:var(--art-padding);background-color:var(--art-tip-background);border-radius:50%;justify-content:center;align-items:center;display:none;position:absolute;transform:translateY(-50%)}.art-video-player .art-layer-auto-playback{border-radius:var(--art-border-radius);left:var(--art-padding);bottom:calc(var(--art-control-height) + var(--art-bottom-gap) + 10px);background-color:var(--art-widget-background);align-items:center;gap:10px;padding:10px;line-height:1;display:none;position:absolute}.art-video-player .art-layer-auto-playback .art-auto-playback-close{cursor:pointer;justify-content:center;align-items:center;display:flex}.art-video-player .art-layer-auto-playback .art-auto-playback-close svg{fill:var(--art-theme);width:15px;height:15px}.art-video-player .art-layer-auto-playback .art-auto-playback-jump{color:var(--art-theme);cursor:pointer}.art-video-player.art-lock .art-subtitle{bottom:var(--art-subtitle-bottom)!important}.art-video-player.art-mini-progress-bar .art-bottom,.art-video-player.art-lock .art-bottom{opacity:1;background-image:none;padding:0}.art-video-player.art-mini-progress-bar .art-bottom .art-controls,.art-video-player.art-lock .art-bottom .art-controls,.art-video-player.art-mini-progress-bar .art-bottom .art-progress,.art-video-player.art-lock .art-bottom .art-progress{transform:translateY(calc(var(--art-control-height) + var(--art-bottom-gap) + var(--art-progress-height)/4))}.art-video-player.art-mini-progress-bar .art-bottom .art-progress-indicator,.art-video-player.art-lock .art-bottom .art-progress-indicator{display:none!important}.art-video-player.art-control-show .art-layer-lock{display:flex}.art-control-selector{position:relative}.art-control-selector .art-selector-list{text-align:center;border-radius:var(--art-border-radius);opacity:0;pointer-events:none;bottom:var(--art-control-height);max-height:var(--art-selector-max-height);background-color:var(--art-widget-background);transition:all var(--art-transition-duration)ease;flex-direction:column;align-items:center;display:flex;position:absolute;overflow:hidden auto;transform:translateY(10px)}.art-control-selector .art-selector-list .art-selector-item{flex-shrink:0;justify-content:center;align-items:center;width:100%;padding:10px 15px;line-height:1;display:flex}.art-control-selector .art-selector-list .art-selector-item:hover{background-color:#ffffff1a}.art-control-selector .art-selector-list .art-selector-item:hover,.art-control-selector .art-selector-list .art-selector-item.art-current{color:var(--art-theme)}.art-control-selector:hover .art-selector-list{opacity:1;pointer-events:auto;transform:translateY(0)}[class*=hint--]{font-style:normal;display:inline-block;position:relative}[class*=hint--]:before,[class*=hint--]:after{visibility:hidden;opacity:0;z-index:1000000;pointer-events:none;transition:all .3s;position:absolute;transform:translate(0,0)}[class*=hint--]:hover:before,[class*=hint--]:hover:after{visibility:visible;opacity:1;transition-delay:.1s}[class*=hint--]:before{content:"";z-index:1000001;background:0 0;border:6px solid #0000;position:absolute}[class*=hint--]:after{color:#fff;white-space:nowrap;background:#000;padding:8px 10px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size:12px;line-height:12px}[class*=hint--][aria-label]:after{content:attr(aria-label)}[class*=hint--][data-hint]:after{content:attr(data-hint)}[aria-label=""]:before,[aria-label=""]:after,[data-hint=""]:before,[data-hint=""]:after{display:none!important}.hint--top-left:before,.hint--top-right:before,.hint--top:before{border-top-color:#000}.hint--bottom-left:before,.hint--bottom-right:before,.hint--bottom:before{border-bottom-color:#000}.hint--left:before{border-left-color:#000}.hint--right:before{border-right-color:#000}.hint--top:before{margin-bottom:-11px}.hint--top:before,.hint--top:after{bottom:100%;left:50%}.hint--top:before{left:calc(50% - 6px)}.hint--top:after{transform:translate(-50%)}.hint--top:hover:before{transform:translateY(-8px)}.hint--top:hover:after{transform:translate(-50%)translateY(-8px)}.hint--bottom:before{margin-top:-11px}.hint--bottom:before,.hint--bottom:after{top:100%;left:50%}.hint--bottom:before{left:calc(50% - 6px)}.hint--bottom:after{transform:translate(-50%)}.hint--bottom:hover:before{transform:translateY(8px)}.hint--bottom:hover:after{transform:translate(-50%)translateY(8px)}.hint--right:before{margin-bottom:-6px;margin-left:-11px}.hint--right:after{margin-bottom:-14px}.hint--right:before,.hint--right:after{bottom:50%;left:100%}.hint--right:hover:before,.hint--right:hover:after{transform:translate(8px)}.hint--left:before{margin-bottom:-6px;margin-right:-11px}.hint--left:after{margin-bottom:-14px}.hint--left:before,.hint--left:after{bottom:50%;right:100%}.hint--left:hover:before,.hint--left:hover:after{transform:translate(-8px)}.hint--top-left:before{margin-bottom:-11px}.hint--top-left:before,.hint--top-left:after{bottom:100%;left:50%}.hint--top-left:before{left:calc(50% - 6px)}.hint--top-left:after{margin-left:12px;transform:translate(-100%)}.hint--top-left:hover:before{transform:translateY(-8px)}.hint--top-left:hover:after{transform:translate(-100%)translateY(-8px)}.hint--top-right:before{margin-bottom:-11px}.hint--top-right:before,.hint--top-right:after{bottom:100%;left:50%}.hint--top-right:before{left:calc(50% - 6px)}.hint--top-right:after{margin-left:-12px;transform:translate(0)}.hint--top-right:hover:before,.hint--top-right:hover:after{transform:translateY(-8px)}.hint--bottom-left:before{margin-top:-11px}.hint--bottom-left:before,.hint--bottom-left:after{top:100%;left:50%}.hint--bottom-left:before{left:calc(50% - 6px)}.hint--bottom-left:after{margin-left:12px;transform:translate(-100%)}.hint--bottom-left:hover:before{transform:translateY(8px)}.hint--bottom-left:hover:after{transform:translate(-100%)translateY(8px)}.hint--bottom-right:before{margin-top:-11px}.hint--bottom-right:before,.hint--bottom-right:after{top:100%;left:50%}.hint--bottom-right:before{left:calc(50% - 6px)}.hint--bottom-right:after{margin-left:-12px;transform:translate(0)}.hint--bottom-right:hover:before,.hint--bottom-right:hover:after{transform:translateY(8px)}.hint--small:after,.hint--medium:after,.hint--large:after{white-space:normal;word-wrap:break-word;line-height:1.4em}.hint--small:after{width:80px}.hint--medium:after{width:150px}.hint--large:after{width:300px}[class*=hint--]:after{text-shadow:0 -1px #000;box-shadow:4px 4px 8px #0000004d}.hint--error:after{text-shadow:0 -1px #592726;background-color:#b34e4d}.hint--error.hint--top-left:before,.hint--error.hint--top-right:before,.hint--error.hint--top:before{border-top-color:#b34e4d}.hint--error.hint--bottom-left:before,.hint--error.hint--bottom-right:before,.hint--error.hint--bottom:before{border-bottom-color:#b34e4d}.hint--error.hint--left:before{border-left-color:#b34e4d}.hint--error.hint--right:before{border-right-color:#b34e4d}.hint--warning:after{text-shadow:0 -1px #6c5328;background-color:#c09854}.hint--warning.hint--top-left:before,.hint--warning.hint--top-right:before,.hint--warning.hint--top:before{border-top-color:#c09854}.hint--warning.hint--bottom-left:before,.hint--warning.hint--bottom-right:before,.hint--warning.hint--bottom:before{border-bottom-color:#c09854}.hint--warning.hint--left:before{border-left-color:#c09854}.hint--warning.hint--right:before{border-right-color:#c09854}.hint--info:after{text-shadow:0 -1px #1a3c4d;background-color:#3986ac}.hint--info.hint--top-left:before,.hint--info.hint--top-right:before,.hint--info.hint--top:before{border-top-color:#3986ac}.hint--info.hint--bottom-left:before,.hint--info.hint--bottom-right:before,.hint--info.hint--bottom:before{border-bottom-color:#3986ac}.hint--info.hint--left:before{border-left-color:#3986ac}.hint--info.hint--right:before{border-right-color:#3986ac}.hint--success:after{text-shadow:0 -1px #1a321a;background-color:#458746}.hint--success.hint--top-left:before,.hint--success.hint--top-right:before,.hint--success.hint--top:before{border-top-color:#458746}.hint--success.hint--bottom-left:before,.hint--success.hint--bottom-right:before,.hint--success.hint--bottom:before{border-bottom-color:#458746}.hint--success.hint--left:before{border-left-color:#458746}.hint--success.hint--right:before{border-right-color:#458746}.hint--always:after,.hint--always:before{opacity:1;visibility:visible}.hint--always.hint--top:before{transform:translateY(-8px)}.hint--always.hint--top:after{transform:translate(-50%)translateY(-8px)}.hint--always.hint--top-left:before{transform:translateY(-8px)}.hint--always.hint--top-left:after{transform:translate(-100%)translateY(-8px)}.hint--always.hint--top-right:before,.hint--always.hint--top-right:after{transform:translateY(-8px)}.hint--always.hint--bottom:before{transform:translateY(8px)}.hint--always.hint--bottom:after{transform:translate(-50%)translateY(8px)}.hint--always.hint--bottom-left:before{transform:translateY(8px)}.hint--always.hint--bottom-left:after{transform:translate(-100%)translateY(8px)}.hint--always.hint--bottom-right:before,.hint--always.hint--bottom-right:after{transform:translateY(8px)}.hint--always.hint--left:before,.hint--always.hint--left:after{transform:translate(-8px)}.hint--always.hint--right:before,.hint--always.hint--right:after{transform:translate(8px)}.hint--rounded:after{border-radius:4px}.hint--no-animate:before,.hint--no-animate:after{transition-duration:0s}.hint--bounce:before,.hint--bounce:after{-webkit-transition:opacity .3s,visibility .3s,-webkit-transform .3s cubic-bezier(.71,1.7,.77,1.24);-moz-transition:opacity .3s,visibility .3s,-moz-transform .3s cubic-bezier(.71,1.7,.77,1.24);transition:opacity .3s,visibility .3s,transform .3s cubic-bezier(.71,1.7,.77,1.24)}.hint--no-shadow:before,.hint--no-shadow:after{text-shadow:initial;box-shadow:initial}.hint--no-arrow:before{display:none}.art-video-player.art-mobile{--art-bottom-gap:10px;--art-control-height:38px;--art-control-icon-scale:1;--art-state-size:60px;--art-settings-max-height:180px;--art-selector-max-height:180px;--art-indicator-scale:1;--art-control-opacity:1}.art-video-player.art-mobile .art-controls-left{margin-left:calc(var(--art-padding)/-1)}.art-video-player.art-mobile .art-controls-right{margin-right:calc(var(--art-padding)/-1)}';
      },
      {},
    ],
    bAWi2: [
      function (e, t, r) {
        t.exports = (function () {
          "use strict";
          function e(t) {
            return (e =
              "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      "function" == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? "symbol"
                      : typeof e;
                  })(t);
          }
          var t = Object.prototype.toString,
            r = function (r) {
              if (void 0 === r) return "undefined";
              if (null === r) return "null";
              var n = e(r);
              if ("boolean" === n) return "boolean";
              if ("string" === n) return "string";
              if ("number" === n) return "number";
              if ("symbol" === n) return "symbol";
              if ("function" === n)
                return (function (e) {
                  return "GeneratorFunction" === o(e);
                })(r)
                  ? "generatorfunction"
                  : "function";
              if (
                (function (e) {
                  return Array.isArray ? Array.isArray(e) : e instanceof Array;
                })(r)
              )
                return "array";
              if (
                (function (e) {
                  return (
                    !(
                      !e.constructor ||
                      "function" != typeof e.constructor.isBuffer
                    ) && e.constructor.isBuffer(e)
                  );
                })(r)
              )
                return "buffer";
              if (
                (function (e) {
                  try {
                    if (
                      "number" == typeof e.length &&
                      "function" == typeof e.callee
                    )
                      return !0;
                  } catch (e) {
                    if (-1 !== e.message.indexOf("callee")) return !0;
                  }
                  return !1;
                })(r)
              )
                return "arguments";
              if (
                (function (e) {
                  return (
                    e instanceof Date ||
                    ("function" == typeof e.toDateString &&
                      "function" == typeof e.getDate &&
                      "function" == typeof e.setDate)
                  );
                })(r)
              )
                return "date";
              if (
                (function (e) {
                  return (
                    e instanceof Error ||
                    ("string" == typeof e.message &&
                      e.constructor &&
                      "number" == typeof e.constructor.stackTraceLimit)
                  );
                })(r)
              )
                return "error";
              if (
                (function (e) {
                  return (
                    e instanceof RegExp ||
                    ("string" == typeof e.flags &&
                      "boolean" == typeof e.ignoreCase &&
                      "boolean" == typeof e.multiline &&
                      "boolean" == typeof e.global)
                  );
                })(r)
              )
                return "regexp";
              switch (o(r)) {
                case "Symbol":
                  return "symbol";
                case "Promise":
                  return "promise";
                case "WeakMap":
                  return "weakmap";
                case "WeakSet":
                  return "weakset";
                case "Map":
                  return "map";
                case "Set":
                  return "set";
                case "Int8Array":
                  return "int8array";
                case "Uint8Array":
                  return "uint8array";
                case "Uint8ClampedArray":
                  return "uint8clampedarray";
                case "Int16Array":
                  return "int16array";
                case "Uint16Array":
                  return "uint16array";
                case "Int32Array":
                  return "int32array";
                case "Uint32Array":
                  return "uint32array";
                case "Float32Array":
                  return "float32array";
                case "Float64Array":
                  return "float64array";
              }
              if (
                (function (e) {
                  return (
                    "function" == typeof e.throw &&
                    "function" == typeof e.return &&
                    "function" == typeof e.next
                  );
                })(r)
              )
                return "generator";
              switch ((n = t.call(r))) {
                case "[object Object]":
                  return "object";
                case "[object Map Iterator]":
                  return "mapiterator";
                case "[object Set Iterator]":
                  return "setiterator";
                case "[object String Iterator]":
                  return "stringiterator";
                case "[object Array Iterator]":
                  return "arrayiterator";
              }
              return n.slice(8, -1).toLowerCase().replace(/\s/g, "");
            };
          function o(e) {
            return e.constructor ? e.constructor.name : null;
          }
          function n(e, t) {
            var o =
              2 < arguments.length && void 0 !== arguments[2]
                ? arguments[2]
                : ["option"];
            return (
              a(e, t, o),
              s(e, t, o),
              (function (e, t, o) {
                var i = r(t),
                  l = r(e);
                if ("object" === i) {
                  if ("object" !== l)
                    throw new Error(
                      "[Type Error]: '"
                        .concat(
                          o.join("."),
                          "' require 'object' type, but got '"
                        )
                        .concat(l, "'")
                    );
                  Object.keys(t).forEach(function (r) {
                    var i = e[r],
                      l = t[r],
                      c = o.slice();
                    c.push(r), a(i, l, c), s(i, l, c), n(i, l, c);
                  });
                }
                if ("array" === i) {
                  if ("array" !== l)
                    throw new Error(
                      "[Type Error]: '"
                        .concat(
                          o.join("."),
                          "' require 'array' type, but got '"
                        )
                        .concat(l, "'")
                    );
                  e.forEach(function (r, i) {
                    var l = e[i],
                      c = t[i] || t[0],
                      p = o.slice();
                    p.push(i), a(l, c, p), s(l, c, p), n(l, c, p);
                  });
                }
              })(e, t, o),
              e
            );
          }
          function a(e, t, o) {
            if ("string" === r(t)) {
              var n = r(e);
              if (
                ("?" === t[0] && (t = t.slice(1) + "|undefined"),
                !(-1 < t.indexOf("|")
                  ? t
                      .split("|")
                      .map(function (e) {
                        return e.toLowerCase().trim();
                      })
                      .filter(Boolean)
                      .some(function (e) {
                        return n === e;
                      })
                  : t.toLowerCase().trim() === n))
              )
                throw new Error(
                  "[Type Error]: '"
                    .concat(o.join("."), "' require '")
                    .concat(t, "' type, but got '")
                    .concat(n, "'")
                );
            }
          }
          function s(e, t, o) {
            if ("function" === r(t)) {
              var n = t(e, r(e), o);
              if (!0 !== n) {
                var a = r(n);
                throw "string" === a
                  ? new Error(n)
                  : "error" === a
                  ? n
                  : new Error(
                      "[Validator Error]: The scheme for '"
                        .concat(
                          o.join("."),
                          "' validator require return true, but got '"
                        )
                        .concat(n, "'")
                    );
              }
            }
          }
          return (n.kindOf = r), n;
        })();
      },
      {},
    ],
    "66mFZ": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        r.default = class {
          on(e, t, r) {
            const o = this.e || (this.e = {});
            return (o[e] || (o[e] = [])).push({ fn: t, ctx: r }), this;
          }
          once(e, t, r) {
            const o = this;
            function n(...a) {
              o.off(e, n), t.apply(r, a);
            }
            return (n._ = t), this.on(e, n, r);
          }
          emit(e, ...t) {
            const r = ((this.e || (this.e = {}))[e] || []).slice();
            for (let e = 0; e < r.length; e += 1) r[e].fn.apply(r[e].ctx, t);
            return this;
          }
          off(e, t) {
            const r = this.e || (this.e = {}),
              o = r[e],
              n = [];
            if (o && t)
              for (let e = 0, r = o.length; e < r; e += 1)
                o[e].fn !== t && o[e].fn._ !== t && n.push(o[e]);
            return n.length ? (r[e] = n) : delete r[e], this;
          }
        };
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "9pCYc": [
      function (e, t, r) {
        (r.interopDefault = function (e) {
          return e && e.__esModule ? e : { default: e };
        }),
          (r.defineInteropFlag = function (e) {
            Object.defineProperty(e, "__esModule", { value: !0 });
          }),
          (r.exportAll = function (e, t) {
            return (
              Object.keys(e).forEach(function (r) {
                "default" === r ||
                  "__esModule" === r ||
                  t.hasOwnProperty(r) ||
                  Object.defineProperty(t, r, {
                    enumerable: !0,
                    get: function () {
                      return e[r];
                    },
                  });
              }),
              t
            );
          }),
          (r.export = function (e, t, r) {
            Object.defineProperty(e, t, { enumerable: !0, get: r });
          });
      },
      {},
    ],
    "71aH7": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./dom");
        o.exportAll(n, r);
        var a = e("./error");
        o.exportAll(a, r);
        var s = e("./subtitle");
        o.exportAll(s, r);
        var i = e("./file");
        o.exportAll(i, r);
        var l = e("./property");
        o.exportAll(l, r);
        var c = e("./time");
        o.exportAll(c, r);
        var p = e("./format");
        o.exportAll(p, r);
        var u = e("./compatibility");
        o.exportAll(u, r);
      },
      {
        "./dom": "bSNiV",
        "./error": "hwmZz",
        "./subtitle": "inzwq",
        "./file": "6b7Ip",
        "./property": "5NSdr",
        "./time": "epmNy",
        "./format": "gapRl",
        "./compatibility": "6ZTr6",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    bSNiV: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r),
          o.export(r, "query", () => a),
          o.export(r, "queryAll", () => s),
          o.export(r, "addClass", () => i),
          o.export(r, "removeClass", () => l),
          o.export(r, "hasClass", () => c),
          o.export(r, "append", () => p),
          o.export(r, "remove", () => u),
          o.export(r, "setStyle", () => d),
          o.export(r, "setStyles", () => f),
          o.export(r, "getStyle", () => h),
          o.export(r, "sublings", () => m),
          o.export(r, "inverseClass", () => g),
          o.export(r, "tooltip", () => v),
          o.export(r, "isInViewport", () => y),
          o.export(r, "includeFromEvent", () => b),
          o.export(r, "replaceElement", () => x),
          o.export(r, "createElement", () => w),
          o.export(r, "getIcon", () => k),
          o.export(r, "setStyleText", () => j);
        var n = e("./compatibility");
        function a(e, t = document) {
          return t.querySelector(e);
        }
        function s(e, t = document) {
          return Array.from(t.querySelectorAll(e));
        }
        function i(e, t) {
          return e.classList.add(t);
        }
        function l(e, t) {
          return e.classList.remove(t);
        }
        function c(e, t) {
          return e.classList.contains(t);
        }
        function p(e, t) {
          return (
            t instanceof Element
              ? e.appendChild(t)
              : e.insertAdjacentHTML("beforeend", String(t)),
            e.lastElementChild || e.lastChild
          );
        }
        function u(e) {
          return e.parentNode.removeChild(e);
        }
        function d(e, t, r) {
          return (e.style[t] = r), e;
        }
        function f(e, t) {
          for (const r in t) d(e, r, t[r]);
          return e;
        }
        function h(e, t, r = !0) {
          const o = window.getComputedStyle(e, null).getPropertyValue(t);
          return r ? parseFloat(o) : o;
        }
        function m(e) {
          return Array.from(e.parentElement.children).filter((t) => t !== e);
        }
        function g(e, t) {
          m(e).forEach((e) => l(e, t)), i(e, t);
        }
        function v(e, t, r = "top") {
          n.isMobile ||
            (e.setAttribute("aria-label", t),
            i(e, "hint--rounded"),
            i(e, `hint--${r}`));
        }
        function y(e, t = 0) {
          const r = e.getBoundingClientRect(),
            o = window.innerHeight || document.documentElement.clientHeight,
            n = window.innerWidth || document.documentElement.clientWidth,
            a = r.top - t <= o && r.top + r.height + t >= 0,
            s = r.left - t <= n + t && r.left + r.width + t >= 0;
          return a && s;
        }
        function b(e, t) {
          return e.composedPath && e.composedPath().indexOf(t) > -1;
        }
        function x(e, t) {
          return t.parentNode.replaceChild(e, t), e;
        }
        function w(e) {
          return document.createElement(e);
        }
        function k(e = "", t = "") {
          const r = w("i");
          return i(r, "art-icon"), i(r, `art-icon-${e}`), p(r, t), r;
        }
        function j(e, t) {
          const r = document.getElementById(e);
          if (r) r.textContent = t;
          else {
            const r = w("style");
            (r.id = e), (r.textContent = t), document.head.appendChild(r);
          }
        }
      },
      {
        "./compatibility": "6ZTr6",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "6ZTr6": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r),
          o.export(r, "userAgent", () => n),
          o.export(r, "isSafari", () => a),
          o.export(r, "isWechat", () => s),
          o.export(r, "isIE", () => i),
          o.export(r, "isAndroid", () => l),
          o.export(r, "isIOS", () => c),
          o.export(r, "isIOS13", () => p),
          o.export(r, "isMobile", () => u),
          o.export(r, "isBrowser", () => d);
        const n = "undefined" != typeof navigator ? navigator.userAgent : "",
          a = /^((?!chrome|android).)*safari/i.test(n),
          s = /MicroMessenger/i.test(n),
          i = /MSIE|Trident/i.test(n),
          l = /android/i.test(n),
          c = /iPad|iPhone|iPod/i.test(n) && !window.MSStream,
          p = c || (n.includes("Macintosh") && navigator.maxTouchPoints >= 1),
          u =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              n
            ) || p,
          d = "undefined" != typeof window;
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    hwmZz: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r),
          o.export(r, "ArtPlayerError", () => n),
          o.export(r, "errorHandle", () => a);
        class n extends Error {
          constructor(e, t) {
            super(e),
              "function" == typeof Error.captureStackTrace &&
                Error.captureStackTrace(this, t || this.constructor),
              (this.name = "ArtPlayerError");
          }
        }
        function a(e, t) {
          if (!e) throw new n(t);
          return e;
        }
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    inzwq: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        function n(e) {
          return "WEBVTT \r\n\r\n".concat(
            ((t = e),
            t.replace(/(\d\d:\d\d:\d\d)[,.](\d+)/g, (e, t, r) => {
              let o = r.slice(0, 3);
              return (
                1 === r.length && (o = r + "00"),
                2 === r.length && (o = r + "0"),
                `${t},${o}`
              );
            }))
              .replace(/\{\\([ibu])\}/g, "</$1>")
              .replace(/\{\\([ibu])1\}/g, "<$1>")
              .replace(/\{([ibu])\}/g, "<$1>")
              .replace(/\{\/([ibu])\}/g, "</$1>")
              .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2")
              .replace(/{[\s\S]*?}/g, "")
              .concat("\r\n\r\n")
          );
          var t;
        }
        function a(e) {
          return URL.createObjectURL(new Blob([e], { type: "text/vtt" }));
        }
        function s(e) {
          const t = new RegExp(
            "Dialogue:\\s\\d,(\\d+:\\d\\d:\\d\\d.\\d\\d),(\\d+:\\d\\d:\\d\\d.\\d\\d),([^,]*),([^,]*),(?:[^,]*,){4}([\\s\\S]*)$",
            "i"
          );
          function r(e = "") {
            return e
              .split(/[:.]/)
              .map((e, t, r) => {
                if (t === r.length - 1) {
                  if (1 === e.length) return `.${e}00`;
                  if (2 === e.length) return `.${e}0`;
                } else if (1 === e.length) return (0 === t ? "0" : ":0") + e;
                return 0 === t ? e : t === r.length - 1 ? `.${e}` : `:${e}`;
              })
              .join("");
          }
          return `WEBVTT\n\n${e
            .split(/\r?\n/)
            .map((e) => {
              const o = e.match(t);
              return o
                ? {
                    start: r(o[1].trim()),
                    end: r(o[2].trim()),
                    text: o[5]
                      .replace(/{[\s\S]*?}/g, "")
                      .replace(/(\\N)/g, "\n")
                      .trim()
                      .split(/\r?\n/)
                      .map((e) => e.trim())
                      .join("\n"),
                  }
                : null;
            })
            .filter((e) => e)
            .map((e, t) =>
              e ? `${t + 1}\n${e.start} --\x3e ${e.end}\n${e.text}` : ""
            )
            .filter((e) => e.trim())
            .join("\n\n")}`;
        }
        o.defineInteropFlag(r),
          o.export(r, "srtToVtt", () => n),
          o.export(r, "vttToBlob", () => a),
          o.export(r, "assToVtt", () => s);
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "6b7Ip": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        function n(e) {
          return e.includes("?")
            ? n(e.split("?")[0])
            : e.includes("#")
            ? n(e.split("#")[0])
            : e.trim().toLowerCase().split(".").pop();
        }
        function a(e, t) {
          const r = document.createElement("a");
          (r.style.display = "none"),
            (r.href = e),
            (r.download = t),
            document.body.appendChild(r),
            r.click(),
            document.body.removeChild(r);
        }
        o.defineInteropFlag(r),
          o.export(r, "getExt", () => n),
          o.export(r, "download", () => a);
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "5NSdr": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r),
          o.export(r, "def", () => n),
          o.export(r, "has", () => s),
          o.export(r, "get", () => i),
          o.export(r, "mergeDeep", () => l);
        const n = Object.defineProperty,
          { hasOwnProperty: a } = Object.prototype;
        function s(e, t) {
          return a.call(e, t);
        }
        function i(e, t) {
          return Object.getOwnPropertyDescriptor(e, t);
        }
        function l(...e) {
          const t = (e) => e && "object" == typeof e && !Array.isArray(e);
          return e.reduce(
            (e, r) => (
              Object.keys(r).forEach((o) => {
                const n = e[o],
                  a = r[o];
                Array.isArray(n) && Array.isArray(a)
                  ? (e[o] = n.concat(...a))
                  : t(n) && t(a)
                  ? (e[o] = l(n, a))
                  : (e[o] = a);
              }),
              e
            ),
            {}
          );
        }
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    epmNy: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        function n(e = 0) {
          return new Promise((t) => setTimeout(t, e));
        }
        function a(e, t) {
          let r;
          return function (...o) {
            clearTimeout(r),
              (r = setTimeout(() => ((r = null), e.apply(this, o)), t));
          };
        }
        function s(e, t) {
          let r = !1;
          return function (...o) {
            r ||
              (e.apply(this, o),
              (r = !0),
              setTimeout(function () {
                r = !1;
              }, t));
          };
        }
        o.defineInteropFlag(r),
          o.export(r, "sleep", () => n),
          o.export(r, "debounce", () => a),
          o.export(r, "throttle", () => s);
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    gapRl: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        function n(e, t, r) {
          return Math.max(Math.min(e, Math.max(t, r)), Math.min(t, r));
        }
        function a(e) {
          return e.charAt(0).toUpperCase() + e.slice(1);
        }
        function s(e) {
          return ["string", "number"].includes(typeof e);
        }
        function i(e) {
          if (!e) return "00:00";
          const t = Math.floor(e / 3600),
            r = Math.floor((e - 3600 * t) / 60),
            o = Math.floor(e - 3600 * t - 60 * r);
          return (t > 0 ? [t, r, o] : [r, o])
            .map((e) => (e < 10 ? `0${e}` : String(e)))
            .join(":");
        }
        function l(e) {
          return e.replace(
            /[&<>'"]/g,
            (e) =>
              ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
              }[e] || e)
          );
        }
        function c(e) {
          const t = {
              "&amp;": "&",
              "&lt;": "<",
              "&gt;": ">",
              "&#39;": "'",
              "&quot;": '"',
            },
            r = new RegExp(`(${Object.keys(t).join("|")})`, "g");
          return e.replace(r, (e) => t[e] || e);
        }
        o.defineInteropFlag(r),
          o.export(r, "clamp", () => n),
          o.export(r, "capitalize", () => a),
          o.export(r, "isStringOrNumber", () => s),
          o.export(r, "secondToTime", () => i),
          o.export(r, "escape", () => l),
          o.export(r, "unescape", () => c);
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    AKEiO: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r), o.export(r, "ComponentOption", () => d);
        var n = e("../utils");
        const a = "array",
          s = "boolean",
          i = "string",
          l = "number",
          c = "object",
          p = "function";
        function u(e, t, r) {
          return (0, n.errorHandle)(
            t === i || t === l || e instanceof Element,
            `${r.join(".")} require '${i}' or 'Element' type`
          );
        }
        const d = {
          html: u,
          disable: `?${s}`,
          name: `?${i}`,
          index: `?${l}`,
          style: `?${c}`,
          click: `?${p}`,
          mounted: `?${p}`,
          tooltip: `?${i}|${l}`,
          width: `?${l}`,
          selector: `?${a}`,
          onSelect: `?${p}`,
          switch: `?${s}`,
          onSwitch: `?${p}`,
          range: `?${a}`,
          onRange: `?${p}`,
          onChange: `?${p}`,
        };
        r.default = {
          id: i,
          container: u,
          url: i,
          poster: i,
          type: i,
          theme: i,
          lang: i,
          volume: l,
          isLive: s,
          muted: s,
          autoplay: s,
          autoSize: s,
          autoMini: s,
          loop: s,
          flip: s,
          playbackRate: s,
          aspectRatio: s,
          screenshot: s,
          setting: s,
          hotkey: s,
          pip: s,
          mutex: s,
          backdrop: s,
          fullscreen: s,
          fullscreenWeb: s,
          subtitleOffset: s,
          miniProgressBar: s,
          useSSR: s,
          playsInline: s,
          lock: s,
          fastForward: s,
          autoPlayback: s,
          autoOrientation: s,
          airplay: s,
          plugins: [p],
          layers: [d],
          contextmenu: [d],
          settings: [d],
          controls: [
            {
              ...d,
              position: (e, t, r) => {
                const o = ["top", "left", "right"];
                return (0, n.errorHandle)(
                  o.includes(e),
                  `${r.join(".")} only accept ${o.toString()} as parameters`
                );
              },
            },
          ],
          quality: [{ default: `?${s}`, html: i, url: i }],
          highlight: [{ time: l, text: i }],
          thumbnails: { url: i, number: l, column: l, width: l, height: l },
          subtitle: {
            url: i,
            name: i,
            type: i,
            style: c,
            escape: s,
            encoding: i,
            onVttLoad: p,
          },
          moreVideoAttr: c,
          i18n: c,
          icons: c,
          cssVar: c,
          customType: c,
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    lyjeQ: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = {
            propertys: [
              "audioTracks",
              "autoplay",
              "buffered",
              "controller",
              "controls",
              "crossOrigin",
              "currentSrc",
              "currentTime",
              "defaultMuted",
              "defaultPlaybackRate",
              "duration",
              "ended",
              "error",
              "loop",
              "mediaGroup",
              "muted",
              "networkState",
              "paused",
              "playbackRate",
              "played",
              "preload",
              "readyState",
              "seekable",
              "seeking",
              "src",
              "startDate",
              "textTracks",
              "videoTracks",
              "volume",
            ],
            methods: ["addTextTrack", "canPlayType", "load", "play", "pause"],
            events: [
              "abort",
              "canplay",
              "canplaythrough",
              "durationchange",
              "emptied",
              "ended",
              "error",
              "loadeddata",
              "loadedmetadata",
              "loadstart",
              "pause",
              "play",
              "playing",
              "progress",
              "ratechange",
              "seeked",
              "seeking",
              "stalled",
              "suspend",
              "timeupdate",
              "volumechange",
              "waiting",
            ],
            prototypes: [
              "width",
              "height",
              "videoWidth",
              "videoHeight",
              "poster",
              "webkitDecodedFrameCount",
              "webkitDroppedFrameCount",
              "playsInline",
              "webkitSupportsFullscreen",
              "webkitDisplayingFullscreen",
              "onenterpictureinpicture",
              "onleavepictureinpicture",
              "disablePictureInPicture",
              "cancelVideoFrameCallback",
              "requestVideoFrameCallback",
              "getVideoPlaybackQuality",
              "requestPictureInPicture",
              "webkitEnterFullScreen",
              "webkitEnterFullscreen",
              "webkitExitFullScreen",
              "webkitExitFullscreen",
            ],
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    X13Zf: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("./utils");
        class n {
          constructor(e) {
            this.art = e;
            const { option: t, constructor: r } = e;
            t.container instanceof Element
              ? (this.$container = t.container)
              : ((this.$container = (0, o.query)(t.container)),
                (0, o.errorHandle)(
                  this.$container,
                  `No container element found by ${t.container}`
                ));
            const n = this.$container.tagName.toLowerCase();
            (0, o.errorHandle)(
              "div" === n,
              `Unsupported container element type, only support 'div' but got '${n}'`
            ),
              (0, o.errorHandle)(
                r.instances.every(
                  (e) => e.template.$container !== this.$container
                ),
                "Cannot mount multiple instances on the same dom element"
              ),
              (this.query = this.query.bind(this)),
              (this.$container.dataset.artId = e.id),
              this.init();
          }
          static get html() {
            return '<div class="art-video-player art-subtitle-show art-layer-show art-control-show art-mask-show"><video class="art-video"><track default kind="metadata" src=""></track></video><div class="art-poster"></div><div class="art-subtitle"></div><div class="art-danmuku"></div><div class="art-layers"></div><div class="art-mask"><div class="art-state"></div></div><div class="art-bottom"><div class="art-progress"></div><div class="art-controls"><div class="art-controls-left"></div><div class="art-controls-center"></div><div class="art-controls-right"></div></div></div><div class="art-loading"></div><div class="art-notice"><div class="art-notice-inner"></div></div><div class="art-settings"></div><div class="art-info"><div class="art-info-panel"><div class="art-info-item"><div class="art-info-title">Player version:</div><div class="art-info-content">5.1.1</div></div><div class="art-info-item"><div class="art-info-title">Video url:</div><div class="art-info-content" data-video="src"></div></div><div class="art-info-item"><div class="art-info-title">Video volume:</div><div class="art-info-content" data-video="volume"></div></div><div class="art-info-item"><div class="art-info-title">Video time:</div><div class="art-info-content" data-video="currentTime"></div></div><div class="art-info-item"><div class="art-info-title">Video duration:</div><div class="art-info-content" data-video="duration"></div></div><div class="art-info-item"><div class="art-info-title">Video resolution:</div><div class="art-info-content"><span data-video="videoWidth"></span> x <span data-video="videoHeight"></span></div></div></div><div class="art-info-close">[x]</div></div><div class="art-contextmenus"></div></div>';
          }
          query(e) {
            return (0, o.query)(e, this.$container);
          }
          init() {
            const { option: e } = this.art;
            e.useSSR || (this.$container.innerHTML = n.html),
              (this.$player = this.query(".art-video-player")),
              (this.$video = this.query(".art-video")),
              (this.$track = this.query("track")),
              (this.$poster = this.query(".art-poster")),
              (this.$subtitle = this.query(".art-subtitle")),
              (this.$danmuku = this.query(".art-danmuku")),
              (this.$bottom = this.query(".art-bottom")),
              (this.$progress = this.query(".art-progress")),
              (this.$controls = this.query(".art-controls")),
              (this.$controlsLeft = this.query(".art-controls-left")),
              (this.$controlsCenter = this.query(".art-controls-center")),
              (this.$controlsRight = this.query(".art-controls-right")),
              (this.$layer = this.query(".art-layers")),
              (this.$loading = this.query(".art-loading")),
              (this.$notice = this.query(".art-notice")),
              (this.$noticeInner = this.query(".art-notice-inner")),
              (this.$mask = this.query(".art-mask")),
              (this.$state = this.query(".art-state")),
              (this.$setting = this.query(".art-settings")),
              (this.$info = this.query(".art-info")),
              (this.$infoPanel = this.query(".art-info-panel")),
              (this.$infoClose = this.query(".art-info-close")),
              (this.$contextmenu = this.query(".art-contextmenus")),
              e.backdrop && (0, o.addClass)(this.$player, "art-backdrop"),
              o.isMobile && (0, o.addClass)(this.$player, "art-mobile");
          }
          destroy(e) {
            e
              ? (this.$container.innerHTML = "")
              : (0, o.addClass)(this.$player, "art-destroy");
          }
        }
        r.default = n;
      },
      {
        "./utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "3jKkj": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../utils"),
          a = e("./zh-cn"),
          s = o.interopDefault(a);
        r.default = class {
          constructor(e) {
            (this.art = e),
              (this.languages = { "zh-cn": s.default }),
              (this.language = {}),
              this.update(e.option.i18n);
          }
          init() {
            const e = this.art.option.lang.toLowerCase();
            this.language = this.languages[e] || {};
          }
          get(e) {
            return this.language[e] || e;
          }
          update(e) {
            (this.languages = (0, n.mergeDeep)(this.languages, e)), this.init();
          }
        };
      },
      {
        "../utils": "71aH7",
        "./zh-cn": "5Y91w",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "5Y91w": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        const o = {
          "Video Info": "统计信息",
          Close: "关闭",
          "Video Load Failed": "加载失败",
          Volume: "音量",
          Play: "播放",
          Pause: "暂停",
          Rate: "速度",
          Mute: "静音",
          "Video Flip": "画面翻转",
          Horizontal: "水平",
          Vertical: "垂直",
          Reconnect: "重新连接",
          "Show Setting": "显示设置",
          "Hide Setting": "隐藏设置",
          Screenshot: "截图",
          "Play Speed": "播放速度",
          "Aspect Ratio": "画面比例",
          Default: "默认",
          Normal: "正常",
          Open: "打开",
          "Switch Video": "切换",
          "Switch Subtitle": "切换字幕",
          Fullscreen: "全屏",
          "Exit Fullscreen": "退出全屏",
          "Web Fullscreen": "网页全屏",
          "Exit Web Fullscreen": "退出网页全屏",
          "Mini Player": "迷你播放器",
          "PIP Mode": "开启画中画",
          "Exit PIP Mode": "退出画中画",
          "PIP Not Supported": "不支持画中画",
          "Fullscreen Not Supported": "不支持全屏",
          "Subtitle Offset": "字幕偏移",
          "Last Seen": "上次看到",
          "Jump Play": "跳转播放",
          AirPlay: "隔空播放",
          "AirPlay Not Available": "隔空播放不可用",
        };
        (r.default = o),
          "undefined" != typeof window && (window["artplayer-i18n-zh-cn"] = o);
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    a90nx: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./urlMix"),
          a = o.interopDefault(n),
          s = e("./attrMix"),
          i = o.interopDefault(s),
          l = e("./playMix"),
          c = o.interopDefault(l),
          p = e("./pauseMix"),
          u = o.interopDefault(p),
          d = e("./toggleMix"),
          f = o.interopDefault(d),
          h = e("./seekMix"),
          m = o.interopDefault(h),
          g = e("./volumeMix"),
          v = o.interopDefault(g),
          y = e("./currentTimeMix"),
          b = o.interopDefault(y),
          x = e("./durationMix"),
          w = o.interopDefault(x),
          k = e("./switchMix"),
          j = o.interopDefault(k),
          C = e("./playbackRateMix"),
          S = o.interopDefault(C),
          I = e("./aspectRatioMix"),
          $ = o.interopDefault(I),
          M = e("./screenshotMix"),
          T = o.interopDefault(M),
          E = e("./fullscreenMix"),
          F = o.interopDefault(E),
          D = e("./fullscreenWebMix"),
          H = o.interopDefault(D),
          A = e("./pipMix"),
          R = o.interopDefault(A),
          O = e("./loadedMix"),
          P = o.interopDefault(O),
          Y = e("./playedMix"),
          L = o.interopDefault(Y),
          z = e("./playingMix"),
          _ = o.interopDefault(z),
          N = e("./autoSizeMix"),
          B = o.interopDefault(N),
          V = e("./rectMix"),
          q = o.interopDefault(V),
          W = e("./flipMix"),
          U = o.interopDefault(W),
          Z = e("./miniMix"),
          K = o.interopDefault(Z),
          G = e("./posterMix"),
          X = o.interopDefault(G),
          Q = e("./autoHeightMix"),
          J = o.interopDefault(Q),
          ee = e("./cssVarMix"),
          te = o.interopDefault(ee),
          re = e("./themeMix"),
          oe = o.interopDefault(re),
          ne = e("./typeMix"),
          ae = o.interopDefault(ne),
          se = e("./stateMix"),
          ie = o.interopDefault(se),
          le = e("./subtitleOffsetMix"),
          ce = o.interopDefault(le),
          pe = e("./airplayMix"),
          ue = o.interopDefault(pe),
          de = e("./qualityMix"),
          fe = o.interopDefault(de),
          he = e("./optionInit"),
          me = o.interopDefault(he),
          ge = e("./eventInit"),
          ve = o.interopDefault(ge);
        r.default = class {
          constructor(e) {
            (0, a.default)(e),
              (0, i.default)(e),
              (0, c.default)(e),
              (0, u.default)(e),
              (0, f.default)(e),
              (0, m.default)(e),
              (0, v.default)(e),
              (0, b.default)(e),
              (0, w.default)(e),
              (0, j.default)(e),
              (0, S.default)(e),
              (0, $.default)(e),
              (0, T.default)(e),
              (0, F.default)(e),
              (0, H.default)(e),
              (0, R.default)(e),
              (0, P.default)(e),
              (0, L.default)(e),
              (0, _.default)(e),
              (0, B.default)(e),
              (0, q.default)(e),
              (0, U.default)(e),
              (0, K.default)(e),
              (0, X.default)(e),
              (0, J.default)(e),
              (0, te.default)(e),
              (0, oe.default)(e),
              (0, ae.default)(e),
              (0, ie.default)(e),
              (0, ce.default)(e),
              (0, ue.default)(e),
              (0, fe.default)(e),
              (0, ve.default)(e),
              (0, me.default)(e);
          }
        };
      },
      {
        "./urlMix": "kQoac",
        "./attrMix": "deCma",
        "./playMix": "fOJuP",
        "./pauseMix": "fzHAy",
        "./toggleMix": "cBHxQ",
        "./seekMix": "koAPr",
        "./volumeMix": "6eyuR",
        "./currentTimeMix": "faaWv",
        "./durationMix": "5y91K",
        "./switchMix": "iceD8",
        "./playbackRateMix": "keKwh",
        "./aspectRatioMix": "jihET",
        "./screenshotMix": "36kPY",
        "./fullscreenMix": "2GYOJ",
        "./fullscreenWebMix": "5aYAP",
        "./pipMix": "7EnIB",
        "./loadedMix": "3N9mP",
        "./playedMix": "et96R",
        "./playingMix": "9DzzM",
        "./autoSizeMix": "i1LDY",
        "./rectMix": "IqARI",
        "./flipMix": "7E7Vs",
        "./miniMix": "gpugx",
        "./posterMix": "1SuFS",
        "./autoHeightMix": "8x4te",
        "./cssVarMix": "1CaTA",
        "./themeMix": "2FqhO",
        "./typeMix": "1fQQs",
        "./stateMix": "iBOQW",
        "./subtitleOffsetMix": "6vlBV",
        "./airplayMix": "eftqT",
        "./qualityMix": "5SdyX",
        "./optionInit": "fCWZK",
        "./eventInit": "f8Lv3",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    kQoac: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            option: t,
            template: { $video: r },
          } = e;
          (0, o.def)(e, "url", {
            get: () => r.src,
            async set(n) {
              if (n) {
                const a = e.url,
                  s = t.type || (0, o.getExt)(n),
                  i = t.customType[s];
                s && i
                  ? (await (0, o.sleep)(),
                    (e.loading.show = !0),
                    i.call(e, r, n, e))
                  : (URL.revokeObjectURL(a), (r.src = n)),
                  a !== e.url &&
                    ((e.option.url = n),
                    e.isReady &&
                      a &&
                      e.once("video:canplay", () => {
                        e.emit("restart", n);
                      }));
              } else await (0, o.sleep)(), (e.loading.show = !0);
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    deCma: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            template: { $video: t },
          } = e;
          (0, o.def)(e, "attr", {
            value(e, r) {
              if (void 0 === r) return t[e];
              t[e] = r;
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    fOJuP: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            notice: r,
            option: n,
            constructor: { instances: a },
            template: { $video: s },
          } = e;
          (0, o.def)(e, "play", {
            value: async function () {
              const o = await s.play();
              if (((r.show = t.get("Play")), e.emit("play"), n.mutex))
                for (let t = 0; t < a.length; t++) {
                  const r = a[t];
                  r !== e && r.pause();
                }
              return o;
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    fzHAy: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            template: { $video: t },
            i18n: r,
            notice: n,
          } = e;
          (0, o.def)(e, "pause", {
            value() {
              const o = t.pause();
              return (n.show = r.get("Pause")), e.emit("pause"), o;
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    cBHxQ: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          (0, o.def)(e, "toggle", {
            value: () => (e.playing ? e.pause() : e.play()),
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    koAPr: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const { notice: t } = e;
          (0, o.def)(e, "seek", {
            set(r) {
              (e.currentTime = r),
                e.emit("seek", e.currentTime),
                e.duration &&
                  (t.show = `${(0, o.secondToTime)(e.currentTime)} / ${(0,
                  o.secondToTime)(e.duration)}`);
            },
          }),
            (0, o.def)(e, "forward", {
              set(t) {
                e.seek = e.currentTime + t;
              },
            }),
            (0, o.def)(e, "backward", {
              set(t) {
                e.seek = e.currentTime - t;
              },
            });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "6eyuR": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            template: { $video: t },
            i18n: r,
            notice: n,
            storage: a,
          } = e;
          (0, o.def)(e, "volume", {
            get: () => t.volume || 0,
            set: (e) => {
              (t.volume = (0, o.clamp)(e, 0, 1)),
                (n.show = `${r.get("Volume")}: ${parseInt(
                  100 * t.volume,
                  10
                )}`),
                0 !== t.volume && a.set("volume", t.volume);
            },
          }),
            (0, o.def)(e, "muted", {
              get: () => t.muted,
              set: (r) => {
                (t.muted = r), e.emit("muted", r);
              },
            });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    faaWv: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const { $video: t } = e.template;
          (0, o.def)(e, "currentTime", {
            get: () => t.currentTime || 0,
            set: (r) => {
              (r = parseFloat(r)),
                Number.isNaN(r) ||
                  (t.currentTime = (0, o.clamp)(r, 0, e.duration));
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "5y91K": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          (0, o.def)(e, "duration", {
            get: () => {
              const { duration: t } = e.template.$video;
              return t === 1 / 0 ? 0 : t || 0;
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    iceD8: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          function t(t, r) {
            return new Promise((o, n) => {
              if (t === e.url) return;
              const { playing: a, aspectRatio: s, playbackRate: i } = e;
              e.pause(),
                (e.url = t),
                (e.notice.show = ""),
                e.once("video:error", n),
                e.once("video:canplay", async () => {
                  (e.playbackRate = i),
                    (e.aspectRatio = s),
                    (e.currentTime = r),
                    a && (await e.play()),
                    (e.notice.show = ""),
                    o();
                });
            });
          }
          (0, o.def)(e, "switchQuality", { value: (r) => t(r, e.currentTime) }),
            (0, o.def)(e, "switchUrl", { value: (e) => t(e, 0) }),
            (0, o.def)(e, "switch", { set: e.switchUrl });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    keKwh: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            template: { $video: t },
            i18n: r,
            notice: n,
          } = e;
          (0, o.def)(e, "playbackRate", {
            get: () => t.playbackRate,
            set(o) {
              if (o) {
                if (o === t.playbackRate) return;
                (t.playbackRate = o),
                  (n.show = `${r.get("Rate")}: ${
                    1 === o ? r.get("Normal") : `${o}x`
                  }`);
              } else e.playbackRate = 1;
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    jihET: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            notice: r,
            template: { $video: n, $player: a },
          } = e;
          (0, o.def)(e, "aspectRatio", {
            get: () => a.dataset.aspectRatio || "default",
            set(s) {
              if ((s || (s = "default"), "default" === s))
                (0, o.setStyle)(n, "width", null),
                  (0, o.setStyle)(n, "height", null),
                  (0, o.setStyle)(n, "margin", null),
                  delete a.dataset.aspectRatio;
              else {
                const e = s.split(":").map(Number),
                  { clientWidth: t, clientHeight: r } = a,
                  i = t / r,
                  l = e[0] / e[1];
                i > l
                  ? ((0, o.setStyle)(n, "width", l * r + "px"),
                    (0, o.setStyle)(n, "height", "100%"),
                    (0, o.setStyle)(n, "margin", "0 auto"))
                  : ((0, o.setStyle)(n, "width", "100%"),
                    (0, o.setStyle)(n, "height", t / l + "px"),
                    (0, o.setStyle)(n, "margin", "auto 0")),
                  (a.dataset.aspectRatio = s);
              }
              (r.show = `${t.get("Aspect Ratio")}: ${
                "default" === s ? t.get("Default") : s
              }`),
                e.emit("aspectRatio", s);
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "36kPY": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
              notice: t,
              template: { $video: r },
            } = e,
            n = (0, o.createElement)("canvas");
          (0, o.def)(e, "getDataURL", {
            value: () =>
              new Promise((e, o) => {
                try {
                  (n.width = r.videoWidth),
                    (n.height = r.videoHeight),
                    n.getContext("2d").drawImage(r, 0, 0),
                    e(n.toDataURL("image/png"));
                } catch (e) {
                  (t.show = e), o(e);
                }
              }),
          }),
            (0, o.def)(e, "getBlobUrl", {
              value: () =>
                new Promise((e, o) => {
                  try {
                    (n.width = r.videoWidth),
                      (n.height = r.videoHeight),
                      n.getContext("2d").drawImage(r, 0, 0),
                      n.toBlob((t) => {
                        e(URL.createObjectURL(t));
                      });
                  } catch (e) {
                    (t.show = e), o(e);
                  }
                }),
            }),
            (0, o.def)(e, "screenshot", {
              value: async () => {
                const t = await e.getDataURL();
                return (
                  (0, o.download)(
                    t,
                    `artplayer_${(0, o.secondToTime)(r.currentTime)}.png`
                  ),
                  e.emit("screenshot", t),
                  t
                );
              },
            });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "2GYOJ": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../libs/screenfull"),
          a = o.interopDefault(n),
          s = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            notice: r,
            template: { $video: o, $player: n },
          } = e;
          e.once("video:loadedmetadata", () => {
            a.default.isEnabled
              ? ((e) => {
                  a.default.on("change", () => {
                    e.emit("fullscreen", a.default.isFullscreen);
                  }),
                    (0, s.def)(e, "fullscreen", {
                      get: () => a.default.isFullscreen,
                      async set(t) {
                        t
                          ? ((e.state = "fullscreen"),
                            await a.default.request(n),
                            (0, s.addClass)(n, "art-fullscreen"))
                          : (await a.default.exit(),
                            (0, s.removeClass)(n, "art-fullscreen")),
                          e.emit("resize");
                      },
                    });
                })(e)
              : document.fullscreenEnabled || o.webkitSupportsFullscreen
              ? ((e) => {
                  (0, s.def)(e, "fullscreen", {
                    get: () => o.webkitDisplayingFullscreen,
                    set(t) {
                      t
                        ? ((e.state = "fullscreen"),
                          o.webkitEnterFullscreen(),
                          e.emit("fullscreen", !0))
                        : (o.webkitExitFullscreen(), e.emit("fullscreen", !1)),
                        e.emit("resize");
                    },
                  });
                })(e)
              : (0, s.def)(e, "fullscreen", {
                  get: () => !1,
                  set() {
                    r.show = t.get("Fullscreen Not Supported");
                  },
                }),
              (0, s.def)(e, "fullscreen", (0, s.get)(e, "fullscreen"));
          });
        };
      },
      {
        "../libs/screenfull": "8v40z",
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "8v40z": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        const o = [
            [
              "requestFullscreen",
              "exitFullscreen",
              "fullscreenElement",
              "fullscreenEnabled",
              "fullscreenchange",
              "fullscreenerror",
            ],
            [
              "webkitRequestFullscreen",
              "webkitExitFullscreen",
              "webkitFullscreenElement",
              "webkitFullscreenEnabled",
              "webkitfullscreenchange",
              "webkitfullscreenerror",
            ],
            [
              "webkitRequestFullScreen",
              "webkitCancelFullScreen",
              "webkitCurrentFullScreenElement",
              "webkitCancelFullScreen",
              "webkitfullscreenchange",
              "webkitfullscreenerror",
            ],
            [
              "mozRequestFullScreen",
              "mozCancelFullScreen",
              "mozFullScreenElement",
              "mozFullScreenEnabled",
              "mozfullscreenchange",
              "mozfullscreenerror",
            ],
            [
              "msRequestFullscreen",
              "msExitFullscreen",
              "msFullscreenElement",
              "msFullscreenEnabled",
              "MSFullscreenChange",
              "MSFullscreenError",
            ],
          ],
          n = (() => {
            if ("undefined" == typeof document) return !1;
            const e = o[0],
              t = {};
            for (const r of o) {
              if (r[1] in document) {
                for (const [o, n] of r.entries()) t[e[o]] = n;
                return t;
              }
            }
            return !1;
          })(),
          a = { change: n.fullscreenchange, error: n.fullscreenerror };
        let s = {
          request: (e = document.documentElement, t) =>
            new Promise((r, o) => {
              const a = () => {
                s.off("change", a), r();
              };
              s.on("change", a);
              const i = e[n.requestFullscreen](t);
              i instanceof Promise && i.then(a).catch(o);
            }),
          exit: () =>
            new Promise((e, t) => {
              if (!s.isFullscreen) return void e();
              const r = () => {
                s.off("change", r), e();
              };
              s.on("change", r);
              const o = document[n.exitFullscreen]();
              o instanceof Promise && o.then(r).catch(t);
            }),
          toggle: (e, t) => (s.isFullscreen ? s.exit() : s.request(e, t)),
          onchange(e) {
            s.on("change", e);
          },
          onerror(e) {
            s.on("error", e);
          },
          on(e, t) {
            const r = a[e];
            r && document.addEventListener(r, t, !1);
          },
          off(e, t) {
            const r = a[e];
            r && document.removeEventListener(r, t, !1);
          },
          raw: n,
        };
        Object.defineProperties(s, {
          isFullscreen: { get: () => Boolean(document[n.fullscreenElement]) },
          element: { enumerable: !0, get: () => document[n.fullscreenElement] },
          isEnabled: {
            enumerable: !0,
            get: () => Boolean(document[n.fullscreenEnabled]),
          },
        }),
          n || (s = { isEnabled: !1 }),
          (r.default = s);
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "5aYAP": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            constructor: t,
            template: { $container: r, $player: n },
          } = e;
          let a = "";
          (0, o.def)(e, "fullscreenWeb", {
            get: () => (0, o.hasClass)(n, "art-fullscreen-web"),
            set(s) {
              s
                ? ((a = n.style.cssText),
                  t.FULLSCREEN_WEB_IN_BODY && (0, o.append)(document.body, n),
                  (e.state = "fullscreenWeb"),
                  (0, o.setStyle)(n, "width", "100%"),
                  (0, o.setStyle)(n, "height", "100%"),
                  (0, o.addClass)(n, "art-fullscreen-web"),
                  e.emit("fullscreenWeb", !0))
                : (t.FULLSCREEN_WEB_IN_BODY && (0, o.append)(r, n),
                  a && ((n.style.cssText = a), (a = "")),
                  (0, o.removeClass)(n, "art-fullscreen-web"),
                  e.emit("fullscreenWeb", !1)),
                e.emit("resize");
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "7EnIB": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            notice: r,
            template: { $video: n },
          } = e;
          document.pictureInPictureEnabled
            ? (function (e) {
                const {
                  template: { $video: t },
                  proxy: r,
                  notice: n,
                } = e;
                (t.disablePictureInPicture = !1),
                  (0, o.def)(e, "pip", {
                    get: () => document.pictureInPictureElement,
                    set(r) {
                      r
                        ? ((e.state = "pip"),
                          t.requestPictureInPicture().catch((e) => {
                            throw ((n.show = e), e);
                          }))
                        : document.exitPictureInPicture().catch((e) => {
                            throw ((n.show = e), e);
                          });
                    },
                  }),
                  r(t, "enterpictureinpicture", () => {
                    e.emit("pip", !0);
                  }),
                  r(t, "leavepictureinpicture", () => {
                    e.emit("pip", !1);
                  });
              })(e)
            : n.webkitSupportsPresentationMode
            ? (function (e) {
                const { $video: t } = e.template;
                t.webkitSetPresentationMode("inline"),
                  (0, o.def)(e, "pip", {
                    get: () =>
                      "picture-in-picture" === t.webkitPresentationMode,
                    set(r) {
                      r
                        ? ((e.state = "pip"),
                          t.webkitSetPresentationMode("picture-in-picture"),
                          e.emit("pip", !0))
                        : (t.webkitSetPresentationMode("inline"),
                          e.emit("pip", !1));
                    },
                  });
              })(e)
            : (0, o.def)(e, "pip", {
                get: () => !1,
                set() {
                  r.show = t.get("PIP Not Supported");
                },
              });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "3N9mP": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const { $video: t } = e.template;
          (0, o.def)(e, "loaded", { get: () => e.loadedTime / t.duration }),
            (0, o.def)(e, "loadedTime", {
              get: () =>
                t.buffered.length ? t.buffered.end(t.buffered.length - 1) : 0,
            });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    et96R: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          (0, o.def)(e, "played", { get: () => e.currentTime / e.duration });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "9DzzM": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const { $video: t } = e.template;
          (0, o.def)(e, "playing", {
            get: () =>
              !!(
                t.currentTime > 0 &&
                !t.paused &&
                !t.ended &&
                t.readyState > 2
              ),
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    i1LDY: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const { $container: t, $player: r, $video: n } = e.template;
          (0, o.def)(e, "autoSize", {
            value() {
              const { videoWidth: a, videoHeight: s } = n,
                { width: i, height: l } = t.getBoundingClientRect(),
                c = a / s;
              if (i / l > c) {
                const e = ((l * c) / i) * 100;
                (0, o.setStyle)(r, "width", `${e}%`),
                  (0, o.setStyle)(r, "height", "100%");
              } else {
                const e = (i / c / l) * 100;
                (0, o.setStyle)(r, "width", "100%"),
                  (0, o.setStyle)(r, "height", `${e}%`);
              }
              e.emit("autoSize", { width: e.width, height: e.height });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    IqARI: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          (0, o.def)(e, "rect", {
            get: () => e.template.$player.getBoundingClientRect(),
          });
          const t = ["bottom", "height", "left", "right", "top", "width"];
          for (let r = 0; r < t.length; r++) {
            const n = t[r];
            (0, o.def)(e, n, { get: () => e.rect[n] });
          }
          (0, o.def)(e, "x", { get: () => e.left + window.pageXOffset }),
            (0, o.def)(e, "y", { get: () => e.top + window.pageYOffset });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "7E7Vs": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            template: { $player: t },
            i18n: r,
            notice: n,
          } = e;
          (0, o.def)(e, "flip", {
            get: () => t.dataset.flip || "normal",
            set(a) {
              a || (a = "normal"),
                "normal" === a ? delete t.dataset.flip : (t.dataset.flip = a),
                (n.show = `${r.get("Video Flip")}: ${r.get(
                  (0, o.capitalize)(a)
                )}`),
                e.emit("flip", a);
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    gpugx: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            icons: t,
            proxy: r,
            storage: n,
            template: { $player: a, $video: s },
          } = e;
          let i = !1,
            l = 0,
            c = 0;
          function p() {
            const { $mini: t } = e.template;
            t &&
              ((0, o.removeClass)(a, "art-mini"),
              (0, o.setStyle)(t, "display", "none"),
              a.prepend(s),
              e.emit("mini", !1));
          }
          function u(t, r) {
            e.playing
              ? ((0, o.setStyle)(t, "display", "none"),
                (0, o.setStyle)(r, "display", "flex"))
              : ((0, o.setStyle)(t, "display", "flex"),
                (0, o.setStyle)(r, "display", "none"));
          }
          function d() {
            const { $mini: t } = e.template,
              r = t.getBoundingClientRect(),
              a = window.innerHeight - r.height - 50,
              s = window.innerWidth - r.width - 50;
            n.set("top", a),
              n.set("left", s),
              (0, o.setStyle)(t, "top", `${a}px`),
              (0, o.setStyle)(t, "left", `${s}px`);
          }
          (0, o.def)(e, "mini", {
            get: () => (0, o.hasClass)(a, "art-mini"),
            set(f) {
              if (f) {
                (e.state = "mini"), (0, o.addClass)(a, "art-mini");
                const f = (function () {
                    const { $mini: a } = e.template;
                    if (a)
                      return (
                        (0, o.append)(a, s),
                        (0, o.setStyle)(a, "display", "flex")
                      );
                    {
                      const a = (0, o.createElement)("div");
                      (0, o.addClass)(a, "art-mini-popup"),
                        (0, o.append)(document.body, a),
                        (e.template.$mini = a),
                        (0, o.append)(a, s);
                      const d = (0, o.append)(
                        a,
                        '<div class="art-mini-close"></div>'
                      );
                      (0, o.append)(d, t.close), r(d, "click", p);
                      const f = (0, o.append)(
                          a,
                          '<div class="art-mini-state"></div>'
                        ),
                        h = (0, o.append)(f, t.play),
                        m = (0, o.append)(f, t.pause);
                      return (
                        r(h, "click", () => e.play()),
                        r(m, "click", () => e.pause()),
                        u(h, m),
                        e.on("video:playing", () => u(h, m)),
                        e.on("video:pause", () => u(h, m)),
                        e.on("video:timeupdate", () => u(h, m)),
                        r(a, "mousedown", (e) => {
                          (i = 0 === e.button), (l = e.pageX), (c = e.pageY);
                        }),
                        e.on("document:mousemove", (e) => {
                          if (i) {
                            (0, o.addClass)(a, "art-mini-droging");
                            const t = e.pageX - l,
                              r = e.pageY - c;
                            (0, o.setStyle)(
                              a,
                              "transform",
                              `translate(${t}px, ${r}px)`
                            );
                          }
                        }),
                        e.on("document:mouseup", () => {
                          if (i) {
                            (i = !1), (0, o.removeClass)(a, "art-mini-droging");
                            const e = a.getBoundingClientRect();
                            n.set("left", e.left),
                              n.set("top", e.top),
                              (0, o.setStyle)(a, "left", `${e.left}px`),
                              (0, o.setStyle)(a, "top", `${e.top}px`),
                              (0, o.setStyle)(a, "transform", null);
                          }
                        }),
                        a
                      );
                    }
                  })(),
                  h = n.get("top"),
                  m = n.get("left");
                h && m
                  ? ((0, o.setStyle)(f, "top", `${h}px`),
                    (0, o.setStyle)(f, "left", `${m}px`),
                    (0, o.isInViewport)(f) || d())
                  : d(),
                  e.emit("mini", !0);
              } else p();
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "1SuFS": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            template: { $poster: t },
          } = e;
          (0, o.def)(e, "poster", {
            get: () => {
              try {
                return t.style.backgroundImage.match(/"(.*)"/)[1];
              } catch (e) {
                return "";
              }
            },
            set(e) {
              (0, o.setStyle)(t, "backgroundImage", `url(${e})`);
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "8x4te": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            template: { $container: t, $video: r },
          } = e;
          (0, o.def)(e, "autoHeight", {
            value() {
              const { clientWidth: n } = t,
                { videoHeight: a, videoWidth: s } = r,
                i = a * (n / s);
              (0, o.setStyle)(t, "height", i + "px"), e.emit("autoHeight", i);
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "1CaTA": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const { $player: t } = e.template;
          (0, o.def)(e, "cssVar", {
            value: (e, r) =>
              r
                ? t.style.setProperty(e, r)
                : getComputedStyle(t).getPropertyValue(e),
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "2FqhO": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          (0, o.def)(e, "theme", {
            get: () => e.cssVar("--art-theme"),
            set(t) {
              e.cssVar("--art-theme", t);
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "1fQQs": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          (0, o.def)(e, "type", {
            get: () => e.option.type,
            set(t) {
              e.option.type = t;
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    iBOQW: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const t = ["mini", "pip", "fullscreen", "fullscreenWeb"];
          (0, o.def)(e, "state", {
            get: () => t.find((t) => e[t]) || "standard",
            set(r) {
              for (let o = 0; o < t.length; o++) {
                const n = t[o];
                n !== r && e[n] && (e[n] = !1);
              }
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "6vlBV": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const { clamp: t } = e.constructor.utils,
            { notice: r, template: n, i18n: a } = e;
          let s = 0,
            i = [];
          e.on("subtitle:switch", () => {
            i = [];
          }),
            (0, o.def)(e, "subtitleOffset", {
              get: () => s,
              set(o) {
                if (n.$track && n.$track.track) {
                  const l = Array.from(n.$track.track.cues);
                  s = t(o, -5, 5);
                  for (let r = 0; r < l.length; r++) {
                    const o = l[r];
                    i[r] ||
                      (i[r] = { startTime: o.startTime, endTime: o.endTime }),
                      (o.startTime = t(i[r].startTime + s, 0, e.duration)),
                      (o.endTime = t(i[r].endTime + s, 0, e.duration));
                  }
                  e.subtitle.update(),
                    (r.show = `${a.get("Subtitle Offset")}: ${o}s`),
                    e.emit("subtitleOffset", o);
                } else e.emit("subtitleOffset", 0);
              },
            });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    eftqT: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            notice: r,
            proxy: n,
            template: { $video: a },
          } = e;
          let s = !0;
          window.WebKitPlaybackTargetAvailabilityEvent &&
          a.webkitShowPlaybackTargetPicker
            ? n(a, "webkitplaybacktargetavailabilitychanged", (e) => {
                switch (e.availability) {
                  case "available":
                    s = !0;
                    break;
                  case "not-available":
                    s = !1;
                }
              })
            : (s = !1),
            (0, o.def)(e, "airplay", {
              value() {
                s
                  ? (a.webkitShowPlaybackTargetPicker(), e.emit("airplay"))
                  : (r.show = t.get("AirPlay Not Available"));
              },
            });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "5SdyX": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          (0, o.def)(e, "quality", {
            set(t) {
              const { controls: r, notice: o, i18n: n } = e,
                a = t.find((e) => e.default) || t[0];
              r.update({
                name: "quality",
                position: "right",
                index: 10,
                style: { marginRight: "10px" },
                html: a ? a.html : "",
                selector: t,
                async onSelect(t) {
                  await e.switchQuality(t.url),
                    (o.show = `${n.get("Switch Video")}: ${t.html}`);
                },
              });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    fCWZK: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            option: t,
            storage: r,
            template: { $video: n, $poster: a },
          } = e;
          for (const r in t.moreVideoAttr) e.attr(r, t.moreVideoAttr[r]);
          t.muted && (e.muted = t.muted),
            t.volume && (n.volume = (0, o.clamp)(t.volume, 0, 1));
          const s = r.get("volume");
          "number" == typeof s && (n.volume = (0, o.clamp)(s, 0, 1)),
            t.poster &&
              (0, o.setStyle)(a, "backgroundImage", `url(${t.poster})`),
            t.autoplay && (n.autoplay = t.autoplay),
            t.playsInline &&
              ((n.playsInline = !0), (n["webkit-playsinline"] = !0)),
            t.theme && (t.cssVar["--art-theme"] = t.theme);
          for (const r in t.cssVar) e.cssVar(r, t.cssVar[r]);
          e.url = t.url;
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    f8Lv3: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../config"),
          a = o.interopDefault(n),
          s = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            notice: r,
            option: o,
            constructor: n,
            proxy: i,
            template: { $player: l, $video: c, $poster: p },
          } = e;
          let u = 0;
          for (let t = 0; t < a.default.events.length; t++)
            i(c, a.default.events[t], (t) => {
              e.emit(`video:${t.type}`, t);
            });
          e.on("video:canplay", () => {
            (u = 0), (e.loading.show = !1);
          }),
            e.once("video:canplay", () => {
              (e.loading.show = !1),
                (e.controls.show = !0),
                (e.mask.show = !0),
                (e.isReady = !0),
                e.emit("ready");
            }),
            e.on("video:ended", () => {
              o.loop
                ? ((e.seek = 0),
                  e.play(),
                  (e.controls.show = !1),
                  (e.mask.show = !1))
                : ((e.controls.show = !0), (e.mask.show = !0));
            }),
            e.on("video:error", async (a) => {
              u < n.RECONNECT_TIME_MAX
                ? (await (0, s.sleep)(n.RECONNECT_SLEEP_TIME),
                  (u += 1),
                  (e.url = o.url),
                  (r.show = `${t.get("Reconnect")}: ${u}`),
                  e.emit("error", a, u))
                : ((e.mask.show = !0),
                  (e.loading.show = !1),
                  (e.controls.show = !0),
                  (0, s.addClass)(l, "art-error"),
                  await (0, s.sleep)(n.RECONNECT_SLEEP_TIME),
                  (r.show = t.get("Video Load Failed")));
            }),
            e.on("video:loadedmetadata", () => {
              e.emit("resize"),
                s.isMobile &&
                  ((e.loading.show = !1),
                  (e.controls.show = !0),
                  (e.mask.show = !0));
            }),
            e.on("video:loadstart", () => {
              (e.loading.show = !0), (e.mask.show = !1), (e.controls.show = !0);
            }),
            e.on("video:pause", () => {
              (e.controls.show = !0), (e.mask.show = !0);
            }),
            e.on("video:play", () => {
              (e.mask.show = !1), (0, s.setStyle)(p, "display", "none");
            }),
            e.on("video:playing", () => {
              e.mask.show = !1;
            }),
            e.on("video:progress", () => {
              e.playing && (e.loading.show = !1);
            }),
            e.on("video:seeked", () => {
              (e.loading.show = !1), (e.mask.show = !0);
            }),
            e.on("video:seeking", () => {
              (e.loading.show = !0), (e.mask.show = !1);
            }),
            e.on("video:timeupdate", () => {
              e.mask.show = !1;
            }),
            e.on("video:waiting", () => {
              (e.loading.show = !0), (e.mask.show = !1);
            });
        };
      },
      {
        "../config": "lyjeQ",
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "8Z0Uf": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../utils"),
          a = e("../utils/component"),
          s = o.interopDefault(a),
          i = e("./fullscreen"),
          l = o.interopDefault(i),
          c = e("./fullscreenWeb"),
          p = o.interopDefault(c),
          u = e("./pip"),
          d = o.interopDefault(u),
          f = e("./playAndPause"),
          h = o.interopDefault(f),
          m = e("./progress"),
          g = o.interopDefault(m),
          v = e("./time"),
          y = o.interopDefault(v),
          b = e("./volume"),
          x = o.interopDefault(b),
          w = e("./setting"),
          k = o.interopDefault(w),
          j = e("./thumbnails"),
          C = o.interopDefault(j),
          S = e("./screenshot"),
          I = o.interopDefault(S),
          $ = e("./airplay"),
          M = o.interopDefault($);
        class T extends s.default {
          constructor(e) {
            super(e), (this.name = "control"), (this.timer = Date.now());
            const { constructor: t } = e,
              { $player: r } = this.art.template;
            e.on("mousemove", () => {
              n.isMobile || (this.show = !0);
            }),
              e.on("click", () => {
                n.isMobile ? this.toggle() : (this.show = !0);
              }),
              e.on("video:timeupdate", () => {
                !e.isInput &&
                  e.playing &&
                  this.show &&
                  Date.now() - this.timer >= t.CONTROL_HIDE_TIME &&
                  (this.show = !1);
              }),
              e.on("control", (e) => {
                e
                  ? ((0, n.removeClass)(r, "art-hide-cursor"),
                    (0, n.addClass)(r, "art-hover"),
                    (this.timer = Date.now()))
                  : ((0, n.addClass)(r, "art-hide-cursor"),
                    (0, n.removeClass)(r, "art-hover"));
              }),
              this.init();
          }
          init() {
            const { option: e } = this.art;
            e.isLive ||
              this.add(
                (0, g.default)({ name: "progress", position: "top", index: 10 })
              ),
              !e.thumbnails.url ||
                e.isLive ||
                n.isMobile ||
                this.add(
                  (0, C.default)({
                    name: "thumbnails",
                    position: "top",
                    index: 20,
                  })
                ),
              this.add(
                (0, h.default)({
                  name: "playAndPause",
                  position: "left",
                  index: 10,
                })
              ),
              this.add(
                (0, x.default)({ name: "volume", position: "left", index: 20 })
              ),
              e.isLive ||
                this.add(
                  (0, y.default)({ name: "time", position: "left", index: 30 })
                ),
              e.quality.length &&
                (0, n.sleep)().then(() => {
                  this.art.quality = e.quality;
                }),
              e.screenshot &&
                !n.isMobile &&
                this.add(
                  (0, I.default)({
                    name: "screenshot",
                    position: "right",
                    index: 20,
                  })
                ),
              e.setting &&
                this.add(
                  (0, k.default)({
                    name: "setting",
                    position: "right",
                    index: 30,
                  })
                ),
              e.pip &&
                this.add(
                  (0, d.default)({ name: "pip", position: "right", index: 40 })
                ),
              e.airplay &&
                window.WebKitPlaybackTargetAvailabilityEvent &&
                this.add(
                  (0, M.default)({
                    name: "airplay",
                    position: "right",
                    index: 50,
                  })
                ),
              e.fullscreenWeb &&
                this.add(
                  (0, p.default)({
                    name: "fullscreenWeb",
                    position: "right",
                    index: 60,
                  })
                ),
              e.fullscreen &&
                this.add(
                  (0, l.default)({
                    name: "fullscreen",
                    position: "right",
                    index: 70,
                  })
                );
            for (let t = 0; t < e.controls.length; t++) this.add(e.controls[t]);
          }
          add(e) {
            const t = "function" == typeof e ? e(this.art) : e,
              {
                $progress: r,
                $controlsLeft: o,
                $controlsRight: a,
                $controlsCenter: s,
              } = this.art.template;
            switch (t.position) {
              case "top":
                this.$parent = r;
                break;
              case "left":
                this.$parent = o;
                break;
              case "right":
                this.$parent = a;
                break;
              case "center":
                this.$parent = s;
                break;
              default:
                (0, n.errorHandle)(
                  !1,
                  "Control option.position must one of 'top', 'left', 'right', 'center'"
                );
            }
            super.add(t);
          }
        }
        r.default = T;
      },
      {
        "../utils": "71aH7",
        "../utils/component": "18nVI",
        "./fullscreen": "c61Lj",
        "./fullscreenWeb": "03jeB",
        "./pip": "u8l8e",
        "./playAndPause": "ebXtb",
        "./progress": "bgoVP",
        "./time": "ikc2j",
        "./volume": "b8NFx",
        "./setting": "03o9l",
        "./thumbnails": "eCVx2",
        "./screenshot": "4KCF5",
        "./airplay": "4IS2d",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "18nVI": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./dom"),
          a = e("./format"),
          s = e("./error"),
          i = e("option-validator"),
          l = o.interopDefault(i),
          c = e("../scheme");
        r.default = class {
          constructor(e) {
            (this.id = 0),
              (this.art = e),
              (this.cache = new Map()),
              (this.add = this.add.bind(this)),
              (this.remove = this.remove.bind(this)),
              (this.update = this.update.bind(this));
          }
          get show() {
            return (0, n.hasClass)(
              this.art.template.$player,
              `art-${this.name}-show`
            );
          }
          set show(e) {
            const { $player: t } = this.art.template,
              r = `art-${this.name}-show`;
            e ? (0, n.addClass)(t, r) : (0, n.removeClass)(t, r),
              this.art.emit(this.name, e);
          }
          toggle() {
            this.show = !this.show;
          }
          add(e) {
            const t = "function" == typeof e ? e(this.art) : e;
            if (
              ((t.html = t.html || ""),
              (0, l.default)(t, c.ComponentOption),
              !this.$parent || !this.name || t.disable)
            )
              return;
            const r = t.name || `${this.name}${this.id}`,
              o = this.cache.get(r);
            (0, s.errorHandle)(
              !o,
              `Can't add an existing [${r}] to the [${this.name}]`
            ),
              (this.id += 1);
            const a = (0, n.createElement)("div");
            (0, n.addClass)(a, `art-${this.name}`),
              (0, n.addClass)(a, `art-${this.name}-${r}`);
            const i = Array.from(this.$parent.children);
            a.dataset.index = t.index || this.id;
            const p = i.find(
              (e) => Number(e.dataset.index) >= Number(a.dataset.index)
            );
            p
              ? p.insertAdjacentElement("beforebegin", a)
              : (0, n.append)(this.$parent, a),
              t.html && (0, n.append)(a, t.html),
              t.style && (0, n.setStyles)(a, t.style),
              t.tooltip && (0, n.tooltip)(a, t.tooltip);
            const u = [];
            if (t.click) {
              const e = this.art.events.proxy(a, "click", (e) => {
                e.preventDefault(), t.click.call(this.art, this, e);
              });
              u.push(e);
            }
            return (
              t.selector &&
                ["left", "right"].includes(t.position) &&
                this.addSelector(t, a, u),
              (this[r] = a),
              this.cache.set(r, { $ref: a, events: u, option: t }),
              t.mounted && t.mounted.call(this.art, a),
              a
            );
          }
          addSelector(e, t, r) {
            const { hover: o, proxy: s } = this.art.events;
            (0, n.addClass)(t, "art-control-selector");
            const i = (0, n.createElement)("div");
            (0, n.addClass)(i, "art-selector-value"),
              (0, n.append)(i, e.html),
              (t.innerText = ""),
              (0, n.append)(t, i);
            const l = e.selector
                .map(
                  (e, t) =>
                    `<div class="art-selector-item ${
                      e.default ? "art-current" : ""
                    }" data-index="${t}">${e.html}</div>`
                )
                .join(""),
              c = (0, n.createElement)("div");
            (0, n.addClass)(c, "art-selector-list"),
              (0, n.append)(c, l),
              (0, n.append)(t, c);
            const p = () => {
              const e =
                (0, n.getStyle)(t, "width") / 2 -
                (0, n.getStyle)(c, "width") / 2;
              c.style.left = `${e}px`;
            };
            o(t, p);
            const u = s(c, "click", async (t) => {
              const r = (t.composedPath() || []).find((e) =>
                (0, n.hasClass)(e, "art-selector-item")
              );
              if (!r) return;
              (0, n.inverseClass)(r, "art-current");
              const o = Number(r.dataset.index),
                s = e.selector[o] || {};
              if (((i.innerText = r.innerText), e.onSelect)) {
                const o = await e.onSelect.call(this.art, s, r, t);
                (0, a.isStringOrNumber)(o) && (i.innerHTML = o);
              }
              p();
            });
            r.push(u);
          }
          remove(e) {
            const t = this.cache.get(e);
            (0, s.errorHandle)(t, `Can't find [${e}] from the [${this.name}]`),
              t.option.beforeUnmount &&
                t.option.beforeUnmount.call(this.art, t.$ref);
            for (let e = 0; e < t.events.length; e++)
              this.art.events.remove(t.events[e]);
            this.cache.delete(e), delete this[e], (0, n.remove)(t.$ref);
          }
          update(e) {
            const t = this.cache.get(e.name);
            return (
              t && ((e = Object.assign(t.option, e)), this.remove(e.name)),
              this.add(e)
            );
          }
        };
      },
      {
        "./dom": "bSNiV",
        "./format": "gapRl",
        "./error": "hwmZz",
        "option-validator": "bAWi2",
        "../scheme": "AKEiO",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    c61Lj: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            tooltip: t.i18n.get("Fullscreen"),
            mounted: (e) => {
              const { proxy: r, icons: n, i18n: a } = t,
                s = (0, o.append)(e, n.fullscreenOn),
                i = (0, o.append)(e, n.fullscreenOff);
              (0, o.setStyle)(i, "display", "none"),
                r(e, "click", () => {
                  t.fullscreen = !t.fullscreen;
                }),
                t.on("fullscreen", (t) => {
                  t
                    ? ((0, o.tooltip)(e, a.get("Exit Fullscreen")),
                      (0, o.setStyle)(s, "display", "none"),
                      (0, o.setStyle)(i, "display", "inline-flex"))
                    : ((0, o.tooltip)(e, a.get("Fullscreen")),
                      (0, o.setStyle)(s, "display", "inline-flex"),
                      (0, o.setStyle)(i, "display", "none"));
                });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "03jeB": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            tooltip: t.i18n.get("Web Fullscreen"),
            mounted: (e) => {
              const { proxy: r, icons: n, i18n: a } = t,
                s = (0, o.append)(e, n.fullscreenWebOn),
                i = (0, o.append)(e, n.fullscreenWebOff);
              (0, o.setStyle)(i, "display", "none"),
                r(e, "click", () => {
                  t.fullscreenWeb = !t.fullscreenWeb;
                }),
                t.on("fullscreenWeb", (t) => {
                  t
                    ? ((0, o.tooltip)(e, a.get("Exit Web Fullscreen")),
                      (0, o.setStyle)(s, "display", "none"),
                      (0, o.setStyle)(i, "display", "inline-flex"))
                    : ((0, o.tooltip)(e, a.get("Web Fullscreen")),
                      (0, o.setStyle)(s, "display", "inline-flex"),
                      (0, o.setStyle)(i, "display", "none"));
                });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    u8l8e: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            tooltip: t.i18n.get("PIP Mode"),
            mounted: (e) => {
              const { proxy: r, icons: n, i18n: a } = t;
              (0, o.append)(e, n.pip),
                r(e, "click", () => {
                  t.pip = !t.pip;
                }),
                t.on("pip", (t) => {
                  (0, o.tooltip)(e, a.get(t ? "Exit PIP Mode" : "PIP Mode"));
                });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    ebXtb: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            mounted: (e) => {
              const { proxy: r, icons: n, i18n: a } = t,
                s = (0, o.append)(e, n.play),
                i = (0, o.append)(e, n.pause);
              function l() {
                (0, o.setStyle)(s, "display", "flex"),
                  (0, o.setStyle)(i, "display", "none");
              }
              function c() {
                (0, o.setStyle)(s, "display", "none"),
                  (0, o.setStyle)(i, "display", "flex");
              }
              (0, o.tooltip)(s, a.get("Play")),
                (0, o.tooltip)(i, a.get("Pause")),
                r(s, "click", () => {
                  t.play();
                }),
                r(i, "click", () => {
                  t.pause();
                }),
                t.playing ? c() : l(),
                t.on("video:playing", () => {
                  c();
                }),
                t.on("video:pause", () => {
                  l();
                });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    bgoVP: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r),
          o.export(r, "getPosFromEvent", () => a),
          o.export(r, "setCurrentTime", () => s);
        var n = e("../utils");
        function a(e, t) {
          const { $progress: r } = e.template,
            { left: o } = r.getBoundingClientRect(),
            a = n.isMobile ? t.touches[0].clientX : t.clientX,
            s = (0, n.clamp)(a - o, 0, r.clientWidth),
            i = (s / r.clientWidth) * e.duration;
          return {
            second: i,
            time: (0, n.secondToTime)(i),
            width: s,
            percentage: (0, n.clamp)(s / r.clientWidth, 0, 1),
          };
        }
        function s(e, t) {
          if (e.isRotate) {
            const r = t.touches[0].clientY / e.height,
              o = r * e.duration;
            e.emit("setBar", "played", r), (e.seek = o);
          } else {
            const { second: r, percentage: o } = a(e, t);
            e.emit("setBar", "played", o), (e.seek = r);
          }
        }
        r.default = function (e) {
          return (t) => {
            const { icons: r, option: o, proxy: i } = t;
            return {
              ...e,
              html: '<div class="art-control-progress-inner"><div class="art-progress-hover"></div><div class="art-progress-loaded"></div><div class="art-progress-played"></div><div class="art-progress-highlight"></div><div class="art-progress-indicator"></div><div class="art-progress-tip"></div></div>',
              mounted: (e) => {
                let l = !1;
                const c = (0, n.query)(".art-progress-hover", e),
                  p = (0, n.query)(".art-progress-loaded", e),
                  u = (0, n.query)(".art-progress-played", e),
                  d = (0, n.query)(".art-progress-highlight", e),
                  f = (0, n.query)(".art-progress-indicator", e),
                  h = (0, n.query)(".art-progress-tip", e);
                function m(e, t) {
                  "loaded" === e && (0, n.setStyle)(p, "width", 100 * t + "%"),
                    "played" === e &&
                      ((0, n.setStyle)(u, "width", 100 * t + "%"),
                      (0, n.setStyle)(f, "left", 100 * t + "%"));
                }
                r.indicator
                  ? (0, n.append)(f, r.indicator)
                  : (0, n.setStyle)(f, "backgroundColor", "var(--art-theme)"),
                  t.on("video:loadedmetadata", () => {
                    for (let e = 0; e < o.highlight.length; e++) {
                      const r = o.highlight[e],
                        a =
                          ((0, n.clamp)(r.time, 0, t.duration) / t.duration) *
                          100,
                        s = `<span data-text="${r.text}" data-time="${r.time}" style="left: ${a}%"></span>`;
                      (0, n.append)(d, s);
                    }
                  }),
                  m("loaded", t.loaded),
                  t.on("setBar", (e, t) => {
                    m(e, t);
                  }),
                  t.on("video:progress", () => {
                    m("loaded", t.loaded);
                  }),
                  t.constructor.USE_RAF
                    ? t.on("raf", () => {
                        m("played", t.played);
                      })
                    : t.on("video:timeupdate", () => {
                        m("played", t.played);
                      }),
                  t.on("video:ended", () => {
                    m("played", 1);
                  }),
                  n.isMobile ||
                    (i(e, "click", (e) => {
                      e.target !== f && s(t, e);
                    }),
                    i(e, "mousemove", (r) => {
                      !(function (e) {
                        const { width: r } = a(t, e);
                        (0, n.setStyle)(c, "width", `${r}px`),
                          (0, n.setStyle)(c, "display", "flex");
                      })(r),
                        (0, n.setStyle)(h, "display", "flex"),
                        (0, n.includeFromEvent)(r, d)
                          ? (function (r) {
                              const { width: o } = a(t, r),
                                { text: s } = r.target.dataset;
                              h.innerHTML = s;
                              const i = h.clientWidth;
                              o <= i / 2
                                ? (0, n.setStyle)(h, "left", 0)
                                : o > e.clientWidth - i / 2
                                ? (0, n.setStyle)(
                                    h,
                                    "left",
                                    e.clientWidth - i + "px"
                                  )
                                : (0, n.setStyle)(h, "left", o - i / 2 + "px");
                            })(r)
                          : (function (r) {
                              const { width: o, time: s } = a(t, r);
                              h.innerHTML = s;
                              const i = h.clientWidth;
                              o <= i / 2
                                ? (0, n.setStyle)(h, "left", 0)
                                : o > e.clientWidth - i / 2
                                ? (0, n.setStyle)(
                                    h,
                                    "left",
                                    e.clientWidth - i + "px"
                                  )
                                : (0, n.setStyle)(h, "left", o - i / 2 + "px");
                            })(r);
                    }),
                    i(e, "mouseleave", () => {
                      (0, n.setStyle)(h, "display", "none"),
                        (0, n.setStyle)(c, "display", "none");
                    }),
                    i(e, "mousedown", (e) => {
                      l = 0 === e.button;
                    }),
                    t.on("document:mousemove", (e) => {
                      if (l) {
                        const { second: r, percentage: o } = a(t, e);
                        m("played", o), (t.seek = r);
                      }
                    }),
                    t.on("document:mouseup", () => {
                      l && (l = !1);
                    }));
              },
            };
          };
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    ikc2j: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            style: o.isMobile
              ? { fontSize: "12px", padding: "0 5px" }
              : { cursor: "auto", padding: "0 10px" },
            mounted: (e) => {
              function r() {
                const r = `${(0, o.secondToTime)(t.currentTime)} / ${(0,
                o.secondToTime)(t.duration)}`;
                r !== e.innerText && (e.innerText = r);
              }
              r();
              const n = [
                "video:loadedmetadata",
                "video:timeupdate",
                "video:progress",
              ];
              for (let e = 0; e < n.length; e++) t.on(n[e], r);
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    b8NFx: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            mounted: (e) => {
              const { proxy: r, icons: n } = t,
                a = (0, o.append)(e, n.volume),
                s = (0, o.append)(e, n.volumeClose),
                i = (0, o.append)(e, '<div class="art-volume-panel"></div>'),
                l = (0, o.append)(i, '<div class="art-volume-inner"></div>'),
                c = (0, o.append)(l, '<div class="art-volume-val"></div>'),
                p = (0, o.append)(l, '<div class="art-volume-slider"></div>'),
                u = (0, o.append)(p, '<div class="art-volume-handle"></div>'),
                d = (0, o.append)(u, '<div class="art-volume-loaded"></div>'),
                f = (0, o.append)(
                  p,
                  '<div class="art-volume-indicator"></div>'
                );
              function h(e) {
                const { top: t, height: r } = p.getBoundingClientRect();
                return 1 - (e.clientY - t) / r;
              }
              function m() {
                if (t.muted || 0 === t.volume)
                  (0, o.setStyle)(a, "display", "none"),
                    (0, o.setStyle)(s, "display", "flex"),
                    (0, o.setStyle)(f, "top", "100%"),
                    (0, o.setStyle)(d, "top", "100%"),
                    (c.innerText = 0);
                else {
                  const e = 100 * t.volume;
                  (0, o.setStyle)(a, "display", "flex"),
                    (0, o.setStyle)(s, "display", "none"),
                    (0, o.setStyle)(f, "top", 100 - e + "%"),
                    (0, o.setStyle)(d, "top", 100 - e + "%"),
                    (c.innerText = Math.floor(e));
                }
              }
              if (
                (m(),
                t.on("video:volumechange", m),
                r(a, "click", () => {
                  t.muted = !0;
                }),
                r(s, "click", () => {
                  t.muted = !1;
                }),
                o.isMobile)
              )
                (0, o.setStyle)(i, "display", "none");
              else {
                let e = !1;
                r(p, "mousedown", (r) => {
                  (e = 0 === r.button), (t.volume = h(r));
                }),
                  t.on("document:mousemove", (r) => {
                    e && ((t.muted = !1), (t.volume = h(r)));
                  }),
                  t.on("document:mouseup", () => {
                    e && (e = !1);
                  });
              }
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "03o9l": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            tooltip: t.i18n.get("Show Setting"),
            mounted: (e) => {
              const { proxy: r, icons: n, i18n: a } = t;
              (0, o.append)(e, n.setting),
                r(e, "click", () => {
                  t.setting.toggle(), t.setting.updateStyle();
                }),
                t.on("setting", (t) => {
                  (0, o.tooltip)(e, a.get(t ? "Hide Setting" : "Show Setting"));
                });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    eCVx2: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils"),
          n = e("./progress");
        r.default = function (e) {
          return (t) => ({
            ...e,
            mounted: (e) => {
              const {
                option: r,
                template: { $progress: a, $video: s },
                events: { proxy: i, loadImg: l },
              } = t;
              let c = null,
                p = !1,
                u = !1;
              i(a, "mousemove", async (i) => {
                if (!p) {
                  p = !0;
                  const e = await l(r.thumbnails.url);
                  (c = e), (u = !0);
                }
                u &&
                  ((0, o.setStyle)(e, "display", "flex"),
                  (function (i) {
                    const { width: l } = (0, n.getPosFromEvent)(t, i),
                      {
                        url: p,
                        number: u,
                        column: d,
                        width: f,
                        height: h,
                      } = r.thumbnails,
                      m = f || c.naturalWidth / d,
                      g = h || m / (s.videoWidth / s.videoHeight),
                      v = a.clientWidth / u,
                      y = Math.floor(l / v),
                      b = Math.ceil(y / d) - 1,
                      x = y % d || d - 1;
                    (0, o.setStyle)(e, "backgroundImage", `url(${p})`),
                      (0, o.setStyle)(e, "height", `${g}px`),
                      (0, o.setStyle)(e, "width", `${m}px`),
                      (0, o.setStyle)(
                        e,
                        "backgroundPosition",
                        `-${x * m}px -${b * g}px`
                      ),
                      l <= m / 2
                        ? (0, o.setStyle)(e, "left", 0)
                        : l > a.clientWidth - m / 2
                        ? (0, o.setStyle)(e, "left", a.clientWidth - m + "px")
                        : (0, o.setStyle)(e, "left", l - m / 2 + "px");
                  })(i));
              }),
                i(a, "mouseleave", () => {
                  (0, o.setStyle)(e, "display", "none");
                }),
                t.on("hover", (t) => {
                  t || (0, o.setStyle)(e, "display", "none");
                });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "./progress": "bgoVP",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "4KCF5": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            tooltip: t.i18n.get("Screenshot"),
            mounted: (e) => {
              const { proxy: r, icons: n } = t;
              (0, o.append)(e, n.screenshot),
                r(e, "click", () => {
                  t.screenshot();
                });
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "4IS2d": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => ({
            ...e,
            tooltip: t.i18n.get("AirPlay"),
            mounted: (e) => {
              const { proxy: r, icons: n } = t;
              (0, o.append)(e, n.airplay), r(e, "click", () => t.airplay());
            },
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "2KYsr": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../utils"),
          a = e("../utils/component"),
          s = o.interopDefault(a),
          i = e("./playbackRate"),
          l = o.interopDefault(i),
          c = e("./aspectRatio"),
          p = o.interopDefault(c),
          u = e("./flip"),
          d = o.interopDefault(u),
          f = e("./version"),
          h = o.interopDefault(f),
          m = e("./close"),
          g = o.interopDefault(m);
        class v extends s.default {
          constructor(e) {
            super(e),
              (this.name = "contextmenu"),
              (this.$parent = e.template.$contextmenu),
              n.isMobile || this.init();
          }
          init() {
            const {
              option: e,
              proxy: t,
              template: { $player: r, $contextmenu: o },
            } = this.art;
            e.playbackRate &&
              this.add((0, l.default)({ name: "playbackRate", index: 10 })),
              e.aspectRatio &&
                this.add((0, p.default)({ name: "aspectRatio", index: 20 })),
              e.flip && this.add((0, d.default)({ name: "flip", index: 30 })),
              this.add((0, h.default)({ name: "version", index: 50 })),
              this.add((0, g.default)({ name: "close", index: 60 }));
            for (let t = 0; t < e.contextmenu.length; t++)
              this.add(e.contextmenu[t]);
            t(r, "contextmenu", (e) => {
              if ((e.preventDefault(), !this.art.constructor.CONTEXTMENU))
                return;
              this.show = !0;
              const t = e.clientX,
                a = e.clientY,
                {
                  height: s,
                  width: i,
                  left: l,
                  top: c,
                } = r.getBoundingClientRect(),
                { height: p, width: u } = o.getBoundingClientRect();
              let d = t - l,
                f = a - c;
              t + u > l + i && (d = i - u),
                a + p > c + s && (f = s - p),
                (0, n.setStyles)(o, { top: `${f}px`, left: `${d}px` });
            }),
              t(r, "click", (e) => {
                (0, n.includeFromEvent)(e, o) || (this.show = !1);
              }),
              this.art.on("blur", () => {
                this.show = !1;
              });
          }
        }
        r.default = v;
      },
      {
        "../utils": "71aH7",
        "../utils/component": "18nVI",
        "./playbackRate": "69eLi",
        "./aspectRatio": "lUefg",
        "./flip": "kysiM",
        "./version": "kRU7C",
        "./close": "jQ8Pm",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "69eLi": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => {
            const {
                i18n: r,
                constructor: { PLAYBACK_RATE: n },
              } = t,
              a = n
                .map(
                  (e) =>
                    `<span data-value="${e}">${
                      1 === e ? r.get("Normal") : e.toFixed(1)
                    }</span>`
                )
                .join("");
            return {
              ...e,
              html: `Playback Speed: ${a}`,
              click: (e, r) => {
                const { value: o } = r.target.dataset;
                o && ((t.playbackRate = Number(o)), (e.show = !1));
              },
              mounted: (e) => {
                const r = (0, o.query)('[data-value="1"]', e);
                r && (0, o.inverseClass)(r, "art-current"),
                  t.on("video:ratechange", () => {
                    const r = (0, o.queryAll)("span", e).find(
                      (e) => Number(e.dataset.value) === t.playbackRate
                    );
                    r && (0, o.inverseClass)(r, "art-current");
                  });
              },
            };
          };
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    lUefg: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => {
            const {
                i18n: r,
                constructor: { ASPECT_RATIO: n },
              } = t,
              a = n
                .map(
                  (e) =>
                    `<span data-value="${e}">${
                      "default" === e ? r.get("Default") : e
                    }</span>`
                )
                .join("");
            return {
              ...e,
              html: `${r.get("Aspect Ratio")}: ${a}`,
              click: (e, r) => {
                const { value: o } = r.target.dataset;
                o && ((t.aspectRatio = o), (e.show = !1));
              },
              mounted: (e) => {
                const r = (0, o.query)('[data-value="default"]', e);
                r && (0, o.inverseClass)(r, "art-current"),
                  t.on("aspectRatio", (t) => {
                    const r = (0, o.queryAll)("span", e).find(
                      (e) => e.dataset.value === t
                    );
                    r && (0, o.inverseClass)(r, "art-current");
                  });
              },
            };
          };
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    kysiM: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (t) => {
            const {
                i18n: r,
                constructor: { FLIP: n },
              } = t,
              a = n
                .map(
                  (e) =>
                    `<span data-value="${e}">${r.get(
                      (0, o.capitalize)(e)
                    )}</span>`
                )
                .join("");
            return {
              ...e,
              html: `${r.get("Video Flip")}: ${a}`,
              click: (e, r) => {
                const { value: o } = r.target.dataset;
                o && ((t.flip = o.toLowerCase()), (e.show = !1));
              },
              mounted: (e) => {
                const r = (0, o.query)('[data-value="normal"]', e);
                r && (0, o.inverseClass)(r, "art-current"),
                  t.on("flip", (t) => {
                    const r = (0, o.queryAll)("span", e).find(
                      (e) => e.dataset.value === t
                    );
                    r && (0, o.inverseClass)(r, "art-current");
                  });
              },
            };
          };
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    kRU7C: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = function (e) {
            return {
              ...e,
              html: window.ctxMenu
                ? `<a href="https://${window.ctxMenu.url}" target="_blank">${window.ctxMenu.text}</a>`
                : "",
            };
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    jQ8Pm: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = function (e) {
            return (t) => ({
              ...e,
              html: t.i18n.get("Close"),
              click: (e) => {
                e.show = !1;
              },
            });
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "02ajl": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./utils"),
          a = e("./utils/component"),
          s = o.interopDefault(a);
        class i extends s.default {
          constructor(e) {
            super(e), (this.name = "info"), n.isMobile || this.init();
          }
          init() {
            const {
              proxy: e,
              constructor: t,
              template: { $infoPanel: r, $infoClose: o, $video: a },
            } = this.art;
            e(o, "click", () => {
              this.show = !1;
            });
            let s = null;
            const i = (0, n.queryAll)("[data-video]", r) || [];
            this.art.on("destroy", () => clearTimeout(s)),
              (function e() {
                for (let e = 0; e < i.length; e++) {
                  const t = i[e],
                    r = a[t.dataset.video],
                    o = "number" == typeof r ? r.toFixed(2) : r;
                  t.innerText !== o && (t.innerText = o);
                }
                s = setTimeout(e, t.INFO_LOOP_TIME);
              })();
          }
        }
        r.default = i;
      },
      {
        "./utils": "71aH7",
        "./utils/component": "18nVI",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    eSWto: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./utils"),
          a = e("./utils/component"),
          s = o.interopDefault(a),
          i = e("option-validator"),
          l = o.interopDefault(i),
          c = e("./scheme"),
          p = o.interopDefault(c);
        class u extends s.default {
          constructor(e) {
            super(e),
              (this.name = "subtitle"),
              (this.eventDestroy = () => null),
              this.init(e.option.subtitle);
            let t = !1;
            e.on("video:timeupdate", () => {
              if (!this.url) return;
              const e = this.art.template.$video.webkitDisplayingFullscreen;
              "boolean" == typeof e &&
                e !== t &&
                ((t = e),
                this.createTrack(e ? "subtitles" : "metadata", this.url));
            });
          }
          get url() {
            return this.art.template.$track.src;
          }
          set url(e) {
            this.switch(e);
          }
          get textTrack() {
            return this.art.template.$video.textTracks[0];
          }
          get activeCue() {
            return this.textTrack.activeCues[0];
          }
          style(e, t) {
            const { $subtitle: r } = this.art.template;
            return "object" == typeof e
              ? (0, n.setStyles)(r, e)
              : (0, n.setStyle)(r, e, t);
          }
          update() {
            const { $subtitle: e } = this.art.template;
            (e.innerHTML = ""),
              this.activeCue &&
                (this.art.option.subtitle.escape
                  ? (e.innerHTML = this.activeCue.text
                      .split(/\r?\n/)
                      .map(
                        (e) =>
                          `<div class="art-subtitle-line">${(0, n.escape)(
                            e
                          )}</div>`
                      )
                      .join(""))
                  : (e.innerHTML = this.activeCue.text),
                this.art.emit("subtitleUpdate", this.activeCue.text));
          }
          async switch(e, t = {}) {
            const { i18n: r, notice: o, option: n } = this.art,
              a = { ...n.subtitle, ...t, url: e },
              s = await this.init(a);
            return (
              t.name && (o.show = `${r.get("Switch Subtitle")}: ${t.name}`), s
            );
          }
          createTrack(e, t) {
            const { template: r, proxy: o, option: a } = this.art,
              { $video: s, $track: i } = r,
              l = (0, n.createElement)("track");
            (l.default = !0),
              (l.kind = e),
              (l.src = t),
              (l.label = a.subtitle.name || "Artplayer"),
              (l.track.mode = "hidden"),
              this.eventDestroy(),
              (0, n.remove)(i),
              (0, n.append)(s, l),
              (r.$track = l),
              (this.eventDestroy = o(this.textTrack, "cuechange", () =>
                this.update()
              ));
          }
          async init(e) {
            const {
              notice: t,
              template: { $subtitle: r },
            } = this.art;
            if (((0, l.default)(e, p.default.subtitle), e.url))
              return (
                this.style(e.style),
                fetch(e.url)
                  .then((e) => e.arrayBuffer())
                  .then((t) => {
                    const r = new TextDecoder(e.encoding).decode(t);
                    switch (
                      (this.art.emit("subtitleLoad", e.url),
                      e.type || (0, n.getExt)(e.url))
                    ) {
                      case "srt": {
                        const t = (0, n.srtToVtt)(r),
                          o = e.onVttLoad(t);
                        return (0, n.vttToBlob)(o);
                      }
                      case "ass": {
                        const t = (0, n.assToVtt)(r),
                          o = e.onVttLoad(t);
                        return (0, n.vttToBlob)(o);
                      }
                      case "vtt": {
                        const t = e.onVttLoad(r);
                        return (0, n.vttToBlob)(t);
                      }
                      default:
                        return e.url;
                    }
                  })
                  .then(
                    (e) => (
                      (r.innerHTML = ""),
                      this.url === e ||
                        (URL.revokeObjectURL(this.url),
                        this.createTrack("metadata", e),
                        this.art.emit("subtitleSwitch", e)),
                      e
                    )
                  )
                  .catch((e) => {
                    throw ((r.innerHTML = ""), (t.show = e), e);
                  })
              );
          }
        }
        r.default = u;
      },
      {
        "./utils": "71aH7",
        "./utils/component": "18nVI",
        "option-validator": "bAWi2",
        "./scheme": "AKEiO",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    jo4S1: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../utils/error"),
          a = e("./clickInit"),
          s = o.interopDefault(a),
          i = e("./hoverInit"),
          l = o.interopDefault(i),
          c = e("./moveInit"),
          p = o.interopDefault(c),
          u = e("./resizeInit"),
          d = o.interopDefault(u),
          f = e("./gestureInit"),
          h = o.interopDefault(f),
          m = e("./viewInit"),
          g = o.interopDefault(m),
          v = e("./documentInit"),
          y = o.interopDefault(v),
          b = e("./updateInit"),
          x = o.interopDefault(b);
        r.default = class {
          constructor(e) {
            (this.destroyEvents = []),
              (this.proxy = this.proxy.bind(this)),
              (this.hover = this.hover.bind(this)),
              (this.loadImg = this.loadImg.bind(this)),
              (0, s.default)(e, this),
              (0, l.default)(e, this),
              (0, p.default)(e, this),
              (0, d.default)(e, this),
              (0, h.default)(e, this),
              (0, g.default)(e, this),
              (0, y.default)(e, this),
              (0, x.default)(e, this);
          }
          proxy(e, t, r, o = {}) {
            if (Array.isArray(t)) return t.map((t) => this.proxy(e, t, r, o));
            e.addEventListener(t, r, o);
            const n = () => e.removeEventListener(t, r, o);
            return this.destroyEvents.push(n), n;
          }
          hover(e, t, r) {
            t && this.proxy(e, "mouseenter", t),
              r && this.proxy(e, "mouseleave", r);
          }
          loadImg(e) {
            return new Promise((t, r) => {
              let o;
              if (e instanceof HTMLImageElement) o = e;
              else {
                if ("string" != typeof e)
                  return r(new (0, n.ArtPlayerError)("Unable to get Image"));
                (o = new Image()), (o.src = e);
              }
              if (o.complete) return t(o);
              this.proxy(o, "load", () => t(o)),
                this.proxy(o, "error", () =>
                  r(new (0, n.ArtPlayerError)(`Failed to load Image: ${o.src}`))
                );
            });
          }
          remove(e) {
            const t = this.destroyEvents.indexOf(e);
            t > -1 && (e(), this.destroyEvents.splice(t, 1));
          }
          destroy() {
            for (let e = 0; e < this.destroyEvents.length; e++)
              this.destroyEvents[e]();
          }
        };
      },
      {
        "../utils/error": "hwmZz",
        "./clickInit": "6UrCm",
        "./hoverInit": "4jWHi",
        "./moveInit": "eqaUm",
        "./resizeInit": "eDXPO",
        "./gestureInit": "95GtS",
        "./viewInit": "InUBx",
        "./documentInit": "hoLfM",
        "./updateInit": "cl8m3",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "6UrCm": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e, t) {
          const {
            constructor: r,
            template: { $player: n, $video: a },
          } = e;
          t.proxy(document, ["click", "contextmenu"], (t) => {
            (0, o.includeFromEvent)(t, n)
              ? ((e.isInput = "INPUT" === t.target.tagName),
                (e.isFocus = !0),
                e.emit("focus", t))
              : ((e.isInput = !1), (e.isFocus = !1), e.emit("blur", t));
          });
          let s = 0;
          t.proxy(a, "click", (t) => {
            const n = Date.now(),
              {
                MOBILE_CLICK_PLAY: a,
                DBCLICK_TIME: i,
                MOBILE_DBCLICK_PLAY: l,
                DBCLICK_FULLSCREEN: c,
              } = r;
            n - s <= i
              ? (e.emit("dblclick", t),
                o.isMobile
                  ? !e.isLock && l && e.toggle()
                  : c && (e.fullscreen = !e.fullscreen))
              : (e.emit("click", t),
                o.isMobile ? !e.isLock && a && e.toggle() : e.toggle()),
              (s = n);
          });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "4jWHi": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e, t) {
          const { $player: r } = e.template;
          t.hover(
            r,
            (t) => {
              (0, o.addClass)(r, "art-hover"), e.emit("hover", !0, t);
            },
            (t) => {
              (0, o.removeClass)(r, "art-hover"), e.emit("hover", !1, t);
            }
          );
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    eqaUm: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = function (e, t) {
            const { $player: r } = e.template;
            t.proxy(r, "mousemove", (t) => {
              e.emit("mousemove", t);
            });
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    eDXPO: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e, t) {
          const { option: r, constructor: n } = e;
          e.on("resize", () => {
            const { aspectRatio: t, notice: o } = e;
            "standard" === e.state && r.autoSize && e.autoSize(),
              (e.aspectRatio = t),
              (o.show = "");
          });
          const a = (0, o.debounce)(() => e.emit("resize"), n.RESIZE_TIME);
          t.proxy(window, ["orientationchange", "resize"], () => a()),
            screen &&
              screen.orientation &&
              screen.orientation.onchange &&
              t.proxy(screen.orientation, "change", () => a());
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "95GtS": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils"),
          n = e("../control/progress");
        function a(e, t, r, o) {
          var n = t - o,
            a = r - e,
            s = 0;
          if (Math.abs(a) < 2 && Math.abs(n) < 2) return s;
          var i = (function (e, t) {
            return (180 * Math.atan2(t, e)) / Math.PI;
          })(a, n);
          return (
            i >= -45 && i < 45
              ? (s = 4)
              : i >= 45 && i < 135
              ? (s = 1)
              : i >= -135 && i < -45
              ? (s = 2)
              : ((i >= 135 && i <= 180) || (i >= -180 && i < -135)) && (s = 3),
            s
          );
        }
        r.default = function (e, t) {
          if (o.isMobile && !e.option.isLive) {
            const { $video: r, $progress: s } = e.template;
            let i = null,
              l = !1,
              c = 0,
              p = 0,
              u = 0;
            const d = (t) => {
                if (1 === t.touches.length && !e.isLock) {
                  i === s && (0, n.setCurrentTime)(e, t), (l = !0);
                  const { pageX: r, pageY: o } = t.touches[0];
                  (c = r), (p = o), (u = e.currentTime);
                }
              },
              f = (t) => {
                if (1 === t.touches.length && l && e.duration) {
                  const { pageX: n, pageY: s } = t.touches[0],
                    l = a(c, p, n, s),
                    d = [3, 4].includes(l),
                    f = [1, 2].includes(l);
                  if ((d && !e.isRotate) || (f && e.isRotate)) {
                    const t = (0, o.clamp)((n - c) / e.width, -1, 1),
                      a = (0, o.clamp)((s - p) / e.height, -1, 1),
                      l = e.isRotate ? a : t,
                      d = i === r ? e.constructor.TOUCH_MOVE_RATIO : 1,
                      f = (0, o.clamp)(u + e.duration * l * d, 0, e.duration);
                    (e.seek = f),
                      e.emit(
                        "setBar",
                        "played",
                        (0, o.clamp)(f / e.duration, 0, 1)
                      ),
                      (e.notice.show = `${(0, o.secondToTime)(f)} / ${(0,
                      o.secondToTime)(e.duration)}`);
                  }
                }
              },
              h = () => {
                l && ((c = 0), (p = 0), (u = 0), (l = !1), (i = null));
              };
            t.proxy(s, "touchstart", (e) => {
              (i = s), d(e);
            }),
              t.proxy(r, "touchstart", (e) => {
                (i = r), d(e);
              }),
              t.proxy(r, "touchmove", f),
              t.proxy(s, "touchmove", f),
              t.proxy(document, "touchend", h);
          }
        };
      },
      {
        "../utils": "71aH7",
        "../control/progress": "bgoVP",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    InUBx: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e, t) {
          const {
              option: r,
              constructor: n,
              template: { $container: a },
            } = e,
            s = (0, o.throttle)(() => {
              e.emit("view", (0, o.isInViewport)(a, n.SCROLL_GAP));
            }, n.SCROLL_TIME);
          t.proxy(window, "scroll", () => s()),
            e.on("view", (t) => {
              r.autoMini && (e.mini = !t);
            });
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    hoLfM: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = function (e, t) {
            t.proxy(document, "mousemove", (t) => {
              e.emit("document:mousemove", t);
            }),
              t.proxy(document, "mouseup", (t) => {
                e.emit("document:mouseup", t);
              });
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    cl8m3: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = function (e) {
            if (e.constructor.USE_RAF) {
              let t = null;
              !(function r() {
                e.playing && e.emit("raf"),
                  e.isDestroy || (t = requestAnimationFrame(r));
              })(),
                e.on("destroy", () => {
                  cancelAnimationFrame(t);
                });
            }
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "6NoFy": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("./utils");
        r.default = class {
          constructor(e) {
            (this.art = e),
              (this.keys = {}),
              e.option.hotkey && !o.isMobile && this.init();
          }
          init() {
            const { proxy: e, constructor: t } = this.art;
            this.add(27, () => {
              this.art.fullscreenWeb && (this.art.fullscreenWeb = !1);
            }),
              this.add(32, () => {
                this.art.toggle();
              }),
              this.add(37, () => {
                this.art.backward = t.SEEK_STEP;
              }),
              this.add(38, () => {
                this.art.volume += t.VOLUME_STEP;
              }),
              this.add(39, () => {
                this.art.forward = t.SEEK_STEP;
              }),
              this.add(40, () => {
                this.art.volume -= t.VOLUME_STEP;
              }),
              e(window, "keydown", (e) => {
                if (this.art.isFocus) {
                  const t = document.activeElement.tagName.toUpperCase(),
                    r = document.activeElement.getAttribute("contenteditable");
                  if (
                    !(
                      "INPUT" === t ||
                      "TEXTAREA" === t ||
                      "" === r ||
                      "true" === r ||
                      e.altKey ||
                      e.ctrlKey ||
                      e.metaKey ||
                      e.shiftKey
                    )
                  ) {
                    const t = this.keys[e.keyCode];
                    if (t) {
                      e.preventDefault();
                      for (let r = 0; r < t.length; r++) t[r].call(this.art, e);
                      this.art.emit("hotkey", e);
                    }
                  }
                }
              });
          }
          add(e, t) {
            return (
              this.keys[e] ? this.keys[e].push(t) : (this.keys[e] = [t]), this
            );
          }
          remove(e, t) {
            if (this.keys[e]) {
              const r = this.keys[e].indexOf(t);
              -1 !== r && this.keys[e].splice(r, 1);
            }
            return this;
          }
        };
      },
      {
        "./utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "6G6hZ": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./utils/component"),
          a = o.interopDefault(n);
        class s extends a.default {
          constructor(e) {
            super(e);
            const {
              option: t,
              template: { $layer: r },
            } = e;
            (this.name = "layer"), (this.$parent = r);
            for (let e = 0; e < t.layers.length; e++) this.add(t.layers[e]);
          }
        }
        r.default = s;
      },
      {
        "./utils/component": "18nVI",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "3dsEe": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./utils"),
          a = e("./utils/component"),
          s = o.interopDefault(a);
        class i extends s.default {
          constructor(e) {
            super(e),
              (this.name = "loading"),
              (0, n.append)(e.template.$loading, e.icons.loading);
          }
        }
        r.default = i;
      },
      {
        "./utils": "71aH7",
        "./utils/component": "18nVI",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    dWGTw: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("./utils");
        r.default = class {
          constructor(e) {
            (this.art = e), (this.timer = null);
          }
          set show(e) {
            const {
              constructor: t,
              template: { $player: r, $noticeInner: n },
            } = this.art;
            e
              ? ((n.innerText = e instanceof Error ? e.message.trim() : e),
                (0, o.addClass)(r, "art-notice-show"),
                clearTimeout(this.timer),
                (this.timer = setTimeout(() => {
                  (n.innerText = ""), (0, o.removeClass)(r, "art-notice-show");
                }, t.NOTICE_TIME)))
              : (0, o.removeClass)(r, "art-notice-show");
          }
        };
      },
      {
        "./utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "5POkG": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./utils"),
          a = e("./utils/component"),
          s = o.interopDefault(a);
        class i extends s.default {
          constructor(e) {
            super(e), (this.name = "mask");
            const { template: t, icons: r, events: o } = e,
              a = (0, n.append)(t.$state, r.state),
              s = (0, n.append)(t.$state, r.error);
            (0, n.setStyle)(s, "display", "none"),
              e.on("destroy", () => {
                (0, n.setStyle)(a, "display", "none"),
                  (0, n.setStyle)(s, "display", null);
              }),
              o.proxy(t.$state, "click", () => e.play());
          }
        }
        r.default = i;
      },
      {
        "./utils": "71aH7",
        "./utils/component": "18nVI",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "6OeNg": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../utils"),
          a = e("bundle-text:./loading.svg"),
          s = o.interopDefault(a),
          i = e("bundle-text:./state.svg"),
          l = o.interopDefault(i),
          c = e("bundle-text:./check.svg"),
          p = o.interopDefault(c),
          u = e("bundle-text:./play.svg"),
          d = o.interopDefault(u),
          f = e("bundle-text:./pause.svg"),
          h = o.interopDefault(f),
          m = e("bundle-text:./volume.svg"),
          g = o.interopDefault(m),
          v = e("bundle-text:./volume-close.svg"),
          y = o.interopDefault(v),
          b = e("bundle-text:./screenshot.svg"),
          x = o.interopDefault(b),
          w = e("bundle-text:./setting.svg"),
          k = o.interopDefault(w),
          j = e("bundle-text:./arrow-left.svg"),
          C = o.interopDefault(j),
          S = e("bundle-text:./arrow-right.svg"),
          I = o.interopDefault(S),
          $ = e("bundle-text:./playback-rate.svg"),
          M = o.interopDefault($),
          T = e("bundle-text:./aspect-ratio.svg"),
          E = o.interopDefault(T),
          F = e("bundle-text:./pip.svg"),
          D = o.interopDefault(F),
          H = e("bundle-text:./lock.svg"),
          A = o.interopDefault(H),
          R = e("bundle-text:./unlock.svg"),
          O = o.interopDefault(R),
          P = e("bundle-text:./fullscreen-off.svg"),
          Y = o.interopDefault(P),
          L = e("bundle-text:./fullscreen-on.svg"),
          z = o.interopDefault(L),
          _ = e("bundle-text:./fullscreen-web-off.svg"),
          N = o.interopDefault(_),
          B = e("bundle-text:./fullscreen-web-on.svg"),
          V = o.interopDefault(B),
          q = e("bundle-text:./switch-on.svg"),
          W = o.interopDefault(q),
          U = e("bundle-text:./switch-off.svg"),
          Z = o.interopDefault(U),
          K = e("bundle-text:./flip.svg"),
          G = o.interopDefault(K),
          X = e("bundle-text:./error.svg"),
          Q = o.interopDefault(X),
          J = e("bundle-text:./close.svg"),
          ee = o.interopDefault(J),
          te = e("bundle-text:./airplay.svg"),
          re = o.interopDefault(te),
          oe = e("bundle-text:./chromecast.svg"),
          ne = o.interopDefault(oe),
          ae = e("bundle-text:./quality.svg"),
          se = o.interopDefault(ae),
          ie = e("bundle-text:./subtitle.svg"),
          le = o.interopDefault(ie),
          ce = e("bundle-text:./sliders.svg"),
          pe = o.interopDefault(ce),
          ue = e("bundle-text:./fast-forward.svg"),
          de = o.interopDefault(ue),
          fe = e("bundle-text:./fast-rewind.svg"),
          he = o.interopDefault(fe),
          me = e("bundle-text:./cloud.svg"),
          ge = o.interopDefault(me),
          ve = e("bundle-text:./offset.svg"),
          ye = o.interopDefault(ve);
        r.default = class {
          constructor(e) {
            const t = {
              loading: s.default,
              state: l.default,
              play: d.default,
              pause: h.default,
              check: p.default,
              volume: g.default,
              volumeClose: y.default,
              screenshot: x.default,
              setting: k.default,
              pip: D.default,
              arrowLeft: C.default,
              arrowRight: I.default,
              playbackRate: M.default,
              aspectRatio: E.default,
              lock: A.default,
              flip: G.default,
              unlock: O.default,
              fullscreenOff: Y.default,
              fullscreenOn: z.default,
              fullscreenWebOff: N.default,
              fullscreenWebOn: V.default,
              switchOn: W.default,
              switchOff: Z.default,
              error: Q.default,
              close: ee.default,
              airplay: re.default,
              quality: se.default,
              chromecast: ne.default,
              subtitle: le.default,
              sliders: pe.default,
              fastForward: de.default,
              fastRewind: he.default,
              cloud: ge.default,
              offset: ye.default,
              ...e.option.icons,
            };
            for (const e in t)
              (0, n.def)(this, e, { get: () => (0, n.getIcon)(e, t[e]) });
          }
        };
      },
      {
        "../utils": "71aH7",
        "bundle-text:./loading.svg": "7tDub",
        "bundle-text:./state.svg": "1ElZc",
        "bundle-text:./check.svg": "lmgoP",
        "bundle-text:./play.svg": "lVWoQ",
        "bundle-text:./pause.svg": "5Mnax",
        "bundle-text:./volume.svg": "w3eIa",
        "bundle-text:./volume-close.svg": "rHjo1",
        "bundle-text:./screenshot.svg": "2KcqM",
        "bundle-text:./setting.svg": "8rQMV",
        "bundle-text:./arrow-left.svg": "kqGBE",
        "bundle-text:./arrow-right.svg": "aFjpC",
        "bundle-text:./playback-rate.svg": "lx7ZM",
        "bundle-text:./aspect-ratio.svg": "2sEjf",
        "bundle-text:./pip.svg": "2CaxO",
        "bundle-text:./lock.svg": "aCGnW",
        "bundle-text:./unlock.svg": "bTrAV",
        "bundle-text:./fullscreen-off.svg": "bA3p0",
        "bundle-text:./fullscreen-on.svg": "fTuY8",
        "bundle-text:./fullscreen-web-off.svg": "tvKf4",
        "bundle-text:./fullscreen-web-on.svg": "1F1oB",
        "bundle-text:./switch-on.svg": "7qNHs",
        "bundle-text:./switch-off.svg": "28aV8",
        "bundle-text:./flip.svg": "1uXI6",
        "bundle-text:./error.svg": "9f4dh",
        "bundle-text:./close.svg": "4nTtS",
        "bundle-text:./airplay.svg": "cDPXC",
        "bundle-text:./chromecast.svg": "etUrX",
        "bundle-text:./quality.svg": "166Bb",
        "bundle-text:./subtitle.svg": "gHMXo",
        "bundle-text:./sliders.svg": "6HLyI",
        "bundle-text:./fast-forward.svg": "jQ8Kk",
        "bundle-text:./fast-rewind.svg": "eQAfd",
        "bundle-text:./cloud.svg": "l1l8z",
        "bundle-text:./offset.svg": "lg5FS",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "7tDub": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke="#fff"><circle cx="12" cy="12" r="9.5" fill="none" stroke-linecap="round" stroke-width="1.5"><animate attributeName="stroke-dasharray" calcMode="spline" dur="1.5s" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" keyTimes="0;0.475;0.95;1" repeatCount="indefinite" values="0 150;42 150;42 150;42 150"/><animate attributeName="stroke-dashoffset" calcMode="spline" dur="1.5s" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" keyTimes="0;0.475;0.95;1" repeatCount="indefinite" values="0;-16;-59;-59"/></circle><animateTransform attributeName="transform" dur="2s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></g></svg>';
      },
      {},
    ],
    "1ElZc": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" stroke="#fff" stroke-width="25" style="fill: #ffffff4f !important;"><path d="M133,440a35.37,35.37,0,0,1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37,7.46-27.53,19.46-34.33a35.13,35.13,0,0,1,35.77.45L399.12,225.48a36,36,0,0,1,0,61L151.23,434.88A35.5,35.5,0,0,1,133,440Z"></path></svg>';
      },
      {},
    ],
    lmgoP: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="fill-none" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" stroke="none"/><path d="m5 12 5 5L20 7"/></svg>';
      },
      {},
    ],
    lVWoQ: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 1 25 25" class="fill-none"><path fill="none" stroke="#fff" stroke-width="2" d="M20.409 9.353a2.998 2.998 0 0 1 0 5.294L7.597 21.614C5.534 22.737 3 21.277 3 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>';
      },
      {},
    ],
    "5Mnax": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" stroke="#fff" class="fill-none" width="24" height="24" viewBox="2 2 21 21" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M6 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM14 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/></svg>';
      },
      {},
    ],
    w3eIa: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" fill="none" viewBox="1 0 22 25"><path stroke="#fff" stroke-linecap="round" stroke-width="1.5" d="M20.802 8a40.484 40.484 0 0 1 0 8"/><path stroke="#fff" stroke-linejoin="round" stroke-width="1.5" d="M13 12c0-1.884-.163-3.73-.475-5.525-.123-.704-.937-1.019-1.52-.605L8.52 7.632A2 2 0 0 1 7.363 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2.363a2 2 0 0 1 1.157.368l2.485 1.762c.583.414 1.397.1 1.52-.605A32.2 32.2 0 0 0 13 12Z"/><path stroke="#fff" stroke-linecap="round" stroke-width="1.5" d="M16.877 9a36.485 36.485 0 0 1 0 6"/></svg>';
      },
      {},
    ],
    rHjo1: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" fill="none" viewBox="1 0 22 25"><path stroke="#fff" stroke-linejoin="round" stroke-width="1.5" d="M13 12c0-1.884-.163-3.73-.475-5.525-.123-.704-.937-1.019-1.52-.605L8.52 7.632A2 2 0 0 1 7.363 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2.363a2 2 0 0 1 1.157.368l2.485 1.762c.583.414 1.397.1 1.52-.605A32.2 32.2 0 0 0 13 12Z"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m17 10 4 4m-4 0 4-4"/></svg>';
      },
      {},
    ],
    "2KcqM": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 50 50"><path d="M19.402 6a5 5 0 0 0-4.902 4.012L14.098 12H9a5 5 0 0 0-5 5v21a5 5 0 0 0 5 5h32a5 5 0 0 0 5-5V17a5 5 0 0 0-5-5h-5.098l-.402-1.988A5 5 0 0 0 30.598 6ZM25 17c5.52 0 10 4.48 10 10s-4.48 10-10 10-10-4.48-10-10 4.48-10 10-10Zm0 2c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8Z"/></svg>';
      },
      {},
    ],
    "8rQMV": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" fill="none" viewBox="0 0 24 24"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.75" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.75" d="M2 12.88v-1.76c0-1.04.85-1.9 1.9-1.9 1.81 0 2.55-1.28 1.64-2.85-.52-.9-.21-2.07.7-2.59l1.73-.99c.79-.47 1.81-.19 2.28.6l.11.19c.9 1.57 2.38 1.57 3.29 0l.11-.19c.47-.79 1.49-1.07 2.28-.6l1.73.99c.91.52 1.22 1.69.7 2.59-.91 1.57-.17 2.85 1.64 2.85 1.04 0 1.9.85 1.9 1.9v1.76c0 1.04-.85 1.9-1.9 1.9-1.81 0-2.55 1.28-1.64 2.85.52.91.21 2.07-.7 2.59l-1.73.99c-.79.47-1.81.19-2.28-.6l-.11-.19c-.9-1.57-2.38-1.57-3.29 0l-.11.19c-.47.79-1.49 1.07-2.28.6l-1.73-.99a1.899 1.899 0 0 1-.7-2.59c.91-1.57.17-2.85-1.64-2.85-1.05 0-1.9-.86-1.9-1.9Z"/></svg>';
      },
      {},
    ],
    kqGBE: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="fill-none chevron" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" stroke="none"/><path d="m15 6-6 6 6 6"/></svg>';
      },
      {},
    ],
    aFjpC: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="fill-none chevron" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" stroke="none"/><path d="m9 6 6 6-6 6"/></svg>';
      },
      {},
    ],
    lx7ZM: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24"><path d="M12 5a10 10 0 0 0-8.66 15 1 1 0 0 0 1.74-1A7.92 7.92 0 0 1 4 15a8 8 0 1 1 14.93 4 1 1 0 0 0 .37 1.37 1 1 0 0 0 1.36-.37A10 10 0 0 0 12 5Zm2.84 5.76-1.55 1.54A2.91 2.91 0 0 0 12 12a3 3 0 1 0 3 3 2.9 2.9 0 0 0-.3-1.28l1.55-1.54a1 1 0 0 0 0-1.42 1 1 0 0 0-1.41 0ZM12 16a1 1 0 0 1 0-2 1 1 0 0 1 .7.28 1 1 0 0 1 .3.72 1 1 0 0 1-1 1Z"/></svg>';
      },
      {},
    ],
    "2sEjf": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" style="width:100%;height:100%;transform:translate(0,0)"><defs><clipPath id="__lottie_element_216"><path d="M0 0h88v88H0z"/></clipPath></defs><g style="display:block" clip-path="url(\'#__lottie_element_216\')"><path fill="#FFF" d="m12.438-12.702-2.82 2.82c-.79.79-.79 2.05 0 2.83l7.07 7.07-7.07 7.07c-.79.79-.79 2.05 0 2.83l2.82 2.83c.79.78 2.05.78 2.83 0l11.32-11.31c.78-.78.78-2.05 0-2.83l-11.32-11.31c-.78-.79-2.04-.79-2.83 0zm-24.88 0c-.74-.74-1.92-.78-2.7-.12l-.13.12-11.31 11.31a2 2 0 0 0-.12 2.7l.12.13 11.31 11.31a2 2 0 0 0 2.7.12l.13-.12 2.83-2.83c.74-.74.78-1.91.11-2.7l-.11-.13-7.07-7.07 7.07-7.07c.74-.74.78-1.91.11-2.7l-.11-.13-2.83-2.82zM28-28c4.42 0 8 3.58 8 8v40c0 4.42-3.58 8-8 8h-56c-4.42 0-8-3.58-8-8v-40c0-4.42 3.58-8 8-8h56z" style="--darkreader-inline-fill:#a8a6a4" transform="translate(44 44)"/></g></svg>';
      },
      {},
    ],
    "2CaxO": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" viewBox="0 0 24 24"><g fill="none" stroke="#fff" stroke-width="2"><path stroke-linecap="round" d="M11 21h-1c-3.771 0-5.657 0-6.828-1.172C2 18.657 2 16.771 2 13v-2c0-3.771 0-5.657 1.172-6.828C4.343 3 6.229 3 10 3h4c3.771 0 5.657 0 6.828 1.172C22 5.343 22 7.229 22 11"/><path d="M13 17c0-1.886 0-2.828.586-3.414C14.172 13 15.114 13 17 13h1c1.886 0 2.828 0 3.414.586C22 14.172 22 15.114 22 17c0 1.886 0 2.828-.586 3.414C20.828 21 19.886 21 18 21h-1c-1.886 0-2.828 0-3.414-.586C13 19.828 13 18.886 13 17Z"/></g></svg>';
      },
      {},
    ],
    aCGnW: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24"><path d="M12 13a1.49 1.49 0 0 0-1 2.61V17a1 1 0 0 0 2 0v-1.39A1.49 1.49 0 0 0 12 13Zm5-4V7A5 5 0 0 0 7 7v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3ZM9 7a3 3 0 0 1 6 0v2H9Zm9 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1Z"/></svg>';
      },
      {},
    ],
    bTrAV: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24"><path d="M12 13a1.49 1.49 0 0 0-1 2.61V17a1 1 0 0 0 2 0v-1.39A1.49 1.49 0 0 0 12 13Zm5-4H9V7a3 3 0 0 1 5.12-2.13 3.08 3.08 0 0 1 .78 1.38 1 1 0 1 0 1.94-.5 5.09 5.09 0 0 0-1.31-2.29A5 5 0 0 0 7 7v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3Zm1 10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1Z"/></svg>';
      },
      {},
    ],
    bA3p0: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" width="24" height="24" viewBox="2 2 20.2 21" stroke-width="2" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></svg>';
      },
      {},
    ],
    fTuY8: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" width="24" height="24" stroke-width="2.35" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></svg>';
      },
      {},
    ],
    tvKf4: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" width="24" height="24" viewBox="2 2 20.2 21" stroke-width="2" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></svg>';
      },
      {},
    ],
    "1F1oB": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" width="24" height="24" stroke-width="2.35" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></svg>';
      },
      {},
    ],
    "7qNHs": [
      function (e, t, r) {
        t.exports =
          '<svg class="icon" width="26" height="26" viewBox="0 0 1664 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#648FFC" d="M1152 0H512a512 512 0 0 0 0 1024h640a512 512 0 0 0 0-1024zm0 960a448 448 0 1 1 448-448 448 448 0 0 1-448 448z"/></svg>';
      },
      {},
    ],
    "28aV8": [
      function (e, t, r) {
        t.exports =
          '<svg class="icon" width="26" height="26" viewBox="0 0 1740 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M511.898 1024h670.515c282.419-.41 511.18-229.478 511.18-511.898 0-282.419-228.761-511.488-511.18-511.897H511.898C229.478.615.717 229.683.717 512.102c0 282.42 228.761 511.488 511.18 511.898zm-.564-975.36A464.589 464.589 0 1 1 48.026 513.024 463.872 463.872 0 0 1 511.334 48.435v.205z"/></svg>';
      },
      {},
    ],
    "1uXI6": [
      function (e, t, r) {
        t.exports =
          '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M554.667 810.667V896h-85.334v-85.333h85.334zm-384-632.662a42.667 42.667 0 0 1 34.986 18.219l203.904 291.328a42.667 42.667 0 0 1 0 48.896L205.611 827.776A42.667 42.667 0 0 1 128 803.328V220.672a42.667 42.667 0 0 1 42.667-42.667zm682.666 0a42.667 42.667 0 0 1 42.368 37.718l.299 4.949v582.656a42.667 42.667 0 0 1-74.24 28.63l-3.413-4.182-203.904-291.328a42.667 42.667 0 0 1-3.03-43.861l3.03-5.035 203.946-291.328a42.667 42.667 0 0 1 34.944-18.219zM554.667 640v85.333h-85.334V640h85.334zm-358.4-320.896V716.8L335.957 512 196.31 319.104zm358.4 150.23v85.333h-85.334v-85.334h85.334zm0-170.667V384h-85.334v-85.333h85.334zm0-170.667v85.333h-85.334V128h85.334z" fill="#fff"/></svg>';
      },
      {},
    ],
    "9f4dh": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" width="24" height="24" stroke-width="2" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M12 9v4M10.363 3.591 2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0zM12 16h.01"/></svg>';
      },
      {},
    ],
    "4nTtS": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" width="24" height="24" stroke-width="2" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M18 6 6 18M6 6l12 12"/></svg>';
      },
      {},
    ],
    cDPXC: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.83 13.45a1 1 0 0 0-1.66 0l-4 6a1 1 0 0 0 0 1A1 1 0 0 0 8 21h8a1 1 0 0 0 .88-.53 1 1 0 0 0-.05-1ZM9.87 19 12 15.8l2.13 3.2ZM19 3H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h.85a1 1 0 1 0 0-2H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-.85a1 1 0 0 0 0 2H19a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z"/></svg>';
      },
      {},
    ],
    etUrX: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" fill="none" viewBox="0 0 24 24"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 8.25V8.2c0-1.12 0-1.68.218-2.108.192-.377.497-.682.874-.874C4.52 5 5.08 5 6.2 5h11.6c1.12 0 1.68 0 2.107.218.377.192.683.497.875.874.218.427.218.987.218 2.105v7.606c0 1.118 0 1.677-.218 2.104a2.003 2.003 0 0 1-.874.875C19.48 19 18.92 19 17.803 19H14m-9 0a2 2 0 0 0-2-2m5 2a5 5 0 0 0-5-5m8 5a8 8 0 0 0-8-8"/></svg>';
      },
      {},
    ],
    "166Bb": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24"><path d="M8.9 17a1 1 0 1 0 1 1 1 1 0 0 0-1-1Zm-3 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1Zm6 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1ZM15 8.5a1 1 0 0 1 1.73 0 1 1 0 0 0 1.36.37 1 1 0 0 0 .41-1.37 3 3 0 0 0-5.2 0 1 1 0 0 0 1.7 1Zm7-3a7 7 0 0 0-12.12 0 1 1 0 0 0 .37 1.37 1 1 0 0 0 .45.13 1 1 0 0 0 .87-.5 5 5 0 0 1 8.66 0 1 1 0 0 0 1.37.37A1 1 0 0 0 22 5.5ZM17.9 14h-1v-3a1 1 0 1 0-2 0v3h-10a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3Zm1 5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1Z"/></svg>';
      },
      {},
    ],
    gHMXo: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" class="fill-none" fill="none" stroke-width="1.5" viewBox="0 0 24 24"><path stroke="#fff" d="M1 15V9a6 6 0 0 1 6-6h10a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H7a6 6 0 0 1-6-6Z"/><path stroke="#fff" stroke-linecap="round" d="m10.5 10-.2-.2c-.5-.5-1.2-.8-2-.8v0a2.8 2.8 0 0 0-2.8 2.8v.4c0 1.5 1.3 2.8 2.8 2.8v0c.8 0 1.5-.3 2-.8l.2-.2m8-4-.2-.2c-.5-.5-1.2-.8-2-.8v0a2.8 2.8 0 0 0-2.8 2.8v.4c0 1.5 1.3 2.8 2.8 2.8v0c.8 0 1.5-.3 2-.8l.2-.2"/></svg>';
      },
      {},
    ],
    "6HLyI": [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 256 256"><path d="M40 88h33a32 32 0 0 0 62 0h81a8 8 0 0 0 0-16h-81a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16Zm64-24a16 16 0 1 1-16 16 16 16 0 0 1 16-16Zm112 104h-17a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16h97a32 32 0 0 0 62 0h17a8 8 0 0 0 0-16Zm-48 24a16 16 0 1 1 16-16 16 16 0 0 1-16 16Z"/></svg>';
      },
      {},
    ],
    jQ8Kk: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" class="fill-none" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" stroke="none"/><path d="m7 7 5 5-5 5m6-10 5 5-5 5"/></svg>';
      },
      {},
    ],
    eQAfd: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" class="fill-none" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" stroke="none"/><path d="m11 7-5 5 5 5m6-10-5 5 5 5"/></svg>';
      },
      {},
    ],
    l1l8z: [
      function (e, t, r) {
        t.exports =
          '<svg transform="scale(-1 1)" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="fill-none" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" stroke="none"/><path d="M6.657 18C4.085 18 2 15.993 2 13.517c0-2.475 2.085-4.482 4.657-4.482.393-1.762 1.794-3.2 3.675-3.773 1.88-.572 3.956-.193 5.444 1 1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486 0 1.927-1.551 3.487-3.465 3.487H6.657"/></svg>';
      },
      {},
    ],
    lg5FS: [
      function (e, t, r) {
        t.exports =
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="fill-none" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" stroke="none"/><path d="M8 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z"/><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2"/></svg>';
      },
      {},
    ],
    "3eYNH": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./flip"),
          a = o.interopDefault(n),
          s = e("./aspectRatio"),
          i = o.interopDefault(s),
          l = e("./playbackRate"),
          c = o.interopDefault(l),
          p = e("./subtitleOffset"),
          u = o.interopDefault(p),
          d = e("../utils/component"),
          f = o.interopDefault(d),
          h = e("../utils/error"),
          m = e("../utils");
        class g extends f.default {
          constructor(e) {
            super(e);
            const {
              option: t,
              controls: r,
              template: { $setting: o },
            } = e;
            (this.name = "setting"),
              (this.$parent = o),
              (this.option = []),
              (this.events = []),
              (this.cache = new Map()),
              t.setting &&
                (this.init(),
                e.on("blur", () => {
                  this.show && ((this.show = !1), this.render(this.option));
                }),
                e.on("focus", (e) => {
                  const t = (0, m.includeFromEvent)(e, r.setting),
                    o = (0, m.includeFromEvent)(e, this.$parent);
                  !this.show ||
                    t ||
                    o ||
                    ((this.show = !1), this.render(this.option));
                }));
          }
          static makeRecursion(e, t, r) {
            for (let o = 0; o < e.length; o++) {
              const n = e[o];
              (n.$parentItem = t),
                (n.$parentList = r),
                g.makeRecursion(n.selector || [], n, e);
            }
            return e;
          }
          get defaultSettings() {
            const e = [],
              { option: t } = this.art;
            return (
              t.playbackRate && e.push((0, c.default)(this.art)),
              t.aspectRatio && e.push((0, i.default)(this.art)),
              t.flip && e.push((0, a.default)(this.art)),
              t.subtitleOffset && e.push((0, u.default)(this.art)),
              e
            );
          }
          init() {
            const { option: e } = this.art,
              t = [...this.defaultSettings, ...e.settings];
            (this.option = g.makeRecursion(t)),
              this.destroy(),
              this.render(this.option);
          }
          destroy() {
            for (let e = 0; e < this.events.length; e++)
              this.art.events.remove(this.events[e]);
            (this.$parent.innerHTML = ""),
              (this.events = []),
              (this.cache = new Map());
          }
          find(e = "", t = this.option) {
            for (let r = 0; r < t.length; r++) {
              const o = t[r];
              if (o.name === e) return o;
              {
                const t = this.find(e, o.selector || []);
                if (t) return t;
              }
            }
          }
          remove(e) {
            const t = this.find(e);
            (0, h.errorHandle)(t, `Can't find [${e}] from the [setting]`);
            const r = t.$parentItem ? t.$parentItem.selector : this.option;
            return (
              r.splice(r.indexOf(t), 1),
              (this.option = g.makeRecursion(this.option)),
              this.destroy(),
              this.render(this.option),
              this.option
            );
          }
          update(e) {
            const t = this.find(e.name);
            return (
              t
                ? (Object.assign(t, e),
                  (this.option = g.makeRecursion(this.option)),
                  this.destroy(),
                  this.render(this.option))
                : this.add(e),
              this.option
            );
          }
          add(e) {
            return (
              this.option.push(e),
              (this.option = g.makeRecursion(this.option)),
              this.destroy(),
              this.render(this.option),
              this.option
            );
          }
          creatHeader(e) {
            const { icons: t, proxy: r, constructor: o } = this.art,
              n = (0, m.createElement)("div");
            (0, m.setStyle)(n, "height", `${o.SETTING_ITEM_HEIGHT}px`),
              (0, m.addClass)(n, "art-setting-item"),
              (0, m.addClass)(n, "art-setting-item-back");
            const a = (0, m.append)(
                n,
                '<div class="art-setting-item-left"></div>'
              ),
              s = (0, m.createElement)("div");
            (0, m.addClass)(s, "art-setting-item-left-icon"),
              (0, m.append)(s, t.arrowLeft),
              (0, m.append)(a, s),
              (0, m.append)(a, e.$parentItem.html);
            const i = r(n, "click", () => this.render(e.$parentList));
            return this.events.push(i), n;
          }
          creatItem(e, t) {
            const { icons: r, proxy: o, constructor: n } = this.art,
              a = (0, m.createElement)("div");
            (0, m.addClass)(a, "art-setting-item"),
              (0, m.setStyle)(a, "height", `${n.SETTING_ITEM_HEIGHT}px`),
              (0, m.isStringOrNumber)(t.name) && (a.dataset.name = t.name),
              (0, m.isStringOrNumber)(t.value) && (a.dataset.value = t.value);
            const s = (0, m.append)(
                a,
                '<div class="art-setting-item-left"></div>'
              ),
              i = (0, m.append)(
                a,
                '<div class="art-setting-item-right"></div>'
              ),
              l = (0, m.createElement)("div");
            switch (((0, m.addClass)(l, "art-setting-item-left-icon"), e)) {
              case "switch":
              case "range":
                (0, m.append)(
                  l,
                  (0, m.isStringOrNumber)(t.icon) || t.icon instanceof Element
                    ? t.icon
                    : r.sliders
                );
                break;
              case "selector":
                t.selector && t.selector.length
                  ? (0, m.append)(
                      l,
                      (0, m.isStringOrNumber)(t.icon) ||
                        t.icon instanceof Element
                        ? t.icon
                        : r.sliders
                    )
                  : (0, m.append)(l, r.check);
            }
            (0, m.append)(s, l),
              (t.$icon = l),
              (0, m.def)(t, "icon", {
                configurable: !0,
                get: () => l.innerHTML,
                set(e) {
                  (0, m.isStringOrNumber)(e) && (l.innerHTML = e);
                },
              });
            const c = (0, m.createElement)("div");
            (0, m.addClass)(c, "art-setting-item-left-text"),
              (0, m.append)(c, t.html || ""),
              (0, m.append)(s, c),
              (t.$html = c),
              (0, m.def)(t, "html", {
                configurable: !0,
                get: () => c.innerHTML,
                set(e) {
                  (0, m.isStringOrNumber)(e) && (c.innerHTML = e);
                },
              });
            const p = (0, m.createElement)("div");
            switch (
              ((0, m.addClass)(p, "art-setting-item-right-tooltip"),
              (0, m.append)(p, t.tooltip || ""),
              (0, m.append)(i, p),
              (t.$tooltip = p),
              (0, m.def)(t, "tooltip", {
                configurable: !0,
                get: () => p.innerHTML,
                set(e) {
                  (0, m.isStringOrNumber)(e) && (p.innerHTML = e);
                },
              }),
              e)
            ) {
              case "switch": {
                const e = (0, m.createElement)("div");
                (0, m.addClass)(e, "art-setting-item-right-icon");
                const o = (0, m.append)(e, r.switchOn),
                  n = (0, m.append)(e, r.switchOff);
                (0, m.setStyle)(t.switch ? n : o, "display", "none"),
                  (0, m.append)(i, e),
                  (t.$switch = t.switch),
                  (0, m.def)(t, "switch", {
                    configurable: !0,
                    get: () => t.$switch,
                    set(e) {
                      (t.$switch = e),
                        e
                          ? ((0, m.setStyle)(n, "display", "none"),
                            (0, m.setStyle)(o, "display", null))
                          : ((0, m.setStyle)(n, "display", null),
                            (0, m.setStyle)(o, "display", "none"));
                    },
                  });
                break;
              }
              case "range":
                {
                  const e = (0, m.createElement)("div");
                  (0, m.addClass)(e, "art-setting-item-right-icon");
                  const r = (0, m.append)(e, '<input type="range">');
                  (r.value = t.range[0] || 0),
                    (r.min = t.range[1] || 0),
                    (r.max = t.range[2] || 10),
                    (r.step = t.range[3] || 1),
                    (0, m.addClass)(r, "art-setting-range"),
                    (0, m.append)(i, e),
                    (t.$range = r),
                    (0, m.def)(t, "range", {
                      configurable: !0,
                      get: () => r.valueAsNumber,
                      set(e) {
                        r.value = Number(e);
                      },
                    });
                }
                break;
              case "selector":
                if (t.selector && t.selector.length) {
                  const e = (0, m.createElement)("div");
                  (0, m.addClass)(e, "art-setting-item-right-icon"),
                    (0, m.append)(e, r.arrowRight),
                    (0, m.append)(i, e);
                }
            }
            switch (e) {
              case "switch":
                if (t.onSwitch) {
                  const e = o(a, "click", async (e) => {
                    t.switch = await t.onSwitch.call(this.art, t, a, e);
                  });
                  this.events.push(e);
                }
                break;
              case "range":
                if (t.$range) {
                  if (t.onRange) {
                    const e = o(t.$range, "change", async (e) => {
                      t.tooltip = await t.onRange.call(this.art, t, a, e);
                    });
                    this.events.push(e);
                  }
                  if (t.onChange) {
                    const e = o(t.$range, "input", async (e) => {
                      t.tooltip = await t.onChange.call(this.art, t, a, e);
                    });
                    this.events.push(e);
                  }
                }
                break;
              case "selector": {
                const e = o(a, "click", async (e) => {
                  if (t.selector && t.selector.length)
                    this.render(t.selector, t.width);
                  else {
                    (0, m.inverseClass)(a, "art-current");
                    for (let e = 0; e < t.$parentItem.selector.length; e++) {
                      const r = t.$parentItem.selector[e];
                      r.default = r === t;
                    }
                    if (
                      (t.$parentList && this.render(t.$parentList),
                      t.$parentItem && t.$parentItem.onSelect)
                    ) {
                      const r = await t.$parentItem.onSelect.call(
                        this.art,
                        t,
                        a,
                        e
                      );
                      t.$parentItem.$tooltip &&
                        (0, m.isStringOrNumber)(r) &&
                        (t.$parentItem.$tooltip.innerHTML = r);
                    }
                  }
                });
                this.events.push(e),
                  t.default && (0, m.addClass)(a, "art-current");
              }
            }
            return a;
          }
          updateStyle(e) {
            const {
              controls: t,
              constructor: r,
              template: { $player: o, $setting: n },
            } = this.art;
            if (t.setting && !m.isMobile) {
              const a = e || r.SETTING_WIDTH,
                { left: s, width: i } = t.setting.getBoundingClientRect(),
                { left: l, width: c } = o.getBoundingClientRect(),
                p = s - l + i / 2 - a / 2;
              p + a > c
                ? ((0, m.setStyle)(n, "left", null),
                  (0, m.setStyle)(n, "right", null))
                : ((0, m.setStyle)(n, "left", `${p}px`),
                  (0, m.setStyle)(n, "right", "auto"));
            }
          }
          render(e, t) {
            const { constructor: r } = this.art;
            if (this.cache.has(e)) {
              const t = this.cache.get(e);
              (0, m.inverseClass)(t, "art-current"),
                (0, m.setStyle)(this.$parent, "width", `${t.dataset.width}px`),
                (0, m.setStyle)(
                  this.$parent,
                  "height",
                  `${t.dataset.height}px`
                ),
                this.updateStyle(Number(t.dataset.width));
            } else {
              const o = (0, m.createElement)("div");
              (0, m.addClass)(o, "art-setting-panel"),
                (o.dataset.width = t || r.SETTING_WIDTH),
                (o.dataset.height = e.length * r.SETTING_ITEM_HEIGHT),
                e[0] &&
                  e[0].$parentItem &&
                  ((0, m.append)(o, this.creatHeader(e[0])),
                  (o.dataset.height =
                    Number(o.dataset.height) + r.SETTING_ITEM_HEIGHT));
              for (let t = 0; t < e.length; t++) {
                const r = e[t];
                (0, m.has)(r, "switch")
                  ? (0, m.append)(o, this.creatItem("switch", r))
                  : (0, m.has)(r, "range")
                  ? (0, m.append)(o, this.creatItem("range", r))
                  : (0, m.append)(o, this.creatItem("selector", r));
              }
              (0, m.append)(this.$parent, o),
                this.cache.set(e, o),
                (0, m.inverseClass)(o, "art-current"),
                (0, m.setStyle)(this.$parent, "width", `${o.dataset.width}px`),
                (0, m.setStyle)(
                  this.$parent,
                  "height",
                  `${o.dataset.height}px`
                ),
                this.updateStyle(Number(o.dataset.width)),
                e[0] &&
                  e[0].$parentItem &&
                  e[0].$parentItem.mounted &&
                  e[0].$parentItem.mounted.call(this.art, o, e[0].$parentItem);
            }
          }
        }
        r.default = g;
      },
      {
        "./flip": "kONUB",
        "./aspectRatio": "84NBV",
        "./playbackRate": "aetWt",
        "./subtitleOffset": "fIBkO",
        "../utils/component": "18nVI",
        "../utils/error": "hwmZz",
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    kONUB: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            icons: r,
            constructor: { SETTING_ITEM_WIDTH: n, FLIP: a },
          } = e;
          function s(e, r, n) {
            r && (r.innerText = t.get((0, o.capitalize)(n)));
            const a = (0, o.queryAll)(".art-setting-item", e).find(
              (e) => e.dataset.value === n
            );
            a && (0, o.inverseClass)(a, "art-current");
          }
          return {
            width: n,
            name: "flip",
            html: t.get("Video Flip"),
            tooltip: t.get((0, o.capitalize)(e.flip)),
            icon: r.flip,
            selector: a.map((r) => ({
              value: r,
              name: `aspect-ratio-${r}`,
              default: r === e.flip,
              html: t.get((0, o.capitalize)(r)),
            })),
            onSelect: (t) => ((e.flip = t.value), t.html),
            mounted: (t, r) => {
              s(t, r.$tooltip, e.flip),
                e.on("flip", () => {
                  s(t, r.$tooltip, e.flip);
                });
            },
          };
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "84NBV": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            icons: r,
            constructor: { SETTING_ITEM_WIDTH: n, ASPECT_RATIO: a },
          } = e;
          function s(e) {
            return "default" === e ? t.get("Default") : e;
          }
          function i(e, t, r) {
            t && (t.innerText = s(r));
            const n = (0, o.queryAll)(".art-setting-item", e).find(
              (e) => e.dataset.value === r
            );
            n && (0, o.inverseClass)(n, "art-current");
          }
          return {
            width: n,
            name: "aspect-ratio",
            html: t.get("Aspect Ratio"),
            icon: r.aspectRatio,
            tooltip: s(e.aspectRatio),
            selector: a.map((t) => ({
              value: t,
              name: `aspect-ratio-${t}`,
              default: t === e.aspectRatio,
              html: s(t),
            })),
            onSelect: (t) => ((e.aspectRatio = t.value), t.html),
            mounted: (t, r) => {
              i(t, r.$tooltip, e.aspectRatio),
                e.on("aspectRatio", () => {
                  i(t, r.$tooltip, e.aspectRatio);
                });
            },
          };
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    aetWt: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            i18n: t,
            icons: r,
            constructor: { SETTING_ITEM_WIDTH: n, PLAYBACK_RATE: a },
          } = e;
          function s(e) {
            return 1 === e ? t.get("Normal") : e.toFixed(1);
          }
          function i(e, t, r) {
            t && (t.innerText = s(r));
            const n = (0, o.queryAll)(".art-setting-item", e).find(
              (e) => Number(e.dataset.value) === r
            );
            n && (0, o.inverseClass)(n, "art-current");
          }
          return {
            width: n,
            name: "playback-rate",
            html: "Playback Speed",
            tooltip: s(e.playbackRate),
            icon: r.playbackRate,
            selector: a.map((t) => ({
              value: t,
              name: `aspect-ratio-${t}`,
              default: t === e.playbackRate,
              html: s(t),
            })),
            onSelect: (t) => ((e.playbackRate = t.value), t.html),
            mounted: (t, r) => {
              i(t, r.$tooltip, e.playbackRate),
                e.on("video:ratechange", () => {
                  i(t, r.$tooltip, e.playbackRate);
                });
            },
          };
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    fIBkO: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = function (e) {
            const { i18n: t, icons: r, constructor: o } = e;
            return {
              width: o.SETTING_ITEM_WIDTH,
              name: "subtitle-offset",
              html: t.get("Sub Offset"),
              icon: r.offset,
              tooltip: "0s",
              range: [0, -5, 5, 0.2],
              onChange: (t) => ((e.subtitleOffset = t.range), t.range + "s"),
            };
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "2aaJe": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        r.default = class {
          constructor() {
            (this.name = "player_settings"), (this.settings = {});
          }
          get(e) {
            try {
              const t =
                JSON.parse(window.localStorage.getItem(this.name)) || {};
              return e ? t[e] : t;
            } catch (t) {
              return e ? this.settings[e] : this.settings;
            }
          }
          set(e, t) {
            try {
              const r = Object.assign({}, this.get(), { [e]: t });
              window.localStorage.setItem(this.name, JSON.stringify(r));
            } catch (r) {
              this.settings[e] = t;
            }
          }
          del(e) {
            try {
              const t = this.get();
              delete t[e],
                window.localStorage.setItem(this.name, JSON.stringify(t));
            } catch (t) {
              delete this.settings[e];
            }
          }
          clear() {
            try {
              window.localStorage.removeItem(this.name);
            } catch (e) {
              this.settings = {};
            }
          }
        };
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
    "8MTUM": [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("../utils"),
          a = e("./miniProgressBar"),
          s = o.interopDefault(a),
          i = e("./autoOrientation"),
          l = o.interopDefault(i),
          c = e("./autoPlayback"),
          p = o.interopDefault(c),
          u = e("./fastForward"),
          d = o.interopDefault(u),
          f = e("./lock"),
          h = o.interopDefault(f);
        r.default = class {
          constructor(e) {
            (this.art = e), (this.id = 0);
            const { option: t } = e;
            t.miniProgressBar && !t.isLive && this.add(s.default),
              t.lock && n.isMobile && this.add(h.default),
              t.autoPlayback && !t.isLive && this.add(p.default),
              t.autoOrientation && n.isMobile && this.add(l.default),
              t.fastForward && n.isMobile && !t.isLive && this.add(d.default);
            for (let e = 0; e < t.plugins.length; e++) this.add(t.plugins[e]);
          }
          add(e) {
            this.id += 1;
            const t = e.call(this.art, this.art);
            return t instanceof Promise
              ? t.then((t) => this.next(e, t))
              : this.next(e, t);
          }
          next(e, t) {
            const r = (t && t.name) || e.name || `plugin${this.id}`;
            return (
              (0, n.errorHandle)(
                !(0, n.has)(this, r),
                `Cannot add a plugin that already has the same name: ${r}`
              ),
              (0, n.def)(this, r, { value: t }),
              this
            );
          }
        };
      },
      {
        "../utils": "71aH7",
        "./miniProgressBar": "87pSL",
        "./autoOrientation": "ePEg5",
        "./autoPlayback": "cVO99",
        "./fastForward": "hFDwt",
        "./lock": "1hsTH",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "87pSL": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          return (
            e.on("control", (t) => {
              t
                ? (0, o.removeClass)(
                    e.template.$player,
                    "art-mini-progress-bar"
                  )
                : (0, o.addClass)(e.template.$player, "art-mini-progress-bar");
            }),
            { name: "mini-progress-bar" }
          );
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    ePEg5: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            constructor: t,
            template: { $player: r, $video: n },
          } = e;
          return (
            e.on("fullscreenWeb", (a) => {
              if (a) {
                const { videoWidth: a, videoHeight: s } = n,
                  { clientWidth: i, clientHeight: l } =
                    document.documentElement;
                ((a > s && i < l) || (a < s && i > l)) &&
                  setTimeout(() => {
                    (0, o.setStyle)(r, "width", `${l}px`),
                      (0, o.setStyle)(r, "height", `${i}px`),
                      (0, o.setStyle)(r, "transform-origin", "0 0"),
                      (0, o.setStyle)(
                        r,
                        "transform",
                        `rotate(90deg) translate(0, -${i}px)`
                      ),
                      (0, o.addClass)(r, "art-auto-orientation"),
                      (e.isRotate = !0),
                      e.emit("resize");
                  }, t.AUTO_ORIENTATION_TIME);
              } else
                (0, o.hasClass)(r, "art-auto-orientation") &&
                  ((0, o.removeClass)(r, "art-auto-orientation"),
                  (e.isRotate = !1),
                  e.emit("resize"));
            }),
            e.on("fullscreen", async (e) => {
              const t = screen.orientation.type;
              if (e) {
                const { videoWidth: e, videoHeight: a } = n,
                  { clientWidth: s, clientHeight: i } =
                    document.documentElement;
                if ((e > a && s < i) || (e < a && s > i)) {
                  const e = t.startsWith("portrait") ? "landscape" : "portrait";
                  await screen.orientation.lock(e),
                    (0, o.addClass)(r, "art-auto-orientation-fullscreen");
                }
              } else
                (0, o.hasClass)(r, "art-auto-orientation-fullscreen") &&
                  (await screen.orientation.lock(t),
                  (0, o.removeClass)(r, "art-auto-orientation-fullscreen"));
            }),
            {
              name: "autoOrientation",
              get state() {
                return (0, o.hasClass)(r, "art-auto-orientation");
              },
            }
          );
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    cVO99: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
              i18n: t,
              icons: r,
              storage: n,
              constructor: a,
              proxy: s,
              template: { $poster: i },
            } = e,
            l = e.layers.add({
              name: "auto-playback",
              html: '<div class="art-auto-playback-close"></div><div class="art-auto-playback-last"></div><div class="art-auto-playback-jump"></div>',
            }),
            c = (0, o.query)(".art-auto-playback-last", l),
            p = (0, o.query)(".art-auto-playback-jump", l),
            u = (0, o.query)(".art-auto-playback-close", l);
          return (
            e.on("video:timeupdate", () => {
              if (e.playing) {
                const t = n.get("times") || {},
                  r = Object.keys(t);
                r.length > a.AUTO_PLAYBACK_MAX && delete t[r[0]],
                  (t[e.option.id || e.option.url] = e.currentTime),
                  n.set("times", t);
              }
            }),
            e.on("ready", () => {
              const d = (n.get("times") || {})[e.option.id || e.option.url];
              d &&
                d >= a.AUTO_PLAYBACK_MIN &&
                ((0, o.append)(u, r.close),
                (0, o.setStyle)(l, "display", "flex"),
                (c.innerText = `${t.get("Last Seen")} ${(0, o.secondToTime)(
                  d
                )}`),
                (p.innerText = t.get("Jump Play")),
                s(u, "click", () => {
                  (0, o.setStyle)(l, "display", "none");
                }),
                s(p, "click", () => {
                  (e.seek = d),
                    e.play(),
                    (0, o.setStyle)(i, "display", "none"),
                    (0, o.setStyle)(l, "display", "none");
                }),
                e.once("video:timeupdate", () => {
                  setTimeout(() => {
                    (0, o.setStyle)(l, "display", "none");
                  }, a.AUTO_PLAYBACK_TIMEOUT);
                }));
            }),
            {
              name: "auto-playback",
              get times() {
                return n.get("times") || {};
              },
              clear: () => n.del("times"),
              delete(e) {
                const t = n.get("times") || {};
                return delete t[e], n.set("times", t), t;
              },
            }
          );
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    hFDwt: [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            constructor: t,
            proxy: r,
            template: { $player: n, $video: a },
          } = e;
          let s = null,
            i = !1,
            l = 1;
          const c = () => {
            clearTimeout(s),
              i &&
                ((i = !1),
                (e.playbackRate = l),
                (0, o.removeClass)(n, "art-fast-forward"));
          };
          return (
            r(a, "touchstart", (r) => {
              1 === r.touches.length &&
                e.playing &&
                !e.isLock &&
                (s = setTimeout(() => {
                  (i = !0),
                    (l = e.playbackRate),
                    (e.playbackRate = t.FAST_FORWARD_VALUE),
                    (0, o.addClass)(n, "art-fast-forward");
                }, t.FAST_FORWARD_TIME));
            }),
            r(document, "touchmove", c),
            r(document, "touchend", c),
            {
              name: "fastForward",
              get state() {
                return (0, o.hasClass)(n, "art-fast-forward");
              },
            }
          );
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "1hsTH": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        );
        var o = e("../utils");
        r.default = function (e) {
          const {
            layers: t,
            icons: r,
            template: { $player: n },
          } = e;
          return (
            t.add({
              name: "lock",
              mounted(t) {
                const n = (0, o.append)(t, r.lock),
                  a = (0, o.append)(t, r.unlock);
                (0, o.setStyle)(n, "display", "none"),
                  e.on("lock", (e) => {
                    e
                      ? ((0, o.setStyle)(n, "display", "inline-flex"),
                        (0, o.setStyle)(a, "display", "none"))
                      : ((0, o.setStyle)(n, "display", "none"),
                        (0, o.setStyle)(a, "display", "inline-flex"));
                  });
              },
              click() {
                (0, o.hasClass)(n, "art-lock")
                  ? ((0, o.removeClass)(n, "art-lock"),
                    (this.isLock = !1),
                    e.emit("lock", !1))
                  : ((0, o.addClass)(n, "art-lock"),
                    (this.isLock = !0),
                    e.emit("lock", !0));
              },
            }),
            {
              name: "lock",
              get state() {
                return (0, o.hasClass)(n, "art-lock");
              },
            }
          );
        };
      },
      {
        "../utils": "71aH7",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    jfJvL: [
      function (e, t, r) {
        var o = e("@parcel/transformer-js/src/esmodule-helpers.js");
        o.defineInteropFlag(r);
        var n = e("./icons"),
          a = o.interopDefault(n);
        r.default = function (e) {
          return (t) => {
            const { $video: r } = t.template,
              { errorHandle: o } = t.constructor.utils;
            function n() {
              const n = t.hls || window.hls;
              o(
                n && n.media === r,
                'Cannot find instance of HLS from "art.hls" or "window.hls"'
              );
              const s = e.auto || "Auto",
                i = e.title || "Quality",
                l = e.getResolution || ((e) => (e.height || "Unknown ") + "P"),
                c = n.levels[n.currentLevel],
                p = c ? l(c) : s;
              e.control &&
                t.controls.update({
                  name: "hls-quality",
                  position: "right",
                  html: p,
                  style: { padding: "0 10px" },
                  selector: n.levels.map((e, t) => ({
                    html: l(e),
                    level: e.level || t,
                    default: c === e,
                  })),
                  onSelect: (e) => (
                    (n.currentLevel = e.level), (t.loading.show = !0), e.html
                  ),
                }),
                e.setting &&
                  t.setting.update({
                    name: "hls-quality",
                    tooltip: p,
                    html: i,
                    icon: a.default.airplay,
                    width: 200,
                    selector: n.levels.map((e, t) => ({
                      html: l(e),
                      level: e.level || t,
                      default: c === e,
                    })),
                    onSelect: function (e) {
                      return (
                        (n.currentLevel = e.level),
                        (t.loading.show = !0),
                        e.html
                      );
                    },
                  });
            }
            return (
              t.on("ready", n),
              t.on("restart", n),
              { name: "artplayerPluginHlsQuality" }
            );
          };
        };
      },
      {
        "./icons": "6OeNg",
        "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc",
      },
    ],
    "4Z3gG": [
      function (e, t, r) {
        e("@parcel/transformer-js/src/esmodule-helpers.js").defineInteropFlag(
          r
        ),
          (r.default = function (e) {
            function t(e) {
              var t,
                r,
                o,
                n = e.split("."),
                a = n[0].split(":") || [],
                s =
                  ((t = n[1] || "0"),
                  (r = 3),
                  (o = "0"),
                  t.length > r
                    ? String(t)
                    : ((r -= t.length) > o.length &&
                        (o += o.repeat(r / o.length)),
                      String(t) + o.slice(0, r))),
                i = Number(s) / 1e3;
              return (
                3600 * Number(a[a.length - 3] || 0) +
                60 * Number(a[a.length - 2] || 0) +
                Number(a[a.length - 1] || 0) +
                i
              );
            }
            return async (r) => {
              const {
                  constructor: {
                    utils: { setStyle: o, clamp: n },
                  },
                  template: { $progress: a },
                  events: { proxy: s },
                } = r,
                i = await (async function (e = "") {
                  const r = (await (await fetch(e)).text())
                      .split(/[\n\r]/gm)
                      .filter((e) => e.trim()),
                    o = [];
                  for (let n = 1; n < r.length; n += 2) {
                    const a = r[n],
                      s = r[n + 1];
                    if (!s.trim()) continue;
                    const i =
                        /((?:[0-9]{2}:)?(?:[0-9]{2}:)?[0-9]{2}(?:.[0-9]{3})?)(?: ?--> ?)((?:[0-9]{2}:)?(?:[0-9]{2}:)?[0-9]{2}(?:.[0-9]{3})?)/,
                      l = a.match(i),
                      c = /(.*)#(\w{4})=(.*)/i,
                      p = s.match(c),
                      u = Math.floor(t(l[1])),
                      d = Math.floor(t(l[2]));
                    let f = p[1];
                    if (!/^\/|((https?|ftp|file):\/\/)/i.test(f)) {
                      const t = e.split("/");
                      t.pop(), t.push(f), (f = t.join("/"));
                    }
                    const h = { start: u, end: d, url: f },
                      m = p[2].split(""),
                      g = p[3].split(",");
                    for (let e = 0; e < m.length; e++) h[m[e]] = g[e];
                    o.push(h);
                  }
                  return o;
                })(e.vtt);
              return (
                r.controls.add({
                  name: "thumbnails",
                  position: "top",
                  index: 20,
                  style: e.style || {},
                  mounted(e) {
                    s(a, "mousemove", async (t) => {
                      o(e, "display", "block");
                      const { second: s, width: l } = (function (e, t) {
                          const { $progress: r } = e.template,
                            { left: o } = r.getBoundingClientRect(),
                            a = n(t.pageX - o, 0, r.clientWidth);
                          return {
                            width: a,
                            second: (a / r.clientWidth) * e.duration,
                          };
                        })(r, t),
                        c = i.find((e) => s >= e.start && s <= e.end);
                      if (!c) return o(e, "display", "none");
                      o(e, "backgroundImage", `url(${c.url})`),
                        o(e, "height", `${c.h}px`),
                        o(e, "width", `${c.w}px`),
                        o(e, "backgroundPosition", `-${c.x}px -${c.y}px`),
                        l <= c.w / 2
                          ? o(e, "left", 0)
                          : l > a.clientWidth - c.w / 2
                          ? o(e, "left", a.clientWidth - c.w + "px")
                          : o(e, "left", l - c.w / 2 + "px");
                    }),
                      s(a, "mouseleave", () => {
                        o(e, "display", "none");
                      }),
                      r.on("hover", (t) => {
                        t || o(e, "display", "none");
                      });
                  },
                }),
                { name: "artplayerPluginVttThumbnail" }
              );
            };
          });
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "9pCYc" },
    ],
  },
  ["5lTcX"],
  "5lTcX",
  "parcelRequire4dc0"
);
