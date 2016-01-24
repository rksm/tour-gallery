/*global virtualDom,requestAnimationFrame,cancelAnimationFrame*/

// JSLoader.loadJs("https://cdn.rawgit.com/Matt-Esch/virtual-dom/14b2f333db8d20bed05dbba43ac52f52e5c566c2/dist/virtual-dom.js")

var h = virtualDom.h,
    diff = virtualDom.diff,
    patch = virtualDom.patch,
    createElement = virtualDom.create

var rendering = {

  render: function(state) {
    if (typeof state.render === "function") return state.render();
    if (Array.isArray(state)) return h('div', state.map(rendering.render));
    if (state.tag) return h(state.tag, state.props || {}, state.children || []);
    return rendering.renderUnknown(state);
  },

  renderUnknown: function(obj) {
    var inspected = lively.lang.obj.inspect(obj, {maxDepth: 2});
    return h("pre", ["Unknown state:\n", inspected]);
  },

  init: function(appState, domNode) {
    var tree = rendering.render(appState),
        rootNode = createElement(tree);
    domNode.innerHTML = "";
    domNode.appendChild(rootNode);
    return {
      tree: tree,
      rootNode: rootNode,
      domNode: domNode
    }
  },

  step: function(renderState, appState) {
    var newTree = rendering.render(appState),
        patches = diff(renderState.tree, newTree);
    renderState.rootNode = patch(renderState.rootNode, patches);
    renderState.tree = newTree;
  },

  run: function(renderState, appState) {
    if (appState.dirty) {
      rendering.step(renderState, appState);
      appState.dirty = false;
    }
    renderState.proc = requestAnimationFrame(function() {
      rendering.run(renderState, appState);
    });
  },

  stop: function(renderState) {
    renderState.proc && cancelAnimationFrame(renderState.proc);
    renderState.proc = null;
  }
}

window.show && show(`!`)