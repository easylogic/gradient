import BaseProperty from "./BaseProperty";
import { INPUT, CLICK, LOAD } from "../../../../../util/Event";
import { html } from "../../../../../util/functions/func";
import { editor } from "../../../../../editor/editor";
import { Length } from "../../../../../editor/unit/Length";
import { EVENT } from "../../../../../util/UIElement";
import icon from "../../../icon/icon";

export default class SaveProperty extends BaseProperty {

  getTitle() {
    return "Save List"
  }

  initState() {
    return {
      list: []
    }
  }

  getClassName() {
    return "save";
  }

  getTools() {
    return `<button type="button" ref="$add">${icon.add}</button>`
  }

  getBody() {
    return html`
      <div class="property-item save-item" ref="$saveList">
        
      </div>
    `;
  }

  [LOAD('$saveList')] () {
    return this.state.list.map(it => {

      const width = Length.parse(it.css.width);
      const height = Length.parse(it.css.height);
      let scaleX = 1; 
      let scaleY = 1;

      if (width.value < height.value) { // 세로가 길면 세로에 맞춘다. 
        scaleY = 150 / height.value;
        scaleX = scaleY;
      } else if (width.value > height.value) {  // 가로가 길면 가로에 비율을 맞춘다. 
        scaleX = 200 / width.value;
        scaleY = scaleX;
      } else {    // 가로/세로 가 같다면 height 기준으로 맞춘다. 
        scaleY = 150 / height.value;
        scaleX = scaleY;
      }

      return `<div class='save-list-item'>
                <div class="preview-container">
                  <div class="preview" style="${it.preview}; transform: translate(-50%, -50%) scale(${scaleX}, ${scaleY});"></div>
                </div>
                <pre class="codeview">${JSON.stringify(it.css, null, 2)}</pre>
              </div>`
    })
  }

  [CLICK('$add')] () {

    const result = {
      json: editor.selection.current.toJSON(),
      css: editor.selection.current.toCSS(),
      preview: editor.selection.current.toString()
    }

    console.log(result.json);

    this.state.list.push(result);

    this.load('$saveList')
  }

}
