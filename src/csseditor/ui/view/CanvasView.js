import UIElement, { EVENT } from "../../../util/UIElement";

import { editor } from "../../../editor/editor";
import { Length } from "../../../editor/unit/Length";
import { Project } from "../../../editor/items/Project";
import { ArtBoard } from "../../../editor/items/ArtBoard";
import { BIND, CLICK, DOUBLECLICK, END, LOAD, MOVE, POINTERSTART, PREVENT, STOP } from "../../../util/Event";
import { CHANGE_SELECTION } from "../../types/event";
import { CSS_TO_STRING } from "../../../util/css/make";
import icon from "../icon/icon";

export default class CanvasView extends UIElement {
  afterRender() {
    var project = editor.addProject(new Project());
    var artboard = project.add(new ArtBoard());

    editor.selection.select(artboard);

    this[EVENT("refreshCanvas")]();
  }
  template() {
    return /*html*/`
            <div class='page-view'>
                <div class="page-canvas" ref="$canvas"></div>         
                <div class="gradient-control" ref="$control"></div>       
                <div class="gradient-transform" ref="$transform">
                  <div class="control-layer" ref="$controlLayer">
                    <div class="control-point" data-direction="top"></div>
                    <div class="control-point" data-direction="right"></div>
                    <div class="control-point" data-direction="left"></div>
                    <div class="control-point" data-direction="bottom"></div>                  
                    <div class="control-point" data-direction="bottom-right"></div>   
                    <div class="control-point" data-direction="bottom-left"></div>    
                    <div class="control-point" data-direction="top-right"></div>   
                    <div class="control-point" data-direction="top-left"></div>                                      
                    <div class="control-point" data-direction="width"></div>
                    <div class="control-point" data-direction="height"></div>
                    <div class="control-point" data-direction="width-left"></div>
                    <div class="control-point" data-direction="height-top"></div>                    
                  </div>

                </div>
                <div class="gradient-list-view">
                  <div ref="$gradientListView">
                  
                  </div>
                  <div class="add-button">
                    <button type="button" ref="$add"> + </button>
                  </div>
                </div>

            </div>
        `;
  }

  [CLICK('$add')] () {

    // ArtBoard, Layer 에 새로운 BackgroundImage 객체를 만들어보자.
    editor.selection.current.createBackgroundImage({ selected: true });

    this.emit('selectGradient');    
    this.emit('refreshCanvas');
    this.trigger('refreshCanvas');
  }

  [EVENT("caculateSize")](targetEvent) {
    var rect = this.refs.$canvas.rect();

    var data = { width: Length.px(rect.width), height: Length.px(rect.height) };
    this.emit(targetEvent, data);
  }

  [EVENT("refreshCanvas")](currentItem) {
    var current = currentItem || editor.selection.current;
    if (current) {
      this.refs.$canvas.cssText(current.toString());      
      var rect = this.refs.$canvas.rect();      
      this.refs.$control.css({
        width: Length.px(rect.width),
        height: Length.px(rect.height),
      });

      this.refs.$transform.css({
        width: Length.px(rect.width),
        height: Length.px(rect.height),
      });      

      this.load('$control');
      this.updateControlLayer();
    }
  }

  [LOAD('$control')] () {
    var current = editor.selection.current;

    return current.backgroundImages.map((it, index) => [it, index]).filter(it => it[0].selected).map(([it, index]) => {

      const { width, height, x, y, size} = it; 
      const css = size === 'auto' ? { width, height, left: x, top: y} : {};

      // console.log(x);

      return `<div class='gradient-layer' data-selected="${it.selected}" data-index="${index}" style="${CSS_TO_STRING({
        ...css, "z-index": index + 1
      })}"></div>`
    })
    
  }


  [LOAD("$gradientListView")]() {
    var current = editor.selection.current;

    if (!current) return EMPTY_STRING;

    return current.backgroundImages.map((it, index) => {
      var image = it.image;
      const imageCSS = CSS_TO_STRING(it.toBackgroundImageCSS());
      const selectedClass = it.selected ? "selected" : "";

      return `
        <div class='fill-item ${selectedClass}' data-index='${index}'>
            <div class="fill-item-container">
              <div class='preview' data-index="${index}">
                  <div class='mini-view' style="${imageCSS}"></div>
              </div>
              <div class="tools">
                <button type="button" class='copy'  data-index="${index}">${icon.add}</button>
              </div>
            </div>
        </div>
      `;
    });
  }

