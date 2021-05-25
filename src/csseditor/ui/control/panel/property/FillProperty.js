import BaseProperty from "./BaseProperty";
import {
  LOAD,
  CLICK,
  PREVENT,
} from "../../../../../util/Event";
import { editor } from "../../../../../editor/editor";
import { EVENT } from "../../../../../util/UIElement";
import {
  CHANGE_RECT,
  CHANGE_LAYER,
  CHANGE_ARTBOARD,
  CHANGE_SELECTION,
  CHANGE_INSPECTOR
} from "../../../../types/event";
import { EMPTY_STRING } from "../../../../../util/css/types";
import icon from "../../../icon/icon";
import Dom from "../../../../../util/Dom";
import { Position } from "../../../../../editor/unit/Length";
import { CSS_TO_STRING } from "../../../../../util/css/make";

const names = {
  image: "Image",
  static: "Static",
  "static-gradient": "Static",
  linear: "Linear",
  "repeating-linear": `${icon.repeat} Linear`,
  radial: "Radial",
  "repeating-radial": `${icon.repeat} Radial`,
  conic: "Conic",
  "repeating-conic": `${icon.repeat} Conic`,
  "linear-gradient": "Linear",
  "repeating-linear-gradient": `${icon.repeat} Linear`,
  "radial-gradient": "Radial",
  "repeating-radial-gradient": `${icon.repeat} Radial`,
  "conic-gradient": "Conic",
  "repeating-conic-gradient": `${icon.repeat} Conic`
};

const types = {
  image: "image",
  static: "gradient",
  "static-gradient": "gradient",
  linear: "gradient",
  "repeating-linear": "gradient",
  radial: "gradient",
  "repeating-radial": "gradient",
  conic: "gradient",
  "repeating-conic": "gradient",
  "linear-gradient": "gradient",
  "repeating-linear-gradient": "gradient",
  "radial-gradient": "gradient",
  "repeating-radial-gradient": "gradient",
  "conic-gradient": "gradient",
  "repeating-conic-gradient": "gradient"
};

export default class FillProperty extends BaseProperty {
  getTitle() {
    return "Gradients";
  }
  getBody() {
    return `<div class='property-item fill-list' ref='$fillList'></div>`;
  }

  getTools() {
    return `
        <button type="button" ref="$add" title="add Fill">${icon.add}</button>
    `;
  }

  getClassName() {
    return "gradients";
  }

  getColorStepList(image) {
    switch (image.type) {
      case "static-gradient":
      case "linear-gradient":
      case "repeating-linear-gradient":
      case "radial-gradient":
      case "repeating-radial-gradient":
      case "conic-gradient":
      case "repeating-conic-gradient":
        return this.getColorStepString(image.colorsteps);
    }

    return EMPTY_STRING;
  }

  getColorStepString(colorsteps) {
    return colorsteps
      .map(step => {
        return `<div class='step' data-colorstep-id="${
          step.id
        }" style='background-color:${step.color};' title="${step.color}"></div>`;
      })
      .join(EMPTY_STRING);
  }

  [LOAD("$fillList")]() {
    var current = editor.selection.current;

    if (!current) return EMPTY_STRING;

    return current.backgroundImages.map((it, index) => {
      var image = it.image;
      var backgroundType = types[image.type];
      var backgroundTypeName = names[image.type];

      const imageCSS = CSS_TO_STRING(it.toBackgroundImageCSS());
      const selectedClass = it.selected ? "selected" : "";

      if (it.selected) {
        this.selectedIndex = index;
      }

      return `
      <div class='fill-item ${selectedClass}' data-index='${index}' ref="fillIndex${index}" draggable='true' data-fill-type="${backgroundType}" >
          <div class="move-container">
            <button type="button" data-type="up">▲</button>
            <button type="button" data-type="down">▽</button>
          </div>
          <div class="fill-item-container">
            <div class='preview' data-index="${index}" ref="preview${index}">
                <div class='mini-view' style="${imageCSS}" ref="miniView${index}"></div>
            </div>
            <div class='fill-info' title="Please drag to change order">
              <div class='gradient-info'>
                <div class='fill-title' ref="fillTitle${index}">${backgroundTypeName}</div>
                <div class='colorsteps' ref="colorsteps${index}">
                </div>
                <div class='tools'>
                  <button type="button" class='remove' data-index='${index}'>${icon.remove2}</button>
                </div>
              </div>
              <div class='background-image-info'>
                <div ref="size${index}">${it.width}/${it.height}</div>
                <div ref="repeat${index}">${it.repeat}</div>
                <div class='blend-mode' ref="blendMode${index}">${it.blendMode}</div>
              </div>
            </div>
          </div>

      </div>
      `;
    });
  }

  [EVENT(CHANGE_RECT, CHANGE_LAYER, CHANGE_ARTBOARD, CHANGE_SELECTION)]() {
    this.refresh();
    this.emit("hideFillPicker");
    this.emit("hideBackgroundPropertyPopup");
  }

  refresh() {
    this.load();
  }

