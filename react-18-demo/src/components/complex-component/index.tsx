const execLongTask = () => {
  for(let i = 0; i < 100; i++) {
    console.log(i);
  }
}

export const ComplexComponent = () => {

  execLongTask();

  return (
    <div>
      ComplexComponent
    </div>
  );
}