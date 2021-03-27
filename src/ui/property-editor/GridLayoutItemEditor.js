import UIElement, { EVENT } from "@sapa/UIElement";
import { LOAD } from "@sapa/Event";
import { CSS_TO_STRING, STRING_TO_CSS } from "@sapa/functions/func";
import "./SelectIconEditor";
import { registElement } from "@sapa/registerElement";

export default class GridLayoutItemEditor extends UIElement {

    initState() {
        return {
            ...STRING_TO_CSS(this.props.value),
        }
    }

    setValue (value) {
        this.setState(STRING_TO_CSS(value))
    }

    getValue () {
        return CSS_TO_STRING(this.state)
    }

    modifyData() {
        this.parent.trigger(this.props.onchange, this.props.key, this.getValue())
    }

    [LOAD('$body')] () {
        return /*html*/`
            <div class='grid-layout-item'>
                <div class='label'><label>${this.$i18n('grid.layout.item.editor.direction')}</label></div>
                <object refClass="SelectIconEditor" 
                    key='grid-direction'
                    value="${this.state['grid-direction'] || 'row'}"
                    options="${getDirectionOptions()}"
                    onchange='changeKeyValue'
                />
            </div>
            <div class='grid-layout-item'>
                <div class='label'><label>${this.$i18n('grid.layout.item.editor.wrap')}</label></div>
                <object refClass="SelectIconEditor" 
                    key='grid-wrap'
                    value="${this.state['grid-wrap'] || 'wrap'}"
                    options="${getWrapOptions()}"
                    onchange='changeKeyValue'
                />
            </div>
            <div class='grid-layout-item'>
                <div class='label'><label>${this.$i18n('grid.layout.item.editor.justify-content')}</label></div>
                <object refClass="SelectIconEditor" 
                    key='justify-content'
                    value="${this.state['justify-content']}"
                    options="${getJustifyContentOptions()}"
                    onchange='changeKeyValue'
                />
            </div>
            <div class='grid-layout-item'>
                <div class='label'><label>${this.$i18n('grid.layout.item.editor.align-items')}</label></div>
                <object refClass="SelectIconEditor" 
                    key='align-items'
                    value="${this.state['align-items']}"
                    options="${getAlignItemsOptions()}"
                    onchange='changeKeyValue'
                />
            </div>
            <div class='grid-layout-item'>
                <div class='label'><label>${this.$i18n('grid.layout.item.editor.align-content')}</label></div>
                <object refClass="SelectIconEditor" 
                    key='align-content'
                    value="${this.state['align-content']}"
                    options="${getAlignContentOptions()}"
                    onchange='changeKeyValue'
                />
            </div>    
        `
    }

    template () {
        return /*html*/`
            <div class='grid-layout-editor' ref='$body' ></div>
        `
    }


    [EVENT('changeKeyValue')] (key, value, params) {

        this.setState({
            [key]: value
        }, false)

        this.modifyData();
    }
}

registElement({ GridLayoutItemEditor })