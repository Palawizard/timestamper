import { describe, expect, it } from "vitest";
import { SerialTaskQueue } from "./serialTaskQueue";

describe("SerialTaskQueue", () => {
  it("runs racing session commands in submission order", async () => {
    const queue = new SerialTaskQueue();
    const order: string[] = [];
    let releaseStart: (() => void) | undefined;

    const start = queue.enqueue(async () => {
      order.push("start-begin");
      await new Promise<void>((resolve) => {
        releaseStart = resolve;
      });
      order.push("start-end");
    });
    const mark = queue.enqueue(async () => {
      order.push("mark");
    });
    const stop = queue.enqueue(async () => {
      order.push("stop");
    });

    await Promise.resolve();
    expect(order).toEqual(["start-begin"]);
    releaseStart?.();
    await Promise.all([start, mark, stop]);

    expect(order).toEqual(["start-begin", "start-end", "mark", "stop"]);
  });

  it("continues after a failed command", async () => {
    const queue = new SerialTaskQueue();
    const nextTask = queue.enqueue(async () => {
      throw new Error("failed command");
    });
    const completed: string[] = [];
    const recoveryTask = queue.enqueue(async () => {
      completed.push("recovered");
    });

    await expect(nextTask).rejects.toThrow("failed command");
    await recoveryTask;
    expect(completed).toEqual(["recovered"]);
  });
});
