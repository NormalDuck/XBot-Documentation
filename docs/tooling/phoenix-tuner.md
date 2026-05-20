# Phoenix Tuner

Configure CTRE devices (TalonFX, CANcoder, Pigeon).

## What Is Phoenix Tuner?

Phoenix Tuner is CTRE's tool for configuring and diagnosing their devices. It connects to devices on the CAN bus.

## Installation

Download from the [CTRE website](https://store.ctr-electronics.com/software/). Available for Windows, macOS, and Linux.

## Features

| Feature | Description |
|---------|-------------|
| **Device Discovery** | Find all CTRE devices on the CAN bus |
| **Firmware Update** | Update device firmware to the latest version |
| **Self Test** | Verify device health and connectivity |
| **Tune PID** | Tune onboard PID gains in real-time |
| **Configure Limits** | Set soft/hard forward and reverse limits |
| **Signal Logging** | Record sensor data for analysis |

## Workflow

1. Connect to the robot network (USB or WiFi)
2. Open Phoenix Tuner
3. Select the device on the CAN bus
4. Configure parameters (PID, limits, current limits)
5. **Save to device flash** (persists without code)

## When to Use Phoenix Tuner

| Task | Use Phoenix Tuner? |
|------|-------------------|
| Set CAN ID | Yes (or use code) |
| Update firmware | Yes |
| Tune onboard PID | Yes (faster than code iteration) |
| Set current limits | Yes |
| Check device health | Yes |
| Configure swerve offsets | Yes (CANCoder) |

## Swerve Module Setup

For each swerve module:
1. Find the CANcoder in Phoenix Tuner
2. Rotate the wheel to a known angle (pointing forward)
3. Set the **absolute sensor offset** to zero
4. Save to flash

This ensures all modules start at a known orientation.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Device not found | Check CAN wiring, verify CAN ID |
| Firmware update fails | Power cycle the device, retry |
| PID tuning not working | Verify motor is connected and enabled |
