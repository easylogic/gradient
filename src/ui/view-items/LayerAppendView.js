import UIElement, { EVENT } from "@core/UIElement";
import { POINTERSTART, BIND, MOVE, END, KEYUP, IF, ESCAPE, ENTER, PREVENT, STOP, POINTERMOVE } from "@core/Event";
import Color from "@core/Color";
import { Length } from "@unit/Length";
import PathStringManager from "@parser/PathStringManager";
import { rectToVerties, vertiesToRectangle } from "@core/functions/collision";
import { vec3 } from "gl-matrix";

export default class LayerAppendView extends UIElement {

    template() {
        return /*html*/`
        <div class='layer-add-view'>
            <div class='area' ref='$area'></div>
            <div class='area-rect' ref='$areaRect'></div>
            <div class='area-pointer' ref='$mousePointer'></div>
        </div>
        `
    }

    initState() {
        return {
            dragStart: false, 
            width: 0,
            height: 0,
            color: Color.random(),
            fontSize: 30,
            showRectInfo: false,          
            areaVerties: rectToVerties(0, 0, 0, 0),
            content: 'Insert a text',
            pathManager: new PathStringManager()
        }
    }

    get scale () {
        return this.$viewport.scale; 
    }  

    checkNotDragStart () {
        return Boolean(this.state.dragStart) === false;
    }
    
    [POINTERMOVE('$el') + IF('checkNotDragStart')] (e) {

        const vertex = this.$viewport.createWorldPosition(e.clientX, e.clientY);        

        // 영역 드래그 하면서 snap 하기 
        const newVertex = this.$snapManager.checkPoint(vertex);

        if (vec3.equals(newVertex, vertex) === false) {
            this.state.target = newVertex;
            this.state.targetVertex = this.$viewport.applyVertex(this.state.target);
            this.state.targetPositionVertext = vec3.clone(this.state.target);            
            this.state.targetGuides = this.$snapManager.findGuideOne([this.state.target]);
        } else {
            this.state.target = null; 
            this.state.targetGuides = [];
            this.state.targetPositionVertext = null;
        }

        this.bindData('$mousePointer')
    }

    [POINTERSTART('$el') + MOVE() + END()] (e) {

        this.initMousePoint = this.state.targetPositionVertext ? this.state.targetPositionVertext : this.$viewport.createWorldPosition(e.clientX, e.clientY);

        this.state.dragStart = true;
        this.state.color = '#C4C4C4'; //Color.random()
        this.state.text = 'Insert a text';
        this.state.areaVerties = rectToVerties(0, 0, 0, 0);

        this.bindData('$area');
        this.bindData('$areaRect');

    }

    createLayerTemplate (width, height) {
        const { type, text, color } = this.state;
        switch(type) {
        case 'artboard':
            return /*html*/`<div class='draw-item' style='background-color: white;'></div>`;
        case 'rect':
            return /*html*/`<div class='draw-item' style='background-color: ${color};'></div>`
        case 'circle':
            return /*html*/`<div class='draw-item' style='background-color: ${color}; border-radius: 100%;'></div>`
        case 'video':
        case 'audio':
        case 'image':            
        case 'cube':
        case 'cylinder':
            return /*html*/`<div class='draw-item' style='outline: 1px solid blue;'></div>`        
        case 'text':
        case 'svg-text':
            return /*html*/`<div class='draw-item' style='font-size: 30px;outline: 1px solid blue;'>${text}</div>`
        case 'svg-rect':
            return /*html*/`
            <div class='draw-item'>
                <svg width="${width}" height="${height}" style="width:100%; height:100%;" overflow="visible">
                    <path d="${PathStringManager.makeRect(0, 0, width, height)}" stroke-width="1" stroke="black" fill="transparent" />
                </svg>
            </div>
            `
        case 'svg-circle':
            return /*html*/`
            <div class='draw-item'>
                <svg width="${width}" height="${height}" style="width:100%; height:100%;" overflow="visible">
                    <path d="${PathStringManager.makeCircle(0, 0, width, height)}" stroke-width="1" stroke="black" fill="transparent" />
                </svg>
            </div>
            `
        case 'svg-textpath':
            return /*html*/`
            <div class='draw-item' style='outline: 1px solid blue;'>
                <svg width="${width}" height="${height}" style="width:100%; height:100%;font-size: ${height}px;" overflow="visible">
                    <defs>
                        <path id='layer-add-path' d="${PathStringManager.makeLine(0, height, width, height)}" />
                    </defs>
                    <text>
                        <textPath 
                          xlink:href="#layer-add-path"
                          textLength="100%"
                          lengthAdjust="spacingAndGlyphs"
                          startOffset="0em"
                        >${text}</textPath>
                    </text>
                </svg>
            </div>
            `            
        }
    }

    [BIND('$area')] () {

        const { areaVerties } = this.state;

        const {left, top, width, height } = vertiesToRectangle(areaVerties);

        return {
            style: { left, top, width, height },
            innerHTML : this.createLayerTemplate(width.value, height.value)
        }
    }

