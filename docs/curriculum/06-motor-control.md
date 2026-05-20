# Motor Control

How to control motors in XBot's codebase.

## Motor Controllers in FRC

[Source: SeriouslyCommonLib XCANMotorController](https://github.com/Team488/SeriouslyCommonLib/tree/main/src/main/java/xbot/common/controls/actuators)

| Controller | Protocol | Common Use |
|------------|----------|------------|
| **SparkMax** | CAN / PWM | Simple mechanisms (NEO motors) |
| **TalonFX (Kraken)** | CAN (CANbus) | High-performance (swerve, shooter) |
| **SparkFlex** | CAN | Neo Vortex motors |

<details>
<summary><strong>What is CAN?</strong></summary>

**CAN** stands for **Controller Area Network**. It is a communication protocol that lets devices talk to each other over a single cable.

**Think of it like this:** Imagine a group chat on your phone. Instead of each person needing a separate phone line to talk to everyone else, everyone is in one group chat and can send messages to any person by mentioning their name. CAN works the same way -- all your motor controllers, sensors, and the roboRIO are on one "group chat" (the CAN bus), and the roboRIO sends messages like "SparkMax on port 3, spin at 50% power."

**Why use CAN instead of regular wires?**

| | PWM (old way) | CAN (modern way) |
|---|---|---|
| Cables needed | One per motor | One cable for ALL devices |
| Signal quality | Degrades over distance | Stays clean |
| Feedback | No way to know if motor actually moved | Motor reports back its speed, position, temperature |
| Wiring mess | Lots of wires | Clean, single cable |

**In FRC:** CAN cables look like thick phone cables (RJ45 connectors). You daisy-chain them from the roboRIO to each motor controller.

</details>

<details>
<summary><strong>What is the roboRIO?</strong></summary>

The **roboRIO** is the "brain" of the robot. It is a small computer made by NI (National Instruments) that runs your Java code and controls everything on the robot.

**Analogy:** If the robot were a human body:
- The **roboRIO** is the brain (makes decisions)
- **Motor controllers** are the muscles (do the work)
- **CAN bus** is the nervous system (carries signals)
- **Sensors** are the eyes and ears (send information back)

The roboRIO has slots for CAN, USB, Ethernet, and other connections. Your Java code runs on the roboRIO, and it sends commands to motor controllers over the CAN bus.

</details>

## XBot's Wrapper: `XCANMotorController`

[Source: SeriouslyCommonLib XCANMotorController](https://github.com/Team488/SeriouslyCommonLib/tree/main/src/main/java/xbot/common/controls/actuators)

XBot wraps all motor controllers behind a single interface. Your code doesn't care about the hardware brand.

<details>
<summary><strong>Why use a wrapper? (The "Universal Remote" analogy)</strong></summary>

Imagine you have a TV, a soundbar, and a streaming box. Each has its own remote. That is annoying, right?

Now imagine a **universal remote** that works with all three devices. You press "power" and it figures out which device needs the signal.

`XCANMotorController` is the universal remote for motors:

```
Without wrapper (messy):
  if (motor is SparkMax) {
      sparkMax.set(speed);
  } else if (motor is TalonFX) {
      talonFX.set(ControlMode.PercentOutput, speed);
  } else if (motor is SparkFlex) {
      sparkFlex.set(speed);
  }

With wrapper (clean):
  motor.setPower(speed);  // Works no matter what brand!
```

**Why this matters for your team:**
- The electrical team might swap motor controllers mid-season
- Your code does not need to change
- New students only need to learn ONE way to control motors

</details>

### Creating a Motor

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
// Create a motor controller using the factory pattern
// The factory handles all the complex setup behind the scenes
XCANMotorController motor = motorFactory.create(
    contract.getDriveMotor(swerveInstance),  // Gets motor info from electrical contract (port, name, type)
    "SwerveDrive",                            // Name prefix - helps identify this motor in logs and dashboards
    "DrivePID",                               // PID property prefix - used for tuning values at runtime
    new XCANMotorControllerPIDProperties.Builder()
        .withVelocityFeedForward(0.01)        // Small constant power to overcome friction when moving
        .withMaxPowerOutput(1.0)              // Maximum power (100%) - safety limit
        .withMinPowerOutput(-1.0)             // Minimum power (-100%) - safety limit
        .build()
);
```

<details>
<summary><strong>What is a "factory" in programming?</strong></summary>

A **factory** is a design pattern where instead of creating objects directly with `new`, you ask a factory object to create it for you.

**Analogy:** Think of a car factory. You do not build a car yourself -- you go to a factory and say "I want a red sedan" and they handle all the complex steps (welding, painting, assembly) and hand you the finished car.

```java
// Without factory (you do everything):
SparkMax motor = new SparkMax(1);
motor.configurePID(0.5, 0, 0);
motor.setInverted(true);
motor.setNeutralMode(NeutralMode.Brake);
// ... 10 more setup steps ...

// With factory (one line):
XCANMotorController motor = factory.create(contract.getMotor(), "Name", "PID", properties);
```

The factory handles all the boring setup so you can focus on robot behavior.

</details>

### Basic Operations

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
// Set power as a percentage (-1.0 = full reverse, 0 = stopped, 1.0 = full forward)
// Think of this like a gas pedal: -100% to +100%
motor.setPower(0.5);

// Set a specific voltage (more precise than power percentage)
// 12 volts = full battery, 6 volts = half power
motor.setVoltage(Volts.of(6.0));

// Set velocity target - the motor controller's built-in PID will maintain this speed
// RPM = Rotations Per Minute, like a car's tachometer
// MotorPidMode.DutyCycle means use percentage-based output (0 to 1)
// The last parameter (0) is the PID slot - advanced, just use 0 for now
motor.setRawVelocityTarget(RPM.of(5000), MotorPidMode.DutyCycle, 0);

// Set position target - tell the motor to move to a specific rotation count
// Useful for elevators, arms, anything that needs to go to an exact position
// MotorPidMode.Voltage means the PID outputs voltage values
motor.setPositionTarget(Rotations.of(10), MotorPidMode.Voltage);

// Read the built-in encoder (sensor that tracks rotation)
// getVelocity() returns how fast the motor is spinning right now
double velocity = motor.getVelocity().in(RotationsPerSecond);

// getPosition() returns total rotations since the motor was last reset
// This is like an odometer in a car - it keeps counting
double position = motor.getPosition().in(Rotations);
```

<details>
<summary><strong>What is the difference between setPower() and setVoltage()?</strong></summary>

Both control motor speed, but they work differently:

| | `setPower(0.5)` | `setVoltage(6.0)` |
|---|---|---|
| **What it means** | 50% of maximum output | Exactly 6 volts |
| **Battery dependent?** | Yes -- 50% of a dead battery is less than 50% of a full battery | No -- always tries to output 6V regardless of battery level |
| **When to use** | Simple mechanisms where precision does not matter much | When you need consistent behavior (swerve drive, shooters) |
| **Analogy** | "Press the gas pedal halfway" | "Drive at exactly 30 mph" |

**Recommendation:** Use `setVoltage()` for mechanisms that need precision (shooters, swerve). Use `setPower()` for simple things like intake rollers.

</details>

<details>
<summary><strong>What is an encoder?</strong></summary>

An **encoder** is a sensor attached to the motor that measures:
- **Position:** How many rotations the motor has turned (like an odometer)
- **Velocity:** How fast the motor is spinning right now (like a speedometer)

**Analogy:** Imagine a wheel with lines drawn on it, and a camera counting how many lines pass by. That is essentially how an encoder works.

```
Motor shaft rotates → Encoder counts ticks → Your code gets position and velocity
```

**Why encoders matter:**
- Without an encoder: "Spin the motor at 50% power" (hope it goes the right distance)
- With an encoder: "Move the motor exactly 10 rotations" (precise control)

XBot's motor controllers have **built-in encoders**, so you do not need to wire up separate sensors.

</details>

## SimpleMotorSubsystem

For simple mechanisms (intake rollers, feeders), XBot provides a base class:

[Source: SeriouslyCommonLib SimpleMotorSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/simple/SimpleMotorSubsystem.java)

<details>
<summary><strong>What is a "base class" and why extend it?</strong></summary>

A **base class** (or parent class) is a class that provides common functionality that other classes can inherit.

**Analogy:** Think of a base class like a "template" for a resume. The template already has sections for "Education," "Experience," and "Skills." You just fill in your specific details instead of creating the whole structure from scratch.

```java
// SimpleMotorSubsystem provides these for free:
//   - A motor field
//   - Forward/reverse/stop commands
//   - Safety checks
//   - Logging

// You ONLY need to provide:
//   - Which motor to use
//   - Any special behavior for your mechanism
```

By extending `SimpleMotorSubsystem`, you get all that functionality without writing it yourself. This is called **inheritance**.

</details>

```java
// HopperRollerSubsystem controls the rollers that move game pieces into the shooter
// It extends SimpleMotorSubsystem to get basic motor functionality for free
public class HopperRollerSubsystem extends SimpleMotorSubsystem {
    @Inject  // Tells Dagger (dependency injection) to provide these parameters automatically
    public HopperRollerSubsystem(
        XCANMotorController.XCANMotorControllerFactory factory,  // Creates motor controllers
        ElectricalContract contract,                              // Tells us which ports motors are on
        PropertyFactory pf) {                                     // Creates tunable properties

        // Call the parent constructor with:
        //   "HopperRoller" = name used in logs and dashboard
        //   pf = property factory for tunable values
        //   1.0 = maximum forward power (100%)
        //   -1.0 = maximum reverse power (-100%)
        super("HopperRoller", pf, 1.0, -1.0);

        // Check if the electrical contract says this motor is wired and ready
        // This prevents crashes if the motor is not connected during testing
        if (contract.isHopperRollerReady()) {
            // Create the motor controller using the factory
            // this.getPrefix() returns "HopperRoller" (set by super constructor)
            this.motor = factory.create(
                contract.getHopperRollerMotor(),  // Gets port number and type from contract
                this.getPrefix(),                  // "HopperRoller" - name prefix
                "HopperRollerPID"                  // PID property prefix for tuning
            );
        }
    }

    // Override setPower to add a safety check
    // @Override means we are replacing the parent class's version of this method
    @Override
    public void setPower(double power) {
        // Only try to set power if the motor was actually created
        // If the motor was not ready, motor would be null and this prevents a crash
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

<details>
<summary><strong>How do "free commands" work?</strong></summary>

When you extend `SimpleMotorSubsystem`, the parent class automatically creates `Command` objects for basic operations. This saves you from writing a separate command class for every simple motor.

**Without free commands (more work):**
```java
// You would need to write this for EVERY motor:
public class HopperForwardCommand extends Command {
    private final HopperRollerSubsystem hopper;
    public HopperForwardCommand(HopperRollerSubsystem hopper) {
        this.hopper = hopper;
        addRequirements(hopper);
    }
    @Override
    public void initialize() { hopper.setPower(1.0); }
    @Override
    public void end(boolean interrupted) { hopper.setPower(0); }
}
```

**With free commands (one line):**
```java
// Already exists! Just use it:
hopperRoller.getForwardCommand();
```

**When to use free commands:** Simple on/off mechanisms (intakes, feeders, conveyors).
**When to write your own command:** Anything that needs PID, multiple steps, or complex logic.

</details>

### Usage

[Source: TeamXbot2026 OperatorCommandMap](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/operator_interface/OperatorCommandMap.java)

```java
// Bind the forward command to the A button on the driver gamepad
// When the driver presses A, the hopper roller starts running forward
oi.driverGamepad.a().onTrue(hopperRoller.getForwardCommand());

// When the driver releases A, stop the hopper roller
// This is important! Without this, the motor would keep running forever
oi.driverGamepad.a().onFalse(hopperRoller.getStopCommand());
```

<details>
<summary><strong>What does onTrue() and onFalse() actually do?</strong></summary>

These are **event triggers** from WPILib's button binding system:

```
Button state:  [released] ----[pressed]----[released]----
                     ↑              ↑
                  onFalse       onTrue
               fires here     fires here
```

- `onTrue(command)` -- schedules the command when the button is **first pressed**
- `onFalse(command)` -- schedules the command when the button is **released**
- `whileTrue(command)` -- keeps the command running while the button is held (cancels on release)
- `toggleOnTrue(command)` -- toggles the command on/off each time you press

**Common pattern for simple mechanisms:**
```java
// Press A to start, release A to stop
button.onTrue(subsystem.getForwardCommand());
button.onFalse(subsystem.getStopCommand());

// Press B to toggle (good for things that stay on)
button.toggleOnTrue(subsystem.getForwardCommand());
```

</details>

## Safety Patterns

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

### Check Before Using

Always check if the device is ready before creating it:

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
// Check if the elevator motor is wired and configured in the electrical contract
// If not, the motor variable stays null and the subsystem still works (just does nothing)
if (contract.isElevatorReady()) {
    this.motor = motorFactory.create(...);
}
```

<details>
<summary><strong>Why check if a device is ready?</strong></summary>

During the season, you might be testing code on a robot that is not fully wired. If your code tries to create a motor controller for a port that has nothing connected, it can crash the entire robot program.

**Scenario:** You are at a competition and the elevator motor cable comes loose. Without the readiness check, your code crashes and the whole robot stops working. With the check, only the elevator stops -- the drive team can still drive.

```java
// BAD: No check, will crash if motor is not connected
this.motor = factory.create(contract.getElevatorMotor(), ...);

// GOOD: Checks first, robot survives if motor is missing
if (contract.isElevatorReady()) {
    this.motor = factory.create(contract.getElevatorMotor(), ...);
}
```

This is called **defensive programming** -- writing code that handles problems gracefully instead of crashing.

</details>

### Use Optional for Safe Access

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
// Return an Optional that may or may not contain the motor
// Optional is a Java class that forces callers to handle the "might be null" case
public Optional<XCANMotorController> getMotor() {
    return Optional.ofNullable(this.motor);  // Wraps motor in Optional (empty if motor is null)
}

// Usage: ifPresent() only runs the code inside if the motor exists
// If motor is null, nothing happens (no crash!)
getMotor().ifPresent(m -> m.setPower(0.5));
```

<details>
<summary><strong>What is Optional and why use it?</strong></summary>

`Optional` is a Java class that represents "a value that might not be there."

**The problem it solves:** In Java, accessing a `null` variable causes a `NullPointerException` and crashes your program. `Optional` forces you to handle the "might be null" case.

**Analogy:** Think of `Optional` like a gift box:
- The box might contain a gift (the motor), or it might be empty
- You cannot use the gift until you open the box and check
- This prevents the embarrassment of assuming there is a gift when there is not

```java
// Without Optional (dangerous - can crash):
XCANMotorController motor = getMotor();
motor.setPower(0.5);  // CRASH if motor is null!

// With Optional (safe - handles both cases):
getMotor().ifPresent(motor -> motor.setPower(0.5));  // Does nothing if motor is null

// You can also provide a fallback:
getMotor().ifPresentOrElse(
    motor -> motor.setPower(0.5),     // If motor exists, set power
    () -> System.out.println("Motor not connected!")  // If not, print a message
);
```

**When to use Optional:** Whenever a value might legitimately be absent (hardware not connected, configuration missing, etc.)

</details>

---

## Quiz

**Q1:** Why does XBot wrap all motor controllers behind `XCANMotorController`?

- [ ] A) To make the code slower
- [ ] B) So code does not care about hardware brand
- [ ] C) To use more memory
- [ ] D) To prevent students from changing motor power

<details>
<summary>Answer</summary>

**B) So code does not care about hardware brand**

**Why:** The wrapper pattern creates a single interface that works with any motor controller (SparkMax, TalonFX, SparkFlex). This means if the electrical team swaps out a motor controller, the rest of the code does not need to change. Think of it like a universal phone charger that works with any brand -- you do not need a different charger for each phone.

</details>

**Q2:** What range does `setPower()` accept?

- [ ] A) 0 to 100
- [ ] B) -12 to 12
- [ ] C) -1.0 to 1.0
- [ ] D) 0 to 1.0

<details>
<summary>Answer</summary>

**C) -1.0 to 1.0**

**Why:** `setPower()` uses a normalized scale where -1.0 means full reverse, 0 means stopped, and 1.0 means full forward. This is a common convention in robotics because it is unitless and works the same regardless of battery voltage. Option A (0 to 100) is a percentage scale some libraries use, and option B (-12 to 12) would be a voltage range, but XBot's `setPower()` specifically uses -1.0 to 1.0.

</details>

**Q3:** What does `SimpleMotorSubsystem` provide for free?

- [ ] A) Auto-tuning PID
- [ ] B) Forward, reverse, and stop commands
- [ ] C) Vision processing
- [ ] D) Swerve kinematics

<details>
<summary>Answer</summary>

**B) Forward, reverse, and stop commands**

**Why:** `SimpleMotorSubsystem` is a base class designed for simple mechanisms that just need to spin forward, reverse, or stop. It provides `getForwardCommand()`, `getReverseCommand()`, and `getStopCommand()` out of the box so you do not need to write separate command classes for basic motor control. Options A, C, and D are much more complex features that require their own specialized classes -- they are not part of a "simple" motor subsystem.

</details>
