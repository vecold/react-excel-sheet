import { MenuRenderProps } from '@zhenliang/sheet/type/sheet';
import React, { forwardRef } from 'react';

export const Menu = forwardRef<
  HTMLDivElement,
  MenuRenderProps & {
    contextMenu?: React.FC<MenuRenderProps>;
    showMenu: boolean;
  }
>((props, ref) => {
  const {
    showMenu,
    position,
    cell,
    onContextMenu,
    contextMenu: ContextMenu,
  } = props;
  const isMenuShow = !!ContextMenu && showMenu;
  return (
    <div ref={ref} style={{ display: isMenuShow ? '' : 'none' }}>
      {isMenuShow && (
        <ContextMenu
          position={position}
          cell={cell}
          onContextMenu={onContextMenu}
        />
      )}
    </div>
  );
});
