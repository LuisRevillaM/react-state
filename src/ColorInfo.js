import React from "react";

const ColorInfo = props => {
  return (
    <div>
      <div>{props.hsl}</div>
      <div>{props.hsv}</div>
      <img alt="color" src={props.image} />
    </div>
  );
};

export default ColorInfo;