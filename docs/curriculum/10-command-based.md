# Command-Based Programming

WPILib's framework for organizing robot behavior.

## Core Concepts

[Source: WPILib Command-Based](https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html)

| Concept | Description |
|---------|-------------|
| **Subsystem** | A physical mechanism on the robot (drive, shooter, elevator) |
| **Command** | An action that runs on one or more subsystems |
| **Requirement** | A command claims the subsystems it needs |

<details>
<summary><strong>What is Command-Based Programming?</strong></summary>

**Command-Based Programming** is WPILib's recommended way to organize robot code. Instead of writing everything in one big file, you break behavior into small, reusable "commands" that run on "subsystems."

**Analogy:** Think of a restaurant:
- **Subsystems** = kitchen stations (grill, prep, dishwasher)
- **Commands** = recipes (make burger, make salad)
- **Requirements** = a recipe claims the stations it needs (burger needs grill, salad needs prep)

**Why use it:**
- Commands are reusable (use the same "shoot" command in auto and teleop)
- Commands cannot conflict (two commands cannot claim the same subsystem)
- Easy to combine (run commands in sequence or parallel)
- Easy to test (test each command independently)

</details>

## Subsystem

[Source: TeamXbot2026 ShooterSubsystem](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/ShooterSubsystem.java)

```java
// ShooterSubsystem controls the shooter mechanism
// Extends BaseSubsystem to get common functionality (logging, periodic calls)
public class ShooterSubsystem extends BaseSubsystem {
    private final XCANMotorController motor;  // The shooter motor

    // @Inject tells Dagger to provide these dependencies
    @Inject
    public ShooterSubsystem(XCANMotorControllerFactory factory, ElectricalContract contract) {
        // Only create the motor if the electrical contract says it is wired
        if (contract.isShooterReady()) {
            this.motor = factory.create(contract.getShooterMotor(), ...);
        }
    }

    // Public method: other code calls this to tell the shooter what to do
    // Sets the target RPM - the motor's onboard PID will maintain this speed
    public void setTargetVelocity(double rpm) {
        motor.setRawVelocityTarget(RPM.of(rpm), MotorPidMode.DutyCycle, 0);
    }

    // periodic() is called automatically every ~20ms (50 times per second)
    // Use it for continuous tasks: reading sensors, updating dashboard, safety checks
    @Override
    public void periodic() {
        // Called every ~20ms while the robot is enabled
        // Example: log current velocity to dashboard
    }
}
```

## Command

[Source: TeamXbot2026 ShooterFireCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/commands/ShooterOutputCommand.java)

```java
// ShooterFireCommand is a specific action: fire the shooter
// Extends BaseCommand to get common command functionality
public class ShooterFireCommand extends BaseCommand {
    private final ShooterSubsystem shooter;  // The subsystem this command controls

    // @Inject tells Dagger to provide the shooter subsystem
    @Inject
    public ShooterFireCommand(ShooterSubsystem shooter) {
        this.shooter = shooter;
        addRequirements(shooter);  // Claims the shooter - no other command can use it while this runs
    }

    // initialize() runs once when the command starts
    // Use it for one-time setup: set targets, reset sensors, start motors
    @Override
    public void initialize() {
        shooter.setTargetVelocity(5000);  // Set shooter to 5000 RPM
    }

    // isFinished() is checked every loop
    // Return true when the command's job is done
    // Return false to keep the command running
    @Override
    public boolean isFinished() {
        return shooter.isAtTargetVelocity();  // Command ends when shooter reaches target speed
    }
}
```

### Command Lifecycle

[Source: SeriouslyCommonLib BaseCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseCommand.java)

```
initialize()  →  execute()  →  isFinished()?  →  end()
                   (every loop)    No: repeat
                                   Yes: end()
```

| Method | When It Runs | What to Put Here |
|--------|-------------|-----------------|
| `initialize()` | Once when the command starts | Set targets, reset sensors, start motors |
| `execute()` | Every loop (~20ms) while running | Continuous actions (usually not needed for simple commands) |
| `isFinished()` | Every loop - return `true` to end | Check if the goal is reached |
| `end(boolean interrupted)` | Once when the command ends | Clean up, stop motors, log results |

