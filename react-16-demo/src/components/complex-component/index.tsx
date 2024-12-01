const execLongTask = () => {
  for(let i = 0; i < 10; i++) {
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