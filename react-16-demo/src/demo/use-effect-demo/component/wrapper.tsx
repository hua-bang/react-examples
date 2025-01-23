import { useEffect, useLayoutEffect, useState } from "react";
import Page from "./page";

const Wrapper = () => {
  const [visible, setVisible] = useState(false);
  const [, update] = useState({});

  useEffect(() => {
    setTimeout(() => {
      Promise.resolve().then(() => {
        setVisible(true);
      });
    }, 3000)
  }, []);

  useLayoutEffect(() => {
    update({});
  }, [visible]);

  return (
    <div>
      {visible ? <Page /> : <div>loading...</div>}
    </div>
  );
};

export default Wrapper;