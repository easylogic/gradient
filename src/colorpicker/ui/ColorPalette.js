import UIElement, { EVENT } from "../../util/UIElement";
import Event, { POINTERSTART, POINTEREND, POINTERMOVE } from "../../util/Event";
import Dom from "../../util/Dom";
import { Length } from "../../editor/unit/Length";

export default class ColorPalette extends UIElement {
  template() {
    return `
        <div class="color-panel">
            <div ref="$saturation" class="saturation">
                <div ref="$value" class="value">
                    <div ref="$drag_pointer" class="drag-pointer" data-axis-value="all">
                      <div ref="$left_saturation" class="left-saturation" data-axis-value="saturation"></div>
                      <div ref="$right_saturation" class="right-saturation" data-axis-value="saturation"></div>
                      <div ref="$top_value" class="top-value" data-axis-value="value"></div>
                      <div ref="$bottom_value" class="bottom-value" data-axis-value="value"></div>
                    </div>
                </div>
            </div>        
        </div>        
        `;
  }

  setBackgroundColor(color) {
    this.$el.css("background-color", color);
  }

  refresh() {
    this.setColorUI();
  }

  calculateSV() {
    var pos = this.drag_pointer_pos || { x: 0, y: 0 };

    var width = this.$el.width();
    var height = this.$el.height();

    var s = pos.x / width;
    var v = (height - pos.y) / height;

    this.dispatch("changeColor", {
      type: "hsv",
      s,
      v
    });
  }

  setColorUI() {
    var x = this.$el.width() * this.$store.hsv.s,
      y = this.$el.height() * (1 - this.$store.hsv.v);

    this.refs.$drag_pointer.px("left", x);
    this.refs.$drag_pointer.px("top", y);

    this.drag_pointer_pos = { x, y };

    this.setBackgroundColor(this.read("getHueColor"));
  }

  setMainColor(e) {
    // e.preventDefault();
    var pos = this.$el.offset();
    var w = this.$el.contentWidth();
    var h = this.$el.contentHeight();

    var x = Event.pos(e).pageX - pos.left;
    var y = Event.pos(e).pageY - pos.top;

    if (x < 0) x = 0;
    else if (x > w) x = w;

    if (y < 0) y = 0;
    else if (y > h) y = h;

    this.refs.$drag_pointer.px("left", x);
    this.refs.$drag_pointer.px("top", y);

    this.drag_pointer_pos = { x, y };

    this.calculateSV();
  }


  setSubColor(e) {
    const localX = e.pageX;
    const localY = e.pageY;

    const distX = localX - this.x;
    const distY = localY - this.y;

    var w = this.$el.contentWidth();
    var h = this.$el.contentHeight();

    var x = Length.parse(this.refs.$drag_pointer.css("left")).value;
    var y = Length.parse(this.refs.$drag_pointer.css("top")).value;

    if (this.axis === 'saturation') {
      x += distX;      
    } else if (this.axis === 'value') {
      y += distY;
    }

    if (x < 0) x = 0;
    else if (x > w) x = w;

    if (y < 0) y = 0;
    else if (y > h) y = h;

    this.refs.$drag_pointer.px("left", x);
    this.refs.$drag_pointer.px("top", y);

    this.drag_pointer_pos = { x, y };

    this.x = localX;    
    this.y = localY;


    this.calculateSV();
  }  

  [EVENT("changeColor")]() {
    this.refresh();
  }

  [EVENT("initColor")]() {
    this.refresh();
  }

  [POINTEREND("document")](e) {
    this.isDown = false;
  }

  [POINTERMOVE("document")](e) {
    if (this.isDown) {
      if (this.axis === 'saturation' || this.axis === 'value') {
        this.setSubColor(e);
      } else {
        this.setMainColor(e);
      }  
    }
  }

  [POINTERSTART()](e) {
    this.isDown = true;
    this.axis = new Dom(e.target).attr('data-axis-value');    
    this.x = e.pageX;
    this.y = e.pageY;

    if (this.axis === 'saturation' || this.axis === 'value') {
      this.setSubColor(e);
    } else {
      this.setMainColor(e);
    }

  }

  [POINTEREND()](e) {
    this.isDown = false;
  }
}
