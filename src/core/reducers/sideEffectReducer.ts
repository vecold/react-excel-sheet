import type { SheetType } from '@zhenliang/sheet/type';
import { head, isNil, last, pick } from 'lodash';
import { FunctionAction, NormalAction } from '../../hooks';
import {
  clipboardDataToString,
  flatRowCol,
  flatRowColIndex,
  formatDataToCell,
  getRowColConfig,
  groupConfigToGroupMap,
  stringToClipboardData,
} from '../util';

export type asyncActionType = (
  dispatch: (action: NormalAction | FunctionAction) => void,
  getState: () => SheetType.UpdateStateType,
) => void;

export const sideEffectReducer: Record<string, asyncActionType> = {
  init(dispatch, getState) {
    const { eventBus } = getState();
    eventBus.on(
      'cell-change',
      (cell: SheetType.CellData & { confirm?: boolean }) => {
        dispatch(() => {
          const { cellChangeHandler } = getState();
          dispatch({ type: 'editFinish', payload: { cell } });
          cellChangeHandler && cellChangeHandler([cell]);
        });
      },
    );
    eventBus.on('cell-create', ({ row, col }: { row: number; col: number }) => {
      const { start, end } = getState();
      const { startRow, endRow, startCol, endCol } = getRowColConfig(
        start,
        end,
      );
      const isMultiSelected = startRow !== endRow && startCol !== endCol;
      const isSelected =
        row >= startRow && row <= endRow && col >= startCol && col <= endCol;
      if (isSelected) {
        eventBus.emit(`cell-${row}-${col}-change`, {
          selected: true,
          selectedInfo: {
            isStart: row === start?.row && col === start.col && isMultiSelected,
            isTop: row === startRow,
            isBottom: row === endRow,
            isLeft: col === startCol,
            isRight: col === endCol,
          },
        });
      }
    });
    eventBus.on("row-select", (value: { row: number }) => {
      dispatch({
        type: 'selectRow',
        payload: value
      })
    })
    eventBus.on("col-select", (value: { col: number, colSpan: number }) => {
      dispatch({
        type: 'selectCol',
        payload: value
      })
    })
  },
  destroy(d, getState) {
    const { eventBus } = getState();
    eventBus?.removeAllListeners();
  },
  emitSelectChange(d, getState) {
    const { eventBus, lastSelected, start, end } = getState();
    const { startRow, endRow, startCol, endCol } = getRowColConfig(start, end);

    const selectedCellIndex = flatRowColIndex(start, end);
    const selectedCells = flatRowCol(start, end);
    const cancelCells = flatRowCol(lastSelected?.start, lastSelected?.end);

    cancelCells.forEach((cell) => {
      if (selectedCells.includes(cell)) return;
      eventBus.emit(`cell-${cell}-change`, {
        selected: false,
        selectedInfo: undefined,
      });
    });

    selectedCellIndex.forEach(({ row, col }) => {
      eventBus.emit(`cell-${row}-${col}-change`, {
        selected: true,
        selectedInfo: {
          isStart:
            row === start?.row &&
            col === start.col &&
            selectedCellIndex.length !== 1,
          isTop: row === startRow,
          isBottom: row === endRow,
          isLeft: col === startCol,
          isRight: col === endCol,
        },
      });
    });
  },
  emitEditChange(d, getState) {
    const { editing, lastEditing, eventBus } = getState();

    if (!isNil(editing?.col) && !isNil(editing?.row)) {
      eventBus.emit(`cell-${editing.row}-${editing.col}-change`, {
        editing: true,
        value: editing.value,
      });
    }
    if (!isNil(lastEditing?.col) && !isNil(lastEditing?.row)) {
      //清空上一个编辑cell的状态
      eventBus.emit(`cell-${lastEditing.row}-${lastEditing.col}-change`, {
        editing: false,
        confirm: lastEditing?.confirm,
      });
      d({ type: 'changes', payload: { lastEditing: undefined } });
    }
  },
  copy(d, getState) {
    const { start, end, data, groupConfig } = getState();
    if (!start || !end) {
      return;
    }

    const cellIndex = flatRowColIndex(start, end);

    const groupMap = groupConfigToGroupMap(groupConfig);

    let count = 0;
    const copyData = cellIndex.reduce(
      (left, { row = 0, col = 0 }) => {
        const { currentRow, value } = left;

        if (groupMap.get(row)) {
          // 如果是分组的子行并且是合并的状态
          if (!groupMap.get(row)?.isStart && !groupMap.get(row)?.isOpen) {
            return {
              currentRow: row,
              value: `${value}`,
            };
          }
        }
        count++;

        // 复制到剪贴板的时候执行 formatter
        const { value: dataValue, dataEditor, record } = data[row][col];
        const { formatter: dataFormatter } = dataEditor || {};
        let formattedValue: string | null = (
          dataFormatter ? dataFormatter(dataValue, record) : dataValue
        ) as string;
        if (isNil(dataValue)) {
          formattedValue = ' ';
        }
        if (currentRow === -1) {
          return {
            currentRow: row,
            value: formattedValue,
          };
        }
        const currentValue = `${value}${currentRow === row ? '\t' : '\n'
          } ${formattedValue}`;

        return {
          currentRow: row,
          value: currentValue,
        };
      },
      { currentRow: -1, value: '' },
    );
    const text = copyData.value;
    stringToClipboardData(text, count);
  },
  async paste(dispatch, getState) {
    const {
      start,
      end,
      cellChangeHandler,
      history,
      freePaste = false,
      data,
      groupConfig,
    } = getState();
    if (!start || !end) return;
    const pasteData = await clipboardDataToString();

    const changeInfo = formatDataToCell({
      ...pick(getState(), ['data', 'start', 'end', 'editing']),
      pasteData,
      groupConfig,
      freePaste,
    });
    if (!changeInfo) return;
    const { changes, extChanges } = changeInfo;

    const legalChanges = changes
      .filter(({ row, col, value }) => {
        const editor = data[row][col].dataEditor;
        if (editor && editor.checker) {
          return editor.checker(value, data[row][col].record);
        }
        return true;
      })
      .map(({ row, col, value }) => {
        const editor = data[row][col].dataEditor;
        return {
          row,
          col,
          id: data[row][col]?.id,
          value: editor?.parser
            ? editor?.parser?.(value, data[row][col].record)
            : value,
        };
      });
    let lastRow = extChanges?.[0]?.row;
    let lastIndex = 1;
    const legalExtChanges = extChanges
      ?.filter(({ value, col }) => {
        const editor = data[0][col].dataEditor;
        if (editor && editor.checker) {
          return editor.checker(value);
        }
        return true;
      })
      .map(({ row, col, value }) => {
        const editor = data[0][col].dataEditor;
        if (lastRow !== row) {
          lastRow = row;
          lastIndex++;
        }
        return {
          row,
          col,
          value: editor?.parser ? editor?.parser?.(value) : value,
          id: -lastIndex,
        };
      });

    let newHistory = [...(history || [])];
    newHistory.push({
      changes: legalChanges.map((item) => ({
        ...item,
        value: data[item.row][item.col].value as string,
      })),
      type: 'Paste',
    });

    dispatch({
      type: 'changes',
      payload: {
        start: pick(legalChanges[0], ['row', 'col']),
        history: newHistory,
        end: pick(legalChanges[legalChanges.length - 1], ['row', 'col']),
        lastSelected: {
          start,
          end,
        },
      },
    });

    cellChangeHandler &&
      cellChangeHandler(
        legalChanges as any,
        freePaste ? legalExtChanges : ([] as any),
      );
  },
  delete(dispatch, getState) {
    const {
      cellChangeHandler,
      start,
      end,
      data,
      history,
      groupConfig,
      editing,
    } = getState();

    if (editing) return;

    const groupMap = groupConfigToGroupMap(groupConfig);
    const cellIndex = flatRowColIndex(start, end);
    const changes = cellIndex
      .filter((item) => !data?.[item.row]?.[item.col].readonly)
      .filter(
        // 过滤掉分组的子行并且是关闭的状态
        (item) =>
          !(
            groupMap.get(item.row) &&
            !groupMap.get(item.row)?.isStart &&
            !groupMap.get(item.row)?.isOpen
          ),
      )
      .map((item) => ({
        cell: data?.[item.row]?.[item.col],
        row: item.row,
        col: item.col,
        value: null,
        id: data?.[item.row]?.[item.col].id,
      }));

    let newHistory = [...(history || [])];
    newHistory.push({
      changes: changes.map((item) => ({
        ...item,
        value: data[item.row][item.col].value as string,
      })),
      type: 'Delete',
    });
    dispatch({ type: 'changes', payload: { history: newHistory } });
    cellChangeHandler && cellChangeHandler(changes as any);
  },
  reverse(dispatch, getState) {
    const { start, end, history, cellChangeHandler, eventBus } = getState();
    if (!history?.length) return;

    const changeHistory = [...history];
    const change = changeHistory.pop() as SheetType.OperateHistory;
    const { type } = change;
    if (!['Edit', 'Paste', 'Delete'].includes(type)) {
      eventBus.emit('reverse', change);

      dispatch({
        type: 'changes',
        payload: {
          history: changeHistory,
        },
      });
      return;
    }
    cellChangeHandler &&
      cellChangeHandler(change.changes as SheetType.CellData[]);

    dispatch({
      type: 'changes',
      payload: {
        start: pick(head(change.changes), ['row', 'col']),
        end: pick(last(change.changes), ['row', 'col']),
        lastSelected: {
          start,
          end,
        },
        history: changeHistory,
      },
    });
  },
};
