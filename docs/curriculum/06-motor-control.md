# Motor Control

How to control motors in XBot's codebase.

## Motor Controllers in FRC

[Source: SeriouslyCommonLib XCANMotorController](https://github.com/Team488/SeriouslyCommonLib/tree/main/src/main/java/xbot/common/controls/actuators)

| Controller | Protocol | Common Use |
|------------|----------|------------|
| **SparkMax** | CAN / PWM | Simple mechanisms (NEO motors) |
| **TalonFX (Kraken)** | CAN (CANbus) | High-performance (swerve, shooter) |
| **SparkFlex** | CAN | Neo Vortex motors |

## XBot's Wrapper: `XCANMotorController`

[Source: SeriouslyCommonLib XCANMotorController](https://github.com/Team488/SeriouslyCommonLib/tree/main/src/main/java/xbot/common/controls/actuators)

XBot wraps all motor controllers behind a single interface. Your code doesn't care about the hardware brand.

### Creating a Motor

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
XCANMotorController motor = motorFactory.create(
    contract.getDriveMotor(swerveInstance),  // From electrical contract
    "SwerveDrive",                            // Name prefix
    "DrivePID",                               // PID property prefix
    new XCANMotorControllerPIDProperties.Builder()
        .withVelocityFeedForward(0.01)
        .withMaxPowerOutput(1.0)
        .withMinPowerOutput(-1.0)
        .build()
);
```

### Basic Operations

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
// Set power (-1.0 to 1.0)
motor.setPower(0.5);

// Set voltage
motor.setVoltage(Volts.of(6.0));

// Set velocity target (onboard PID)
motor.setRawVelocityTarget(RPM.of(5000), MotorPidMode.DutyCycle, 0);

// Set position target (onboard PID)
motor.setPositionTarget(Rotations.of(10), MotorPidMode.Voltage);

// Read sensors
double velocity = motor.getVelocity().in(RotationsPerSecond);
double position = motor.getPosition().in(Rotations);
```

## SimpleMotorSubsystem

For simple mechanisms (intake rollers, feeders), XBot provides a base class:

[Source: SeriouslyCommonLib SimpleMotorSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/simple/SimpleMotorSubsystem.java)

```java
public class HopperRollerSubsystem extends SimpleMotorSubsystem {
    @Inject
    public HopperRollerSubsystem(
        XCANMotorController.XCANMotorControllerFactory factory,
        ElectricalContract contract,
        PropertyFactory pf) {

        super("HopperRoller", pf, 1.0, -1.0);  // name, properties, fwd, rev

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

### Free Commands

Extending `SimpleMotorSubsystem` gives you these commands for free:

[Source: SeriouslyCommonLib SimpleMotorSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/simple/SimpleMotorSubsystem.java)

| Method | What It Does |
|--------|-------------|
| `getForwardCommand()` | Runs motor forward at configured power |
| `getReverseCommand()` | Runs motor reverse at configured power |
| `getStopCommand()` | Stops the motor |

### Usage

[Source: TeamXbot2026 OperatorCommandMap](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/operator_interface/OperatorCommandMap.java)

```java
// Bind to a button
oi.driverGamepad.a().onTrue(hopperRoller.getForwardCommand());
oi.driverGamepad.a().onFalse(hopperRoller.getStopCommand());
```

## Safety Patterns

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

### Check Before Using

Always check if the device is ready before creating it:

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
if (contract.isElevatorReady()) {
    this.motor = motorFactory.create(...);
}
```

### Use Optional for Safe Access

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
public Optional<XCANMotorController> getMotor() {
    return Optional.ofNullable(this.motor);
}

// Usage
getMotor().ifPresent(m -> m.setPower(0.5));
```

---

## Quiz

**Q1:** Why does XBot wrap all motor controllers behind `XCANMotorController`?

- [ ] A) To make the code slower
- [ ] B) So code doesn't care about hardware brand
- [ ] C) To use more memory
- [ ] D) To prevent students from changing motor power

<details><summary>Answer</summary>B) So code doesn't care about hardware brand</details>

**Q2:** What range does `setPower()` accept?

- [ ] A) 0 to 100
- [ ] B) -12 to 12
- [ ] C) -1.0 to 1.0
- [ ] D) 0 to 1.0

<details><summary>Answer</summary>C) -1.0 to 1.0</details>

**Q3:** What does `SimpleMotorSubsystem` provide for free?

- [ ] A) Auto-tuning PID
- [ ] B) Forward, reverse, and stop commands
- [ ] C) Vision processing
- [ ] D) Swerve kinematics

<details><summary>Answer</summary>B) Forward, reverse, and stop commands</details>
