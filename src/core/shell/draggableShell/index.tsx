import type { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { createElement, useEffect, useMemo, useRef } from 'react';
import { useSetState, useSheetEvent, useWidth } from '../../../hooks';
import { classNames } from '../../util';
import { CheckViewer } from '../../viewer/checkViewer';
import { GroupViewer } from '../../viewer/groupViewer';
import './index.less';

export const DraggableShell = ({
  columns,
  className,
  showGroup,
  showSelect,
  controlProps,
  controlWidth = 30,
}: SheetType.SheetShell) => {
  const TableShell: React.FC<{
    children: React.ReactElement;
  }> = ({ children }) => {
    const headRef = useRef<HTMLTableRowElement>(null);
    const downRef = useRef<
      | (HTMLTableHeaderCellElement & {
        mouseDown?: boolean;
        oldX?: number;
        oldWidth?: number;
        width?: string;
      })
      | null
    >(null);
    const [_widths, _setWidth] = useSetState<
      Record<number | string, string | number>
    >({});
    const { widths: contextWidths, onChange: contextSetWidth } = useWidth();
    const eventBus = useSheetEvent()

    const setWidth = contextSetWidth || _setWidth;
    const widths = contextWidths || _widths;

    const hasControl = showGroup || showSelect;

    const thItems = useMemo(() => {
      const ths = [];

      if (hasControl) {
        ths.push(
          <th className="cell cell-title read-only sheet-control" key="-1">
            {showGroup && (
              <GroupViewer
                row={-1}
                col={-1}
                value={true}
                record={{ open: controlProps?.group?.open, isHeader: true }}
              />
            )}
            {showSelect && (
              <CheckViewer
                row={-1}
                col={-1}
                value={controlProps?.check?.checked}
                record={{
                  open: controlProps?.check?.checked,
                  isHeader: true,
                  indeterminate: controlProps?.check?.indeterminate,
                }}
              />
            )}
          </th>,
        );
      }
      columns.forEach((item: SheetTableType.ColumnProps, index: number) => {
        item.titleConfig?.colSpan !== 0 &&
          ths.push(
            <th
              className={classNames(
                'cell',
                'cell-title',
                'read-only',
                item.fixed && 'fixed',
                item.fixed && `fixed-${item.fixed}`,
                item.titleConfig?.className,
              )}
              colSpan={item.titleConfig?.colSpan}
              key={item.dataIndex ?? index}
              onClick={(e) => {
                if (item.fixed) return
                const target = e.target as HTMLTableHeaderCellElement;

                if (e.nativeEvent.offsetX <= target.offsetWidth - 8) {
                  eventBus.emit('col-select', { col: hasControl ? index + 1 : index, colSpan: item.titleConfig?.colSpan })
                }
              }}
              style={{
                textAlign: (item.align as any) ?? 'unset',
                left: item.fixed === 'left' ? 0 : 'unset',
                right: item.fixed === 'right' ? 0 : 'unset',
              }}
              onMouseDown={(e) => {
                const target = e.target as HTMLTableHeaderCellElement;

                downRef.current = target;
                if (e.nativeEvent.offsetX > target.offsetWidth - 10) {
                  downRef.current.mouseDown = true;
                  downRef.current.oldX = e.nativeEvent.x;
                  downRef.current.oldWidth = downRef.current.offsetWidth;
                  e.preventDefault()
                } else {
                  downRef.current = null;
                }
              }}
              onMouseMove={(e) => {
                const target = e.target as HTMLTableCellElement | HTMLSpanElement;
                if (target instanceof HTMLSpanElement) {
                  if (target.parentElement instanceof HTMLTableCellElement) {
                    target.parentElement.style.cursor = ''
                  }
                  return
                }
                if (e.nativeEvent.offsetX > target.offsetWidth - 8) {
                  target.style.cursor = 'col-resize';
                } else {
                  target.style.cursor = item.fixed ? 'default' : '';
                }
                //取出暂存的Table Cell
                if (downRef.current === undefined) downRef.current = target;
                //调整宽度
              }}
            >
              <span className="value-viewer">
                {typeof item.title === 'function'
                  ? createElement(item.title as React.FC)
                  : item.title}
              </span>
            </th>,
          );
      });

      return ths;
    }, [columns]);

    const colItems = useMemo(() => {
      const cols = [];
      if (hasControl) {
        cols.push(
          <col
            className={classNames('sheet-control')}
            key="sheet-control"
            style={{
              width: controlWidth,
            }}
          />,
        );
      }
      let i = 0;
      columns.forEach((item: SheetTableType.ColumnProps, index: number) => {
        let currentWidth: number | string = item.width || 'unset';
        if (item.titleConfig?.colSpan !== 0) {
          currentWidth = widths[i] || item.width || 'unset';
          i++;
        }
        cols.push(
          <col
            className={classNames('cell')}
            key={item.dataIndex ?? index}
            style={{
              width: currentWidth,
            }}
          />,
        );
      });
      return cols;
    }, [widths, hasControl, columns]);

    useEffect(() => {
      const handleMouseUp = () => {
        //结束宽度调整
        if (downRef.current) {
          downRef.current.mouseDown = false;
          downRef.current.style.cursor = 'default';
        }
      };
      const handleMouseMove = (e: MouseEvent) => {
        if (!downRef.current || !downRef.current.mouseDown) return;

        if (
          downRef.current?.mouseDown !== null &&
          downRef.current?.mouseDown === true
        ) {
          downRef.current.style.cursor = 'default';
          if (
            (downRef.current.oldWidth ?? 0) +
            (e.x - (downRef.current.oldX ?? 0)) >
            0
          ) {
            let newWidth = Math.max(
              Number(
                (downRef.current.oldWidth ?? 0) +
                (e.x - (downRef.current.oldX ?? 0)),
              ),
              50,
            );

            const cellList = ([] as any[]).slice.call(headRef.current?.cells);
            const changeIndex = cellList.indexOf(downRef.current);
            const actualIndex = hasControl ? changeIndex - 1 : changeIndex;
            const isDoubleSpan =
              (columns[actualIndex]?.titleConfig?.colSpan || 0) > 1;
            const nextColumn = columns[actualIndex + 1] || {};
            const nextWidth = +String(nextColumn?.width).replace('px', '');
            //调整该列中的每个Cell
            const widths = {
              length: columns.length,
              [actualIndex]: isDoubleSpan ? newWidth - nextWidth : newWidth,
            };

            setWidth(widths as any);
          }
        }
      };

      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }, [hasControl]);
    return (
      <>
        <table
          key="header"
          className={classNames('header', 'harvest-sheet', className)}
          style={{ position: 'sticky', top: 0, zIndex: 3 }}
        >
          <colgroup>{colItems}</colgroup>
          <thead style={{ pointerEvents: 'all' }}>
            <tr ref={headRef}>{thItems}</tr>
          </thead>
        </table>
        <table key="body" className={classNames('body', 'harvest-sheet')}>
          <colgroup className="header">{colItems}</colgroup>
          <tbody key="tbody">{children}</tbody>
        </table>
      </>
    );
  };
  return TableShell;
};
