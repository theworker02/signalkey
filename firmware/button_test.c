#include "button.h"
#include <assert.h>
#include <stdio.h>
static unsigned edge(sk_button *b, bool pressed, uint32_t now) {
  assert(sk_button_update(b, pressed, now) == 0);
  return sk_button_update(b, pressed, now + 20);
}
int main(void) {
  sk_button b = {0};
  assert(edge(&b, true, 0) == 0);
  assert(edge(&b, false, 80) == 0);
  assert(sk_button_update(&b, false, 400) == 0);
  assert(sk_button_update(&b, false, 401) == SK_PRESS);
  b = (sk_button){0};
  edge(&b, true, 0);
  edge(&b, false, 80);
  edge(&b, true, 180);
  assert(edge(&b, false, 450) == SK_DOUBLE);
  assert(sk_button_update(&b, false, 1000) == 0);
  b = (sk_button){0};
  edge(&b, true, 0);
  assert(sk_button_update(&b, true, 819) == 0);
  assert(sk_button_update(&b, true, 820) == SK_HOLD);
  assert(edge(&b, false, 900) == 0);
  assert(sk_button_update(&b, false, 2000) == 0);
  b = (sk_button){0};
  edge(&b, true, 0);
  edge(&b, false, 80);
  edge(&b, true, 180);
  assert(sk_button_update(&b, true, 1000) == SK_HOLD);
  assert(edge(&b, false, 1100) == 0);
  b = (sk_button){0};
  assert(sk_button_update(&b, true, 0) == 0);
  assert(sk_button_update(&b, false, 5) == 0);
  assert(sk_button_update(&b, true, 9) == 0);
  assert(sk_button_update(&b, false, 15) == 0);
  assert(sk_button_update(&b, false, 1000) == 0);
  b = (sk_button){0};
  edge(&b, true, UINT32_MAX - 50);
  edge(&b, false, 10);
  assert(sk_button_update(&b, false, 331) == SK_PRESS);
  puts("Button debounce, single/double/hold precedence and clock wrap tests passed");
  return 0;
}
