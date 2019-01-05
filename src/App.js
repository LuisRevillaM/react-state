import React, { Component } from "react";
import "./App.css";

const ColorInfo = props => {
  let data = JSON.stringify(props.colorData);
  console.log(data);
  return <div>{data}</div>;
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
      this.props.dispatchHex(this.state.color);
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

const App = Wrapped => {
  return class extends Component {
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
      const data = await fetch(`http://www.thecolorapi.com/id?hex=${color}`, {
        signal: abortSignal
      });

      const jsonData = await data.json();

      console.log(jsonData);
      this.dispatch({ type: "success", payload: jsonData });

      return controller;
    };

    renderContent = () => {
      if (this.state.colorData.hsl !== undefined) {
        return <Wrapped colorData={this.state.colorData} />;
      } else if (this.state.status === "loading") {
        return <div>Loading...</div>;
      }
    };

    render() {
      return (
        <div className="App">
          <HexInput dispatchHex={this.dispatchHex} />
          {this.renderContent()}
        </div>
      );
    }
  };
};

export default App(ColorInfo);
