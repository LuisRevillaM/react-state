import React from "react";

const HexInput = ({ dispatchHex }) => {
  const [input, setInput] = React.useState("000000");
  React.useEffect(() => {
    if (/^[a-fA-F\d]{6}$/.test(input)) {
      dispatchHex(input);
    }
  }, [input]);
  const handleChange = (e) => {
    setInput(e.target.value);
  };
  return (<div>
    <input value={input} onChange={handleChange} />
  </div>);
};

export default HexInput;