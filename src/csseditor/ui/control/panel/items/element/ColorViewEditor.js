import { BLUR, CLICK, FOCUS, INPUT } from "../../../../../../util/Event";
import UIElement, { EVENT } from "../../../../../../util/UIElement";

export default class ColorViewEditor extends UIElement {
    initState() {
        return {
            label: this.props.label,
            value: this.props.value
        }
    }

    updateData(opt = {}) {
        this.setState(opt);
        this.modifyColor();
    }

    updateEndData(opt = {}) {
        this.setState(opt);
        this.modifyEndColor();
    }    

    getValue () {
        return this.state.value; 
    }

    setValue (value) {
        this.changeColor(value)
    }

    modifyColor() {
        this.parent.trigger(this.props.onchange, this.props.key, this.state.value, this.props.params);
    }

    modifyEndColor() {
        this.parent.trigger(this.props.onchangeend, this.props.key, this.state.value, this.props.params);
    }


    changeColor (value) {
        this.setState({ value })
    }

    refresh () {
        this.refs.$miniView.cssText(`background-color: ${this.state.value}`);
        this.refs.$colorCode.val(this.state.value);
    }

    template() {
        return /*html*/`
            <div class='color-view-editor'>    
                <div class='color-code' ref="$container">
                    <div class='preview' ref='$preview'>
                        <div class='mini-view'>
                            <div class='color-view' style="background-color: ${this.state.value}" ref='$miniView'></div>
                        </div>
                    </div>                
                    <input type="text" ref='$colorCode' value='${this.state.value}' tabIndex="1" />
                </div>
            </div>
        ` 
    }

    [FOCUS('$colorCode')] (e) {
        this.refs.$container.addClass('focused');
    }

    [BLUR('$colorCode')] (e) {
        this.refs.$container.removeClass('focused');
    }

    [CLICK("$preview")](e) {
        this.viewColorPicker();
    }

    viewColorPicker() {
        const offset = this.$el.offset();
        this.emit("showColorPickerPopup", {
            target: this, 
            left: offset.left,
            top: offset.top,
            changeEvent: 'changeColorViewEditor',
            changeEndEvent: 'changeEndColorViewEditor',
            color: this.state.value
        });
    }


    [CLICK('$remove')] (e) {
        this.updateData({ value: ''})
    }    

    [INPUT("$el .color-code input")](e) {
        var color = e.$dt.value;
        this.refs.$miniView.cssText(`background-color: ${color}`);

        this.updateData({ value: color })
    }

    [EVENT("changeColorViewEditor")](color) {
        this.updateData({ value: color })
        this.refresh();
    }

    [EVENT("changeEndColorViewEditor")](color) {
        this.updateEndData({ value: color })
    }    
}