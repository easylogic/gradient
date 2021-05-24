import BaseProperty from "./BaseProperty";
import { CLICK, CHANGE, INPUT } from "../../../../../util/Event";
import { editor } from "../../../../../editor/editor";
import { html } from "../../../../../util/functions/func";
import { EVENT } from "../../../../../util/UIElement";
import { BackgroundImage } from "../../../../../editor/css-property/BackgroundImage";
import { StaticGradient } from "../../../../../editor/image-resource/StaticGradient";
import { Length } from "../../../../../editor/unit/Length";

const BorderImageStyleLit = [
  "stretch",
  "repeat",
  "round",
  "space",
];

export default class BorderImageProperty extends BaseProperty {
  getTitle() {
    return "Border Image";
  }

  getClassName() {
    return "border-image";
  }

  afterRender() {
    this.refresh();
    this.trigger('toggleBorderImage');
  }

  getTemplateForBorderImageProperty() {

    const current = editor.selection.current || {borderImage: {width: Length.px(0), outset: 0, slice: Length.percent(100)}};


    return html`
      <div class="property-item border-image-item">
        <div class="input-group">
          <div class="input-field">
            <div class="slider">
              <label>gradient</label>
            </div>
            <div class="input-ui">
              <div class='gradient-preview' ref="$preview" style='border:1px solid #adadad;cursor:pointer;'>
                <div class='gradient-view' ref='$gradientView'></div>
              </div>
            </div>
          </div>
          <div class="input-field">
            <div class="slider">
              <label>Width</label>
            </div>
            <div class="input-ui">
              <div class="input">
                <input type="number" min="0" max="100" value="${current.borderImage.width.value}" ref="$width" />
              </div>
              <div class="select">
                <select class="unit" ref="$unit">
                  <option value="px">px</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
          </div>
          <div class="input-field">
            <div class="slider">
              <label>Slice</label>
            </div>
            <div class="input-ui">
              <div class="input">
                <input type="number" min="0" max="100" value="${current.borderImage.slice.value}" ref="$slice" />
              </div>
              <div class="select">
                <select class="unit" ref="$sliceUnit">
                  <option value="px" ${current.borderImage.slice.unit === 'px' ? 'selected' : ''}>px</option>
                  <option value="%" ${['percent', '%'].includes(current.borderImage.slice.unit) ? 'selected' : ''}>%</option>
                </select>
              </div>
            </div>
          </div>          
          <div class="input-field">
            <div class="slider">
              <label>outset</label>
            </div>
            <div class="input-ui">
              <div class="input">
                <input type="number" min="0" max="100" value="${current.borderImage.outset.value}" ref="$outset" />
              </div>
              <div class="select">
                <select class="unit" ref="$unit">
                  <option value="px">px</option>
                </select>
              </div>
            </div>
          </div>          
          <div class="input-field">
            <div class="slider">
              <label>Repeat</label>
            </div>
            <div class="input-ui">
              <div class="style">
                <select ref="$repeat">
                  ${BorderImageStyleLit.map(it => {
                    return `<option value="${it}">${it}</option>`;
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getBody() {
    return `
        ${this.getTemplateForBorderImageProperty()}
    `;
  }

  refresh(){
    this.load();
  }


  [CLICK('$preview')] () {
    var current = editor.selection.current;

    const gradient = new StaticGradient();

    if (current) {
      this.emit("showFillPicker", {
        ...(current.borderImage.source || gradient.toJSON()),
        refresh: true
      }, {
        id: this.source
      });
      this.emit('hideBackgroundPropertyPopup');
    }
  }

  [CHANGE("$unit")](e) {
    this.refreshBorderImageInfo();
  }

  [INPUT("$width")](e) {
    this.refreshBorderImageInfo({
      width: this.refs.$width.value
    });
  }

  [INPUT("$outset")](e) {
    this.refreshBorderImageInfo({
      outset: this.refs.$outset.value
    });
  }  

  [INPUT("$slice")](e) {
    this.refreshBorderImageInfo({
      slice: new Length(this.refs.$slice.value, this.refs.$sliceUnit.value)
    });
  }    

  [CHANGE("$repeat")](e) {
    this.refreshBorderImageInfo({
      repeat: this.refs.$repeat.value
    });
  }

  refreshBorderImageInfo(obj) {
    var current = editor.selection.current;

    if (current) {
      // ArtBoard, Layer 에 새로운 BackgroundImage 객체를 만들어보자.
      current.setBorderImage(obj);

      this.refresh();

      this.emit("refreshCanvas");
    }
  }

  [EVENT('changeFillPicker')] (source, params) {
    if (params.id === this.source) {
      const backgroundImage = new BackgroundImage()
      backgroundImage.setGradient(source);
      this.refreshBorderImageInfo({
        source
      });
  
      this.refs.$gradientView.css('background-image', backgroundImage.image.toString())
    }

  }
}
