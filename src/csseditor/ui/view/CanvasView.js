import UIElement, { EVENT } from "../../../util/UIElement";

import { editor } from "../../../editor/editor";
import { Length } from "../../../editor/unit/Length";
import { Project } from "../../../editor/items/Project";
import { ArtBoard } from "../../../editor/items/ArtBoard";
import { BIND, CLICK, END, LOAD, MOVE, POINTERSTART, PREVENT, STOP } from "../../../util/Event";
import { CHANGE_SELECTION } from "../../types/event";
import { CSS_TO_STRING } from "../../../util/css/make";

export default class CanvasView extends UIElement {
  afterRender() {
    var project = editor.addProject(new Project());
    var artboard = project.add(new ArtBoard());

    editor.selection.select(artboard);

    this[EVENT("refreshCanvas")]();
  }
  template() {
    return `
            <div class='page-view'>
                <div class="page-canvas" ref="$canvas"></div>         
                <div class="gradient-control" ref="$control"></div>          
            </div>
        `;
  }

  [EVENT("caculateSize")](targetEvent) {
    var rect = this.refs.$canvas.rect();

    var data = { width: Length.px(rect.width), height: Length.px(rect.height) };
    this.emit(targetEvent, data);
  }

  [EVENT("refreshCanvas")](currentItem) {
    var current = currentItem || editor.selection.current;
    if (current) {
      this.refs.$canvas.cssText(current.toString());      
      var rect = this.refs.$canvas.rect();      
      this.refs.$control.css({
        width: Length.px(rect.width),
        height: Length.px(rect.height),
      });

      this.load('$control');
    }
  }

  [LOAD('$control')] () {
    var current = editor.selection.current;

    return current.backgroundImages.map((it, index) => {

      const { width, height, x, y, size} = it; 
      const css = size === 'auto' ? { width, height, left: x, top: y} : {};

      // console.log(x);

      return `<div class='gradient-layer' data-selected="${it.selected}" data-index="${index}" style="${CSS_TO_STRING(css)}"></div>`
    })
    
  }

  [POINTERSTART('$control .gradient-layer') + MOVE('moveGradientLayer') + END('moveEndGradientLayer') + PREVENT + STOP] (e) {
    const index = +e.$delegateTarget.attr('data-index');

    this.selectedIndex = index; 
    this.selectLayer(this.selectedIndex);

    editor.selection.current.selectBackgroundImage(index);
    this.selectedBackgroundImage = editor.selection.current.getSelectedBackgroundImage();

    // console.log(this.selectedBackgroundImage);

    const { x, y, width: w, height: h } = this.selectedBackgroundImage;    
    this.oldX = x.clone(); 
    this.oldY = y.clone(); 
    this.oldW = w.clone(); 
    this.oldH = h.clone();     

    const {width, height} = editor.selection.current;
    this.oldWidth = width.clone().value;
    this.oldHeight = height.clone().value;

    this.emit('selectGradient');

  }
 
  moveGradientLayer (dx, dy) {
    const newX = this.oldX.toPx(this.oldWidth).add(dx).clone().floor();
    const newY = this.oldY.toPx(this.oldHeight).add(dy).clone().floor();
    const newW = this.oldW.toPx(this.oldWidth).floor();
    const newH = this.oldH.toPx(this.oldHeight).floor();

    this.selectedBackgroundImage.reset({
      x: newX, y: newY, width: newW, height: newH
    })

    this.trigger('refreshCanvas');
    this.emit('refreshCanvas');
  }

  moveEndGradientLayer () {
    this.emit('selectGradient');
  }

  selectLayer (index) {
    this.refs.$control.$(`[data-selected="true"]`).removeAttr('data-selected');
    this.refs.$control.$(`[data-index="${index}"]`).attr('data-selected', "true");
  }

  [EVENT("selectGradient")] () {
    this.load("$control");
  }


  // [CLICK("$el")]() {
  //   this.emit(CHANGE_SELECTION);
  // }

  [EVENT("downloadCanvas")] () {
    var current = editor.selection.current;
    if (current) {
      const width = current.width.value;
      const height = current.height.value; 

      const svg = `<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%" x="0" y="0">
            <div xmlns="http://www.w3.org/1999/xhtml" style="position:relative">
              <div style="${current.toString()}"></div>
            </div>
          </foreignObject>
        </svg>`
      const blob = new Blob([svg],{type:'image/svg+xml'});

      var a = new FileReader();
      a.onload = function(e) {

        let image = new Image();
        image.crossOrigin="Anonymous"
        image.onload = () => {
          
          let canvas = document.createElement('canvas');

          let context = canvas.getContext('2d');

          canvas.widht = width;
          canvas.height = height;

          // draw image in canvas starting left-0 , top - 0  
          context.drawImage(image, 0, 0, width, height );
          let png = canvas.toDataURL(); // default png

          var link = document.createElement('a');
          link.download = "easylogic-gradient.png";
          link.style.opacity = "0";
          link.href = png;
          link.click();
          
        };
        image.onerror = function (e) {
          console.log(e);
        }
        image.src = e.target.result;
      }
      a.readAsDataURL(blob);      
    }
  }
}
