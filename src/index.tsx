import React from 'react';
import ReactDOM from 'react-dom';
import { createModule, DefaultTypelessProvider, useActions } from 'typeless';

const CounterSymbol = Symbol('counter');

const [useCounterModule, CounterActions, getCounterState] = createModule(CounterSymbol)
  .withActions({
    increment: null,
    decrement: null,
  })
  .withState<CounterState>();

interface CounterState {
  count: number;
}

useCounterModule
  .reducer({ count: 0 })
  .on(CounterActions.increment, state => {
    state.count++;
  })
  .on(CounterActions.decrement, state => {
    state.count--;
  });

function Main() {
  useCounterModule();

  const { increment, decrement } = useActions(CounterActions);
  const { count } = getCounterState.useState();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <div>{count}</div>
      <button onClick={increment}>+</button>
    </div>
  );
}

ReactDOM.render(
  <DefaultTypelessProvider>
    <Main />
  </DefaultTypelessProvider>,
  document.getElementById('root'),
);
