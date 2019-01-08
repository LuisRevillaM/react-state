import EventEmitter from "events";
import AppDispatcher from "./AppDispatcher";

let colors = [];

class ColorStore extends EventEmitter {
  constructor() {
    super();

    AppDispatcher.register(action => {
      if (action.type === "SAVE_COLOR") {
        return this.addColor(action.payload);
      }
      if (action.type === "HYDRATE_COLORS") {
        console.log("made it here too");
        return this.hydrateColors(action.payload);
      }
    });
  }
  addColor(color) {
    colors = [...colors, color];
    this.saveToLocalStorage(colors);
    this.emit("change");
  }

  saveToLocalStorage = colors => {
    window.localStorage.setItem(`colors`, JSON.stringify(colors));
  };
  hydrateColors(colorArray) {
    console.log("made it here as well");
    colors = colorArray;
    console.log(colors);
    this.emit("change");
  }
  getColors() {
    return colors;
  }
}

export default new ColorStore();
