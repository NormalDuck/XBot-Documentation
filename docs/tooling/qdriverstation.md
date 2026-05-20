# QDriverStation

Driver station alternative for macOS and Linux.

## The Problem

The official FRC Driver Station only runs on **Windows**. Mac and Linux users need an alternative.

## Installation

### macOS

```bash
brew install qdriverstation
```

### Linux

Follow the [installation guide](https://github.com/FRC-Utilities/QDriverStation).

## Setup

1. Connect to the robot network (roboRIO USB or WiFi)
2. Open QDriverStation
3. Set team number to **488**
4. Click **Start** - it will auto-connect to the robot

## Features

| Feature | Supported |
|---------|-----------|
| Enable/Disable robot | Yes |
| Set alliance color | Yes |
| Display match info | Yes |
| Joystick support | Yes |
| FRC Game Tools | No |
| DS Log Viewer | Limited |

## Limitations

- No FRC Game Tools integration
- May have compatibility issues with newer FRC versions
- No built-in log viewer (use AdvantageScope instead)
- Windows DS is recommended when available

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Can't connect to robot | Verify network connection, check team number |
| Joystick not detected | Check USB connection, restart QDriverStation |
| Robot won't enable | Check robot code is deployed and running |

## Alternative: Use Windows

If possible, use a Windows laptop with the official FRC Driver Station for the most reliable experience.
