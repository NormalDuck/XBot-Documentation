# Simple Motor Subsystem

Full source: [SeriouslyCommonLib SimpleMotorSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/simple/SimpleMotorSubsystem.java)

## Overview

`SimpleMotorSubsystem` is a base class for mechanisms that just need to run a motor forward, reverse, or stop. Examples: intake rollers, feeder wheels, conveyor belts.

## The Base Class

```java
public abstract class SimpleMotorSubsystem extends BaseSubsystem {
    final DoubleProperty forwardPower;
    final DoubleProperty reversePower;

    public SimpleMotorSubsystem(String name, PropertyFactory pf,
                                double defaultForwardPower, double defaultReversePower) {
        setName(name);
        pf.setPrefix(name);
        this.forwardPower = pf.createPersistentProperty("Forward Power", defaultForwardPower);
        this.reversePower = pf.createPersistentProperty("Reverse Power", defaultReversePower);
        setDefaultCommand(getStopCommand());  // Stop when no command is running
    }

    // Subclasses must implement this
    public abstract void setPower(double power);

    // Final methods - cannot be overridden
    public final void setForward() { setPower(forwardPower.get()); }
    public final void setReverse() { setPower(reversePower.get()); }
    public final void stop() { setPower(0); }

    // Built-in commands
    public final Command getForwardCommand() {
        return new NamedRunCommand(name + "-Forward", this::setForward, this);
    }
    public final Command getReverseCommand() {
        return new NamedRunCommand(name + "-Reverse", this::setReverse, this);
    }
    public final Command getStopCommand() {
        return new NamedRunCommand(name + "-Stop", this::stop, this);
    }
}
```

## Creating a Subsystem

```java
public class HopperRollerSubsystem extends SimpleMotorSubsystem {
    private XCANMotorController motor;

    @Inject
    public HopperRollerSubsystem(
        XCANMotorController.XCANMotorControllerFactory factory,
        ElectricalContract contract,
        PropertyFactory pf) {

        super("HopperRoller", pf, 1.0, -1.0);

        if (contract.isHopperRollerReady()) {
            this.motor = factory.create(
                contract.getHopperRollerMotor(),
                this.getPrefix(),
                "HopperRollerPID"
            );
        }
    }

    @Override
    public void setPower(double power) {
        if (motor != null) {
            motor.setPower(power);
        }
    }
}
```

## Using the Built-in Commands

```java
// In OperatorCommandMap
oi.driverGamepad.b().onTrue(hopperRoller.getForwardCommand());
oi.driverGamepad.b().onFalse(hopperRoller.getStopCommand());

oi.driverGamepad.y().onTrue(hopperRoller.getReverseCommand());
oi.driverGamepad.y().onFalse(hopperRoller.getStopCommand());
```

## Tuning Power at Runtime

The forward and reverse power values are stored as properties:

```java
// Default: forward = 1.0, reverse = -1.0
super("HopperRoller", pf, 1.0, -1.0);

// Change at runtime via AdvantageKit/SmartDashboard:
// "HopperRoller/Forward Power" -> 0.5 (slower)
// "HopperRoller/Reverse Power" -> -0.3 (even slower)
```
