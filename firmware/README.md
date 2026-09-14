# RP2040 engineering baseline — firmware 0.0.3, protocol 1.0

The actual RP2040 application compiles and links with pinned Pico SDK 2.2.0, TinyUSB commit 86ad6e56 and Arm GNU 14.3.Rel1. The check uses invalid USB identifiers 0:0 and generates no application UF2. Never flash its scratch ELF. No physical testing or deployable firmware release is claimed. Three native C tests cover framing, gestures and reconnect session behavior.

Target: official Raspberry Pi **Pico H**, RP2040, preinstalled headers, **Micro-USB** connector. The custom proposal uses USB-C. GP3 input to a normally open switch to GND; GP2 is GRB 800 kHz data through a 5 V AHCT buffer to a candidate 12-pixel ring. Review `hardware/prototype/README.md` before connecting power.

Local reproducible build verification (requires Git, CMake and Python; downloads portable tools into `.local`):

```powershell
powershell -File scripts/setup-firmware-tools.ps1
powershell -File scripts/build-firmware-check.ps1
powershell -File scripts/test-firmware.ps1
```

`toolchain-lock.json` pins the SDK/submodule and official download hashes. The build wrapper checks SDK revisions and emits `docs/evidence/arm-firmware-build.json`. This verifies compilation/linking, not USB signaling, waveform timing, suspend current or physical behavior. The checker hashes archives; it does not continuously attest extracted executables. No user device is opened or flashed.

For a later device build, use a separate build directory and authorized numeric USB IDs. The default build still refuses missing identifiers; zero/FFFF are rejected. `SIGNALKEY_BUILD_CHECK` is explicitly off by default. Real UF2 output additionally needs the matching official picotool. Its setup/UF2 generation is not yet verified.
```powershell
$env:PICO_SDK_PATH='C:\path\to\pico-sdk'
cmake -S firmware -B firmware/build -G Ninja -DPICO_BOARD=pico -DSIGNALKEY_USB_VID=<authorized-VID> -DSIGNALKEY_USB_PID=<authorized-PID>
cmake --build firmware/build
```

The identifier placeholders must be replaced by numbers you are entitled to use; CMake intentionally refuses to invent them. Hold BOOTSEL while connecting Micro-USB, then copy the built UF2 to the RP2040 boot volume. Keep BOOTSEL physically accessible; RUN-to-GND reset access is part of the enclosure review. Automatic updates, signatures, secure boot, rollback and power-loss-safe application updates are not implemented.

The source implements a 20 ms debounce, 300 ms window from first debounced release to second debounced press, and 800 ms hold threshold. A hold suppresses its release event; a single press waits for the double window, so the proposed <100 ms acknowledgement target **does not include gesture disambiguation and is not yet measured**. Double press is generated on second release. A held second press consumes the pending single. Buttons are events only; firmware never sees a command to execute.

PIO drives bounded 20 ms frames without waiting on the FIFO. Maximum channel brightness is 64/255, but software clamping is **not a hardware current limiter**. GP4 now controls the proposed default-off LED rail. Before configuration and during suspend, the source disables PIO output, drives data low, and turns GP4 off. On enable it waits 1 ms before data resumes. The hardware gate and startup timing are untested. The descriptor requests 500 mA when configured; full-device suspend current still requires MCU low-power work and measurement. This baseline is not USB power compliant merely because it enumerates. A controlled LED supply is required on the custom PCB.

Heartbeats use wrap-safe elapsed unsigned milliseconds (2 s host interval, 6 s device expiry). Watchdog is 2 s. Session/config defaults live in a versioned RAM record; flash persistence is deferred deliberately to avoid unreviewed flash erases. USB identity uses Pico SDK flash unique ID prefixed SK-; verify every physical serial for uniqueness. Firmware replies use a seven-slot usable queue; overflow/rate excess drops reports and host times out. Commands are idempotent; no host command retry or action replay occurs.

Required next verification: authorized-ID UF2 generation; physical TinyUSB descriptor inspection; logic-analyzer waveform; physical button timing; current/suspend limits; host removal/reconnect; queue overflow; watchdog recovery. Native C golden/malformed-report and gesture debounce/precedence/wrap tests passed. Pico SDK integration and ARM linking are separately verified. Physical USB behavior remains untested.

GP4 is Pico header pin 6, proposed to TPS2553 EN with external default-off pulldown. See the E1 power budget before designing this circuit. Native logic tests: `powershell -File scripts/test-firmware.ps1` using the project-local Zig tool or `SIGNALKEY_ZIG`.


New-session input policy: disconnect, suspend, heartbeat expiry and HELLO discard queued replies/events and reset pending gestures. Input is accepted only with a configured, awake USB connection and fresh host heartbeat. Each session must first observe 20 ms of released button state; holding the button across reconnect cannot execute a workflow. A new press after release uses the normal gesture timing. Firmware reads the clock after `tud_task()` so a callback cannot set a heartbeat later than the loop timestamp and cause unsigned expiry underflow.

The compiler caught and fixed reserved PIO label `zero`; it is now `bit_zero`. TinyUSB's SDK-provided OS setting is preserved to avoid a macro conflict. Board logic remains RP2040/Pico-specific; Pico W/Pico 2 variants are not supported by this evidence.
