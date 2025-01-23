
const ComplexComponent = () => {
  let count = 0;
  while(count++ < 10000) {
    console.log(count);
  }
  return (
    <div>
     {new Array(10000).fill(0).map((item, index) => (
      <div>{index + 1}</div>
     ))}
    </div>
  );
}

export default ComplexComponent;