  updateControlLayer() {
    var current = editor.selection.current;    
    if (!current) return;
    const image = current.getSelectedBackgroundImage()
    if (!image) {
      this.refs.$controlLayer.toggle(false);
      return;
    }

    const { width, height, x, y, size} = image; 
    const css = size === 'auto' ? { width, height, left: x, top: y} : {};

    if (this.refs.$controlLayer.css('display') === 'none') {
      this.refs.$controlLayer.toggle(true);
    }
    this.refs.$controlLayer.css(css);
  }

  [CLICK('$gradientListView .fill-item .preview')] (e) {
    const index = +e.$delegateTarget.attr('data-index');
    editor.selection.current.selectBackgroundImage(index);

    this.emit('selectGradient');    
    this.emit('refreshCanvas');
    this.trigger('refreshCanvas');
  }

  [CLICK('$gradientListView .fill-item .copy')] (e) {
    const index = +e.$delegateTarget.attr('data-index');
    editor.selection.current.copyBackgroundImage(index);
    editor.selection.current.selectBackgroundImage(index);    

    this.emit('selectGradient');    
    this.emit('refreshCanvas');
    this.trigger('refreshCanvas');
  }  

  [CLICK('$controlLayer [data-direction]') + PREVENT + STOP] (e) {

    const direction = e.$delegateTarget.attr('data-direction');

    this.selectedBackgroundImage = editor.selection.current.getSelectedBackgroundImage();   
    const { x, y, width, height } = this.selectedBackgroundImage;    

    switch(direction) {
    case 'height':
      this.selectedBackgroundImage.reset({
        height: width.clone()
      })
        
      break;
    case 'height-top':
      this.selectedBackgroundImage.reset({
        y: y.clone().add(height).sub(width.clone()),
        height: width.clone()
      })
        
      break;
    case 'width':
        this.selectedBackgroundImage.reset({
          width: height.clone()
        })
          
        break;
    case 'width-left':
      this.selectedBackgroundImage.reset({
        x: x.clone().add(width).sub(height.clone()),
        width: height.clone()
      })
        
      break;
    default: return; 
    }


    this.trigger('refreshCanvas');
    this.emit('refreshCanvas');
    this.emit('selectGradient');    

  }

  createSnapPointList () {
    const pointList = []
    editor.selection.current.backgroundImages.filter(it => !it.selected).forEach(it => {
      const { x, y, width: w, height: h } = it;    

      pointList.push(
        {x: +x, y: +y},
        {x: +x + +w, y: +y},
        {x: +x + +w, y: +y + +h},
        {x: +x, y: +y + +h},
        {x: +x + +w/2, y: +y + +h/2},
      );
    });

    const {width, height} = editor.selection.current;

    pointList.push(
      {x: 0, y: 0},
      {x: +width, y: 0},
      {x: +width, y: +height},
      {x: 0, y: +height},
      {x: +width/2, y: +height/2},
    );

    return pointList;
  }

  [POINTERSTART('$controlLayer [data-direction]') + MOVE('moveDirection') + END('moveEndDirection') + PREVENT + STOP]  (e) {
    this.direction = e.$delegateTarget.attr('data-direction');
    this.selectedBackgroundImage = editor.selection.current.getSelectedBackgroundImage();   
    
    const { x, y, width: w, height: h } = editor.selection.current.selectedBackgroundImage;
    this.oldX = x.clone(); 
    this.oldY = y.clone(); 
    this.oldW = w.clone(); 
    this.oldH = h.clone();         

    const {width, height} = editor.selection.current;
    this.oldWidth = width.clone().value;
    this.oldHeight = height.clone().value;    

    this.snapPoint = this.createSnapPointList()
  }

