# Bounded primary-source research — 2026-09-12

Prices are observed public US-dollar page prices, excluding tax/shipping, not quotes or durable price commitments. SignalKey name/trademark availability is unverified. No novelty/patentability or market demand claim is made.

| Category / product | Observed price | Officially described features | Unresolved comparison |
|---|---:|---|---|
| Stream controller: [Elgato Stream Deck Neo](https://www.elgato.com/us/en/p/stream-deck-neo-black) | $99.99 | Eight LCD keys, Infobar, two Touch Points, profiles and plugin ecosystem | Evaluate actual command-result feedback plugins and setup burden; do not assume SignalKey is unique |
| Status light: [kuando Busylight UC Omega](https://shop.busylight.com/kuando-busylight-uc-omega/) | $54.95 | USB presence light, ringer and platform-dependent call/chat notifications; kuandoHUB | Evaluate developer status APIs and local workflow fit; no one-button comparison tested |
| Programmable keypad building block: [Adafruit NeoKey 1x4 QT](https://www.adafruit.com/product/4980) | $9.95 | Four mechanical-key positions with NeoPixels and I2C interface | Module price excludes complete USB product, keys/caps/controller/enclosure; cannot compare directly to retail finished device |

This is a bounded initial sample, not exhaustive competitive research. A finished programmable macro-pad comparison and hands-on competitor testing remain open.

Software decisions use [Electron security guidance](https://www.electronjs.org/docs/latest/tutorial/security), [Electron release listing](https://releases.electronjs.org/), [Vite requirements](https://vite.dev/guide/), and exact npm registry versions resolved on 2026-09-12. Node 24.16.0 was available; project pins Electron 44.3.0, React 19.3.0, Vite 8.3.0, TypeScript 7.0.2, and other direct dependencies in the lockfile. The installed Electron runtime and node-hid loading are smoke-tested rather than assumed ABI-compatible.

Hardware sources: [Pico datasheet](https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf), [RP2040 hardware design](https://datasheets.raspberrypi.com/rp2040/hardware-design-with-rp2040.pdf), [TinyUSB](https://docs.tinyusb.org/en/latest/), [Adafruit ring](https://www.adafruit.com/product/1643), [AHCT buffer datasheet](https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf), [TPS2553 datasheet](https://www.ti.com/lit/ds/symlink/tps2553.pdf). These establish reference inputs, not an approved circuit.