<details>
<summary><strong>Walkthrough: What happens when a command runs?</strong></summary>

Let us trace `ShooterFireCommand` from start to finish:

```
1. Driver presses A button → command is scheduled

2. initialize() runs:
   shooter.setTargetVelocity(5000);
   // Shooter motor starts spinning up

3. execute() runs (every 20ms):
   // This command does not override execute(), so nothing happens here
   // The motor's onboard PID is handling the speed control

4. isFinished() runs (every 20ms):
   return shooter.isAtTargetVelocity();
   // First few times: false (shooter not at 5000 RPM yet)
   // After ~1 second: true (shooter reached target)

5. end(false) runs:
   // Command is done! The shooter is at target speed.
   // Another command (like a feeder command) can now fire the game piece.
```

**What if interrupted?** If another command claims the shooter while this is running, `end(true)` is called with `interrupted = true`. This lets you handle the interruption (maybe stop the shooter).

</details>

## Binding Commands to Buttons

[Source: TeamXbot2026 OperatorCommandMap](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/operator_interface/OperatorCommandMap.java)

```java
// In OperatorCommandMap.java
// This class connects gamepad buttons to commands
@Inject
public OperatorCommandMap(
    OperatorInterface oi,        // The gamepad/controller
    ShooterFireCommand fire,     // Command to fire the shooter
    ShooterStopCommand stop) {   // Command to stop the shooter

    // When the A button is pressed, schedule the fire command
    oi.driverGamepad.a().onTrue(fire);

    // When the A button is released, schedule the stop command
    oi.driverGamepad.a().onFalse(stop);
}
```

<details>
<summary><strong>What is OperatorInterface?</strong></summary>

**OperatorInterface** (often abbreviated as `oi`) represents the driver and operator gamepads. It provides access to buttons, joysticks, and triggers.

```java
// Common button bindings:
oi.driverGamepad.a()          // A button
oi.driverGamepad.b()          // B button
oi.driverGamepad.x()          // X button
oi.driverGamepad.y()          // Y button
oi.driverGamepad.leftBumper() // Left bumper
oi.driverGamepad.rightTrigger() // Right trigger (has a value 0-1)

// Joystick axes (return values from -1.0 to 1.0):
oi.driverGamepad.getLeftY()   // Left stick up/down
oi.driverGamepad.getLeftX()   // Left stick left/right
oi.driverGamepad.getRightX()  // Right stick left/right
```

</details>

## Command Groups

### Sequential (one after another)

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

```java
// Commands run one at a time, in order
// Next command starts only after the previous one finishes
new SequentialCommandGroup(
    new IntakeDeployExtendCommand(),  // 1. Deploy the intake (waits until done)
    new WaitCommand(0.5),             // 2. Wait 0.5 seconds (gives intake time to settle)
    new ShooterFireCommand()          // 3. Fire the shooter (starts after wait)
);
```

### Parallel (at the same time)

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

```java
// Commands run simultaneously
// Group finishes when ALL commands finish
new ParallelCommandGroup(
    new ElevatorToHeightCommand(),   // Move elevator up
    new HoodToAngleCommand()         // Move hood to angle (at the same time)
);
// Both start together, group ends when both are done
```

### Deadlines (run until one finishes)

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

```java
// Commands run simultaneously
// Group finishes when the DEADLINE command finishes (first one listed)
// Other commands are cancelled when the deadline ends
new ParallelDeadlineGroup(
    new ShooterFireCommand(),           // Deadline - when this finishes, group ends
    new IntakeFeederCommand()           // Runs alongside - cancelled when shooter is ready
);
```

<details>
<summary><strong>When to use each command group type?</strong></summary>

**SequentialCommandGroup** -- when steps must happen in order:
```java
// You cannot fire before the intake is deployed
new SequentialCommandGroup(
    new DeployIntake(),
    new FireShooter()
);
```

**ParallelCommandGroup** -- when actions are independent and should happen together:
```java
// Elevator and hood can move at the same time (different subsystems)
new ParallelCommandGroup(
    new ElevatorToHeight(),
    new HoodToAngle()
);
```