  [CLICK("$add")](e) {
    var current = editor.selection.current;

    if (current) {
      // ArtBoard, Layer 에 새로운 BackgroundImage 객체를 만들어보자.
      current.createBackgroundImage({ selected: true });
      this.refresh();

      this.selectedIndex = current.backgroundImages.length-1;
      this.selectItem(this.selectedIndex, true);

      this.emit("refreshCanvas");
      this.emit(CHANGE_INSPECTOR);      


      this.current = editor.selection.current;
      this.currentBackgroundImage = this.current.getSelectedBackgroundImage();
  
      this.emit("showFillPicker", {
        ...this.getFillData(this.currentBackgroundImage),
        selectColorStepId: null,
        refresh: true
      }, {
        id: this.source
      });
      this.viewBackgroundPropertyPopup();
  
      this.emit("selectGradient");

    }

  }

  [EVENT('selectGradient')] () {
    var current = editor.selection.current;

    if (current) {
     
      this.refresh();

      this.selectedIndex = current.getSelectedBackgroundIndex();
      this.selectItem(this.selectedIndex, true);

      this.emit(CHANGE_INSPECTOR);      

      this.current = current;
      this.currentBackgroundImage = this.current.getSelectedBackgroundImage();
  
      this.emit("showFillPicker", {
        ...this.getFillData(this.currentBackgroundImage),
        selectColorStepId: null,
        refresh: true
      }, {
        id: this.source
      });
      this.viewBackgroundPropertyPopup();
    }
  }


  getFillData(backgroundImage) {
    let data = {
      type: backgroundImage.type
    };

    switch (data.type) {
      case "image":
        data.url = backgroundImage.image ? backgroundImage.image.url : "";
        break;
      default:
        if (backgroundImage.image) {
          const image = backgroundImage.image;

          data.type = image.type;
          data.colorsteps = [...image.colorsteps];
          data.angle = image.angle;
          data.radialType = image.radialType || "ellipse";
          data.radialPosition = image.radialPosition || Position.CENTER;
        } else {
          data.colorsteps = [];
          data.angle = 0;
          data.radialType = "ellipse";
          data.radialPosition = Position.CENTER;
        }

        break;
    }

    return data;
  }

  // notNeedColorPicker(e) {
  //   var $el = new Dom(e.target);
  //   const isPreview = $el.hasClass("preview");
  //   const isStep = $el.hasClass("step");
  //   return !isPreview && !isStep;
  // }

  // [CLICK("$fillList") + IF("notNeedColorPicker")](e) {
  //   this.emit("hideFillPicker");
  // }

  [CLICK("$fillList .colorsteps .step")](e) {
    var selectColorStepId = e.$delegateTarget.attr("data-colorstep-id");
    var $preview = e.$delegateTarget.closest("fill-item").$(".preview");
    this.viewFillPicker($preview, selectColorStepId);
  }

  [CLICK("$fillList .move-container [data-type]") + PREVENT](e) {
    var startIndex = +e.$delegateTarget.closest("fill-item").attr('data-index');
    var moveType = e.$delegateTarget.attr('data-type');
    var current = editor.selection.current;
    var targetIndex = -1;

    if (moveType === 'up') {
      targetIndex = startIndex - 1;
      console.log(startIndex, targetIndex);
      if (targetIndex < 0) {
        return;
      }

    } else if (moveType === 'down') {
      targetIndex = startIndex + 1;      

      if (targetIndex >= current.backgroundImages.length) {
        return;
      }
    }

    current.sortBackgroundImage(startIndex, targetIndex);    

    this.emit("refreshCanvas");
  
    this.refresh();

    this.viewFillPicker(this.getRef("preview", targetIndex));
  }  

  // [DRAGSTART("$fillList .fill-item")](e) {
  //   this.startIndex = +e.$delegateTarget.attr("data-index");
  // }

  // // drop 이벤트를 걸 때 dragover 가 같이 선언되어 있어야 한다.
  // [DRAGOVER("$fillList .fill-item") + PREVENT](e) {}

  // [DROP("$fillList .fill-item") + PREVENT](e) {
  //   var targetIndex = +e.$delegateTarget.attr("data-index");
  //   var current = editor.selection.current;
  //   if (!current) return;

  //   this.selectItem(this.startIndex, true);
  //   current.sortBackgroundImage(this.startIndex, targetIndex);

  //   this.emit("refreshCanvas");

  //   this.refresh();

  //   // startIndex 가 target 이랑 바뀌면
  //   // startIndex 객체는 selected 르 true 로 설정하고
  //   // refresh 될 때 selectedIndex 가 설정 되고
  //   // viewFillPicker 를 호출할 $preview 가 필요하네 ?
  //   this.viewFillPicker(this.getRef("preview", this.selectedIndex));
  // }

  [CLICK("$fillList .tools .remove")](e) {
    var removeIndex = e.$delegateTarget.attr("data-index");
    var current = editor.selection.current;
    if (!current) return;
    var currentBackgroundImage = current.backgroundImages[removeIndex];

    if (currentBackgroundImage) {
      current.removeBackgroundImage(removeIndex);

      this.emit("refreshCanvas");

      this.refresh();
    }
  }

