import React, { Component } from "react";
import "./App.css";
import WithLocalColors from "./WithLocalColors";

const ColorInfo = props => {
  let saveToLocalStorage = () => {
    props.saveColor(props.colorData);
  };

  return (
    <div>
      <img src={props.colorData.image.named} alt="color" />
      <button onClick={saveToLocalStorage}>Save color</button>
    </div>
  );
};

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

class WithSearchData extends Component {
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

class App extends Component {
  renderApp = () => {
    let withLocalData = (localColors, addColor) => {
      return (
        <div>
          <WithSearchData
            render={data => {
              return <ColorInfo colorData={data} saveColor={addColor} />;
            }}
          />
          <div>
            <div>
              {localColors.map(c => {
                return (
                  <div
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
    };
    return (
      <div>
        <WithLocalColors render={withLocalData} />
      </div>
    );
  };
  render() {
    return this.renderApp();
  }
}

export default App;
