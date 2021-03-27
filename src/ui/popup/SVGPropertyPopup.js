import { EVENT } from "@sapa/UIElement";
import { INPUT, LOAD } from "@sapa/Event";
import "../property-editor/SVGFilterEditor";
import "../property-editor/SVGClipPathEditor";
import BasePopup from "./BasePopup";
import { registElement } from "@sapa/registerElement";

export default class SVGPropertyPopup extends BasePopup {

  getTitle() {
    return 'SVG Property';
  }


  initState() {
    return {
      changeEvent: 'changeSVGPropertyPopup',
      name: '',
      type: '',
      value: []
    };
  }

  updateData(opt) {
    this.setState(opt, false); 
    this.emit(this.state.changeEvent, this.state);
  }

  getBody() {
    return /*html*/`
    <div class='svg-property-editor-popup' ref='$popup'>
      <div class="box">
        ${this.templateForName()}
        <div class='editor' ref='$editor'></div>
      </div>
    </div>`;
  }

  [LOAD('$editor')] () {

    switch(this.state.type) {
      case 'filter':
        return /*html*/`
          <object refClass="SVGFilterEditor" ref='$filter' title="SVG Filter" key="filter" onchange='changeFilterEditor'>
            <property name="value" type="json">${JSON.stringify(this.state.value)}</property>
          </div>
        `
      case 'clip-path':
        return /*html*/`
          <object refClass="SVGClipPathEditor" ref='$clippath' title="SVG Clip Path" key="clip-path" onchange='changeClipPathEditor'>
            <property name="value" type='json'>${JSON.stringify(this.state.value)}</property>
          </div>
        `
    }

    return ``
  }

  [EVENT('changeFilterEditor')] (key, value) {
    this.updateData({
      value
    })
  }

  [EVENT('changeClipPathEditor')] (key, value) {
    this.updateData({
      value
    })
  }  

  templateForName() {
    return /*html*/`
      <div class='name'>
        <label>Name</label>
        <div class='input grid-1'>
          <input type='text' value='${this.state.name}' ref='$name'/>
        </div>
      </div>
    `
  }

  [INPUT('$name')] (e) {
    if (this.refs.$name.value.match(/^[a-zA-Z0-9\b]+$/)) {
      this.updateData({name : this.refs.$name.value })
    } else {
      e.preventDefault()
      e.stopPropagation()
      return false;
    }
  }

  refresh() {
    this.refs.$name.val(this.state.name);

    this.load();
  }

  [EVENT("showSVGPropertyPopup")](data) {
    this.setState(data);
    this.refresh()

    this.show(250);
  }

  [EVENT("hideSVGPropertyPopup")]() {
    this.$el.hide();
  }
}

registElement({ SVGPropertyPopup })