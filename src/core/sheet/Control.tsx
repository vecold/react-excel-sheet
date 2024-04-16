import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import React, { CSSProperties } from 'react';

interface ControlProps {
  showBackEdit?: boolean;
  startRowVisible: boolean;
  handelClick: () => void;
  backEditStyle?: Partial<CSSProperties>;
  direction: 'up' | 'down';
}

export const Control: React.FC<ControlProps> = (props) => {
  const {
    showBackEdit,
    startRowVisible,
    handelClick,
    backEditStyle,
    direction,
  } = props;
  if (!showBackEdit || startRowVisible) return null;

  const styles = backEditStyle || {
    top: 0,
    right: 0,
  };

  const backIcon =
    direction === 'up' ? (
      <ArrowUpOutlined rev={undefined} />
    ) : (
      <ArrowDownOutlined rev={undefined} />
    );
  return (
    <div className="back-edit" onClick={handelClick} style={styles}>
      {backIcon}
      <span style={{ marginLeft: 0 }}>返回编辑行</span>
    </div>
  );
};
