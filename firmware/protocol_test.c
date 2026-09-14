#include "protocol.h"
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char **argv) {
  assert(argc == 2);
  uint8_t b[64];
  assert(strlen(argv[1]) == 128);
  for (unsigned i = 0; i < 64; i++) {
    char pair[3] = {argv[1][i * 2], argv[1][i * 2 + 1], 0};
    b[i] = (uint8_t)strtoul(pair, NULL, 16);
  }
  assert(sk_parse(b, 64));
  assert(b[4] == HEARTBEAT);
  assert((b[5] | b[6] << 8) == 0x1234);
  uint8_t expected[64];
  sk_packet(expected, HEARTBEAT, 0x1234, NULL, 0);
  assert(memcmp(b, expected, 64) == 0);
  assert(!sk_parse(b, 63));
  b[2] = 2;
  assert(!sk_parse(b, 64));
  b[2] = 1;
  b[63] = 1;
  assert(!sk_parse(b, 64));
  puts("C protocol golden fixture and malformed report tests passed");
  return 0;
}
