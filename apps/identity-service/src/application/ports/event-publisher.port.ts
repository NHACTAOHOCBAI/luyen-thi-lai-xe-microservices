export abstract class EventPublisher {
  abstract publish(eventName: string, payload: unknown): Promise<void>;
}
