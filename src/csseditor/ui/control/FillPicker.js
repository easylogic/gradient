import UIElement, { EVENT } from "../../../util/UIElement";
import ColorPicker from "../../../colorpicker/index";
import icon from "../icon/icon";
import { CLICK, CHANGE } from "../../../util/Event";
import { EMPTY_STRING } from "../../../util/css/types";
import { html } from "../../../util/functions/func";
import { Length, Position } from "../../../editor/unit/Length";
import { editor } from "../../../editor/editor";
import { CHANGE_SELECTION } from "../../types/event";

const tabs = [
  // { type: "static-gradient", title: "Static Gradient" },
  { type: "linear-gradient", title: "Linear Gradient" },
  { type: "repeating-linear-gradient", title: "Repeating Linear Gradient" },
  { type: "radial-gradient", title: "Radial Gradient" },
  { type: "repeating-radial-gradient", title: "Repeating Radial Gradient" },
  { type: "conic-gradient", title: "Conic Gradient" },
  { type: "repeating-conic-gradient", title: "Repeating Conic Gradient" },
  { type: "image", title: "Image", icon: icon.image }
];

export default class FillPicker extends UIElement {
  afterRender() {
    // this.$el.hide();

    var defaultColor = "rgba(0, 0, 0, 0)";

    this.colorPicker = ColorPicker.create({
      type: "sketch",
      position: "inline",
      container: this.refs.$color.el,
      color: defaultColor,
      localStorage: {
        prefix: 'easylogic.gradient.colorpicker'
      },
      onChange: c => {
        this.changeColor(c);
      }
    });

    setTimeout(() => {
      this.colorPicker.dispatch("initColor", defaultColor);
    }, 100);
  }

  initialize() {
    super.initialize();

    this.selectedTab = "image";
  }

  template() {
    return html`
      <div class="fill-picker">
        <div class="picker-tab">
          <div class="picker-tab-list" ref="$tab" data-value="linear-gradient">
            ${tabs.map(it => {
              return /*html*/`
                <span 
                    class='picker-tab-item ${
                      it.selected ? "selected" : EMPTY_STRING
                    }' 
                    data-selected-value='${it.type}'
                    title='${it.title}'
                >
                    <div class='icon'>${it.icon || EMPTY_STRING}</div>
                </span>`;
            })}
          </div>
        </div>
        <div class="picker-tab-container" ref="$tabContainer">
          <div
            class="picker-tab-content"
            data-content-type="color"
            ref="$color"
          ></div>
          <div
            class="picker-tab-content"
            data-content-type="image"
            ref="$image"
          >
            <div class="image-preview">
              <figure>
                <img src="" ref="$imagePreview" />
                <div class="select-text">Select a image</div>
              </figure>
              <input type="file" ref="$imageFile" accept="image/*" />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  [CHANGE("$imageFile")](e) {
    var files = this.refs.$imageFile.files;

    //?????? ?????? ??????
    // files.length ?????? Preview ??? ?????? ??????
    // URL.createObjectUrl ??? ?????? url ?????? (?????? URL ??? ????????? ????????????)
    // emit('changeFillPicker', { images: [........] })

    var images = files.map(file => {
      return editor.createUrl(file);
    });

    if (images) {
      this.refs.$imagePreview.attr("src", images[0]);
      this.emit("changeFillPicker", { type: "image", images }, this.state.params);
    }
  }

  [CLICK("$tab .picker-tab-item")](e) {
    const type = e.$delegateTarget.attr("data-selected-value");

    //TODO: picker ????????? ????????? ?????? ????????? ?????? ???????????? ??????.
    this.selectTabContent(type, {
      type,
      selectTab: true
    });
  }

  selectTabContent(type, data = {}) {
    this.selectedTab = type;
    this.$el.attr("data-gradient-type", type);    
    this.refs.$tab.attr("data-value", type);
    this.refs.$tabContainer.attr(
      "data-value",
      type === "image" ? "image" : "color"
    );
    switch (type) {
      case "image": // image
        if (data.url) {
          this.refs.$imagePreview.attr("src", data.url);
        }
        this.emit("hideGradientEditor");
        break;
      default:
        // gradient
        let sample = {
          refresh: data.refresh || false,
          type: data.type || "static-gradient",
          selectColorStepId: data.selectColorStepId,
          angle: data.angle || 0,
          radialType: data.radialType,
          radialPosition: data.radialPosition
        };
        if (data.colorsteps) {
          sample.colorsteps = data.colorsteps;
        }

        this.emit("showGradientEditor", sample, data.selectTab);

        break;
    }
  }

  changeColor(color) {
    this.emit("changeColorPicker", color);
  }

  [EVENT("showFillPicker")](data, params) {
    this.$el.show();
    this.state.params = params;
    this.selectTabContent(data.type, data);
    this.emit("hidePicker");
  }

  [EVENT("hideFillPicker", "hidePicker", CHANGE_SELECTION)]() {
    this.$el.hide();
  }

  [EVENT("selectColorStep")](color) {
    this.colorPicker.initColorWithoutChangeEvent(color);
  }

  [EVENT("changeColorStep")](data = {}) {
    this.emit("changeFillPicker", {
      type: this.selectedTab,
      ...data
    }, this.state.params);
  }
}
