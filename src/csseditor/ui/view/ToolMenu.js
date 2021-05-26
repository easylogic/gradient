import UIElement from "../../../util/UIElement";
import menuItems from "./menu-items/index";

export default class ToolMenu extends UIElement {
  components() {
    return menuItems;
  }

  template() {
    return /*html*/`
            <div class='tool-menu'>
                <div class='items left'>
                  <div class='logo'>
                    <div class='text'>EasyLogic Gradient</div>
                    <div class='site'>easylogic.studio</div>
                  </div>
                  <div class="menus">
                    <Initialize />
                    <Save />                    
                    <GradientList />
                  </div>
                </div>
                <div class='items  right'>
                    <ExportCodePen />
                    <ExportJSFiddle />
                    <Github />
                    <Download />
                </div>                
            </div>
        `;
  }
}
