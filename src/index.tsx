import React from 'react';
import ReactDOM from 'react-dom';
import { createModule, DefaultTypelessProvider, useActions } from 'typeless';
import * as Rx from 'typeless/rx';

const CounterSymbol = Symbol('counter');

const [useCounterModule, SomeActions, getCounterState] = createModule(CounterSymbol)
  .withActions({
    increment: null,
    fetchSomebody: null,
    fetchSomebodyFulfilled: (some: { id: number; somebody: string }) => ({ payload: some }),
    rejected: null,
  })
  .withState<CounterState>();

interface CounterState {
  count: number;
}

const API = {
  getSomeId: () => Promise.resolve(42),
  getSomebodyById: (id: number) => Promise.resolve('somebody'),
};

useCounterModule
  .epic()
  .on(SomeActions.fetchSomebody, () => {
    return Rx.from(API.getSomeId()).pipe(
      Rx.mergeMap(id =>
        Rx.from(API.getSomebodyById(id)).pipe(
          Rx.map(somebody => SomeActions.fetchSomebodyFulfilled({ id, somebody })),
        ),
      ),
      Rx.catchError(e => Rx.of(SomeActions.rejected())),
    );
  })
  .on(SomeActions.fetchSomebody, (async () => {
    try {
      const id = await API.getSomeId();
      const somebody = await API.getSomebodyById(id);
      return SomeActions.fetchSomebodyFulfilled({ id, somebody });
    } catch (e) {
      return SomeActions.rejected();
    }
  }) as any)
  .on(SomeActions.fetchSomebody, (async () => {
    return Rx.empty();
  }) as any)
useCounterModule.reducer({ count: 0 }).on(SomeActions.increment, state => {
  state.count++;
});

function Main() {
  useCounterModule();

  const { increment, fetchSomebody: rejectApi } = useActions(SomeActions);
  const { count } = getCounterState.useState();
  return (
    <div>
      <div>{count}</div>
      <button onClick={increment}>+</button>
      <div>
        <button onClick={rejectApi}>alert!</button>
      </div>
    </div>
  );
}

ReactDOM.render(
  <DefaultTypelessProvider>
    <Main />
  </DefaultTypelessProvider>,
  document.getElementById('root'),
);
