import type { SheetType } from '@zhenliang/sheet/type';
import { isNil } from 'lodash';
import { reducerAction } from '.';
import { getNextVisibleRow, groupConfigToGroupMap, stripRowIndex } from '../util';

export const keyboardReducer: Record<string, reducerAction> = {
  move(state, payload) {
    const { row, col } = payload as SheetType.CellPosition;
    const { groupConfig, data = [] } = state;
    let newRow: number | null = (state.start?.row || 0) + row;
    if (groupConfig) {
      newRow = getNextVisibleRow(
        newRow as number,
        data?.[data.length - 1]?.[0].row || data.length,
        groupConfigToGroupMap(groupConfig),
        row < 0 ? -1 : 1,
      );
    }
    let currentPos = {
      row: newRow as number,
      col: (state.start?.col || 0) + col,
    };
    let lastEditing = state.lastEditing;
    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }

    if (isNil(currentPos.row)) {
      return {
        ...state,
        start: undefined,
        end: undefined,
        lastSelected: {
          start: state.start,
          end: state.end,
        },
        editing: undefined,
        lastEditing,
      };
    }

    return {
      ...state,
      start: currentPos,
      end: currentPos,
      lastSelected: {
        start: state.start,
        end: state.end,
      },
      editing: undefined,
      lastEditing,
    };
  },
  escape(state) {
    return {
      ...state,
      editing: undefined,
      lastEditing: state.editing,
    };
  },
  reverse(state) {
    return state;
  },
  delete(state) {
    return state;
  },
  enter(state, payload) {
    const { start, end, editing, data } = state;
    if (!start || !end || data?.[start.row]?.[start.col].readonly || !data?.[start.row]?.[start.col].editable) {
      return state;
    }

    if (!editing) {
      return {
        ...state,
        end: start,
        editing: { ...start, value: payload as string },
      };
    }
    return keyboardReducer.move(state, { row: 1, col: 0 });
  },
  otherInput(state, payload) {
    if (state.editing) return state;
    return keyboardReducer.enter(state, payload);
  },
  selectAll(state) {
    const { data = [] } = state;
    let lastEditing

    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }
    const { startIndex, endIndex } = stripRowIndex(data)
    return {
      ...state,
      start: { row: 0, col: startIndex },
      end: { row: data.length - 1, col: endIndex },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
      editing: undefined,
      lastEditing,
    };

  }
};
