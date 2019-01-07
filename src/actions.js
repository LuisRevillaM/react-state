import uniqueId from "lodash/uniqueId";
import AppDispatcher from "./AppDispatcher";

const addColor = colorData => {
  AppDispatcher.dispatch({
    type: "SAVE_COLOR",
    payload: Object.assign(colorData, { _id: uniqueId() })
  });
};
