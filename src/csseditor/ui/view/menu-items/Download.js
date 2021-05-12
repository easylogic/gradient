import MenuItem from "./MenuItem";

export default class Download extends MenuItem {
  getIcon() {
    return "download";
  }
  getTitle() {
    return "Download";
  }

  clickButton(e) {
    this.emit("downloadCanvas");
  }
}
