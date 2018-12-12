declare class QueueNode {
  data: any;
  next: QueueNode | null;

  constructor(data: any);
}

declare class Queue {
  head: QueueNode | null;
  tail: QueueNode | null;

  constructor();

  enqueue(data: any): void;

  dequeue(): any;

  dequeueAll(): any[];
}

export default Queue;
