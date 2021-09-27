import { createEventEmitter, EventEmitter } from ".";
import "jest-extended";

type ExampleEvents = {
  exampleType: undefined;
  exampleWithPayload: { value: string };
};

function createExampleEventEmitter(): EventEmitter<ExampleEvents> {
  return createEventEmitter<ExampleEvents>();
}

describe("createEventEmitter", () => {
  it("listens and emits", async () => {
    const emitter = createExampleEventEmitter();
    const handler = jest.fn();

    emitter.on("exampleType", handler);
    emitter.emit("exampleType");

    expect(handler).toHaveBeenCalled();
  });

  it("emits the event payload", async () => {
    const emitter = createExampleEventEmitter();
    const handler = jest.fn();

    emitter.on("exampleWithPayload", handler);
    emitter.emit("exampleWithPayload", { value: "someEventValue" });

    expect(handler).toHaveBeenCalledWith({ value: "someEventValue" });
  });

  it("emits in the order listeners were added", async () => {
    const emitter = createExampleEventEmitter();
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    emitter.on("exampleType", handler1);
    emitter.on("exampleType", handler2);
    emitter.emit("exampleType");

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
    expect(handler1).toHaveBeenCalledBefore(handler2);
  });

  it("removes listeners", async () => {
    const emitter = createExampleEventEmitter();
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const id = emitter.on("exampleType", handler1);
    emitter.on("exampleType", handler2);
    emitter.off("exampleType", id);
    emitter.emit("exampleType");

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it("removes listeners", async () => {
    const emitter = createExampleEventEmitter();

    expect(() =>
      emitter.off("exampleType", 1)
    ).toThrowErrorMatchingInlineSnapshot(
      `"No listener with id 1 for event type \\"exampleType\\""`
    );
  });

  it("listens once", async () => {
    const emitter = createExampleEventEmitter();
    const handler1 = jest.fn();

    emitter.once("exampleWithPayload", handler1);
    emitter.emit("exampleWithPayload", { value: "example" });
    emitter.emit("exampleWithPayload");

    expect(handler1).toHaveBeenCalledWith({ value: "example" });
    expect(handler1).toHaveBeenCalledTimes(1);
  });
});
