# Command-Based Programming

WPILib's framework for organizing robot behavior.

## Core Concepts

[Source: WPILib Command-Based](https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html)

| Concept | Description |
|---------|-------------|
| **Subsystem** | A physical mechanism on the robot (drive, shooter, elevator) |
| **Command** | An action that runs on one or more subsystems |
| **Requirement** | A command claims the subsystems it needs |

## Subsystem

[Source: TeamXbot2026 ShooterSubsystem](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/ShooterSubsystem.java)

```java
public class ShooterSubsystem extends BaseSubsystem {
    private final XCANMotorController motor;

    @Inject
    public ShooterSubsystem(XCANMotorControllerFactory factory, ElectricalContract contract) {
        if (contract.isShooterReady()) {
            this.motor = factory.create(contract.getShooterMotor(), ...);
        }
    }

    public void setTargetVelocity(double rpm) {
        motor.setRawVelocityTarget(RPM.of(rpm), MotorPidMode.DutyCycle, 0);
    }

    @Override
    public void periodic() {
        // Called every ~20ms
    }
}
```

## Command

[Source: TeamXbot2026 ShooterFireCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/commands/ShooterOutputCommand.java)

```java
public class ShooterFireCommand extends BaseCommand {
    private final ShooterSubsystem shooter;

    @Inject
    public ShooterFireCommand(ShooterSubsystem shooter) {
        this.shooter = shooter;
        addRequirements(shooter);  // Claims the subsystem
    }

    @Override
    public void initialize() {
        shooter.setTargetVelocity(5000);
    }

    @Override
    public boolean isFinished() {
        return shooter.isAtTargetVelocity();
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

| Method | When It Runs |
|--------|-------------|
| `initialize()` | Once when the command starts |
| `execute()` | Every loop (~20ms) while running |
| `isFinished()` | Every loop - return `true` to end |
| `end(boolean interrupted)` | Once when the command ends |

## Binding Commands to Buttons

[Source: TeamXbot2026 OperatorCommandMap](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/operator_interface/OperatorCommandMap.java)

```java
// In OperatorCommandMap.java
@Inject
public OperatorCommandMap(
    OperatorInterface oi,
    ShooterFireCommand fire,
    ShooterStopCommand stop) {

    oi.driverGamepad.a().onTrue(fire);
    oi.driverGamepad.a().onFalse(stop);
}
```

## Command Groups

### Sequential (one after another)

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

```java
new SequentialCommandGroup(
    new IntakeDeployExtendCommand(),
    new WaitCommand(0.5),
    new ShooterFireCommand()
);
```

### Parallel (at the same time)

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

```java
new ParallelCommandGroup(
    new ElevatorToHeightCommand(),
    new HoodToAngleCommand()
);
```

### Deadlines (run until one finishes)

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

```java
new ParallelDeadlineGroup(
    new ShooterFireCommand(),           // Deadline
    new IntakeFeederCommand()           // Runs alongside
);
```

## Default Commands

A default command runs whenever no other command requires the subsystem:

[Source: TeamXbot2026 SubsystemDefaultCommandMap](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/SubsystemDefaultCommandMap.java)

```java
// In subsystemDefaultCommandMap
shooter.setDefaultCommand(new ShooterMaintainerCommand(shooter));
```

---

## Quiz

**Q1:** What does `addRequirements(shooter)` do in a command?

- [ ] A) Makes the command run faster
- [ ] B) Claims the subsystem so no other command can use it at the same time
- [ ] C) Deletes the subsystem
- [ ] D) Adds a new motor to the robot

<details><summary>Answer</summary>B) Claims the subsystem so no other command can use it at the same time</details>

**Q2:** What is the difference between `SequentialCommandGroup` and `ParallelCommandGroup`?

- [ ] A) Sequential runs commands one after another; Parallel runs them at the same time
- [ ] B) Sequential is faster
- [ ] C) Parallel only works in autonomous
- [ ] D) There is no difference

<details><summary>Answer</summary>A) Sequential runs commands one after another; Parallel runs them at the same time</details>

**Q3:** When does a command's `initialize()` method run?

- [ ] A) Every 20ms
- [ ] B) Once when the command starts
- [ ] C) When the robot is disabled
- [ ] D) When the match ends

<details><summary>Answer</summary>B) Once when the command starts</details>