  moveDirection (dx, dy) {

    let newX = this.oldX.toPx(this.oldWidth);
    let newY = this.oldY.toPx(this.oldHeight);
    let newW = this.oldW.toPx(this.oldWidth);
    let newH = this.oldH.toPx(this.oldHeight);

    const rate = this.oldH/this.oldW

    switch(this.direction) {
    case 'right': 
      if (newW.value + dx < 0) {
        const newDx = newW.value + dx; 
        newX = newX.add(newDx).clone().floor();    
        newW = newW.set(Math.abs(newDx)).clone().floor();       
      } else {
        newW = newW.add(dx).clone().floor();
      }
 
      break; 
    case 'left': 
      if (dx > newW.value ) {
        const newDx = dx - newW.value;
        newX = newX.add(newW.value).clone().floor();    
        newW = newW.set(Math.abs(newDx)).clone().floor();
      } else {
        newX = newX.add(dx).clone().floor();    
        newW = newW.add(-dx).clone().floor();
      }

      break; 
    case 'bottom': 
      if (newH.value + dy < 0) {
        const newDy = newH.value + dy;
        newY = newY.add(newDy).clone().floor();    
        newH = newH.set(Math.abs(newDy)).clone().floor();        
      } else {
        newH = newH.add(dy).clone().floor();
      }

      break; 

    case 'bottom-right': 
    case 'top-right':     
      // center 를 기준으로 등비율로 사이즈 조절된다. 
      // 즉, width 의 비율만큼 height 를 결정한다. 
      // (x + width + dx) - (x + width/2) / (width/2)
      var centerX = +newX + newW/2;
      var nextW = (newW/2 + dx);

      if (nextW > 0) {
        newW = Length.px(nextW * 2);
        newX = Length.px(centerX - (newW/2))
      } else {
        newW = Length.px(Math.abs(nextW) * 2);
        newX = Length.px(centerX + nextW)
  
      }

      var centerY = +newY + newH/2;
      newH = Length.px(newW * rate);
      newY = Length.px(centerY - (newH/2))

      break;

    case 'bottom-left': 
    case 'top-left': 
      // center 를 기준으로 등비율로 사이즈 조절된다. 
      // 즉, width 의 비율만큼 height 를 결정한다. 
      // (x + width + dx) - (x + width/2) / (width/2)

      var centerX = +newX + newW/2;
      var nextW = (newW/2 - dx);

      if (nextW > 0) {
        newW = Length.px(nextW * 2);
        newX = Length.px(centerX - (newW/2))
      } else {
        newW = Length.px(Math.abs(nextW) * 2);
        newX = Length.px(centerX + nextW)
  
      }

      var centerY = +newY + newH/2;
      newH = Length.px(newW * rate);
      newY = Length.px(centerY - (newH/2))

      break;       
    case 'top': 

      if (dy > newH.value) {
        const newDy = dy - newH.value;
        newY = newY.add(newH.value).clone().floor();    
        newH = newH.set(Math.abs(newDy)).clone().floor();        
      } else {
        newY = newY.add(dy).clone().floor();    
        newH = newH.add(-dy).clone().floor();
      }

      break; 
    }

    const {x, y, width, height} = this.snapBackgroundImage(newX, newY, newW, newH);

    this.selectedBackgroundImage.reset({ x, y, width, height})

    this.trigger('refreshCanvas');
    this.emit('refreshCanvas');

  }

  snapBackgroundImage (x, y, width, height) {

    return { x, y, width, height}
  }

  moveEndDirection() {
    this.emit('selectGradient');
  }

  [DOUBLECLICK('$control .gradient-layer')] (e) {
    this.selectedBackgroundImage = editor.selection.current.getSelectedBackgroundImage();

    const { x, y, width: w, height: h } = this.selectedBackgroundImage;    
    this.oldX = x.clone(); 
    this.oldY = y.clone(); 
    this.oldW = w.clone(); 
    this.oldH = h.clone();     

    const {width, height} = editor.selection.current;
    this.oldWidth = width.clone().value;
    this.oldHeight = height.clone().value;


    const centerX =  this.oldWidth/2 - this.oldW.value/2;
    const centerY =  this.oldHeight/2 - this.oldH.value/2;

    this.selectedBackgroundImage.reset({
      x: Length.px(centerX), y: Length.px(centerY)
    })

    this.trigger('refreshCanvas');
    this.emit('refreshCanvas');

  }

  [POINTERSTART('$control .gradient-layer') + MOVE('moveGradientLayer') + END('moveEndGradientLayer') + PREVENT + STOP] (e) {
    const index = +e.$delegateTarget.attr('data-index');

    editor.selection.current.selectBackgroundImage(index);
    this.selectedBackgroundImage = editor.selection.current.getSelectedBackgroundImage();
    this.selectedIndex = index; 
    this.selectLayer(this.selectedIndex);
    this.emit('selectGradient');    

    const { x, y, width: w, height: h } = editor.selection.current.selectedBackgroundImage;    

    this.oldX = x.clone(); 
    this.oldY = y.clone(); 
    this.oldW = w.clone(); 
    this.oldH = h.clone();     

    const {width, height} = editor.selection.current;
    this.oldWidth = width.clone().value;
    this.oldHeight = height.clone().value;

    this.snapPoint = this.createSnapPointList()    

  }

