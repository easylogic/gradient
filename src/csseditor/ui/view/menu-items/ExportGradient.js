import { editor } from "../../../../editor/editor";
import MenuItem from "./MenuItem";

export default class ExportGradient extends MenuItem {
    getTitle() {
      return "Export";
    }
  
    clickButton(e) {
        const result = editor.export();

        const blob = new Blob([JSON.stringify(result, null, 4)],{type:'application/json'});

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
  