/* Nebula: slow drifting smoke behind [data-nebula] elements.
 *
 * Each element carries a still (its CSS background) so the page looks right
 * before this runs, without JavaScript and without WebGL. Once the page has
 * loaded, this adds a canvas behind the element's content and draws the same
 * field moving very slowly; the canvas fades in over the still.
 *
 * Kept cheap on purpose (PageSpeed): it starts after the load event, draws
 * at half resolution and about 30 frames a second, only while the element is
 * on screen and the tab is visible, waits for the visitor's first
 * interaction, and does nothing for prefers-reduced-motion or without a
 * hardware GPU (the still stays).
 *
 * Variants (data-nebula="..."):
 *   light   Signal Orange smoke on white, top right (page heroes)
 *   light-center  the same along the top, for a centred hero
 *   navy    embers on navy, right side (call-to-action band)
 *   footer  pale navy smoke rising from the bottom edge
 *   mark    navy smoke filling the footer wordmark
 */
(function () {
  'use strict';

  // Colours are the brand tokens (_assets/css/tokens.css) as 0-1 RGB.
  function rgb(r, g, b) { return [r / 255, g / 255, b / 255]; }

  var VARIANTS = {
    light: {
      base: rgb(255, 255, 255),
      low: rgb(255, 214, 192), mid: rgb(255, 170, 120), high: rgb(255, 128, 52),
      // Mask: centre (x, y from the bottom) and radii, in element units.
      mask: [0.78, 0.82, 0.55, 1.0], narrow: [1.05, 1.0, 0.75, 0.45], fade: [0.05, 0.5], gain: 1.55, scale: 0.42, seed: [3.1, 7.4], speed: 1
    },
    // Centred heroes: the cloud runs along the top, behind the header, and
    // has faded before the headline's middle.
    'light-center': {
      base: rgb(255, 255, 255),
      low: rgb(255, 214, 192), mid: rgb(255, 170, 120), high: rgb(255, 128, 52),
      mask: [0.56, 1.08, 0.78, 0.6], narrow: [0.75, 1.06, 0.9, 0.42], fade: [0.25, 0.75], gain: 1.6, scale: 0.42, seed: [3.1, 7.4], speed: 1
    },
    navy: {
      base: rgb(37, 41, 63),
      low: rgb(90, 38, 26), mid: rgb(170, 61, 20), high: rgb(232, 90, 12),
      mask: [0.96, 0.35, 0.42, 1.5], fade: [-1, 0], gain: 1.05, scale: 0.75, seed: [11.3, 2.2], speed: 1.2
    },
    footer: {
      base: rgb(255, 255, 255),
      low: rgb(225, 227, 234), mid: rgb(168, 169, 178), high: rgb(110, 113, 128),
      mask: [0.5, -0.2, 1.6, 1.25], fade: [-1, 0], gain: 1.2, scale: 0.6, seed: [5.7, 13.9], speed: 0.8
    },
    mark: {
      base: rgb(244, 245, 248),
      low: rgb(233, 234, 236), mid: rgb(168, 169, 178), high: rgb(81, 84, 107),
      mask: [0.5, 0.5, 6.0, 6.0], fade: [-1, 0], gain: 1.3, scale: 0.6, seed: [5.7, 13.9], speed: 0.8
    }
  };

  var VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  // Domain-warped fractal noise: the field is sampled at a point that is
  // itself pushed around by two layers of noise, which gives the long folded
  // wisps of a nebula rather than round blobs.
  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 uRes;uniform float uTime;uniform vec4 uMask;uniform vec2 uSeed;',
    'uniform vec2 uFade;uniform float uGain;uniform float uScale;uniform vec3 uBase;uniform vec3 uLow;uniform vec3 uMid;uniform vec3 uHigh;',
    // Gradient noise: a random direction at each lattice point, blended
    // with a quintic curve, so the field has no grid-shaped blotches.
    // A hash that stays stable under GPU float rounding (no large products).
    'float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
    'vec2 g(vec2 p){float a=h(p)*6.28318;return vec2(cos(a),sin(a));}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);',
    ' float v=mix(mix(dot(g(i),f),dot(g(i+vec2(1.,0.)),f-vec2(1.,0.)),u.x),',
    '  mix(dot(g(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(g(i+vec2(1.,1.)),f-vec2(1.,1.)),u.x),u.y);',
    ' return .5+.75*v;}',
    'float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);',
    ' for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.48;}return v/.9;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;',
    ' vec2 p=gl_FragCoord.xy/min(uRes.x,uRes.y)*uScale*2.+uSeed;',
    ' float t=uTime*.035;',
    ' vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t*.8));',
    ' vec2 r=vec2(fbm(p+2.4*q+vec2(1.7,9.2)+t*.6),fbm(p+2.4*q+vec2(8.3,2.8)-t*.5));',
    ' float f=fbm(p+2.2*r);',
    ' float d=smoothstep(.25,.95,f*.8+.4*length(q)*r.y);',
    ' vec2 e=(uv-uMask.xy)/uMask.zw;',
    ' float m=exp(-dot(e,e)*4.)*smoothstep(uFade.x,uFade.y,uv.y);',
    ' float a=clamp(d*m*uGain,0.,1.);',
    ' vec3 c=mix(uLow,uMid,smoothstep(.15,.6,d));c=mix(c,uHigh,smoothstep(.55,1.,d*m));',
    // Opaque over the element's own base colour, so it fully covers the still.
    ' gl_FragColor=vec4(mix(uBase,c,a),1.);',
    '}'
  ].join('\n');

  var SCALE = 0.5;        // render at half resolution; the field is soft
  var FRAME_MS = 1000 / 30;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scenes = [];

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function setup(el) {
    var v = VARIANTS[el.getAttribute('data-nebula')];
    if (!v) return null;
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return null;
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var u = {};
    ['uRes', 'uTime', 'uMask', 'uFade', 'uSeed', 'uGain', 'uScale', 'uBase', 'uLow', 'uMid', 'uHigh'].forEach(function (k) {
      u[k] = gl.getUniformLocation(prog, k);
    });
    gl.uniform4fv(u.uMask, v.mask);
    gl.uniform2fv(u.uFade, v.fade);
    gl.uniform2fv(u.uSeed, v.seed);
    gl.uniform1f(u.uGain, v.gain);
    gl.uniform1f(u.uScale, v.scale);
    gl.uniform3fv(u.uBase, v.base);
    gl.uniform3fv(u.uLow, v.low);
    gl.uniform3fv(u.uMid, v.mid);
    gl.uniform3fv(u.uHigh, v.high);

    el.insertBefore(canvas, el.firstChild);
    return { el: el, canvas: canvas, gl: gl, u: u, v: v, visible: false, shown: false, w: 0, h: 0 };
  }

  function resize(s) {
    var w = Math.max(1, Math.round(s.el.clientWidth * SCALE));
    var h = Math.max(1, Math.round(s.el.clientHeight * SCALE));
    if (w === s.w && h === s.h) return;
    // On a phone the hero is tall and narrow: keep the cloud in the top
    // corner, away from the text.
    s.gl.uniform4fv(s.u.uMask, s.v.narrow && s.el.clientWidth < 700 ? s.v.narrow : s.v.mask);
    s.w = s.canvas.width = w;
    s.h = s.canvas.height = h;
    s.gl.viewport(0, 0, w, h);
    s.gl.uniform2f(s.u.uRes, w, h);
  }

  function draw(s, seconds) {
    resize(s);
    s.gl.uniform1f(s.u.uTime, seconds * s.v.speed);
    s.gl.drawArrays(s.gl.TRIANGLES, 0, 3);
    if (!s.shown) {
      s.shown = true;
      // Fade in on the next frame so the transition runs.
      requestAnimationFrame(function () { s.canvas.classList.add('on'); });
    }
  }

  var start = 0, last = 0, running = false;

  function tick(now) {
    if (!running) return;
    if (now - last >= FRAME_MS) {
      last = now;
      var t = (now - start) / 1000;
      for (var i = 0; i < scenes.length; i++) if (scenes[i].visible) draw(scenes[i], t);
    }
    requestAnimationFrame(tick);
  }

  function anyVisible() {
    for (var i = 0; i < scenes.length; i++) if (scenes[i].visible) return true;
    return false;
  }

  function play() {
    if (running || reduce || document.hidden || !anyVisible()) return;
    running = true;
    requestAnimationFrame(tick);
  }

  function pause() { running = false; }

  // A software rasteriser (SwiftShader, llvmpipe: no GPU, or a GPU-less
  // headless browser such as a page-speed lab) would draw every frame on the
  // CPU. There the still, which is this same field at time zero, stays.
  function softwareGL() {
    try {
      var gl = document.createElement('canvas').getContext('webgl');
      if (!gl) return true;
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      var name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
    } catch (e) {
      return true;
    }
  }

  function init() {
    if (softwareGL()) return;
    var els = document.querySelectorAll('[data-nebula]');
    for (var i = 0; i < els.length; i++) {
      var s = setup(els[i]);
      if (s) scenes.push(s);
    }
    if (!scenes.length) return;
    start = performance.now();

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        scenes.forEach(function (s) {
          if (s.el === e.target) {
            s.visible = e.isIntersecting;
            if (s.visible && !s.shown) draw(s, (performance.now() - start) / 1000);
          }
        });
      });
      if (anyVisible()) play(); else pause();
    }, { rootMargin: '100px' });
    scenes.forEach(function (s) { io.observe(s.el); });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else play();
    });
  }

  // Start on the visitor's first scroll, pointer move, touch or key press
  // after the page has loaded. The canvas fades in over an identical still,
  // so starting late is invisible, and a browser that never interacts (a
  // page-speed lab, a crawler) never pays for WebGL at all. Reduced motion
  // keeps the still, which is the same field at time zero.
  var EVENTS = ['scroll', 'wheel', 'pointermove', 'pointerdown', 'touchstart', 'keydown'];

  function wake() {
    EVENTS.forEach(function (e) { window.removeEventListener(e, wake, true); });
    (window.requestIdleCallback || function (cb) { setTimeout(cb, 50); })(init, { timeout: 1000 });
  }

  function arm() {
    if (reduce) return;
    EVENTS.forEach(function (e) { window.addEventListener(e, wake, { capture: true, passive: true }); });
  }

  if (document.readyState === 'complete') arm();
  else window.addEventListener('load', arm, { once: true });
}());
