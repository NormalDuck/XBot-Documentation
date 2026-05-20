# Robot Architecture

How XBot code is organized and how a robot program runs.

## Project Structure

```
TeamXbot2026/
├── src/main/java/competition/
│   ├── Main.java                    # Entry point - starts the robot program
│   ├── Robot.java                   # Robot lifecycle - what happens when
│   ├── electrical_contract/         # Hardware wiring definitions (CAN IDs, ports)
│   ├── injection/
│   │   ├── components/              # Dagger components (dependency injection entry points)
│   │   └── modules/                 # Dagger modules (maps interfaces to implementations)
│   ├── subsystems/                  # Robot mechanisms (each physical part of the robot)
│   │   ├── drive/                   # Swerve drive subsystem
│   │   ├── shooter/                 # Shooter mechanism
│   │   ├── hood/                    # Hood mechanism
│   │   └── ...
│   └── operator_interface/          # Controller button bindings (gamepad to commands)
└── SeriouslyCommonLib/              # Shared library (used by all XBot robots)
```

<details>
<summary><strong>What is a "subsystem"?</strong></summary>

A **subsystem** represents one physical mechanism on the robot. Each subsystem controls the motors, sensors, and logic for one part of the robot.

**Analogy:** Think of subsystems like organs in a body. Each organ has a specific job:
- Heart = DriveSubsystem (moves the robot around)
- Arm = ShooterSubsystem (shoots game pieces)
- Legs = IntakeSubsystem (picks up game pieces)

Each subsystem works independently but coordinates with others through commands.

**Common subsystems on an FRC robot:**
- DriveSubsystem -- swerve drive (movement)
- ShooterSubsystem -- shoots game pieces
- IntakeSubsystem -- picks up game pieces
- ElevatorSubsystem -- lifts mechanisms up and down
- ClimberSubsystem -- climbs at the end of the match

</details>

## Robot Lifecycle

```
Main.startRobot()
    → Robot() constructor
        → robotInit()           # Runs once at startup - set everything up
            → initializeSystems()   # Creates all subsystems
        → autonomousInit()      # Runs once when auto starts - prepare for auto
        → autonomousPeriodic()  # Runs ~50x/sec during auto - execute auto routine
        → teleopInit()          # Runs once when teleop starts - prepare for driver control
        → teleopPeriodic()      # Runs ~50x/sec during teleop - execute driver commands
```

<details>
<summary><strong>What is the difference between Init and Periodic?</strong></summary>

**Init** methods run **once** when a mode starts. Use them for setup.
**Periodic** methods run **repeatedly** (~50 times per second). Use them for ongoing behavior.

**Analogy:** Think of a basketball game:
- `autonomousInit()` = the referee's whistle starts the game (happens once)
- `autonomousPeriodic()` = players running plays, shooting, defending (happens continuously)
- `teleopInit()` = halftime -- switch to human-controlled play (happens once)
- `teleopPeriodic()` = driver controlling the robot (happens continuously)

```java
// Init: set things up once
public void autonomousInit() {
    shooter.setTargetVelocity(5000);  // Set shooter speed once at start of auto
}

// Periodic: check and update continuously
public void autonomousPeriodic() {
    if (shooter.isAtTargetVelocity()) {  // Check every loop
        feeder.run();                     // Fire when ready
    }
}
```

</details>

## The Entry Point

```java
// Main.java - do not modify
// This is the first code that runs when the robot turns on
// It tells WPILib to create a new Robot object and start the lifecycle
public final class Main {
    public static void main(String... args) {
        RobotBase.startRobot(Robot::new);  // Creates Robot and starts the program
    }
}
```

<details>
<summary><strong>What does `Robot::new` mean?</strong></summary>

`Robot::new` is a **method reference** -- a shorthand way of saying "create a new Robot when needed."

**What is happening:**
```java
// These two lines do the same thing:
RobotBase.startRobot(Robot::new);           // Method reference (shorthand)
RobotBase.startRobot(() -> new Robot());    // Lambda (longer form)
```

**Why use `::new`:** It is cleaner Java syntax. Instead of writing out the full lambda `() -> new Robot()`, you just say `Robot::new` which means "call the Robot constructor."

**Do not modify Main.java.** It is the same for every FRC robot and should never need changes.

</details>

## The Robot Class

