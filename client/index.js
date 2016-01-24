/*global virtualDom*/

var h = virtualDom.h;

var imageFiles = [
  "/bik-webpage/public/data/DSC00188.120x80.jpg",
  "/bik-webpage/public/data/DSC00189.120x80.jpg",
  "/bik-webpage/public/data/DSC00190.120x80.jpg",
  "/bik-webpage/public/data/DSC00191.120x80.jpg",
  "/bik-webpage/public/data/DSC00192.120x80.jpg",
  "/bik-webpage/public/data/DSC00194.120x80.jpg",
  "/bik-webpage/public/data/DSC00197.120x80.jpg",
  "/bik-webpage/public/data/DSC00198.120x80.jpg",
  "/bik-webpage/public/data/DSC00200.120x80.jpg",
  "/bik-webpage/public/data/DSC00202.120x80.jpg",
  "/bik-webpage/public/data/DSC00203.120x80.jpg",
  "/bik-webpage/public/data/DSC00204.120x80.jpg",
  "/bik-webpage/public/data/DSC00205.120x80.jpg",
  "/bik-webpage/public/data/DSC00206.120x80.jpg",
  "/bik-webpage/public/data/DSC00207.120x80.jpg",
  "/bik-webpage/public/data/DSC00208.120x80.jpg",
  "/bik-webpage/public/data/DSC00209.120x80.jpg",
  "/bik-webpage/public/data/DSC00210.120x80.jpg",
  "/bik-webpage/public/data/DSC00211.120x80.jpg",
  "/bik-webpage/public/data/DSC00212.120x80.jpg"];

var imageListItem = {

  render: function(appState, image) {
    return h("img.image-list-item", {
      onmousedown: function(evt) { imageList.selectImage(appState, image); },
      className: image.selected ? "selected" : "",
      src: image.url,
      style: {
        maxWidth: `${image.maxWidth}px`,
        maxHeight: `${image.maxHeight}px`
      }
    });
  }

}

var imageList = {
  selectImage: function(appState, image) {
    appState.images.forEach(ea => ea.selected = false);
    image.selected = true;
    appState.selectImage = image;
    appState.dirty = true;
  },
  render: function(appState) {
    return h("div.image-list", appState.images.map(img => imageListItem.render(appState, img)));
  }
}

var imageControls = {

  toggleExport: function(appState, image, shouldExport) {
    image.includeInExport = shouldExport;
    appState.dirty = true;
  },

  render: function(appState) {
    var image = appState.selectImage;
    return h("div.image-controls", [
      h("div#image-info", [image ?  image.url : "nothing selected"]),
      h("div", [h("textarea#description", image ? image.description : "")]),
      h('div.labeled-checkbox', [
        h("input#should-export-image", {
          onchange: evt => image && this.toggleExport(appState, image, evt.target.checked),
          type: "checkbox",
          checked: image ? image.includeInExport : false
        }),
        h("label", {checked: false, "htmlFor": "should-export-image"}, ["export"])])
    ]);
  }

}

var navbar = {
  render: function(appState) {
    return h("div.navbar", [
      h("input#location", {type: "text"}, [appState.location])
    ]);
  }
}

var app = {
  get dirty() { return this.state.dirty; },
  set dirty(v) { return this.state.dirty = v; },

  state: {
    dirty: true,
    location: '',
    images: imageFiles.map(ea => ({
      url: ea,
      includeInExport: true,
      selected: false, 
      type: "image",
      maxWidth: 200,
    })),
    selectedImage: null
  },

  render: function() {
    return h("div", [
      navbar.render(app.state),
      imageList.render(app.state),
      imageControls.render(app.state)
    ]);
  }
};


var renderState = rendering.init(app, document.querySelector("#vdom-app"));

if (typeof $world === "undefined") // real web page
  rendering.run(renderState, app);
else // preview
  rendering.step(renderState, app);

window.show && show(`! ${renderState.proc}`);

var remote = lively.lang.Path("lively.net.tools.RemoteProject").get(window)
remote && remote.reloadProjectPage("tour-gallery-editor");
