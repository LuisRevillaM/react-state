import React from "react";
import "./App.css";
import ColorInfo from "./ColorInfo";
import HexInput from './HexInput';

const App = ({ fetchColor, stateReducer, initialState }) => {
  const [state, dispatch] = React.useReducer(stateReducer, initialState);
  const controller = new AbortController;
console.log(state.status);
  const fetch = fetchColor({hex: state.validatedHex, dispatch:dispatch, abortController: controller.signal });
  React.useEffect(()=>{
    console.log('running effect')
    if (state.status === "ready") fetch();

    return () => {
      controller.abort();
    }
  });

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
