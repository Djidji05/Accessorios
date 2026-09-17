import { AuditLog } from '../types';

export type EventType = 
  | 'TRANSACTION_CREATED'
  | 'TASK_ROUTED'
  | 'TASK_IN_PROGRESS'
  | 'PROOF_SUBMITTED'
  | 'TRANSACTION_COMPLETED'
  | 'TRANSACTION_CANCELLED'
  | 'KILL_SWITCH_TOGGLED'
  | 'PERMISSIONS_UPDATED'
  | 'TREASURY_ADJUSTED'
  | 'TREASURY_RECHARGED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'TRANSACTION_UPDATED';

export interface SystemEvent<T = any> {
  id: string;
  type: EventType;
  timestamp: string;
  sourceNodeId: string;
  sourceNodeRole: string;
  payload: T;
}

type EventCallback = (event: SystemEvent) => void;

class DistributedEventBus {
  private listeners: Map<EventType | '*', EventCallback[]> = new Map();
  private eventHistory: SystemEvent[] = [];

  subscribe(eventType: EventType | '*', callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe cleanup function
    return () => {
      const list = this.listeners.get(eventType);
      if (list) {
        this.listeners.set(eventType, list.filter(cb => cb !== callback));
      }
    };
  }

  publish<T>(type: EventType, sourceNodeId: string, sourceNodeRole: string, payload: T): SystemEvent<T> {
    const event: SystemEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      timestamp: new Date().toISOString(),
      sourceNodeId,
      sourceNodeRole,
      payload,
    };

    this.eventHistory.unshift(event);

    // Notify listeners for specific event type
    const specificListeners = this.listeners.get(type) || [];
    specificListeners.forEach(cb => cb(event));

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*') || [];
    wildcardListeners.forEach(cb => cb(event));

    return event;
  }

  getHistory(): SystemEvent[] {
    return [...this.eventHistory];
  }
}

export const eventBus = new DistributedEventBus();
