type EventMap = {
  [k: string]: object | undefined;
};

type OptionalArg<T> = T extends undefined ? [] : [T];

export function createEventEmitter<T extends EventMap>() {
  type EventType = keyof T;
  type Event<K extends EventType> = T[K];
  type ListenerStore = { [K in EventType]: ListenerEntries<K> };
  type ListenerEntries<K extends EventType> = { [key: string]: Listener<K> };

  interface Listener<K extends EventType> {
    id: number;
    handler: EventHandler<K>;
  }
  type EventHandler<K extends EventType> = (
    ...params: OptionalArg<Event<K>>
  ) => void;

  const listeners = {} as ListenerStore;
  let idSeq = 0;

  function on<K extends EventType>(eventType: K, handler: EventHandler<K>) {
    const id = idSeq++;

    listeners[eventType] = listeners[eventType] || {};
    (listeners[eventType] as ListenerEntries<K>)[id.toString()] = {
      id,
      handler,
    };

    return id;
  }

  function off<K extends EventType>(eventType: K, id: number) {
    const eventListeners: ListenerEntries<K> = listeners[eventType];
    const idx = id.toString();

    if (eventListeners && eventListeners[idx]) {
      delete eventListeners[idx];
    } else {
      throwMissingListenerError(idx, eventType.toString());
    }
  }

  function once<K extends EventType>(eventType: K, handler: EventHandler<K>) {
    let id = -1;
    id = on(eventType, (...args: Parameters<typeof handler>) => {
      handler(...args);
      off(eventType, id);
    });
  }

  function emit<K extends EventType>(
    eventType: EventType,
    ...params: OptionalArg<Event<K>>
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
