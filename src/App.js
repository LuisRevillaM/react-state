import React, { Component } from "react";
import "./App.css";
import { addColor, hydrateColors } from "./actions";
import ColorStore from "./colorStore";

//ColorInfo is a stateless component that nonetheless has in scope the method
//addColor: an action creator that dispatches actions with data to modify the
//global state of our app, adding a color to our collection

const ColorInfo = props => {
  let saveColor = () => {
    addColor(props.colorData);
  };

  return (
    <div>
      <img src={props.colorData.image.named} alt="color" />
      <button onClick={saveColor}>Save color</button>
    </div>
  );
};

//HexInput is a text input component that executes a handler (passed as props)
//every time the input represents a 6 digit, hexadecimal code representing a color
//HexInput is a stateful component, only to hold the value of the text input.
//This component does not interact with our global Flux store. It however receives
//a method that changes the state of its parent
class HexInput extends Component {
  state = {
    color: "000000"
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      /^[a-fA-F\d]{6}$/.test(this.state.color) &&
      this.state.color.toUpperCase() !== prevState.color.toUpperCase()
    ) {
      this.props.onNewHex(this.state.color);
    }
  }

  handleChange = e => {
    this.setState({ color: e.target.value });
  };

  render() {
    return (
      <div>
        <input value={this.state.color} onChange={this.handleChange} />
      </div>
    );
  }
}

//SearchColor is a Component that shares remote data about a given color through
//the render-props pattern.The component holds an text input and functionality
//to fetch data from The Color API and update its state. This component does not
//consume or modifie our global Flux store. It's render prop could however
//output a tree that includes a component that does affect/reads the flux store.

class SearchColor extends Component {
  state = {
    status: "ready",
    colorData: {},
    validatedHex: "000000"
  };
  componentDidMount() {
    this.controller = this.fetchColor(this.state.validatedHex);
  }
  componentDidUpdate() {
    if (
      this.state.status === "ready" &&
      this.state.colorData.hex &&
      this.state.colorData.hex.clean !== this.state.validatedHex.toUpperCase()
    ) {
      this.fetchColor(this.state.validatedHex);
    }
  }
  componentWillUnmount() {
    this.controller.abort();
  }
  controller = {};
  stateReducer = (state, action) => {
    switch (action.type) {
      case "ready":
        return Object.assign(state, {
          status: "ready",
          validatedHex: action.payload
        });
      case "fetch":
        return Object.assign(state, { status: "loading" });
      case "success":
        return Object.assign(state, {
          status: "done",
          colorData: action.payload
        });
      case "failure":
        return Object.assign(state, { status: "error" });
      default:
        return state;
    }
  };
  dispatch = action => {
    console.log(action.type, action);
    const newState = this.stateReducer(this.state, action);
    this.setState(newState);
  };

  dispatchHex = (() => {
    let action = { type: "ready", payload: "" };
    return color => {
      action.payload = color;
      this.dispatch(action);
    };
  })();

  getAbortController = () => {
    const controller = new AbortController();
    return controller;
  };

  fetchColor = async function fetchFlow(color) {
    const controller = this.getAbortController();
    const abortSignal = controller.signal;
    this.dispatch({ type: "fetch" });

    try {
      const data = await fetch(`http://www.thecolorapi.com/id?hex=${color}`, {
        signal: abortSignal
      });

      const jsonData = await data.json();

      this.dispatch({ type: "success", payload: jsonData });
    } catch (e) {
      this.dispatch({ type: "failure" });
    }

    return controller;
  };

  renderContent = () => {
    if (
      this.state.colorData.hsl !== undefined &&
      this.state.status !== "error"
    ) {
      return this.props.render(this.state.colorData, this.dispatch);
    } else if (this.state.status === "loading") {
      return <div>Loading...</div>;
    } else if (this.state.status === "error") {
      return <div>Network error</div>;
    }
  };

  render() {
    return (
      <div className="App">
        <HexInput onNewHex={this.dispatchHex} />
        {this.renderContent()}
      </div>
    );
  }
}

//Our main component subscribes to the flux store to have an updated list of colors.
//It's also in charge of "hydrating" our store initially, dispatching the HYDRATE_COLORS
//action after reading the LocalStore on componentDidMount
//It's only the ColorInfo component the one with access to addColor action creator.
//Amazing.

class App extends Component {
  state = {
    colors: ColorStore.getColors()
  };
  componentDidMount() {
    ColorStore.on("change", this.updateColorsInState);

    const colors = this.getColorsFromLocalStorage();

    if (colors && colors.length > 0) {
      hydrateColors(colors);
    }
  }
  updateColorsInState = () => {
    this.setState({ colors: ColorStore.getColors() });
  };

  getColorsFromLocalStorage = function() {
    const localStorage = window.localStorage.getItem("colors");

    if (localStorage) {
      const arr = JSON.parse(localStorage);
      return arr;
    }
  };

  render() {
    return (
      <div>
        <SearchColor
          render={data => {
            return <ColorInfo colorData={data} />;
          }}
        />
        <div>
          <div>
            {this.state.colors.map(c => {
              return (
                <div
                  key={c._id}
                  style={{
                    display: "inline-block",
                    textAlign: "center",
                    marginRight: 2
                  }}
                >
                  <img src={c.image.bare} alt="color" />
                  <div>{c.hex.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
