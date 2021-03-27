import BaseProperty from "./BaseProperty";
import { EVENT } from "@sapa/UIElement";
import "../property-editor/PathDataEditor";
import { DEBOUNCE } from "@sapa/Event";
import { registElement } from "@sapa/registerElement";


export default class PathDataProperty extends BaseProperty {

  getTitle() {
    return this.$i18n('path.data.property.title');
  }

  getClassName() {
    return "item path-data-property"
  }

  isSVGItem  (current) {
    return current.is('svg-path', 'svg-brush', 'svg-textpath')
  }

  [EVENT('refreshStyleView', 'refreshRect') + DEBOUNCE(100)]() {
    this.refresh();
  }  

  [EVENT('refreshSelection')]() {

    this.refreshShow(['svg-path', 'svg-brush', 'svg-textpath'])

  }

  refresh() {
    var current = this.$selection.current || {};
    this.children.$pathData.setValue(current.d);
  }

  getBody() {
    var current = this.$selection.current || {};

    return /*html*/`
      <div>
        <object refClass="PathDataEditor" ref='$pathData' key='d' value='${current.d}' onchange='changeValue' />
      </div>
    `;
  }


  [EVENT('changeValue')] (key, value, params) {
    this.emit("updatePathItem", this.$selection.current, {
      [key]: value 
    })
    
  }
}

registElement({ PathDataProperty })