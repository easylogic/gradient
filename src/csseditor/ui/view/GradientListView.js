import { editor } from "../../../editor/editor";
import { CLICK, DOUBLECLICK, LOAD, PREVENT, STOP } from "../../../util/Event";
import UIElement, { EVENT } from "../../../util/UIElement";
import { CHANGE_ARTBOARD, CHANGE_SELECTION } from "../../types/event";

export default class GradientListView extends UIElement {
  template() {
    return /*html*/`
        <div class='saved-gradient-list-view'>
            <div class="gradient-list-container" ref="$container">

            </div>
        </div>
    `
  }

  [LOAD('$container')] () {
      const list = editor.load();
      list.reverse();
      return list.map(it => {
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

  [CLICK('$el')] () {
    this.trigger('hideGradientListView');
  }

  [EVENT('showGradientListView')] () {
    this.$el.toggleClass('show', true);
  }

  [EVENT('hideGradientListView')] () {
    this.$el.toggleClass('show', false);
  }  

  [EVENT('toggleGradientListView')] () {
    this.$el.toggleClass('show');
  }

  [EVENT('loadGradientList')]() {
      this.refresh();
  }

  [CLICK('$container .gradient-list-item') + STOP] (e) {
      const id = e.$delegateTarget.attr('data-id');
      const data = editor.load().find(it => it.id === id);

      if (data) {
        editor.selection.current.reset(data.json);
        this.trigger('hideGradientListView')
        this.emit('refreshCanvas');
        this.emit('selectGradient');
      }

  }
}
