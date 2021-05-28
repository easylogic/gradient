import { editor } from "../../../../editor/editor";
import { CHANGE, CLICK } from "../../../../util/Event";
import UIElement from "../../../../util/UIElement";

export default class LoadGradient extends UIElement {

    template() {
      return /*html*/`
        <div class='load-gradient'>
          <button type="button">Load Gradient</button> 
          <input type="file" ref="$file" />
        </div>
      `
    }
  
    [CLICK('$el button')] () {
      this.refs.$file.click();
    }

    [CHANGE('$file')] (e) {
      console.log(this.refs.$file.files[0]);
      const blob = this.refs.$file.files[0];

      const file = new FileReader();
      file.onload = (e) => {
        const data = JSON.parse(e.target.result);

        if (data) {
          editor.selection.current.reset(data.json);
          this.emit('hideGradientListView')
          this.emit('refreshCanvas');
          this.emit('selectGradient');        
        }

      }
      file.readAsText(blob, 'utf-8');


    }
  }
  