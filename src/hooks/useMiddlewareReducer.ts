import * as React from 'react';

export type NormalAction = { type: string; payload?: any };
export type FunctionAction = (dispatch: any, getState?: () => any) => any;

export type Dispatch = (action: any) => any;

export type MiddlewareAPI<A> = { getState: () => A; dispatch: Dispatch };

export type Middleware<A> = (
  api: MiddlewareAPI<A>,
) => (next: Dispatch) => Dispatch;

export const useMiddlewareReducer = <A, B>(
  reducer: (state: A, action: B) => A,
  initialState: A,
  middleware: Middleware<A>[] = [],
): [A, Dispatch] => {
  const [state, setState] = React.useState(initialState);
  const stateRef = React.useRef(state);

  const dispatch = React.useMemo(() => {
    let dispatch: Dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`,
      );
    };

    const middlewareAPI = {
      getState: () => stateRef.current,
      dispatch: (action: B) => dispatch(action),
    };

    const localDispatch = (action: B) => {
      stateRef.current = reducer(stateRef.current, action);
      setState(stateRef.current);
    };

    dispatch = middleware
      .map((middleware) => middleware(middlewareAPI))
      .reduceRight((acc, middleware) => middleware(acc), localDispatch);

    return dispatch;
  }, []);

  return [state, dispatch];
};
