import { useSheetEvent } from '@zhenliang/sheet';
import { FC, useEffect } from 'react';

export const SheetEvent: FC<{
  handler?: (value: unknown) => void;
  name: string;
}> = ({ handler, name }) => {
  const eventBus = useSheetEvent();

  useEffect(() => {
    if (!eventBus || !handler) {
      return;
    }
    eventBus.on(name, handler);
    return () => {
      eventBus.off(name, handler);
    };
  }, [eventBus, handler, name]);

  return null;
};
