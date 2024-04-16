import type { EventEmitter } from 'events';
import { CSSProperties } from 'react';
import { SheetTableType, SheetType } from '.';

export enum CellAlign {
  left = 'left',
  center = 'center',
  right = 'right',
  unset = 'unset',
}

export type Cell = {
  id: string;
  row?: number;
  col?: number;
  key?: string;
  readonly?: boolean;
  component?: CellViewer;
  editable?: boolean;
  colSpan?: number;
  rowSpan?: number;
  width?: number;
  record?: Record<string, unknown>;
  disableEvents?: boolean;
  dataEditor?: CellEditor;
  dataIndex?: string;
  valueViewer?: CellViewer;
  searchKey?: (value: unknown, record?: unknown) => string
  className?: string;
  align?: CellAlign;
  fixed?: Omit<CellAlign, 'center'>;
  value?: string | number | null;
};

export type CellViewerProps = {
  value: unknown;
  record?: Record<string, unknown>;
  row?: number;
  col?: number;
  cell?: Cell;
};

export type CellEditorProps = {
  value: unknown;
  cell?: Cell;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
} & CellViewerProps;

export type CellEditor = React.FC<CellEditorProps> & {
  checker?: (value: unknown, record?: Record<string, unknown>) => boolean;
  formatter?: (value: unknown, record?: Record<string, unknown>) => unknown;
  parser?: (value: unknown, record?: Record<string, unknown>) => unknown;
};
export type CellViewer = React.FC<CellViewerProps>;

export type CellPosition = {
  row: number;
  col: number;
};

export type CellData = {
  id: string;
  cell: Cell;
  row: number;
  col: number;
  value?: string;
};

export type CellNavigable = (
  cell?: Cell,
  row?: number,
  col?: number,
) => boolean;
export type CellChangeHandler = (
  cells: CellData[],
  additions?: CellData[],
) => void;

export type RowGroup = {
  groupName: string;
  groupStart: number;
  groupEnd: number;
};
export type RowGroupConfig = {
  defaultOpen?: boolean;
  groups: RowGroup[];
  groupOpen: boolean[];
};

export type GroupMap = Map<
  number,
  SheetType.RowGroup & { isStart: boolean; isOpen: boolean }
>;

export type MenuRenderProps = {
  position?: { top: number; left: number };
  cell?: CellPosition;
  onContextMenu?: (event: any) => void;
};

export type SheetInstance = {
  zoomTo: (row?: number) => void;
  pushToHistory: (value: OperateHistory) => void;
  selectRow: (row?: number) => void;
  select: (props: {
    start: SheetType.CellPosition;
    end: SheetType.CellPosition;
  }) => void;
  popHistory: () => OperateHistory;
  dropHistory: () => OperateHistory[];
};

export type SheetProps = {
  sheetInstance?: React.MutableRefObject<SheetInstance | null>;
  sheetRenderer?: any;
  rowRenderer?: any;
  emptyRenderer?: any;
  className?: string;
  data: Cell[][];
  freePaste?: boolean;
  virtualized?: boolean;
  showBackEdit?: boolean;
  backEditStyle?: Partial<CSSProperties>;
  searchStyle?: Partial<CSSProperties>;
  sticky?: boolean;

  groupConfig?: RowGroupConfig;

  onCellsChanged?: CellChangeHandler;
  menuRenderer?: React.FC<MenuRenderProps>;
  onContextMenu?: (event: any) => void;

  scroll?: { x?: number | string; y?: number | string };
  rowClassName?:
  | string
  | ((record: Record<string, unknown>, index: number) => string);
  children?: any[];
  boldScroll?: boolean;
  hideColBar?: boolean;
};
export type WidthConfigContext = {
  onChange?: (value: Record<number | string, number>) => void;
  widths?: Record<number | string, number>;
};

export type GroupConfigContext = {
  onChange?: (value: RowGroupConfig) => void;
  config?: RowGroupConfig & { configMap: GroupMap };
};

export type SheetShell = Pick<SheetTableType.TableProps, 'columns'> & {
  className?: string;
  showGroup?: boolean;
  showSelect?: boolean;
  controlWidth?: number;
  controlProps?: {
    check?: {
      checked: boolean;
      indeterminate?: boolean;
    };
    group?: {
      open: boolean;
    };
  };
};

export type SheetRow = {
  row: number;
  cells: Cell[];
  selected: boolean;
  children: React.ElementType;
};

// todo
export type windowAssertion = {
  clipboardData?: {
    getData?: (type: string) => string;
    setData?: (type: string, data: string) => string;
  };
};

export type refAssertion = {
  contains?: (target: EventTarget | null) => boolean;
  focus?: () => boolean;
} & HTMLSpanElement;

export type AttributesRenderer = (
  cell: Cell,
  row: number,
  col: number,
) => Record<string, string>;

export type CellProps = {
  row: number;
  col: number;
  cell: Cell;
  cellRenderer?: React.ElementType;
  dataEditor?: React.ElementType;
  valueViewer?: React.ElementType;
  attributesRenderer?: AttributesRenderer;
};

export type SearchState = {
  showSearch: boolean
  searchText: string
  searchTotal: number
  searchCurrent: number
  searchResultList?: CellPosition[]
  searchCalledCount: number
}

export type UpdateStateType = {
  eventBus: EventEmitter;
  start: CellPosition;
  end: CellPosition;
  selecting: boolean;
  forceEdit: boolean;
  clear: CellPosition;
  editing: CellPosition & { value?: string };
  history: OperateHistory[];
  freePaste?: boolean;
  data: Cell[][];
  mouseDown: boolean;
  isIndex: boolean;
  lastSelected?: {
    start?: CellPosition;
    end?: CellPosition;
  };
  groupConfig?: {
    groups: RowGroup[];
    groupOpen: boolean[];
  };
  lastFocus: { id: string; col: number }[];
  lastEditing: CellPosition & { confirm?: boolean };
  cellChangeHandler: (cells: CellData[], additions?: CellData[]) => void;
} & SearchState;
export type UpdateFocus = (start: CellPosition, end: CellPosition) => void;

export type Options<T = any> = {
  value: string | number;
  label: string;
} & T;

export type OptionsType = Options<{
  disabled?: boolean;
  children?: OptionsType[];
}>;

export type OperateHistory = {
  changes: Partial<CellData>[];
  type: OperateType;

  rowInfo?: {
    newRow?: number;
    deleteRow?: number;
  };
  extraInfo?: Record<string, unknown>;
};

export type OperateType =
  // 前三个Type 直接调用 onCellChange
  | 'Edit'
  | 'Paste'
  | 'Delete'
  // 后三个单独Event 处理
  | 'DeleteRow'
  | 'NewRow'
  | 'Custom';
