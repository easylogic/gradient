import UIElement from "../../../util/UIElement";
import { html } from "../../../util/functions/func";
import property from "./panel/property/index";
import { CLICK, IF } from "../../../util/Event";

export default class Inspector extends UIElement {
  template() {
    return html`
      <div class="feature-control">
          <SizeProperty />
          <BackgroundColorProperty />        
          <FillProperty />        
          <BorderRadiusProperty />        
          <BorderProperty />
          <BorderImageProperty />        
          <OutlineProperty />
          <FilterProperty />        
      </div>
    `;
  }

  components() {
    return property;
  }
}
