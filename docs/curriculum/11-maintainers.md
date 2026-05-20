# Maintainers

Commands that continuously keep a subsystem at its target.

## What Is a Maintainer?

[Source: SeriouslyCommonLib BaseMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseMaintainerCommand.java)

A **Maintainer** is a command that runs continuously to keep a subsystem at its goal. It handles the transition between human control and automatic (PID) control.

## State Machine

[Source: SeriouslyCommonLib BaseMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseMaintainerCommand.java)

```
Coast → HumanControl → InitializeMachineControl → MachineControl
```

| State | When | What Happens |
|-------|------|-------------|
| **Coast** | Human just released input | Motors coast to a stop |
| **HumanControl** | Human is providing input | Human has direct control |
| **InitializeMachineControl** | Human stopped, brief delay | Set target to current position |
| **MachineControl** | No human input | PID maintains target |

## XBot's BaseMaintainerCommand

[Source: TeamXbot2026 HoodMaintainerCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/hood/commands/HoodMaintainerCommand.java)

```java
public class HoodMaintainerCommand extends BaseMaintainerCommand<Double, Double> {
    final HoodSubsystem hood;

    @Inject
    public HoodMaintainerCommand(
        HoodSubsystem hood,
        PropertyFactory pf,
        HumanVsMachineDeciderFactory deciderFactory,
        OperatorInterface oi) {
        super(hood, pf, deciderFactory, 0.1, 0.1);  // error tolerance, time window
        this.hood = hood;
    }

    @Override
    protected void coastAction() {
        // Do nothing - let it coast
    }

    @Override
    protected void calibratedMachineControlAction() {
        var target = hood.getTargetValue();
        if (target != null) {
            hood.runServo();
        }
    }

    @Override
    protected double getErrorMagnitude() {
        return Math.abs(hood.getTargetValue() - hood.getCurrentValue());
    }

    @Override
    protected Double getHumanInput() {
        return 0.0;  // No manual override
    }

    @Override
    protected double getHumanInputMagnitude() {
        return 0.0;
    }
}
```

## Methods to Override

[Source: SeriouslyCommonLib BaseMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseMaintainerCommand.java)

| Method | Purpose |
|--------|---------|
| `coastAction()` | What to do when coasting (usually nothing) |
| `calibratedMachineControlAction()` | PID logic to maintain target |
| `getErrorMagnitude()` | How far from target (absolute value) |
| `getHumanInput()` | Human override input |
| `getHumanInputMagnitude()` | Magnitude of human input (for state machine) |

## Real Maintainers in XBot

[Source: SeriouslyCommonLib BaseMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseMaintainerCommand.java)

| Maintainer | Subsystem | Purpose |
|------------|-----------|---------|
| `SwerveDriveMaintainerCommand` | Swerve drive | Maintain heading |
| `SwerveSteeringMaintainerCommand` | Swerve steering | Keep wheels pointed correctly |
| `HoodMaintainerCommand` | Hood | Maintain hood angle |
| `ShooterWheelMaintainerCommand` | Shooter | Keep wheels at target velocity |
| `ElevatorMaintainerCommand` | Elevator (2025) | Maintain elevator height |
| `IntakeDeployMaintainerCommand` | Intake deploy | Maintain deploy angle |

## WaitForMaintainerCommand

Used to wait until a maintainer reaches its goal:

[Source: SeriouslyCommonLib BaseWaitForMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseWaitForMaintainerCommand.java)

```java
new SequentialCommandGroup(
    new SetShooterTargetCommand(5000),
    new WaitForMaintainerCommand(shooter),  // Wait until at speed
    new ShooterFeederFireCommand()           // Then fire
);
```

---

## Quiz

**Q1:** What are the four states in the maintainer state machine?

- [ ] A) Start, Run, Stop, Reset
- [ ] B) Coast, HumanControl, InitializeMachineControl, MachineControl
- [ ] C) Auto, Teleop, Test, Disabled
- [ ] D) Forward, Reverse, Stop, Coast

<details><summary>Answer</summary>B) Coast, HumanControl, InitializeMachineControl, MachineControl</details>

**Q2:** When does the maintainer switch from HumanControl to MachineControl?

- [ ] A) Immediately when human stops
- [ ] B) After a brief delay with no human input
- [ ] C) Only during autonomous
- [ ] D) When the robot is disabled

<details><summary>Answer</summary>B) After a brief delay with no human input</details>

**Q3:** What does `WaitForMaintainerCommand` do?

- [ ] A) Stops the maintainer
- [ ] B) Waits until the maintainer reaches its goal before continuing
- [ ] C) Resets the PID values
- [ ] D) Switches to human control

<details><summary>Answer</summary>B) Waits until the maintainer reaches its goal before continuing</details>
