#include "input_session.h"
#include <assert.h>
#include <stdio.h>
int main(void) {
  sk_input_session s = {0};
  assert(!sk_input_update(&s, false, true, 100));
  assert(!sk_input_update(&s, true, true, 200));
  assert(!sk_input_update(&s, true, true, 1200));
  assert(!sk_input_update(&s, true, false, 1201));
  assert(!sk_input_update(&s, true, false, 1221));
  assert(s.armed);
  assert(!sk_input_update(&s, true, true, 1300));
  assert(!sk_input_update(&s, true, true, 1320));
  assert(!sk_input_update(&s, true, false, 1400));
  assert(!sk_input_update(&s, true, false, 1420));
  assert(sk_input_update(&s, true, false, 1721) == SK_PRESS);
  // Loss during a pending single must erase it.
  sk_input_update(&s, true, true, 1800);
  sk_input_update(&s, true, true, 1820);
  sk_input_update(&s, true, false, 1900);
  sk_input_update(&s, true, false, 1920);
  assert(!sk_input_update(&s, false, false, 2000));
  assert(!sk_input_update(&s, true, false, 2500));
  assert(!sk_input_update(&s, true, false, 2520));
  assert(!sk_input_update(&s, true, false, 3000));
  // Release arming handles unsigned clock wrap too.
  s = (sk_input_session){0};
  sk_input_update(&s, true, false, UINT32_MAX - 10);
  assert(!sk_input_update(&s, true, false, 10));
  assert(s.armed);
  puts("Session release gate, offline input discard and clock wrap passed");
}
