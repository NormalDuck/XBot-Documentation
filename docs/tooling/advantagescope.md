# AdvantageScope

Data visualization for robot debugging.

## What Is AdvantageScope?

AdvantageScope is XBot's primary data visualization tool. It replaces Shuffleboard for viewing robot data during matches.

## What It Shows

- Robot pose on the field
- Swerve module states (angles and speeds)
- Sensor values (gyro, encoders, lasers)
- Mechanism positions (elevator height, hood angle)
- Match log replay

## Viewing Logs

### Downloading Logs

Logs are saved to `/home/lvuser/logs/` on the roboRIO.

**Windows:**
```powershell
.\fetch-logs.ps1
```

**macOS/Linux:**
```bash
scp admin@roboRIO-488-frc.local:/home/lvuser/logs/*.log ./logs/
```

### Opening Logs

1. Open AdvantageScope
2. Go to **File > Open**
3. Select the `.log` file

## AdvantageKit Logging

XBot uses AdvantageKit for structured logging in subsystems:

```java
// In subsystem periodic()
aKitLog.record("CurrentVelocity", this.getCurrentValue());
aKitLog.record("TargetVelocity", targetVelocity);
aKitLog.record("IsAtGoal", isMaintainerAtGoal());
aKitLog.record("CurrentPose", pose);
```

Logged data appears in AdvantageScope under the subsystem's prefix.

## Key Views

| View | Use For |
|------|---------|
| **Field** | Robot position, path visualization |
| **Swerve** | Individual module states |
| **3D** | Robot mechanism visualization |
| **Graph** | Time-series data (velocity, position, etc.) |
| **Table** | Raw data table view |

## Tips

- Record logs during every practice match
- Compare logs between good and bad runs
- Use the graph view to tune PID values
- Export data as CSV for further analysis
