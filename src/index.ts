export type EventMap = {
  [k: string]: object | undefined;
};

export interface EventEmitter<T extends EventMap> {
  on: <K extends keyof T>(eventType: K, handler: EventHandler<T, K>) => number;
  off: <K extends keyof T>(eventType: K, id: number) => void;
  once: <K extends keyof T>(eventType: K, handler: EventHandler<T, K>) => void;
  emit: <K extends keyof T>(
    eventType: keyof T,
    ...params: OptionalArg<K>
  ) => void;
}

type OptionalArg<T> = T extends undefined ? [] : [T];

type EventType<T extends EventMap> = keyof T;
type Event<T extends EventMap, K extends EventType<T>> = T[K];
type ListenerStore<T extends EventMap> = {
  [K in EventType<T>]: ListenerEntries<T, K>;
};
type ListenerEntries<T extends EventMap, K extends EventType<T>> = {
  [key: string]: Listener<T, K>;
};

interface Listener<T extends EventMap, K extends EventType<T>> {
  id: number;
  handler: EventHandler<T, K>;
}
type EventHandler<T extends EventMap, K extends EventType<T>> = (
  ...params: OptionalArg<Event<T, K>>
) => void;

export function createEventEmitter<T extends EventMap>() {
  const listeners = {} as ListenerStore<T>;
  let idSeq = 0;

  function on<K extends EventType<T>>(
    eventType: K,
    handler: EventHandler<T, K>
  ) {
    const id = idSeq++;

    listeners[eventType] = listeners[eventType] || {};
    (listeners[eventType] as ListenerEntries<T, K>)[id.toString()] = {
      id,
      handler,
    };

    return id;
  }

  function off<K extends EventType<T>>(eventType: K, id: number) {
    const eventListeners: ListenerEntries<T, K> = listeners[eventType];
    const idx = id.toString();

    if (eventListeners && eventListeners[idx]) {
      delete eventListeners[idx];
    } else {
      throwMissingListenerError(idx, eventType.toString());
    }
  }

  function once<K extends EventType<T>>(
    eventType: K,
    handler: EventHandler<T, K>
  ) {
    let id = -1;
    id = on(eventType, (...args: Parameters<typeof handler>) => {
      handler(...args);
      off(eventType, id);
    });
  }

  function emit<K extends EventType<T>>(
    eventType: EventType<T>,
    ...params: OptionalArg<Event<T, K>>
  ) {
    const eventListeners = listeners[eventType];

    if (eventListeners) {
      Object.values(eventListeners)
        .sort(byId)
        .forEach(({ handler }) => handler(...params));
    }
  }

  return { on, off, once, emit };
}

function throwMissingListenerError(idx: string, eventType: string) {
  throw new Error(`No listener with id ${idx} for event type "${eventType}"`);
}

function byId(listener1: { id: number }, listener2: { id: number }) {
  return listener1.id - listener2.id;
}
