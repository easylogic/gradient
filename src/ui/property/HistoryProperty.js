import BaseProperty from "./BaseProperty";
import { EVENT } from "@sapa/UIElement";
import { LOAD, DOMDIFF } from "@sapa/Event";
import icon from "@icon/icon";
import { registElement } from "@sapa/registerElement";

export default class HistoryProperty extends BaseProperty {

  afterRender() {
    this.show();
  }

  getTitle() {
    return 'History';
  }

  getBody() {
    return /*html*/`
      <div class="history-list-view" ref='$body'></div>
    `;
  }

  [LOAD('$body') + DOMDIFF] () {
    return this.$editor.history.map((it, index) => {
      if (it === '-') {
        return /*html*/`<div class='divider'>-</div>`
      }  
      return /*html*/`
        <div class='history-item'>
          <span>${index === (this.$editor.history.currentIndex) ? icon.arrowRight : ''}</span>
          <span>${it.message}</span>
        </div>
      `
    })
  }

  [EVENT('refreshHistory')] () {
    this.refresh();
  }
}

registElement({ HistoryProperty })