  // 객체를 선택하는 괜찮은 패턴이 어딘가에 있을 텐데......
  // 언제까지 selected 를 설정해야하는가?
  selectItem(selectedIndex, isSelected = true) {

    this.refs.$fillList.$$(".selected").forEach(it => it.removeClass("selected"))

    if (isSelected) {
      this.refs[`fillIndex${selectedIndex}`].addClass("selected");
    }

    if (this.current) {
      this.current.selectBackgroundImage(selectedIndex);
    }
  }

  viewFillPicker($preview, selectColorStepId) {
    if (typeof this.selectedIndex === "number") {
      this.selectItem(this.selectedIndex, false);
    }

    this.selectedIndex = +$preview.attr("data-index");
    this.selectItem(this.selectedIndex, true);
    this.current = editor.selection.current;

    if (!this.current) return;
    this.currentBackgroundImage = this.current.getSelectedBackgroundImage();

    this.emit("showFillPicker", {
      ...this.getFillData(this.currentBackgroundImage),
      selectColorStepId,
      refresh: true
    }, {
      id: this.source
    });
    this.viewBackgroundPropertyPopup();

    this.emit("selectGradient");
  }

  viewBackgroundPropertyPopup(position) {
    this.current = editor.selection.current;

    if (!this.current) return;
    this.currentBackgroundImage = this.current.getSelectedBackgroundImage();

    const back = this.currentBackgroundImage;

    const x = back.x;
    const y = back.y;
    const width = back.width;
    const height = back.height;
    const maxWidth = this.current.width;
    const maxHeight = this.current.height;
    const repeat = back.repeat;
    const size = back.size;
    const blendMode = back.blendMode;
    const image = back.image;

    this.emit("showBackgroundPropertyPopup", {
      image,
      position,
      x,
      y,
      width,
      height,
      maxWidth,
      maxHeight,
      repeat,
      size,
      blendMode
    });
    // this.emit("hideFillPicker");
  }

  [CLICK("$fillList .fill-item-container")](e) {
    this.viewFillPicker(e.$delegateTarget.$('.preview'));
  }

  viewChangeImage(data) {
    var backgroundImage = this.currentBackgroundImage;
    if (!backgroundImage) return;
    var $el = this.getRef("miniView", this.selectedIndex);
    if ($el) {
      $el.css({
        ...backgroundImage.toBackgroundImageCSS(),
        "background-size": "cover"
      });
    }

    var $el = this.getRef("fillTitle", this.selectedIndex);
    if ($el) {
      $el.html(names["image"]);
    }

    var $el = this.getRef("colorsteps", this.selectedIndex);
    if ($el) {
      $el.empty();
    }
  }

  setImage(data) {
    if (this.currentBackgroundImage) {
      this.currentBackgroundImage.setImageUrl(data);

      this.viewChangeImage(data);

      if (this.current) {
        this.emit("refreshCanvas", this.current);
      }
    }
  }

  [EVENT("selectFillPickerTab")](type, data) {
    var typeName = types[type];
    var $fillItem = this.refs[`fillIndex${this.selectedIndex}`];
    $fillItem.attr("data-fill-type", typeName);
  }

  viewChangeGradient(data) {
    var backgroundImage = this.currentBackgroundImage;

    if (!backgroundImage) return;
    var $el = this.getRef("miniView", this.selectedIndex);
    if ($el) {
      $el.cssText(CSS_TO_STRING(backgroundImage.toBackgroundImageCSS()));
    }

    var $el = this.getRef("fillTitle", this.selectedIndex);
    if ($el) {
      $el.html(names[data.type]);
    }
  }

  setGradient(data) {
    // console.log(this.currentBackgroundImage, data);
    if (this.currentBackgroundImage) {
      this.currentBackgroundImage.setGradient(data);
      this.viewChangeGradient(data);

      this.emit("refreshCanvas");
    }
  }

  [EVENT("changeFillPicker")](data, params) {
    if (params.id === this.source) {
      switch (data.type) {
        case "image":
          this.setImage(data);
          break;
        default:
          this.setGradient(data);
          break;
      }
    }

  }

  getRef(...args) {
    return this.refs[args.join("")];
  }

  refreshBackgroundPropertyInfo(image, data) {
    if (data.blendMode) {
      var $element = this.getRef(`blendMode`, this.selectedIndex);
      $element.text(data.blendMode);
    } else if (data.width || data.height || data.size) {
      var $element = this.getRef(`size`, this.selectedIndex);

      switch (image.size) {
        case "contain":
        case "cover":
          var text = image.size;
          break;
        default:
          var text = `${image.width}/${image.height}`;
          break;
      }
      $element.text(text);
    } else if (data.repeat) {
      var $element = this.getRef(`repeat`, this.selectedIndex);
      $element.text(data.repeat);
    }
  }

  [EVENT("changeBackgroundPropertyPopup")](data) {
    if (this.currentBackgroundImage) {
      this.currentBackgroundImage.reset({ ...data });

      if (this.current) {
        this.emit("refreshCanvas", this.current);
        this.refreshBackgroundPropertyInfo(this.currentBackgroundImage, data);
      }
    }
  }
}
