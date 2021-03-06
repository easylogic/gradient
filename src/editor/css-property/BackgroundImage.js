import { Length, Position } from "../unit/Length";
import { keyMap } from "../../util/functions/func";
import { Property } from "../items/Property";
import { StaticGradient } from "../image-resource/StaticGradient";
import { URLImageResource } from "../image-resource/URLImageResource";
import { LinearGradient } from "../image-resource/LinearGradient";
import { RepeatingLinearGradient } from "../image-resource/RepeatingLinearGradient";
import { RadialGradient } from "../image-resource/RadialGradient";
import { RepeatingRadialGradient } from "../image-resource/RepeatingRadialGradient";
import { ConicGradient } from "../image-resource/ConicGradient";
import { RepeatingConicGradient } from "../image-resource/RepeatingConicGradient";
import { Gradient } from "../image-resource/Gradient";

const RepeatList = ["repeat", "no-repeat", "repeat-x", "repeat-y"];

export class BackgroundImage extends Property {
  static parse(obj) {
    return new BackgroundImage(obj);
  }

  addImageResource(imageResource) {
    this.clear("image-resource");
    return this.addItem("image-resource", imageResource);
  }

  addGradient(gradient) {
    return this.addImageResource(gradient);
  }

  setImageUrl(data) {
    if (!data.images) return;
    if (!data.images.length) return;
    this.reset({ type: "image", image: this.createImage(data.images[0]) });
  }

  createImage(url) {
    return new URLImageResource({ url });
  }

  setGradient(data) {
    this.reset({
      type: data.type,
      image: this.createGradient(data, this.json.image)
    });
    
    return this;
  }

  createGradient(data, gradient) {
    const colorsteps = data.colorsteps;

    // linear, conic 은 angle 도 같이 설정한다.
    const angle = data.angle;

    // radial 은  radialType 도 같이 설정한다.
    const radialType = data.radialType;
    const radialPosition = data.radialPosition;

    // delete json.itemType;
    // delete json.type;

    switch (data.type) {
      // case "static-gradient":
      //   return new StaticGradient({ 
      //     colorsteps 
      //   });
      case "linear-gradient":
        return new LinearGradient({ 
          colorsteps, 
          angle 
        });
      case "repeating-linear-gradient":
        return new RepeatingLinearGradient({ 
          colorsteps, 
          angle 
      });
      case "radial-gradient":
        return new RadialGradient({
          colorsteps,
          radialType,
          radialPosition
        });
      case "repeating-radial-gradient":
        return new RepeatingRadialGradient({
          colorsteps,
          radialType,
          radialPosition
        });
      case "conic-gradient":
        return new ConicGradient({
          colorsteps,
          angle,
          radialPosition
        });
      case "repeating-conic-gradient":
        return new RepeatingConicGradient({
          colorsteps,
          angle,
          radialPosition
        });
    }

    return new Gradient();
  }

  getDefaultObject() {
    return super.getDefaultObject({
      itemType: "background-image",
      checked: false,
      blendMode: "normal",
      size: "auto",
      repeat: "no-repeat",
      width: Length.percent(100),
      height: Length.percent(100),
      x: Length.percent(0),
      y: Length.percent(0),
      image: new LinearGradient()
    });
  }
  
  toJSON() {
    return this.attrs(
      'x',
      'y',
      'width',
      'height',
      'size',
      'repeat', 
      'blendMode',
      'checked',
      'image',
      'selected'
    )
  }
  convert(json) {
    json.x = Length.parse(json.x);
    json.y = Length.parse(json.y);

    if (json.width) json.width = Length.parse(json.width);
    if (json.height) json.height = Length.parse(json.height);

    if (json.image) {
      if (json.image.type === 'image') {
        json.image = this.createImage(json.image.url);
      } else {
        json.image = this.createGradient(json.image);
      }
    }

    return json;
  }

  get image() {
    return this.json.image;
  }

  set image(image) {
    this.json.image = image;
  }

  checkField(key, value) {
    if (key === "repeat") {
      return RepeatList.includes(value);
    }

    return super.checkField(key, value);
  }

  toBackgroundImageCSS(isExport = false) {
    if (!this.json.image) return {};
    return {
      "background-image": this.json.image.toString(isExport)
    };
  }

  toBackgroundPositionCSS() {
    var json = this.json;

    return {
      "background-position": `${json.x} ${json.y}`
    };
  }

  toBackgroundSizeCSS() {
    var json = this.json;
    var backgroundSize = "auto";

    // console.log(json.parent);

    if (json.size == "contain" || json.size == "cover") {
      backgroundSize = json.size;
    } else {
      backgroundSize = `${json.width} ${json.height}`;
    }

    return {
      "background-size": backgroundSize
    };
  }

  toBackgroundRepeatCSS() {
    var json = this.json;
    return {
      "background-repeat": json.repeat
    };
  }

  toBackgroundBlendCSS() {
    var json = this.json;
    return {
      "background-blend-mode": json.blendMode
    };
  }

  toCSS(isExport = false) {
    var results = {
      ...this.toBackgroundImageCSS(isExport),
      ...this.toBackgroundPositionCSS(),
      ...this.toBackgroundSizeCSS(),
      ...this.toBackgroundRepeatCSS(),
      ...this.toBackgroundBlendCSS(),
    };

    return results;
  }

  toString() {
    return keyMap(this.toCSS(), (key, value) => {
      return `${key}: ${value}`;
    }).join(";");
  }
}
