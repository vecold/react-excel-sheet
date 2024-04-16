import type { SheetType } from '@zhenliang/sheet/type';
import { reducerAction } from '.';
import { stripRowIndex } from '../util';

export const mouseReducer: Record<string, reducerAction> = {
  mouseDown(state, payload) {
    const {
      pos: { row, col },
      shiftKey,
    } = payload as {
      pos: { row: number; col: number };
      shiftKey: boolean;
    };
    const { data, start, end } = state;

    if (data?.[row][col].dataIndex === 'index') {
      return mouseReducer.selectRow(state, { row })
    }

    if (data?.[row][col].fixed) {
      return {
        ...state,
        start: undefined,
        end: undefined,
        lastSelected: {
          start,
          end,
        },
      };
    }

    if (shiftKey) {
      return {
        ...state,
        mouseDown: true,
        editing: undefined,
        lastEditing: {
          ...(state.editing as any),
          confirm: true,
        },
        start: start ? start : { row, col },
        end: { row, col },
        lastSelected: {
          start: start,
          end: end,
        },
      };
    }
    return {
      ...state,
      mouseDown: true,
      editing: undefined,
      lastEditing: {
        ...state.editing,
        confirm: true,
      },
      start: { row, col },
      end: { row, col },
      lastSelected: {
        start: start,
        end: end,
      },
    };
  },
  mouseOver(state, payload) {
    const { row, col } = payload as {
      row: number;
      col: number;
    };

    const { data } = state;

    if (state.mouseDown === false || data?.[row][col].fixed) return state;
    if (state.isIndex && state.start && state.end &&
      data?.[row][col].dataIndex === 'index') {
      return {
        ...state,
        end: { row, col: state.end?.col },
        lastSelected: {
          start: state.start,
          end: state.end,
        },
      };

    }


    return {
      ...state,
      end: { row, col },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
    };
  },
  mouseUp(state, payload) {
    const { row, col } = payload as {
      row: number;
      col: number;
    };

    const { data } = state;
    if (state.mouseDown === false || data?.[row][col].fixed) return state;
    if (state.isIndex && state.end) {
      return {
        ...state,
        mouseDown: false,
        isIndex: false,
        end: { row, col: state.end?.col },
        lastSelected: {
          start: state.start,
          end: state.end,
        },
      };
    }
    return {
      ...state,
      mouseDown: false,
      isIndex: false,
      end: { row, col },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
    };
  },
  loseFocus(state) {
    let lastEditing = state.lastEditing;
    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }
    return {
      ...state,
      start: undefined,
      end: undefined,
      editing: undefined,
      lastEditing,
      lastSelected: {
        start: state.start,
        end: state.end,
      },

      searchText: '',
      showSearch: false,
      searchTotal: 0,
      searchCurrent: 0,
      searchCalledCount: 0,
      searchResultList: [],
    };
  },
  doubleClick(state, payload) {
    const { row, col } = payload as {
      row: number;
      col: number;
    };
    const { data } = state;
    if (data?.[row][col]?.readonly) {
      return state;
    }
    return {
      ...state,
      mouseDown: false,
      isIndex: false,
      editing: { row, col },
      start: { row, col },
      end: { row, col },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
      lastEditing: state.editing,
    };
  },
  mouseLeaveInterval(state, payload) {
    const { end } = payload as { end: SheetType.CellPosition };
    const { data } = state;
    // fixed 列不选中
    if (data?.[0]?.[end.col ?? 0]?.fixed) {
      return state;
    }

    return {
      ...state,
      end,
    };
  },
  selectRow(state, payload) {

    const { row } = payload as { row: number }
    const { data = [] } = state;
    let lastEditing

    const { startIndex, endIndex } = stripRowIndex(data)
    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }
    return {
      ...state,
      start: { row, col: startIndex },
      end: { row, col: endIndex },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
      mouseDown: true,
      isIndex: true,
      editing: undefined,
      lastEditing,
    };

  },
  selectCol(state, payload) {
    const { col, colSpan } = payload as { col: number, colSpan: number }
    const { data = [] } = state;
    let lastEditing

    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }
    return {
      ...state,
      start: { row: 0, col },
      end: { row: data.length - 1, col: col + (colSpan > 1 ? (colSpan - 1) : 0) },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
      editing: undefined,
      lastEditing,
    };

  }
};
