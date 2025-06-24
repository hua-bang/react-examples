import { useState } from "react";
import Component1 from "../component1";

const Demo2 = () => {
  const [show, setShow] = useState(true);
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && Component1({ name: "Demo2" })}
    </div>
  );
};

export default Demo2;
