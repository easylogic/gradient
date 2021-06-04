import UIElement from "../../../util/UIElement";
import { html } from "../../../util/functions/func";

import ColorPickerUI from "@easylogic/colorpicker";
import "@easylogic/colorpicker/dist/colorpicker.css";

export default class EmbedColorPicker extends UIElement {
  afterRender() {
    // this.$el.hide();

    var defaultColor = "rgba(0, 0, 0, 0)";

    this.colorPicker = ColorPickerUI.create({
      type: "sketch",
      position: "inline",
      container: this.refs.$el.el,
      color: defaultColor,
      onChange: c => {
        this.changeColor(c);
      }
    });
  }

  template() {
    return html`
      <div class="embed-color-picker"></div>
    `;
  }

  getValue () {
    this.colorPicker.getColor();
  }

  setValue (color) {
    this.colorPicker.initColorWithoutChangeEvent(color);
  }

  changeColor(color) {
    this.parent.trigger(this.props.onchange, color, this.changeData);
  }

}
