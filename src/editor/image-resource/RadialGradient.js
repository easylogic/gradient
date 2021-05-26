import { Gradient } from "./Gradient";
import { EMPTY_STRING, WHITE_STRING } from "../../util/css/types";
import { Length, Position } from "../unit/Length";

const DEFINED_POSITIONS = {
  ["center"]: true,
  ["top"]: true,
  ["left"]: true,
  ["right"]: true,
  ["bottom"]: true
};

export class RadialGradient extends Gradient {
  getDefaultObject(obj = {}) {
    return super.getDefaultObject({
      type: "radial-gradient",
      radialType: "ellipse",
      radialPosition: [Position.CENTER, Position.CENTER],
      ...obj
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...this.attrs(
        'radialType',
        'radialPosition'
      )
    }
  }

  isRadial() {
    return true;
  }

  convert(json) {

    json = super.convert(json);

    json.radialPosition = json.radialPosition?.map(it => Length.parse(it)) || [];

    return json;
  }

  copy() {
    return new RadialGradient({
      radialType: this.json.radialType,
      radialPosition: this.json.radialPosition,
      colorsteps: this.copyColorSteps()
    })
  }

  toString() {
    var colorString = this.getColorString();
    var json = this.json;
    var opt = EMPTY_STRING;
    var radialType = json.radialType;
    var radialPosition = json.radialPosition || ["center", "center"];

    radialPosition = DEFINED_POSITIONS[radialPosition]
      ? radialPosition
      : radialPosition.join(WHITE_STRING);

    opt = radialPosition ? `${radialType} at ${radialPosition}` : radialType;

    return `${json.type}(${opt}, ${colorString})`;
  }
}
