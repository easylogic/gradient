import { editor } from "../../../../editor/editor";
import { CLICK, LOAD } from "../../../../util/Event";
import UIElement, { EVENT } from "../../../../util/UIElement";
import { CHANGE_SELECTION } from "../../../types/event";

export default class GradientList extends UIElement{
    template() {
        return /*html*/`
            <div class='gradient-list'>
                <div class="gradient-list-container" ref="$container">

                </div>
                <div class="gradient-list-tools">
                    <button type="button" ref='$all'>All Gradients</button>
                </div>
            </div>
        `
    }

    [LOAD('$container')] () {
        const list = editor.load();
        list.reverse();
        return list.filter((_, index) => index < 5).map(it => {
            return /*html*/`<div class='gradient-list-item' data-id="${it.id}">
                <div class="preview" style="${it.preview}"></div>
            </div>`
        })
    }

    afterRender() {
        this.refresh();
    }

    refresh() {
        this.load();
    }

    [EVENT('loadGradientList')]() {
        this.refresh();
    }

    [CLICK('$container .gradient-list-item')] (e) {
        const id = e.$delegateTarget.attr('data-id');
        const data = editor.load().find(it => it.id === id);
  
        if (data) {
          editor.selection.current.reset(data.json);
          this.emit('refreshCanvas');
          this.emit('selectGradient');
          this.emit("hideGradientListView");          
        }

    }

    [CLICK('$all')] () {
        this.emit('toggleGradientListView');
    }
}