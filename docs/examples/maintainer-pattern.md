# Maintainer Command Pattern

Full source: [SeriouslyCommonLib BaseMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseMaintainerCommand.java)

## Overview

A maintainer command runs continuously to keep a subsystem at its target. It uses a state machine to decide between human control and automatic (PID) control.

## State Machine Flow

```
Coast → HumanControl → InitializeMachineControl → MachineControl
```

| State | Trigger | Action |
|-------|---------|--------|
| **Coast** | Human just released input | Motors coast |
| **HumanControl** | Human is providing input | Human has direct control |
| **InitializeMachineControl** | Human stopped, brief delay | Set target to current position |
| **MachineControl** | No human input | PID maintains target |

## Creating a Maintainer

```java
public class MyMaintainerCommand extends BaseMaintainerCommand<Double, Double> {
    final MySubsystem subsystem;

    @Inject
    public MyMaintainerCommand(
        MySubsystem subsystem,
        PropertyFactory pf,
        HumanVsMachineDeciderFactory deciderFactory) {
        // error tolerance = 0.1, time stable window = 0.1s
        super(subsystem, pf, deciderFactory, 0.1, 0.1);
        this.subsystem = subsystem;
    }

    @Override
    protected void coastAction() {
        // Motors coast - do nothing
    }

    @Override
    protected void calibratedMachineControlAction() {
        // Use PID to maintain target
        double target = subsystem.getTargetValue();
        double current = subsystem.getCurrentValue();
        double output = pid.calculate(target, current);
        subsystem.setPower(output);
    }

    @Override
    protected double getErrorMagnitude() {
        return Math.abs(subsystem.getTargetValue() - subsystem.getCurrentValue());
    }

    @Override
    protected Double getHumanInput() {
        // Return human override input, or 0 if none
        return 0.0;
    }

    @Override
    protected double getHumanInputMagnitude() {
        return Math.abs(getHumanInput());
    }
}
```

## Methods to Override

| Method | Purpose | Required |
|--------|---------|----------|
| `coastAction()` | What to do when coasting | Yes |
| `calibratedMachineControlAction()` | PID logic to maintain target | Yes |
| `getErrorMagnitude()` | How far from target | Yes |
| `getHumanInput()` | Human override input | Yes |
| `getHumanInputMagnitude()` | Magnitude of human input | Yes |
| `initializeMachineControlAction()` | Override to customize re-init | No |
| `uncalibratedMachineControlAction()` | Override for auto-calibration | No |
| `additionalAtGoalChecks()` | Extra "at goal" conditions | No |

## Real Example: Hood Maintainer

From [TeamXbot2026 HoodMaintainerCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/hood/commands/HoodMaintainerCommand.java):

```java
public class HoodMaintainerCommand extends BaseMaintainerCommand<Double, Double> {
    final HoodSubsystem hood;
    final OperatorInterface oi;

    @Inject
    public HoodMaintainerCommand(
        HoodSubsystem hood,
        PropertyFactory pf,
        HumanVsMachineDeciderFactory humanVsMachineDeciderFactory,
        OperatorInterface operatorInterface) {
        super(hood, pf, humanVsMachineDeciderFactory, .1, .1);
        this.hood = hood;
        this.oi = operatorInterface;
    }

    @Override
    protected void coastAction() {
        // Hood coasts - do nothing
    }

    @Override
    protected void initializeMachineControlAction() {
        // Cancel any command that's manipulating the setpoint
        if (this.hood.getSetpointLock().getCurrentCommand() != null
                && !DriverStation.isAutonomous()) {
            this.hood.getSetpointLock().getCurrentCommand().cancel();
        }
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
        var target = hood.getTargetValue();
        var current = hood.getCurrentValue();
        return Math.abs(target - current);
    }

    @Override
    protected Double getHumanInput() {
        return 0.0;  // No manual override for hood
    }

    @Override
    protected double getHumanInputMagnitude() {
        return Math.abs(getHumanInput());
    }
}
```

## Setting as Default Command

```java
// In subsystemDefaultCommandMap
@Inject
public SubsystemDefaultCommandMap(
    HoodSubsystem hood,
    HoodMaintainerCommand hoodMaintainer) {

    hood.setDefaultCommand(hoodMaintainer);
}
```