**ParallelDeadlineGroup** -- when one action is the "main" event and others support it:
```java
// Shooter spinning up is the main event
// Feeder runs alongside but stops when shooter is ready
new ParallelDeadlineGroup(
    new WaitForShooter(),    // Main event - wait for shooter
    new RunFeeder()          // Support - keep feeding until shooter is ready
);
```

</details>

## Default Commands

A default command runs whenever no other command requires the subsystem:

[Source: TeamXbot2026 SubsystemDefaultCommandMap](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/SubsystemDefaultCommandMap.java)

```java
// In subsystemDefaultCommandMap
// This command runs on the shooter whenever no other command is using it
// It keeps the shooter maintained (e.g., spinning at idle speed)
shooter.setDefaultCommand(new ShooterMaintainerCommand(shooter));
```

<details>
<summary><strong>What is a default command?</strong></summary>

A **default command** is the "resting behavior" of a subsystem. It runs automatically whenever no other command claims that subsystem.

**Analogy:** Think of a default command like a car's idle. When you are not pressing the gas or brake, the engine still runs at idle speed. When you press the gas, a different command takes over. When you release, it goes back to idle.

```
No button pressed → Default command runs (maintainer keeps shooter at idle)
Driver presses A  → ShooterFireCommand takes over (spins up to target)
Driver releases A → ShooterFireCommand ends → Default command resumes (back to idle)
```

**Common default commands:**
- ShooterMaintainerCommand -- keeps shooter at idle speed
- DriveMaintainerCommand -- maintains heading
- IntakeMaintainerCommand -- keeps intake ready

</details>

---

## Quiz

**Q1:** What does `addRequirements(shooter)` do in a command?

- [ ] A) Makes the command run faster
- [ ] B) Claims the subsystem so no other command can use it at the same time
- [ ] C) Deletes the subsystem
- [ ] D) Adds a new motor to the robot

<details>
<summary>Answer</summary>

**B) Claims the subsystem so no other command can use it at the same time**

**Why:** `addRequirements()` tells the command scheduler which subsystems this command needs. When the command runs, it "owns" those subsystems. If another command tries to use the same subsystem, the first command is interrupted and cancelled. This prevents conflicts like two commands trying to set the shooter to different speeds at the same time. Options A, C, and D are unrelated to what `addRequirements()` does.

```java
public class ShooterFireCommand extends Command {
    public ShooterFireCommand(ShooterSubsystem shooter) {
        addRequirements(shooter);  // "I need the shooter - nobody else can use it"
    }
}
```

</details>

**Q2:** What is the difference between `SequentialCommandGroup` and `ParallelCommandGroup`?

- [ ] A) Sequential runs commands one after another; Parallel runs them at the same time
- [ ] B) Sequential is faster
- [ ] C) Parallel only works in autonomous
- [ ] D) There is no difference

<details>
<summary>Answer</summary>

**A) Sequential runs commands one after another; Parallel runs them at the same time**

**Why:** `SequentialCommandGroup` waits for each command to finish before starting the next. `ParallelCommandGroup` starts all commands at once and waits for all of them to finish. Option B is wrong -- speed depends on the commands, not the group type. Option C is wrong -- both work in any mode. Option D is wrong -- they behave very differently.

```java
// Sequential: A finishes, then B starts, then C starts
new SequentialCommandGroup(A, B, C);  // Total time = A + B + C

// Parallel: A, B, and C all start together
new ParallelCommandGroup(A, B, C);    // Total time = max(A, B, C)
```

</details>

**Q3:** When does a command's `initialize()` method run?

- [ ] A) Every 20ms
- [ ] B) Once when the command starts
- [ ] C) When the robot is disabled
- [ ] D) When the match ends

<details>
<summary>Answer</summary>

**B) Once when the command starts**

**Why:** `initialize()` is called exactly once when the command is first scheduled. It is where you set up the command: set targets, reset sensors, start motors. Option A describes `execute()` and `isFinished()`, which run every loop. Options C and D are lifecycle events handled by `Robot.java`, not individual commands.

```java
@Override
public void initialize() {
    // Runs ONCE when command starts
    shooter.setTargetVelocity(5000);  // Set target one time
}

@Override
public void execute() {
    // Runs EVERY 20ms while command is active
    // Usually empty for simple commands
}
```

</details>
