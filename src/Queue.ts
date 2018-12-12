class QueueNode {
  data: any;
  next: QueueNode | null;

  constructor(data: any) {
    this.data = data;
    this.next = null;
  }
}

class Queue {
  head: QueueNode | null = null;
  tail: QueueNode | null = null;

  constructor() {

  }

  enqueue(data: any) {

    let newNode = new QueueNode(data);
    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      (<QueueNode>this.tail).next = newNode;
      this.tail = newNode;
    }

  }

  dequeue(): any {

    let dqNode = null;
    if (this.head !== null) {
      dqNode = this.head.data;
      this.head = this.head.next;
    }
    return dqNode;

  }

  dequeueAll(): any[] {

    let arr: any[] = [];
    let item = this.dequeue();
    while (item !== null) {
      arr.push(item);
      item = this.dequeue();
    }

    return arr;

  }

}


export default Queue;
