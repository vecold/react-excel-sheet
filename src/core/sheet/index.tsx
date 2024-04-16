import type { SheetType } from '@zhenliang/sheet/type';
import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
// import ReduxLogger from 'redux-logger';
import ReduxThunk from 'redux-thunk';

import DefaultRow from './DefaultRow';
import DefaultShell from './DefaultShell';

import { useGroup } from '@zhenliang/sheet/hooks/useGroupConfig';
import { Empty } from 'antd';
import { isEmpty, isNil, isNumber } from 'lodash';
import {
  SheetEventContext,
  useEventBus,
  useMiddlewareReducer,
} from '../../hooks';
import sheetReducer from '../reducers';
import { classNames, getRowHeight, rowToActualRow } from '../util';
import { Control } from './Control';
import { DefaultRowMapper } from './DefaultRowMapper';
import { Menu } from './Menu';
import './index.less';
import { useCellEvent } from './useCellEvent';
import { useContextMenu } from './useContextMenu';
import { useKeyBoardEvent } from './useKeyBoardEvent';
import { useMouseEvent } from './useMouseEvent';
import { useSelectVisible } from './useSelectVisible';
import {
  VirtualizeEnd,
  VirtualizeStart,
  useVirtualList,
} from './useVirtualList';
import { SearchInput } from './searchInput';
import { useSearchInput } from './useSearchInput';

