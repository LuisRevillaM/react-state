import uniqueId from "lodash/uniqueId";
import AppDispatcher from "./AppDispatcher";

export const addColor = colorData => {
  console.log("dispatching things");
  AppDispatcher.dispatch({
    type: "SAVE_COLOR",
    payload: Object.assign(colorData, {
      _id: uniqueId(),
      created: new Date().getTime()
    })
  });
};

export const hydrateColors = colors => {
  console.log("trying out here");
  AppDispatcher.dispatch({
    type: "HYDRATE_COLORS",
    payload: colors
  });
};
