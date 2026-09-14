#pragma once
#include "button.h"

// A new host session must observe a stable release before accepting a gesture.
// Neither presses made offline nor a button held through reconnect may execute.
typedef struct {
  sk_button button;
  bool armed, releasing;
  uint32_t released_at;
} sk_input_session;

static inline unsigned sk_input_update(sk_input_session *s, bool eligible, bool pressed,
                                       uint32_t now) {
  if (!eligible) {
    *s = (sk_input_session){0};
    return 0;
  }
  if (!s->armed) {
    if (pressed)
      s->releasing = false;
    else if (!s->releasing) {
      s->releasing = true;
      s->released_at = now;
    } else if (now - s->released_at >= 20)
      s->armed = true;
    return 0;
  }
  return sk_button_update(&s->button, pressed, now);
}
