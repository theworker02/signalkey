#pragma once
#include <stdbool.h>
#include <stdint.h>
enum { SK_PRESS = 1, SK_DOUBLE = 2, SK_HOLD = 4 };
typedef struct {
  bool raw, stable, held, pending, second;
  uint32_t changed, down, released;
} sk_button;
// The second debounced DOWN must begin within 300 ms of the first UP.
// A second hold consumes the pending first press. Release after hold emits nothing.
static inline unsigned sk_button_update(sk_button *b, bool pressed, uint32_t now) {
  unsigned events = 0;
  if (pressed != b->raw) {
    b->raw = pressed;
    b->changed = now;
  }
  if (b->raw != b->stable && now - b->changed >= 20) {
    b->stable = b->raw;
    if (b->stable) {
      b->second = b->pending && now - b->released <= 300;
      if (b->pending && !b->second) {
        events |= SK_PRESS;
        b->pending = false;
      }
      b->down = now;
      b->held = false;
    } else if (!b->held) {
      if (b->second) {
        events |= SK_DOUBLE;
        b->pending = false;
        b->second = false;
      } else {
        b->pending = true;
        b->released = now;
      }
    }
  }
  if (b->stable && !b->held && now - b->down >= 800) {
    events |= SK_HOLD;
    b->held = true;
    b->pending = false;
    b->second = false;
  }
  if (b->pending && !b->second && now - b->released > 300) {
    events |= SK_PRESS;
    b->pending = false;
  }
  return events;
}