const Sheet: React.FC<SheetType.SheetProps> = (props) => {
  const {
    sheetInstance = { current: null },
    sheetRenderer: SheetShell = DefaultShell,
    emptyRenderer = <Empty description="暂无数据" />,
    rowRenderer: Row = DefaultRow,
    menuRenderer: ContextMenu,
    virtualized = false,
    className,
    data,
    freePaste = false,
    // groupConfig = undefined,
    onCellsChanged,
    onContextMenu,
    rowClassName,
    scroll,
    children,
    showBackEdit,
    backEditStyle,
    boldScroll = true,
    hideColBar = true,
  } = props;
  const sheetWrapperRef = useRef<SheetType.refAssertion>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const eventBus = useEventBus();
  const { config: groupConfig } = useGroup();
  const [state, dispatch] = useMiddlewareReducer(
    sheetReducer,
    {
      data,
      mouseDown: false,
      editing: undefined,
      lastFocus: [],
      groupConfig,
      eventBus,
    },
    // [ReduxThunk, ReduxLogger],
    [ReduxThunk],
  );
  useImperativeHandle(
    sheetInstance,
    () => ({
      zoomTo: (row?: number) => {
        // 给定 row 回到行
        // 不给定 row 默认回到编辑行和列
        dispatch((d: unknown, getState: () => SheetType.UpdateStateType) => {
          const { start, groupConfig, data } = getState();
          const container = sheetWrapperRef.current as HTMLSpanElement;
          if (!start && isNil(row)) return;
          const actual = rowToActualRow(
            (row as number) ?? start?.row,
            groupConfig,
            data.length,
          );
          const rowHeight = getRowHeight(container);
          const firstRowCell = container.querySelector(
            `td.cell[data-col='${start?.col}']`,
          ) as HTMLElement;
          let colPosition = firstRowCell
            ? firstRowCell.offsetLeft - firstRowCell.clientWidth
            : 0;

          const scrollHeight = actual * rowHeight;
          sheetWrapperRef.current?.scrollTo(
            isNumber(row) ? 0 : colPosition,
            scrollHeight,
          );

          // 最后一行的bug暂时用 scroll end 事件来处理
          if (
            isNil(row) &&
            start.row === data.length - 1 &&
            sheetWrapperRef.current
          ) {
            const handleScrollEnd = () => {
              sheetWrapperRef.current?.scrollTo(
                isNumber(row) ? 0 : colPosition,
                scrollHeight,
              );
              sheetWrapperRef.current?.removeEventListener(
                'scrollend',
                handleScrollEnd,
              );
            };

            sheetWrapperRef.current.addEventListener(
              'scrollend',
              handleScrollEnd,
            );
          }
        });
      },
      pushToHistory: (config: SheetType.OperateHistory) => {
        dispatch({ type: 'pushHistory', payload: config });
      },
      selectRow: (row?: number) => {
        if (isNil(row)) {
          dispatch({ type: 'clearSelect' });
        } else {
          dispatch({ type: 'selectOneRow', payload: row });
        }
      },
      select: (props) => {
        dispatch({ type: 'select', payload: props });
      },
      popHistory: () => {
        const { history } = state;
        dispatch({ type: 'popHistory' });
        return history?.length
          ? history?.[history.length - 1]
          : ({} as SheetType.OperateHistory);
      },
      dropHistory: () => {
        const { history } = state
        dispatch({ type: 'changes', payload: { history: [] } })
        return history ?? []
      }
    }),
    [state.history],
  );

  useEffect(() => {
    // 同步必要的状态
    dispatch({
      type: 'changes',
      payload: {
        cellChangeHandler: onCellsChanged,
        data,
        freePaste,
        groupConfig,
      },
    });
  }, [onCellsChanged, data, freePaste, groupConfig]);

  useCellEvent(dispatch, state);
  useMouseEvent(dispatch, sheetWrapperRef);
  useKeyBoardEvent(dispatch, sheetWrapperRef);

  const menu = useContextMenu(
    dispatch,
    sheetWrapperRef,
    !!ContextMenu,
    contextMenuRef,
  );

  // timeout 的副作用不适合放reducer里面
  useEffect(() => {
    if (!state.editing && state.start) {
      setTimeout(() => {
        // 表格获取焦点 + 接收keyboard event
        sheetWrapperRef.current?.focus({ preventScroll: true });
      }, 1);
    }
  }, [state.editing, state.start]);

  const visibleData = useMemo(() => {
    if (!groupConfig?.groups?.length) {
      return state.data;
    }
    return state.data?.filter((item, index) => {
      if (!groupConfig?.configMap.has(index)) {
        return true;
      }
      const rowConfig = groupConfig.configMap.get(index);
      return rowConfig?.isOpen || rowConfig?.isStart;
    });
  }, [state.data, groupConfig]);

  const { virtualStart, virtualEnd, paddingTop, paddingBottom } =
    useVirtualList(sheetWrapperRef, visibleData, virtualized);

  const { closeSearch, changeSearch, goNext, goLast } = useSearchInput(state, dispatch, sheetInstance)

  useEffect(() => {
    dispatch({
      type: 'clearEdit',
    });
    dispatch({
      type: 'clearSelectIfNotSingleRow',
    });
  }, [groupConfig]);

  const rowElements = useMemo(() => {
    return visibleData
      ?.slice(virtualStart, virtualEnd)
      ?.map((rowData: SheetType.Cell[]) => {
        const row = rowData[0]?.row || 0;

        const rowCN =
          rowClassName instanceof Function
            ? rowClassName?.(rowData?.[rowData.length - 1]?.record as any, row)
            : rowClassName;
        return (
          <Row key={row} row={row} cells={rowData} rowClassName={rowCN}>
            <DefaultRowMapper rowData={rowData} row={row} />
          </Row>
        );
      });
  }, [visibleData, groupConfig, virtualStart, virtualEnd, rowClassName]);

  const memoHeight = Math.min((visibleData?.length ?? 0) + 1, 10) * 42 + 43;

  const [startRowVisible, direction] = useSelectVisible(
    sheetWrapperRef,
    state.start,
  );

  const isEmptyData = isEmpty(state.data);

  const EmptyElement = useMemo(() => {
    if (isEmptyData) {
      return (
        <div style={{ marginTop: 16, marginBottom: 16 }}>{emptyRenderer}</div>
      );
    }
    return null;
  }, [isEmptyData, emptyRenderer]);

  const hasHorizontalScrollbar =
    sheetWrapperRef.current &&
    sheetWrapperRef.current.scrollWidth > sheetWrapperRef.current.clientWidth;

  return (
    <SheetEventContext.Provider value={eventBus}>
      <>
        <span>
          <span
            ref={sheetWrapperRef}
            tabIndex={0}
            className={classNames(
              'harvest harvest-sheet-container',
              className,
              hasHorizontalScrollbar && boldScroll ? 'tableWarpScroll' : null,
              hideColBar ? 'hideColBar' : null,
            )}
            style={{
              maxHeight: scroll?.y ?? memoHeight,
              width: scroll?.x ?? '100%',
            }}
          >
            <SheetShell
              key="sheet"
              className={classNames('harvest-sheet', className)}
            >
              <VirtualizeStart
                virtualized={virtualized}
                paddingTop={paddingTop}
              />
              {rowElements}
              <VirtualizeEnd
                virtualized={virtualized}
                paddingBottom={paddingBottom}
              />
            </SheetShell>
            <Menu
              ref={contextMenuRef}
              position={menu.position}
              cell={menu.cellPosition}
              showMenu={menu.showMenu}
              contextMenu={ContextMenu}
              onContextMenu={onContextMenu}
            />
            {EmptyElement}
          </span>
          <div className="harvest-sheet-control">
            {children}
            <Control
              showBackEdit={showBackEdit}
              startRowVisible={startRowVisible}
              handelClick={() => sheetInstance?.current?.zoomTo()}
              direction={direction}
              backEditStyle={backEditStyle}
            />
          </div>
        </span>
        <SearchInput
          style={props.searchStyle}
          value={state.searchText}
          total={state.searchTotal}
          current={state.searchCurrent}
          calledCount={state.searchCalledCount}
          open={state.showSearch}
          goNext={goNext}
          goLast={goLast}
          onChange={changeSearch}
          onClose={closeSearch} />
      </>
    </SheetEventContext.Provider>
  );
};

export default Sheet;
