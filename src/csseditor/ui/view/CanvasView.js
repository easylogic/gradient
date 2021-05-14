import UIElement, { EVENT } from "../../../util/UIElement";

import { editor } from "../../../editor/editor";
import { Length } from "../../../editor/unit/Length";
import { Project } from "../../../editor/items/Project";
import { ArtBoard } from "../../../editor/items/ArtBoard";
import { CLICK } from "../../../util/Event";
import { CHANGE_SELECTION } from "../../types/event";

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
    }
  }

  [CLICK("$el")]() {
    this.emit(CHANGE_SELECTION);
  }

  [EVENT("downloadCanvas")] () {
    var current = editor.selection.current;
    if (current) {
      const width = current.width.value;
      const height = current.height.value; 

      const svg = `<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%" x="0" y="0">
            <div xmlns="http://www.w3.org/1999/xhtml" style="${current.toString()}"></div>
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