    [BIND('$areaRect')] () {

        const { areaVerties, showRectInfo} = this.state; 

        const newVerties = this.$viewport.applyVertiesInverse(areaVerties);

        const {width, height } = vertiesToRectangle(newVerties);

        return {
            style: {
                display: showRectInfo ? 'inline-block' : 'none',
                left: Length.px(areaVerties[2][0]),
                top: Length.px(areaVerties[2][1]),
            },
            innerHTML: `${width.value} x ${height.value}`
        }
    }

    makeMousePointer () {

        const target = this.state.target 

        if (!target) return '';

        const guides = this.state.targetGuides || []

        return /*html*/`
        <svg width="100%" height="100%">
            ${guides.map(guide => {
                this.state.pathManager.reset();

                guide = this.$viewport.applyVerties([ guide[0], guide[1] ])

                return this.state.pathManager
                            .M({x: guide[0][0], y: guide[0][1]})                            
                            .L({x: guide[1][0], y: guide[1][1]})
                            .X({x: guide[0][0], y: guide[0][1]})
                            .X({x: guide[1][0], y: guide[1][1]})                            
                            .toString('layer-add-snap-pointer')
            }).join('\n')}
        </svg>
    `
    }

    [BIND('$mousePointer')] () {

        const html = this.makeMousePointer()
        
        // if (html === '') return;

        return {
            innerHTML: html
        }
    }

    move () {
        const e = this.$config.get('bodyEvent');
        const targetMousePoint = this.$viewport.createWorldPosition(e.clientX, e.clientY);     
        const newMousePoint = this.$snapManager.checkPoint(targetMousePoint);

        if (vec3.equals(newMousePoint, targetMousePoint) === false) {
            this.state.target = newMousePoint;
            this.state.targetVertex = this.$viewport.applyVertex(newMousePoint);
            this.state.targetGuides = this.$snapManager.findGuideOne([newMousePoint]);
        } else {
            this.state.target = null; 
            this.state.targetGuides = [];
        }

        const isShiftKey = e.shiftKey;

        const minX = Math.min(newMousePoint[0], this.initMousePoint[0]);
        const minY = Math.min(newMousePoint[1], this.initMousePoint[1]);

        const maxX = Math.max(newMousePoint[0], this.initMousePoint[0]);
        const maxY = Math.max(newMousePoint[1], this.initMousePoint[1]);        
        
        let dx = maxX - minX;
        let dy = maxY - minY; 

        if (isShiftKey) {
            dy = dx; 
        }

        // 영역 드래그 하면서 snap 하기 
        const verties = rectToVerties(minX, minY, dx, dy);                
        this.state.areaVerties = this.$viewport.applyVerties(verties);

        this.state.showRectInfo = true; 


        this.bindData('$area');
        this.bindData('$areaRect'); 
        this.bindData('$mousePointer')

    }

    end (dx, dy) {
        const isAltKey = this.$config.get('bodyEvent').altKey;        
        let { color, text, fontSize, areaVerties} = this.state; 

        // viewport 좌표를 world 좌표로 변환 
        const rectVerties = this.$viewport.applyVertiesInverse(areaVerties);

        const {x, y, width, height } = vertiesToRectangle(rectVerties);

        var rect = { 
            x,  y, width,  height, 
            'background-color': color,
            'content': text,
            'font-size': fontSize,
        }

        switch(this.state.type) {
        case 'text': 
        case 'svg-text':
        case 'svg-textpath': 
            delete rect['background-color']; 
            break;         
        default: 
            delete rect['content']; 
            break; 
        }

        switch(this.state.type) {
        case 'image': this.emit('openImage', rect); break;
        case 'video': this.emit('openVideo', rect); break; 
        case 'audio': this.emit('openAudio', rect); break;             
        default: this.emit('newComponent', this.state.type, rect, /* isSelected */ true );break;
        }
        

        if (!isAltKey) {
            this.trigger('hideLayerAppendView')
        }

        this.state.dragStart = false;        
        this.state.showRectInfo = false; 
        this.state.target = null;
        this.bindData('$areaRect');         
    }    

    [EVENT('showLayerAppendView')] (type) {
        this.state.type = type; 

        this.state.isShow = true; 
        this.refs.$area.empty()
        this.$el.show();
        this.$el.focus();
        this.$snapManager.clear();        
        this.emit('change.mode.view', 'CanvasView');
    }

    [EVENT('hideLayerAppendView')] () {

        if (this.$el.isShow()) {
            this.state.isShow = false;
            // this.refs.$area.empty()
            this.$el.hide();
            this.emit('change.mode.view');               
        }

    }

    [EVENT('hideAddViewLayer')] () {
        this.state.isShow = false;
        this.$el.hide();
    }


    isShow () {
        return this.state.isShow
    }    

    [KEYUP('document') + IF('isShow') + ESCAPE + ENTER + PREVENT + STOP] () {
        this.trigger('hideLayerAppendView');        
    }    
} 