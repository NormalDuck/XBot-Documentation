# Robot Architecture

How XBot code is organized and how a robot program runs.

## Project Structure

```
TeamXbot2026/
├── src/main/java/competition/
│   ├── Main.java                    # Entry point
│   ├── Robot.java                   # Robot lifecycle
│   ├── electrical_contract/         # Hardware wiring definitions
│   ├── injection/
│   │   ├── components/              # Dagger components
│   │   └── modules/                 # Dagger modules
│   ├── subsystems/                  # Robot mechanisms
│   │   ├── drive/                   # Swerve drive
│   │   ├── shooter/                 # Shooter mechanism
│   │   ├── hood/                    # Hood mechanism
│   │   └── ...
│   └── operator_interface/          # Controller button bindings
└── SeriouslyCommonLib/              # Shared library
```

## Robot Lifecycle

```
Main.startRobot()
    → Robot() constructor
        → robotInit()           # Runs once at startup
            → initializeSystems()   # Creates all subsystems
        → autonomousInit()      # Runs once when auto starts
        → autonomousPeriodic()  # Runs ~50x/sec during auto
        → teleopInit()          # Runs once when teleop starts
        → teleopInit()          # Runs once when teleop starts
        → teleopPeriodic()      # Runs ~50x/sec during teleop
```

## The Entry Point

```java
// Main.java - do not modify
public final class Main {
    public static void main(String... args) {
        RobotBase.startRobot(Robot::new);
    }
}
```

## The Robot Class

```java
public class Robot extends BaseRobot {
    @Override
    protected void initializeSystems() {
        super.initializeSystems();
        // Wire up default commands, button bindings, etc.
        getInjectorComponent().subsystemDefaultCommandMap();
        getInjectorComponent().operatorCommandMap();
    }
}
```

## Two Teams

| Team | Focus |
|------|-------|
| **Core Programming** | Drive, mechanisms, autonomous, infrastructure |
| **Vision Programming** | AprilTag detection, pose estimation, path planning |

## Key Files

| File | Purpose |
|------|---------|
| `Main.java` | Starts the robot |
| `Robot.java` | Lifecycle and initialization |
| `ElectricalContract.java` | Wiring definitions |
| `RobotComponent.java` | Dagger component |
| `OperatorCommandMap.java` | Button-to-command bindings |

---

## Quiz

**Q1:** Which method runs once when the robot starts up?

- [ ] A) `robotPeriodic()`
- [ ] B) `teleopInit()`
- [ ] C) `robotInit()`
- [ ] D) `autonomousPeriodic()`

<details><summary>Answer</summary>C) `robotInit()`</details>

**Q2:** How often does `teleopPeriodic()` run?

- [ ] A) Once per match
- [ ] B) Every second
- [ ] C) About 50 times per second (~20ms)
- [ ] D) Only when a button is pressed

<details><summary>Answer</summary>C) About 50 times per second (~20ms)</details>

**Q3:** Where are hardware wiring definitions stored in XBot?

- [ ] A) `Robot.java`
- [ ] B) `electrical_contract/`
- [ ] C) `build.gradle`
- [ ] D) `vendordeps/`

<details><summary>Answer</summary>B) `electrical_contract/`</details>
