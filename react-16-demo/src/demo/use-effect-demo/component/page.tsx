import { useEffect, useState } from "react";
import ComplexComponent from "./complexComponent";

const Page = () => {

  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    setHasData(true);
  }, []);

  return (
    <div>
      <div>Page</div>
      {hasData ?  <ComplexComponent /> : <div>loading...</div>}
    </div>
  );
}

export default Page;