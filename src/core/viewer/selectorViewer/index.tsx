/* eslint-disable eqeqeq */
// == string 和 number 类型忽略
import { SheetType } from '@zhenliang/sheet/type';

export const getSelectorViewer = (options: SheetType.Options[]) => {
  const TypeViewer: SheetType.CellViewer = (props) => {
    return (
      <span className="value-viewer">
        {options.find(
          (item) => item.label === props.value || `${item.value}` === `${props.value}`,
        )?.label || null}
      </span>
    );
  };
  return TypeViewer;
};
