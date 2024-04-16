import type { SheetType } from '@zhenliang/sheet/type';
import { keyboardReducer } from './keyboardReducer';
import { mouseReducer } from './mouseReducer';
import { stateReducer } from './stateReducer';

export type SheetAction =
  | 'change'
  | 'changes'
  | 'rowMove'
  | 'colMove'
  | 'editFinish'
  | 'pushHistory'
  | 'popHistory'
  | 'select'
  | 'selectOneRow'
  | 'changeSearch'
  | 'closeSearch'
  | 'openSearch'

  | 'clearSelect'
  | 'clearSelectIfNotSingleRow'
  | 'clearEdit'
  | 'mouseDown'
  | 'mouseOver'
  | 'mouseUp'
  | 'selectRow'
  | 'selectCol'
  | 'loseFocus'
  | 'doubleClick'
  | 'mouseLeaveInterval'
  | 'move'
  | 'selectAll'
  | 'escape'
  | 'reverse'
  | 'delete'
  | 'enter'
  | 'otherInput'
  | 'none';

export type reducerAction = (
  type: Partial<SheetType.UpdateStateType>,
  payload?: unknown,
) => Partial<SheetType.UpdateStateType>;

const sheetReducer = (
  state: Partial<SheetType.UpdateStateType>,
  action: { type: SheetAction; payload?: unknown },
) => {
  switch (action.type) {
    case 'change':
    case 'changes':
    case 'rowMove':
    case 'colMove':
    case 'editFinish':
    case 'pushHistory':
    case 'popHistory':
    case 'select':
    case 'selectOneRow':
    case 'clearSelect':
    case 'clearSelectIfNotSingleRow':
    case 'clearEdit':
    case 'changeSearch':
    case 'closeSearch':
    case 'openSearch':
      return stateReducer[action.type](state, action.payload);
    case 'mouseDown':
    case 'mouseOver':
    case 'mouseUp':
    case 'loseFocus':
    case 'doubleClick':
    case 'mouseLeaveInterval':
    case 'selectRow':
    case 'selectCol':
      return mouseReducer[action.type](state, action.payload);
    case 'move':
    case 'escape':
    case 'reverse':
    case 'delete':
    case 'enter':
    case 'selectAll':
    case 'otherInput':
      return keyboardReducer[action.type](state, action.payload);
    default:
      throw new Error('Unexpected action');
  }
};

export default sheetReducer;

export { sideEffectReducer } from './sideEffectReducer';
