type EventListener<T = void> = (data: T) => void;

export class EventEmitter<Events extends Record<string, any> = Record<string, void>> {
  private listeners: Map<string, Set<EventListener<any>>> = new Map();

  on<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): void {
    const eventKey = String(event);
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, new Set());
    }
    this.listeners.get(eventKey)!.add(listener);
  }

  off<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): void {
    const eventKey = String(event);
    this.listeners.get(eventKey)?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const eventKey = String(event);
    this.listeners.get(eventKey)?.forEach((listener) => listener(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}

