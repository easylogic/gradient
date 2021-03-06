import BaseProperty from "./BaseProperty";
import { CLICK, CHANGE, INPUT, LOAD } from "../../../../../util/Event";
import { Length } from "../../../../../editor/unit/Length";
import { editor } from "../../../../../editor/editor";
import { html } from "../../../../../util/functions/func";
import { EVENT } from "../../../../../util/UIElement";

const borderStyleLit = [
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset"
];

const borderTypeList = ["all", "top", "right", "bottom", "left"];

export default class BorderProperty extends BaseProperty {
  getTitle() {
    return "Border";
  }

  afterRender() {
    this.refresh();
  }

  getClassName() {
    return "border";
  }

  [LOAD("$borderDirection")]() {
    var current = editor.selection.current || { border: {} };

    return borderTypeList.map(type => {
      return `<button type="button" data-value="${type}" ref="$${type}" has-value='${!!current
        .border[type]}'></button>`;
    });
  }

  getTemplateForBorderProperty() {
    return html`
      <div class="property-item border-item">
        <div
          class="border-direction"
          ref="$borderDirection"
          data-selected-value="all"
        ></div>
        <div class="input-group">
          <div class="input-field">
            <div class="slider">
              <label>Width</label>
            </div>
            <div class="input-ui">
              <div class="input">
                <input type="number" min="0" max="100" value="0" ref="$width" />
              </div>
              <div class="select">
                <select class="unit" ref="$unit">
                  <option value="px">px</option>
                  <option value="em">em</option>
                </select>
              </div>
            </div>
          </div>
          <div class="input-field">
            <div class="slider">
              <label>Style</label>
            </div>
            <div class="input-ui">
              <div class="style">
                <select ref="$style">
                  ${borderStyleLit.map(it => {
                    return `<option value="${it}">${it}</option>`;
                  })}
                </select>
              </div>
            </div>
          </div>

          <div class="input-field">
            <div class="slider">
              <label>Color</label>
            </div>
            <div class="input-ui color-ui">
              <ColorViewEditor ref='$color' key='borderColor' value="black" onchange="changeColor" />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getBody() {
    return `
        ${this.getTemplateForBorderProperty()}
    `;
  }

  // TODO: current ????????? ????????? ????????? ????????????.
  refresh() {
    this.load();
  }

  [CHANGE("$unit")](e) {
    this.refreshBorderInfo();
  }

  [INPUT("$width")](e) {
    this.refreshBorderInfo();
  }

  [CHANGE("$style")](e) {
    this.refreshBorderInfo();
  }

  refreshBorderInfo() {
    var value = this.refs.$width.value;
    var type = this.refs.$borderDirection.attr("data-selected-value");
    var unit = this.refs.$unit.value;
    var style = this.refs.$style.value;
    var color = this.children.$color.getValue()

    var current = editor.selection.current;

    if (current) {
      // ArtBoard, Layer ??? ????????? BackgroundImage ????????? ???????????????.
      current.setBorder(type, {
        width: new Length(value, unit),
        style,
        color
      });

      this.refresh();

      this.emit("refreshCanvas");
      this.emit('toggleBorderImage');
    }
  }

  [CLICK("$borderDirection button")](e) {
    var type = e.$delegateTarget.attr("data-value");
    this.refs.$borderDirection.attr("data-selected-value", type);

    var current = editor.selection.current;
    if (current) {
      current.setBorder(type);
    }

    this.refresh();
  }

  [EVENT("changeColor")](color) {
    this.refreshBorderInfo();
  }
}
