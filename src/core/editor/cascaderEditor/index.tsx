import type { SheetType } from '@zhenliang/sheet/type';
import { Cascader } from 'antd';
import 'antd/es/cascader/style/index.css';
import { isNil } from 'lodash';
import { useMemo } from 'react';
import {
  optionsToValuesFromLabelOrValue,
  valuesTransferToLabel,
} from '../../util';
import './index.less';

const getCascaderEditor = (
  options: SheetType.OptionsType[],
  getCustomOptions?: (
    props: SheetType.CellEditorProps,
  ) => SheetType.OptionsType[],
) => {
  const CascaderEditor: SheetType.CellEditor = (props) => {
    const { value, onConfirm } = props;

    const val = useMemo(() => {
      const res = optionsToValuesFromLabelOrValue(options, value as string);
      return res;
    }, [value, options]);
    const handleChange = (opt: any) => {
      onConfirm(opt ? opt[opt.length - 1] : null);
    };
    const customOptions = getCustomOptions ? getCustomOptions(props) : options;
    return (
      <Cascader
        autoFocus
        open
        className={'cascader-editor'}
        onMouseDown={(event: any) => {
          event.stopPropagation();
        }}
        value={val}
        allowClear
        displayRender={(label) => label[label.length - 1]}
        onChange={handleChange}
        options={customOptions}
      />
    );
  };

  CascaderEditor.formatter = (value) => {
    const res = optionsToValuesFromLabelOrValue(options, value as string);
    return !res?.length
      ? ''
      : valuesTransferToLabel(options, res[res.length - 1]);
  };

  CascaderEditor.parser = (value) => {
    const res = optionsToValuesFromLabelOrValue(options, value as string);
    return res.length ? res[res.length - 1] : null;
  };
  CascaderEditor.checker = (value) => {
    if (isNil(value)) {
      return true;
    }
    const res = optionsToValuesFromLabelOrValue(options, value as string);
    return !!res.length;
  };
  return CascaderEditor;
};
export default getCascaderEditor;
