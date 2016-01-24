/*global virtualDom,requestAnimationFrame,cancelAnimationFrame*/

// JSLoader.loadJs("https://cdn.rawgit.com/Matt-Esch/virtual-dom/14b2f333db8d20bed05dbba43ac52f52e5c566c2/dist/virtual-dom.js")

var h = virtualDom.h,
    diff = virtualDom.diff,
    patch = virtualDom.patch,
    createElement = virtualDom.create

/*

- vdomState: the virtual-dom state, initialized here

- renderState: custom data structure from user code.
  when renderState.dirty == true then a re-render is triggered

- renderFunc: optional render function that will receive the renderState and
  should produce a vdom of it. If not specified then rendering.render will
  be used. It will
    1. check if renderState has a render method
    2. recursively render arrays of state
    3. create vdom nodes from {tag: STRING, [props: OBJECT], [children: ARRAY]}
       JS objects

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Here is a simple example:

var h = virtualDom.h;
var renderState = {messsage: "Hello World", audience: "Me"};
var domNode = document.querySelector("#vdom-app");

function renderFunc(renderState) {
  return h("center", [
    h("h1", {style: {color: "red"}}, ["Hello ", renderState.for]),
    h("p", {style: {color: "green"}}, "We have a messsage for you:"),
    h("p", {style: {color: "blue"}}, renderState.messsage),
  ]);
}

rendering.initAndRun(domNode, renderState, renderFunc);


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Control over init and looping:
// init creates and attaches _vdom to renderState
rendering.init(domNode, renderState, renderFunc);

// To just render once:
rendering.step(renderState, renderFunc);

// To start render loop:
rendering.run(renderState, renderFunc);
// To stop render loop
rendering.stop(renderState);
 */

var rendering = {

  render: function(renderState) {
    if (typeof renderState.render === "function") return renderState.render();
    if (Array.isArray(renderState)) return h('div', renderState.map(rendering.render));
    if (renderState.tag) return h(renderState.tag, renderState.props || {}, renderState.children || []);
    return rendering.renderUnknown(renderState);
  },

  renderUnknown: function(obj) {
    var inspected = lively.lang.obj.inspect(obj, {maxDepth: 2});
    return h("pre", ["Unknown state:\n", inspected]);
  },

  init: function(domNode, renderState, renderFunc) {
    renderState.dirty = true; // force render
    var tree = (renderFunc || rendering.render)(renderState),
        rootNode = createElement(tree),
        vdomState = {tree: tree, rootNode: rootNode, domNode: domNode};
    renderState._vdom = vdomState;
    domNode.innerHTML = "";
    domNode.appendChild(rootNode);
  },

  step: function(renderState, renderFunc) {
    var vdomState = renderState._vdom,
        newTree = (renderFunc || rendering.render)(renderState),
        patches = diff(vdomState.tree, newTree);
    vdomState.rootNode = patch(vdomState.rootNode, patches);
    vdomState.tree = newTree;
  },

  run: function(renderState, renderFunc) {
    if (renderState.dirty) {
      rendering.step(renderState, renderFunc);
      renderState.dirty = false;
    }
    renderState._loop = requestAnimationFrame(
      () => rendering.run(renderState, renderFunc));
  },

  stop: function(renderState) {
    renderState._loop && cancelAnimationFrame(renderState._loop);
    renderState._loop = null;
  },
  
  once: function(domNode, renderState, renderFunc) {
    rendering.init(domNode, renderState, renderFunc);
    rendering.step(renderState, renderFunc);
  },

  initAndRun: function(domNode, renderState, renderFunc) {
    rendering.init(domNode, renderState, renderFunc);
    rendering.run(renderState, renderFunc);
  }
}

window.show && show(`!`)