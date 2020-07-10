import React from "react";
import "./App.css";
import ColorInfo from "./ColorInfo";
import HexInput from './HexInput';

const App = ({ fetchColor }) => {
  const initialState = {
    status: "ready",
    colorData: {},
    validatedHex: "000000",
  };
  
  const stateReducer = (state, action) => {
    switch (action.type) {
      case "ready":
        return {
          ...state,
          status: "ready",
          validatedHex: action.payload,
        };
      case "fetch":
        return { ...state, status: "loading" };
      case "success":
        return {
          ...state,
          status: "done",
          colorData: action.payload,
        };
      case "failure":
        return { ...state, status: "error" };
      default:
        throw new Error("wrong action");
    }
  };

  const [state, dispatch] = React.useReducer(stateReducer, initialState);
  const controller = new AbortController;

  const fetch = fetchColor({hex: state.validatedHex, dispatch:dispatch, abortController: controller.signal });
  React.useEffect(()=>{
    console.log('running effect')
    if (state.status === "ready") fetch();

    return () => {
      controller.abort();
    }
  }, [state.validatedHex]);

  const dispatchHex = (color) => {
    dispatch({ type: "ready", payload: color });
  };

  const renderContent = () => {
    if (state.status === 'done') {
      return (
        <ColorInfo
          hsl={state.colorData.hsl.value}
          hsv={state.colorData.hsv.value}
          image={state.colorData.image.bare}
        />
      );
    } else if (state.status === "loading") {
      return <div>Loading...</div>;
    }
  };

  return (
    <div className="App">
      <HexInput dispatchHex={dispatchHex} />
      {renderContent()}
    </div>
  );
}


export default App;
