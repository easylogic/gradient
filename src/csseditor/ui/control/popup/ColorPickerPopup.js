import { EVENT } from "../../../../util/UIElement";
import EmbedColorPicker from "../EmbedColorPicker";
import BasePopup from "./BasePopup";


export default class ColorPickerPopup extends BasePopup {

  getTitle() {
    return 'ColorPicker';
  }

  getClassName() {
    return 'compact'
  }

  initState() {

    return {
      color: 'rgba(0, 0, 0, 1)'
    }
  }

  components() {
      return {
        EmbedColorPicker
      }
  }

  updateData(opt = {}) {
    this.setState(opt, false);

    if (this.state.target) {
      this.state.target.trigger(this.state.changeEvent, this.state.color, this.params);
    }

  }

  updateEndData(opt = {}) {
    this.setState(opt, false);

    if (this.state.target) {
      this.state.target.trigger(this.state.changeEndEvent, this.state.color, this.params);
    }

  }

  getBody() {
    return /*html*/`
      <div class="color-picker-popup">
        <div class='box'>
          <EmbedColorPicker ref='$color' value='${this.state.color}' onchange='changeColor' onchangeend="changeEndColor" />
        </div>
      </div>
    `;
  }


  [EVENT('changeColor')] (color) {
    this.updateData({
      color
    })
  }

  [EVENT('changeEndColor')] (color) {
    this.updateEndData({
      color
    })
  }  

  [EVENT("showColorPickerPopup")](data, params) {
    data.changeEvent = data.changeEvent || 'changeFillPopup'

    this.params = params;
    this.setState(data, false);
    this.children.$color.setValue(this.state.color);

    this.show(232);
  }

  [EVENT("hideColorPickerPopup")]() {
    this.hide();
  }


}