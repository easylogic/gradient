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
          return /*html*/`<div class='gradient-list-item'>
              <div class="preview" data-id="${it.id}" style="${it.preview}"></div>
              <div class="tools">
                <button type="button" class="export" data-id="${it.id}">export</button>
              </div>
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

  [CLICK('$container .gradient-list-item .preview') + STOP] (e) {
      const id = e.$delegateTarget.attr('data-id');
      const data = editor.load().find(it => it.id === id);

      if (data) {
        editor.selection.current.reset(data.json);
        this.trigger('hideGradientListView')
        this.emit('refreshCanvas');
        this.emit('selectGradient');
      }

  }

  [CLICK('$container .gradient-list-item .export') + STOP] (e) {
    const id = e.$delegateTarget.attr('data-id');
    const data = editor.load().find(it => it.id === id);

    if (data) {

      const blob = new Blob([JSON.stringify(data, null, 4)],{type:'application/json'});

      var a = new FileReader();
      a.onload = function(e) {
          var link = document.createElement('a');
          link.download = "easylogic-gradient.json";
          link.style.opacity = "0";
          link.href = e.target.result;
          link.click();
      }
      a.readAsDataURL(blob);
    }

}
}
