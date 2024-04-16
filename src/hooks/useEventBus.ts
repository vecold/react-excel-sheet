import EventEmitter from 'events';
import { useEffect, useRef } from 'react';

const useEventBus = () => {
  const eventBus = useRef<EventEmitter | null>(new EventEmitter());

  useEffect(() => {
    return () => {
      eventBus.current?.removeAllListeners();
      eventBus.current = null;
    };
  }, []);

  if (!eventBus.current) {
    eventBus.current = new EventEmitter();
  }

  return eventBus.current;
};

export { useEventBus };
