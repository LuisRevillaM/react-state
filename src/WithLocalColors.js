import React, { Component } from "react";

export default class WithLocalColors extends Component {
  state = { colors: [] };
  componentDidMount() {
    this.setState({ colors: this.getColors() });
  }

  componentDidUpdate() {
    //this.setState({ colors: this.getColors() });
  }

  saveColor = colorData => {
    let included = false;

    this.state.colors.forEach(c => {
      if (c.hex.clean.toUpperCase() === colorData.hex.clean.toUpperCase()) {
        included = true;
      }
    });
    if (included) {
      return;
    }

    this.setState(
      prevState => {
        return { colors: [...prevState.colors, colorData] };
      },
      () => {
        this.saveToLocalStorage(colorData);
      }
    );
  };

  saveToLocalStorage = colorData => {
    window.localStorage.setItem(
      `"${colorData.hex.clean}"`,
      JSON.stringify(colorData)
    );
  };

  getColors = function() {
    let length = window.localStorage.length;
    let arr = [];
    for (let i = 0; i < length; i++) {
      let keyName = window.localStorage.key(i);
      arr.push(JSON.parse(window.localStorage.getItem(keyName)));
    }
    return arr;
  };

  render() {
    console.log("state now", this.state.colors);
    return <div>{this.props.render(this.state.colors, this.saveColor)}</div>;
  }
}
