/* eslint-disable eqeqeq */
// == string 和 number 类型忽略
import { SheetType } from '@zhenliang/sheet/type';
import { valuesTransferToLabel } from '../../util';

export const getCascaderViewer = (options: SheetType.OptionsType[]) => {
  const TypeViewer: SheetType.CellViewer = (props) => {
    const { value } = props;
    const text =
      valuesTransferToLabel(options, value as string) || (value as string);
    return <>{text}</>;
  };
  return TypeViewer;
};
