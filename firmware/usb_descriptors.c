#include "tusb.h"
#include "pico/unique_id.h"
#include <stdio.h>
#include <string.h>
static const tusb_desc_device_t descriptor = {.bLength = sizeof(tusb_desc_device_t),
                                              .bDescriptorType = TUSB_DESC_DEVICE,
                                              .bcdUSB = 0x0200,
                                              .bDeviceClass = 0,
                                              .bDeviceSubClass = 0,
                                              .bDeviceProtocol = 0,
                                              .bMaxPacketSize0 = 64,
                                              .idVendor = SIGNALKEY_USB_VID,
                                              .idProduct = SIGNALKEY_USB_PID,
                                              .bcdDevice = 0x0001,
                                              .iManufacturer = 1,
                                              .iProduct = 2,
                                              .iSerialNumber = 3,
                                              .bNumConfigurations = 1};
uint8_t const *tud_descriptor_device_cb(void) {
  return (const uint8_t *)&descriptor;
}
// Vendor page FF00, usage 1; unnumbered 64-byte input and output reports.
static const uint8_t report[] = {0x06, 0x00, 0xff, 0x09, 0x01, 0xa1, 0x01, 0x15, 0x00,
                                 0x26, 0xff, 0x00, 0x75, 0x08, 0x95, 0x40, 0x09, 0x01,
                                 0x81, 0x02, 0x95, 0x40, 0x09, 0x01, 0x91, 0x02, 0xc0};
uint8_t const *tud_hid_descriptor_report_cb(uint8_t instance) {
  (void)instance;
  return report;
}
// Engineering high-power request; actual compliance depends on measured hardware.
static const uint8_t configuration[] = {
    TUD_CONFIG_DESCRIPTOR(1, 1, 0, TUD_CONFIG_DESC_LEN + TUD_HID_INOUT_DESC_LEN, 0, 500),
    TUD_HID_INOUT_DESCRIPTOR(0, 0, HID_ITF_PROTOCOL_NONE, sizeof(report), 0x01, 0x81, 64, 2)};
uint8_t const *tud_descriptor_configuration_cb(uint8_t index) {
  (void)index;
  return configuration;
}
uint16_t const *tud_descriptor_string_cb(uint8_t index, uint16_t langid) {
  (void)langid;
  static uint16_t out[64];
  static char serial[40];
  if (index == 0) {
    out[0] = (TUSB_DESC_STRING << 8) | 4;
    out[1] = 0x0409;
    return out;
  }
  if (!serial[0]) {
    char id[PICO_UNIQUE_BOARD_ID_SIZE_BYTES * 2 + 1];
    pico_get_unique_board_id_string(id, sizeof(id));
    snprintf(serial, sizeof(serial), "SK-%s", id);
  }
  const char *s = index == 1   ? "Magnexis"
                  : index == 2 ? "SignalKey engineering prototype"
                  : index == 3 ? serial
                               : NULL;
  if (!s)
    return NULL;
  size_t n = strlen(s);
  if (n > 63)
    n = 63;
  for (size_t i = 0; i < n; i++)
    out[i + 1] = (uint8_t)s[i];
  out[0] = (TUSB_DESC_STRING << 8) | (2 * n + 2);
  return out;
}