```java
public class Robot extends BaseRobot {
    @Override
    protected void initializeSystems() {
        super.initializeSystems();  // Call parent setup first
        // Wire up default commands, button bindings, etc.
        // These connect subsystems to commands and controller buttons
        getInjectorComponent().subsystemDefaultCommandMap();
        getInjectorComponent().operatorCommandMap();
    }
}
```

<details>
<summary><strong>What does initializeSystems() do?</strong></summary>

`initializeSystems()` is where all the pieces of the robot get connected together. It is called once during `robotInit()`.

**Think of it like setting up a stage play:**
1. `super.initializeSystems()` -- build the stage and set up lights
2. `subsystemDefaultCommandMap()` -- tell each actor what to do when they have no specific scene
3. `operatorCommandMap()` -- connect the director's cues (gamepad buttons) to the actors' actions

**What happens if you skip this:** The robot will turn on, but nothing will work. No buttons will do anything, and subsystems will not have their default behaviors.

</details>

## Two Teams

| Team | Focus |
|------|-------|
| **Core Programming** | Drive, mechanisms, autonomous, infrastructure |
| **Vision Processing** | AprilTag detection, pose estimation, path planning |

<details>
<summary><strong>How do the two teams work together?</strong></summary>

The **Core Programming** team writes the code that controls the robot's mechanisms and behavior. The **Vision Processing** team writes code that helps the robot "see" the field and game pieces.

**How they connect:** Vision provides data (where are the AprilTags, where is the robot on the field) that Core Programming uses to make decisions (where to drive, where to aim the shooter).

```
Vision Team:                    Core Team:
┌──────────────┐               ┌──────────────┐
│ Camera input │───data───────▶│ DriveSubsystem│
│ AprilTags    │   (pose,      │ ShooterSubsystem│
│ Pose est.    │    targets)   │ Autonomous   │
└──────────────┘               └──────────────┘
```

Both teams use the same codebase and Git workflow. Communication between teams is essential.

</details>

## Key Files

| File | Purpose |
|------|---------|
| `Main.java` | Starts the robot -- do not modify |
| `Robot.java` | Lifecycle and initialization |
| `ElectricalContract.java` | Wiring definitions (CAN IDs, ports) |
| `RobotComponent.java` | Dagger component -- wires all dependencies |
| `OperatorCommandMap.java` | Button-to-command bindings |

---

## Quiz

**Q1:** Which method runs once when the robot starts up?

- [ ] A) `robotPeriodic()`
- [ ] B) `teleopInit()`
- [ ] C) `robotInit()`
- [ ] D) `autonomousPeriodic()`

<details>
<summary>Answer</summary>

**C) `robotInit()`**

**Why:** `robotInit()` runs exactly once when the robot program first starts, before any match mode begins. It is where you set up subsystems, configure preferences, and prepare the robot. `robotPeriodic()` runs continuously (not once). `teleopInit()` runs once when teleop starts (not at startup). `autonomousPeriodic()` runs continuously during autonomous mode.

```
Robot turns on → robotInit() (once) → wait for match → teleopInit() or autonomousInit()
```

</details>

**Q2:** How often does `teleopPeriodic()` run?

- [ ] A) Once per match
- [ ] B) Every second
- [ ] C) About 50 times per second (~20ms)
- [ ] D) Only when a button is pressed

<details>
<summary>Answer</summary>

**C) About 50 times per second (~20ms)**

**Why:** The robot control loop runs at 50Hz, meaning `teleopPeriodic()` is called every 20 milliseconds. This is fast enough to feel responsive to the driver but slow enough that the roboRIO can handle all the calculations. Option A describes `teleopInit()`. Option B would be too slow for robot control. Option D is wrong -- periodic runs regardless of button presses.

**Why 50Hz?** This is the standard FRC control loop rate. It matches the update rate of the Driver Station and provides smooth control without overwhelming the processor.

</details>

**Q3:** Where are hardware wiring definitions stored in XBot?

- [ ] A) `Robot.java`
- [ ] B) `electrical_contract/`
- [ ] C) `build.gradle`
- [ ] D) `vendordeps/`

<details>
<summary>Answer</summary>

**B) `electrical_contract/`**

**Why:** The electrical contract is the single source of truth for how the robot is wired. It maps every motor, sensor, and device to its CAN ID and port. `Robot.java` handles lifecycle, not wiring. `build.gradle` defines build dependencies (libraries). `vendordeps/` stores third-party library configurations.

**Why this matters:** When the electrical team rewires the robot, you only update the electrical contract. All the subsystem code automatically uses the new wiring because it reads from the contract.

</details>
