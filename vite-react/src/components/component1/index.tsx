import { useEffect, useState } from "react";

interface Component1Props {
  name: string;
}

const Component1 = ({ name }: Component1Props) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Component1 mounted", name);
  }, [count]);

  return (
    <div>
      <h1>{name}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default Component1;
