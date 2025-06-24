import "./App.css";
import Demo1 from "./components/demo1";
import Demo2 from "./components/demo2";

function App() {
  return (
    <div style={{ display: "flex", gap: "40px" }}>
      <Demo1 />
      <Demo2 />
    </div>
  );
}

export default App;