  checkSnapPoint(newX, newY, width, height) {


    const x = newX.clone();
    const y = newY.clone();

    const x2 = x.value + width.value; 
    const y2 = y.value + height.value; 

    const centerX = x.value + width.value/2; 
    const centerY = y.value + height.value/2; 

    let checkedXList1 = this.snapPoint.filter(it => (Math.abs(x.value - it.x) <= 3));
    let checkedXList2 = this.snapPoint.filter(it => (Math.abs(centerX - it.x) <= 3));
    let checkedXList3 = this.snapPoint.filter(it => (Math.abs(x2 - it.x) <= 3));
    let lastX = newX;

    if (checkedXList1.length) lastX = Length.px(checkedXList1[0].x).clone();
    else if (checkedXList2.length) lastX = Length.px(checkedXList2[0].x - width.value/2).clone();
    else if (checkedXList3.length) lastX = Length.px(checkedXList3[0].x - width.value).clone();

    // console.log(checkedXList1,checkedXList2,checkedXList3, x, x2, centerX)


    let checkedYList1 = this.snapPoint.filter(it => (Math.abs(y.value - it.y) <= 3));
    let checkedYList2 = this.snapPoint.filter(it => (Math.abs(centerY - it.y) <= 3));
    let checkedYList3 = this.snapPoint.filter(it => (Math.abs(y2 - it.y) <= 3));
    let lastY = newY;

    if (checkedYList1.length) lastY = Length.px(checkedYList1[0].y).clone();
    else if (checkedYList2.length) lastY = Length.px(checkedYList2[0].y - height.value/2).clone();
    else if (checkedYList3.length) lastY = Length.px(checkedYList3[0].y - height.value).clone();    

    // console.log(lastX, lastY, width, height);

    return { x: lastX.clone(), y: lastY.clone(), width: width.clone(), height: height.clone()}
  }
 
  moveGradientLayer (dx, dy) {
    const newX = this.oldX.toPx(this.oldWidth).add(dx).clone().floor();
    const newY = this.oldY.toPx(this.oldHeight).add(dy).clone().floor();
    const newW = this.oldW.toPx(this.oldWidth).floor();
    const newH = this.oldH.toPx(this.oldHeight).floor();

    const {x, y, width, height} = this.checkSnapPoint(newX, newY, newW, newH);

    editor.selection.current.selectedBackgroundImage.reset({x, y, width, height})

    this.trigger('refreshCanvas');
    this.emit('refreshCanvas');
  }

  moveEndGradientLayer () {
    this.emit('selectGradient');
  }

  selectLayer (index) {
    this.refs.$control.$(`[data-selected="true"]`).removeAttr('data-selected');
    this.refs.$control.$(`[data-index="${index}"]`).attr('data-selected', "true");

    this.updateControlLayer();
  }

  [EVENT("selectGradient")] () {
    this.load("$control");
    this.updateControlLayer();
  }


  // [CLICK("$el")]() {
  //   this.emit(CHANGE_SELECTION);
  // }

  [EVENT("downloadCanvas")] () {
    var current = editor.selection.current;
    if (current) {
      const width = current.width.value;
      const height = current.height.value; 

      const svg = `<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%" x="0" y="0">
            <div xmlns="http://www.w3.org/1999/xhtml" style="position:relative">
              <div style="${current.toString()}"></div>
            </div>
          </foreignObject>
        </svg>`
      const blob = new Blob([svg],{type:'image/svg+xml'});

      var a = new FileReader();
      a.onload = function(e) {

        let image = new Image();
        image.crossOrigin="Anonymous"
        image.onload = () => {
          
          let canvas = document.createElement('canvas');

          let context = canvas.getContext('2d');

          canvas.widht = width;
          canvas.height = height;

          // draw image in canvas starting left-0 , top - 0  
          context.drawImage(image, 0, 0, width, height );
          let png = canvas.toDataURL(); // default png

          var link = document.createElement('a');
          link.download = "easylogic-gradient.png";
          link.style.opacity = "0";
          link.href = png;
          link.click();
          
        };
        image.onerror = function (e) {
          console.log(e);
        }
        image.src = e.target.result;
      }
      a.readAsDataURL(blob);      
    }
  }
}
