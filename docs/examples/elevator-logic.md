# Elevator Logic

Full source: [TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

## Overview

The 2025 robot's elevator uses:
- **TalonFX motor** with onboard PID
- **LaserCAN** distance sensor for position feedback
- **Bottom limit switch** for calibration
- **Complimentary filter** to fuse motor + laser readings

## 1. Calibration

The elevator starts uncalibrated. It calibrates when it hits the bottom sensor:

```java
// When bottom sensor is triggered, set zero reference
public boolean tryMarkElevatorCalibratedAgainstLowerLimit() {
    var success = trySetLaserCANOffset() && trySetMotorOffset();
    if (success) {
        isCalibrated = true;
    }
    return success;
}
```

Called in `periodic()` when the bottom sensor is hit:

```java
@Override
public void periodic() {
    // Bandage case: isTouchingBottom flashes true for one tick on startup
    if (this.isTouchingBottom() && periodicTickCounter >= 3 && !isCalibrated()) {
        if (tryMarkElevatorCalibratedAgainstLowerLimit()) {
            setTargetValue(getCurrentValue());
        }
    }
}
```

## 2. Sensor Fusion

Combines LaserCAN (accurate but noisy) with motor encoder (smooth but drifts):

```java
@Override
public Distance getCurrentValue() {
    return Meters.of(sensorFusionFilter.calculateFilteredValue(
        getCalibratedLaserDistance().map(d -> d.in(Meters)).orElse(Double.MAX_VALUE),
        getCalibratedMotorDistance().in(Meters)
    ));
}
```

The complimentary filter weights the two sensors (0.5 = equal weight):

```java
sensorFusionFilter = new ComplimentaryFilter(pf, this.getPrefix(), true, 0.5);
```

## 3. Setting Height Targets

Map game-specific positions to elevator heights:

```java
public void setTargetHeight(Landmarks.CoralLevel value) {
    switch (value) {
        case TWO -> setTargetValue(l2Height.get());
        case THREE -> setTargetValue(l3Height.get().plus(trimValue.get()));
        case FOUR -> setTargetValue(l4Height.get().plus(trimValue.get()));
        case CORAL_COLLECTING -> setTargetValue(humanLoadHeight.get());
        case HIGH_ALGAE -> setTargetValue(highAlgaeRemovalHeight.get());
        case LOW_ALGAE -> setTargetValue(lowAlgaeRemovalHeight.get());
        // ...
    }
}
```

Height presets are stored as properties for easy tuning:

```java
l2Height = pf.createPersistentProperty("l2Height", Inches.of(0.25));
l3Height = pf.createPersistentProperty("l3Height", Inches.of(15.25));
l4Height = pf.createPersistentProperty("l4Height", Inches.of(47.5));
```

## 4. Motion Magic (Trapezoidal Profile)

Smooth acceleration/deceleration instead of instant power changes:

```java
masterMotor.setPositionTarget(
    masterMotor.getPosition().plus(deltaRotations),
    motionMagicEnabled.get()
        ? XCANMotorController.MotorPidMode.TrapezoidalVoltage
        : XCANMotorController.MotorPidMode.Voltage
);
```

Motion Magic constraints are tunable at runtime:

```java
public void configureMotionMagicConstraints() {
    masterMotor.setTrapezoidalProfileAcceleration(
        RadiansPerSecondPerSecond.of(motionMagicAcceleration.get()));
    masterMotor.setTrapezoidalProfileJerk(
        RadiansPerSecondPerSecond.of(motionMagicJerk.get()).per(Second));
}
```

## 5. Soft Limits

Prevents the elevator from going past safe bounds:

```java
@Override
public void setPower(Double power) {
    if (aboveUpperLimit()) {
        power = MathUtils.constrainDouble(power, -1, powerNearUpperLimitThreshold.get());
    }
    if (belowLowerLimit()) {
        power = MathUtils.constrainDouble(power, powerNearLowerLimitThreshold.get(), 1);
    }
    masterMotor.setVoltage(Volts.of(power * 12));
}
```

## 6. Logging

All key values are logged for debugging in AdvantageScope:

```java
aKitLog.record("ElevatorTargetHeight-m", elevatorTargetHeight.in(Meters));
aKitLog.record("ElevatorCurrentHeight-m", getCurrentValue().in(Meters));
aKitLog.record("isElevatorCalibrated", isCalibrated());
aKitLog.record("isElevatorMaintainerAtGoal", this.isMaintainerAtGoal());
```
