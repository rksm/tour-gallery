/*global rendering, virtualDom*/

var h = virtualDom.h;

var imageFiles = [
  "http://localhost:9001/bik-webpage/public/data/DSC00188.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00189.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00190.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00191.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00192.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00194.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00197.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00198.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00200.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00202.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00203.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00204.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00205.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00206.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00207.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00208.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00209.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00210.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00211.120x80.jpg",
  "http://localhost:9001/bik-webpage/public/data/DSC00212.120x80.jpg"];

function updateHeight(renderState) {
  var full = window.innerHeight;
  var top = 40;
  var middle = ((full - top) / 100) * 66;
  var bottom = full - top - middle;

  renderState.location.height = top;
  renderState.imageList.height = middle;
  renderState.imageInfo.height = bottom;
  
  console.log(full, top, middle, bottom);
  renderState.dirty = true;
}

var renderState = {
  dirty: false,

  location: {
    string: '',
    height: 20
  },

  imageList: {
    images: imageFiles.map(ea => ({
      url: ea,
      includeInExport: true,
      selected: false, 
      type: "image",
      maxWidth: 200,
    })),
    selection: null,
    height: 200
  },
  
  imageInfo: {
    height: 50
  }
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var imageListItem = {

  render: function(renderState, image) {
    return h("img.image-list-item", {
      onmousedown: function(evt) { imageList.selectImage(renderState, image); },
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

  selectImage: function(renderState, image) {
    renderState.imageList.images.forEach(ea => ea.selected = false);
    image.selected = true;
    renderState.imageList.selection = image;
    renderState.dirty = true;
  },

  render: function(renderState) {
    return h("div.image-list", {style: {height: renderState.imageList.height + "px"}}, renderState.imageList.images.map(img => imageListItem.render(renderState, img)));
  }

}

var imageControls = {

  toggleExport: function(renderState, image, shouldExport) {
    image.includeInExport = shouldExport;
    renderState.dirty = true;
  },

  render: function(renderState) {
    var image = renderState.imageList.selection;
    return h("div.image-controls",
    {style: {height: renderState.imageInfo.height + "px"}},
    [
      h("span#image-info", [image ?  image.url : "nothing selected"]),
      h('div.labeled-checkbox', [
        h("input#should-export-image", {
          onchange: evt => image && this.toggleExport(renderState, image, evt.target.checked),
          type: "checkbox",
          checked: image ? image.includeInExport : false
        }),
        h("label", {checked: false, "htmlFor": "should-export-image"}, ["export"])]),
      h("div.description", [h("textarea", image ? image.description : "")])
    ]);
  }

}

var navbar = {

  render: function(renderState) {
    return h("div.navbar",
    {style: {height: renderState.location.height}},
    [
      h("input#location",  {type: "text", placeholder: "/path/to/your/images"}, [renderState.location.string]),
      h("input#location-btn",  {type: "button", value: "Load"})
    ]);
  }

}

var mainWindow = {

  render: function(renderState) {
    return h("div", [
      navbar.render(renderState),
      imageList.render(renderState),
      imageControls.render(renderState)
    ]);
  }

}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var domNode = document.querySelector("#vdom-app");
updateHeight(renderState);

if (typeof $world === "undefined") {
  // real web page
  window.onorientationchange = () => updateHeight(renderState);
  window.onresize = () => updateHeight(renderState);
  rendering.initAndRun(domNode, renderState, mainWindow.render);
} else {
  // preview
  rendering.once(domNode, renderState, mainWindow.render);
}

var remote = lively.lang.Path("lively.net.tools.RemoteProject").get(window);
remote && remote.reloadProjectPage("tour-gallery-editor");
