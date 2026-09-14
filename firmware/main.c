#include "pico/stdlib.h"
#include "hardware/watchdog.h"
#include "hardware/pio.h"
#include "hardware/clocks.h"
#include "tusb.h"
#include "protocol.h"
#include "button.h"
#include "input_session.h"
#include "ring.pio.h"
#define BUTTON_PIN 3
#define LIGHT_PIN 2
#define LED_ENABLE_PIN 4
#define LED_COUNT 12
// Versioned RAM defaults only. No flash persistence is claimed in this baseline.
static struct {
  uint8_t version, brightness;
  uint32_t expiry_ms;
} config = {1, 32, 6000};
static uint8_t state = UNKNOWN;
static uint32_t heartbeat = 0, rate_start = 0;
static bool seen_host = false;
static unsigned rate_count = 0;
static uint8_t queue[8][64];
static unsigned head = 0, tail = 0;
static uint16_t button_sequence = 0;
static sk_input_session input_session = {0};
static void reset_input(void) {
  input_session = (sk_input_session){0};
  head = tail = 0;
}
static PIO pio = pio0;
static unsigned sm = 0;
static uint32_t frame[LED_COUNT];
static unsigned pixel = LED_COUNT;
static uint32_t now_ms(void) {
  return to_ms_since_boot(get_absolute_time());
}
static bool enqueue(uint8_t op, uint16_t sequence, const uint8_t *body, uint8_t len) {
  unsigned next = (head + 1) % 8;
  if (next == tail)
    return false;
  sk_packet(queue[head], op, sequence, body, len);
  head = next;
  return true;
}
void tud_hid_set_report_cb(uint8_t instance, uint8_t report_id, hid_report_type_t type,
                           uint8_t const *buffer, uint16_t size) {
  (void)instance;
  if (report_id != 0 || type != HID_REPORT_TYPE_OUTPUT || !sk_parse(buffer, size))
    return;
  uint32_t now = now_ms();
  if (now - rate_start >= 1000) {
    rate_start = now;
    rate_count = 0;
  }
  if (++rate_count > 30)
    return;
  uint8_t op = buffer[4], length = buffer[7], body[4] = {op};
  uint16_t seq = buffer[5] | buffer[6] << 8;
  uint8_t error = 0;
  if ((op == SET_LIGHT || op == SET_BRIGHTNESS) ? length != 1 : length != 0)
    error = 1;
  else
    switch (op) {
    case HELLO:
      reset_input();
      seen_host = true;
      heartbeat = now;
      state = UNKNOWN;
      break;
    case GET_CAPABILITIES:
      body[1] = 0x07;
      body[2] = LED_COUNT;
      body[3] = 64;
      break;
    case GET_STATE:
      body[1] = state;
      body[2] = config.brightness;
      break;
    case SET_LIGHT:
      if (buffer[8] > DISCONNECTED)
        error = 2;
      else
        state = buffer[8];
      break;
    case SET_BRIGHTNESS:
      config.brightness = buffer[8] > 64 ? 64 : buffer[8];
      break;
    case HEARTBEAT:
      seen_host = true;
      heartbeat = now;
      break;
    default:
      error = 3;
      break;
    }
  if (error) {
    uint8_t errors[] = {error, op};
    enqueue(ERROR, seq, errors, 2);
  } else
    enqueue(ACK, seq, body, op == GET_CAPABILITIES ? 4 : op == GET_STATE ? 3 : 1);
}
uint16_t tud_hid_get_report_cb(uint8_t instance, uint8_t report_id, hid_report_type_t type,
                               uint8_t *buffer, uint16_t reqlen) {
  (void)instance;
  (void)report_id;
  (void)type;
  (void)buffer;
  (void)reqlen;
  return 0;
}
void tud_umount_cb(void) {
  state = DISCONNECTED;
  seen_host = false;
  reset_input();
}
void tud_suspend_cb(bool remote_wakeup_en) {
  (void)remote_wakeup_en;
  state = UNKNOWN;
  seen_host = false;
  reset_input();
}
static void buttons(uint32_t now) {
  bool eligible =
      seen_host && tud_mounted() && !tud_suspended() && now - heartbeat < config.expiry_ms;
  unsigned events = sk_input_update(&input_session, eligible, !gpio_get(BUTTON_PIN), now);
  for (uint8_t g = 0; g < 3; g++)
    if (events & (1u << g))
      enqueue(BUTTON_EVENT, button_sequence++, &g, 1);
}
static bool led_power(uint32_t now) {
  static bool powered = false;
  static uint32_t enabled_at = 0;
  bool allowed = tud_mounted() && !tud_suspended();
  if (!allowed) {
    pio_sm_set_enabled(pio, sm, false);
    gpio_set_function(LIGHT_PIN, GPIO_FUNC_SIO);
    gpio_set_dir(LIGHT_PIN, GPIO_OUT);
    gpio_put(LIGHT_PIN, 0);
    gpio_put(LED_ENABLE_PIN, 0);
    pio_sm_clear_fifos(pio, sm);
    pixel = LED_COUNT;
    powered = false;
    return false;
  }
  if (!powered) {
    gpio_put(LED_ENABLE_PIN, 1);
    enabled_at = now;
    powered = true;
    return false;
  }
  // P3: allow the proposed switched 470 uF rail to charge before sending data.
  // 564 uF * 5 V / 232 mA ~= 12.2 ms ideal; 50 ms is a bench starting value.
  // Scope rail startup and DIN on the received assembly before qualification.
  if (now - enabled_at < 50)
    return false;
  pio_gpio_init(pio, LIGHT_PIN);
  pio_sm_set_enabled(pio, sm, true);
  return true;
}
static void lights(uint32_t now) {
  static uint32_t next_frame = 0;
  static bool initialized = false;
  // Stream to PIO only when FIFO has space: USB servicing never waits on LED output.
  if (pixel < LED_COUNT) {
    if (!pio_sm_is_tx_fifo_full(pio, sm))
      pio_sm_put(pio, sm, frame[pixel++]);
    return;
  }
  if (initialized && now - next_frame < 20)
    return;
  initialized = true;
  next_frame = now;
  uint8_t r = 10, g = 10, b = 10;
  unsigned scale = 255;
  switch (state) {
  case RUNNING:
    r = 20;
    g = 80;
    b = 255;
    scale = 50 + (now % 1200 < 600 ? now % 600 : 600 - now % 600) * 205 / 600;
    break;
  case SUCCESS:
    r = 0;
    g = 255;
    b = 60;
    break;
  case FAILURE:
    r = 255;
    g = 10;
    b = 10;
    scale = (now % 1200 < 130 || (now % 1200 >= 260 && now % 1200 < 390)) ? 255 : 20;
    break;
  case CANCELLED:
    r = 240;
    g = 130;
    b = 0;
    break;
  case UNKNOWN:
  case DISCONNECTED:
    r = 80;
    g = 40;
    b = 0;
    scale = now % 2000 < 150 ? 120 : 20;
    break;
  default:
    break;
  }
  if (!tud_mounted() || tud_suspended())
    r = g = b = 0;
  r = (uint32_t)r * config.brightness * scale / 65025;
  g = (uint32_t)g * config.brightness * scale / 65025;
  b = (uint32_t)b * config.brightness * scale / 65025;
  for (unsigned i = 0; i < LED_COUNT; i++)
    frame[i] = ((uint32_t)g << 24) | ((uint32_t)r << 16) | ((uint32_t)b << 8);
  pixel = 0;
}
int main(void) {
  gpio_init(LED_ENABLE_PIN);
  gpio_put(LED_ENABLE_PIN, 0);
  gpio_set_dir(LED_ENABLE_PIN, GPIO_OUT);
  gpio_init(BUTTON_PIN);
  gpio_set_dir(BUTTON_PIN, GPIO_IN);
  gpio_pull_up(BUTTON_PIN);
  unsigned offset = pio_add_program(pio, &ring_program);
  pio_sm_config c = ring_program_get_default_config(offset);
  sm_config_set_sideset_pins(&c, LIGHT_PIN);
  sm_config_set_out_shift(&c, false, true, 24);
  sm_config_set_fifo_join(&c, PIO_FIFO_JOIN_TX);
  sm_config_set_clkdiv(&c, (float)clock_get_hz(clk_sys) / 8000000.f);
  pio_gpio_init(pio, LIGHT_PIN);
  pio_sm_set_consecutive_pindirs(pio, sm, LIGHT_PIN, 1, true);
  pio_sm_init(pio, sm, offset, &c);
  pio_sm_set_enabled(pio, sm, true);
  tusb_init();
  watchdog_enable(2000, true);
  while (true) {
    tud_task();
    uint32_t now = now_ms();
    watchdog_update();
    if (!seen_host || now - heartbeat >= config.expiry_ms) {
      if (seen_host)
        reset_input();
      seen_host = false;
      state = UNKNOWN;
    }
    buttons(now);
    if (led_power(now))
      lights(now);
    if (tud_hid_ready() && tail != head && tud_hid_report(0, queue[tail], 64))
      tail = (tail + 1) % 8;
    tight_loop_contents();
  }
}
