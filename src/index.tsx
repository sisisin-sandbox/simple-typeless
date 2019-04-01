import React from 'react';
import ReactDOM from 'react-dom';
import { createActions, createEpic, createReducer, initialize, useActions, useMappedState, useModule } from 'typeless';

export const MODULE = 'counter';

export const Msg = createActions(MODULE, {
  increment: null,
  decrement: null,
});

export interface CounterState {
  count: number;
}

declare module 'typeless/types' {
  interface DefaultState {
    count: CounterState;
  }
}

const epic = createEpic(MODULE);

const reducer = createReducer({ count: 0 })
  .on(Msg.increment, state => {
    state.count++;
  })
  .on(Msg.decrement, state => {
    state.count--;
  });

function Main() {
  useModule({
    epic,
    reducer,
    reducerPath: ['count'],
  });

  const { increment, decrement } = useActions(Msg);
  const { count } = useMappedState(state => state.count);
  return (
    <div>
      <button onClick={decrement}>-</button>
      <div>{count}</div>
      <button onClick={increment}>+</button>
    </div>
  );
}

const { TypelessProvider } = initialize();

ReactDOM.render(
  <TypelessProvider>
    <Main />
  </TypelessProvider>,
  document.getElementById('root'),
);
