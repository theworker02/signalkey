#pragma once
#include <stdint.h>
#include <stdbool.h>
#include <string.h>
enum {
  HELLO = 1,
  GET_CAPABILITIES,
  GET_STATE,
  BUTTON_EVENT,
  SET_LIGHT,
  SET_BRIGHTNESS,
  HEARTBEAT,
  ACK,
  ERROR
};
enum { IDLE, RUNNING, SUCCESS, FAILURE, CANCELLED, UNKNOWN, DISCONNECTED };
static inline bool sk_parse(const uint8_t *p, unsigned len) {
  if (len != 64 || p[0] != 0x53 || p[1] != 0x4b || p[2] != 1 || p[3] != 0 || p[4] < 1 || p[4] > 9 ||
      p[7] > 56)
    return false;
  for (unsigned i = 8 + p[7]; i < 64; i++)
    if (p[i])
      return false;
  return true;
}
static inline void sk_packet(uint8_t *p, uint8_t op, uint16_t seq, const uint8_t *body,
                             uint8_t len) {
  memset(p, 0, 64);
  p[0] = 0x53;
  p[1] = 0x4b;
  p[2] = 1;
  p[4] = op;
  p[5] = seq & 255;
  p[6] = seq >> 8;
  p[7] = len;
  if (len)
    memcpy(p + 8, body, len);
}
