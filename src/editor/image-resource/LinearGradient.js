import { Gradient } from "./Gradient";
import { EMPTY_STRING } from "../../util/css/types";
import { isNumber } from "../../util/functions/func";
import { ColorStep } from "./ColorStep";

const DEFINED_DIRECTIONS = {
  "0": "to top",
  "45": "to top right",
  "90": "to right",
  "135": "to bottom right",
  "180": "to bottom",
  "225": "to bottom left",
  "270": "to left",
  "315": "to top left"
};

export class LinearGradient extends Gradient {
  getDefaultObject(obj) {
    return super.getDefaultObject({
      type: "linear-gradient",
      angle: 0,
      colorsteps: [
        new ColorStep({
          color: "yellow",
          percent: 0,
          index: 0,
          selected: true
        }),
        new ColorStep({ color: "red", percent: 100, index: 1 })
      ],
      ...obj
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...this.attrs(
        'angle'
      )
    }
  }

  isLinear() {
    return true;
  }
  hasAngle() {
    return true;
  }

  copy() {
    return new LinearGradient({
      angle: this.json.angle,
      colorsteps: this.copyColorSteps()
    })
  }

  toString() {
    var colorString = this.getColorString();

    var opt = EMPTY_STRING;
    var angle = this.json.angle;

    opt = angle;

    if (isNumber(opt)) {
      opt = DEFINED_DIRECTIONS[`${opt}`] || opt;
    }

    if (isNumber(opt)) {
      opt = opt > 360 ? opt % 360 : opt;

      opt = `${opt}deg`;
    }

    var result = `${this.json.type}(${opt}, ${colorString})`;

    return result;
  }

  static toLinearGradient(colorsteps) {
    if (colorsteps.length === 0) {
      return "none";
    }

    var gradient = new LinearGradient({
      angle: "to right",
      colorsteps
    });

    return gradient + "";
  }
}
