import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { HidDevice } from "../apps/desktop/core/transport";
import { encode, decode, Op } from "../packages/protocol";
class FakeHid extends EventEmitter {
  writes: number[][] = [];
  write(data: number[]) {
    this.writes.push(data);
    return data.length;
  }
  close() {}
  report(op: number, sequence: number, payload: number[]) {
    this.emit(
      "data",
      Buffer.from(encode({ op, sequence, payload: new Uint8Array(payload) })),
    );
  }
}
test("HID report ID, ACK correlation, duplicate events and malformed input", async () => {
  const handle = new FakeHid();
  const device = new HidDevice("hid:test", handle);
  const pending = device.send(Op.HEARTBEAT);
  assert.equal(handle.writes[0].length, 65);
  assert.equal(handle.writes[0][0], 0);
  const command = decode(new Uint8Array(handle.writes[0].slice(1)));
  handle.report(Op.ACK, command.sequence, [Op.HEARTBEAT]);
  await pending;
  let presses = 0;
  device.on("press", () => presses++);
  handle.report(Op.BUTTON_EVENT, 1, [0]);
  handle.report(Op.BUTTON_EVENT, 2, [0]);
  handle.report(Op.BUTTON_EVENT, 1, [0]);
  assert.equal(presses, 2);
  let errors = 0;
  device.on("protocol-error", () => errors++);
  handle.emit("data", Buffer.from([1, 2]));
  assert.equal(errors, 1);
  device.close();
});
test("HID removal rejects pending requests and missing ACK times out", async () => {
  const handle = new FakeHid();
  const device = new HidDevice("hid:test", handle);
  const request = device.send(Op.HELLO);
  const rejected = assert.rejects(request, /DEVICE_REMOVED/);
  handle.emit("error", new Error("unplugged"));
  await rejected;
  const second = new HidDevice("hid:test2", new FakeHid());
  await assert.rejects(() => second.send(Op.HELLO), /ACK_TIMEOUT/);
  second.close();
});
