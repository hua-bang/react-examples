import { useState } from 'react'
import './App.css'
import { ComplexComponent } from './components/complex-component';


const longTask = () => {
  for(let i = 0; i < 1000; i++) {
    console.log(i);
  }
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        Promise React 16
      </div>
      <div onClick={() => {

        setTimeout(() => {
          longTask();
          setCount(prev => prev + 1);
          longTask();
          setCount(prev => prev + 1);
          longTask();
          setCount(prev => prev + 1);
        }, 0);

        // Promise.resolve().then(() => {
        //   longTask();
        //   setCount(prev => prev + 1);
        //   longTask();
        //   setCount(prev => prev + 1);
        //   longTask();
        //   setCount(prev => prev + 1);
        // })
      }}>
        count: {count}
      </div> 
      <div>
        {new Array(100).fill(0).map((item, index) => {
          return <ComplexComponent key={index} />
        })}
      </div>
    </>
  )
}

export default App
