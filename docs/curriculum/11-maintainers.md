# Maintainers

Commands that continuously keep a subsystem at its target.

## What Is a Maintainer?

[Source: SeriouslyCommonLib BaseMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseMaintainerCommand.java)

A **Maintainer** is a command that runs continuously to keep a subsystem at its goal. It handles the transition between human control and automatic (PID) control.

<details>
<summary><strong>Why do we need maintainers?</strong></summary>

Many mechanisms on a robot need to maintain a position or speed even when the driver is not actively controlling them.

**Example: Hood angle**
- Driver uses joystick to aim the hood
- Driver releases joystick
- Without a maintainer: hood flops to a random position
- With a maintainer: hood stays at the last aimed angle using PID

**Example: Shooter wheels**
- Driver sets target speed
- Without a maintainer: you would need to hold a button to keep the shooter spinning
- With a maintainer: shooter stays at target speed automatically

**Analogy:** A maintainer is like cruise control in a car. You set the speed, let go of the gas, and the car maintains that speed automatically.

</details>

## State Machine

[Source: SeriouslyCommonLib BaseMaintainerCommand](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/command/BaseMaintainerCommand.java)

```
Coast → HumanControl → InitializeMachineControl → MachineControl
```

| State | When | What Happens |
|-------|------|-------------|
| **Coast** | Human just released input | Motors coast to a stop (brief pause) |
| **HumanControl** | Human is providing input | Human has direct control via joystick/buttons |
| **InitializeMachineControl** | Human stopped, brief delay | Set target to current position (smooth handoff) |
| **MachineControl** | No human input | PID maintains the target automatically |

<details>
<summary><strong>Why does the state machine have a Coast state?</strong></summary>

The **Coast** state prevents jerky behavior when the driver releases the joystick.

**Without Coast:**
```
Driver releases joystick → PID immediately kicks in → mechanism jerks to hold position
```

**With Coast:**
```
Driver releases joystick → brief coast period (mechanism slows naturally) → PID kicks in smoothly
```

**Analogy:** Think of coast like letting go of a shopping cart on a slight incline. Instead of immediately grabbing it (jerky), you let it roll for a moment, then gently stop it (smooth).

The coast state is brief (usually 100-200ms) and gives the mechanism time to settle before PID takes over.

</details>

## XBot's BaseMaintainerCommand

[Source: TeamXbot2026 HoodMaintainerCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/hood/commands/HoodMaintainerCommand.java)

```java
// HoodMaintainerCommand keeps the hood at its target angle
// <Double, Double> means the state type and input type are both Double
public class HoodMaintainerCommand extends BaseMaintainerCommand<Double, Double> {
    final HoodSubsystem hood;  // The subsystem this maintainer controls

    @Inject
    public HoodMaintainerCommand(
        HoodSubsystem hood,
        PropertyFactory pf,
        HumanVsMachineDeciderFactory deciderFactory,
        OperatorInterface oi) {
        // Call parent constructor with:
        //   hood = the subsystem to maintain
        //   pf = property factory for tunable values
        //   deciderFactory = factory for the human vs machine state machine
        //   0.1 = error tolerance (how close to target counts as "at target")
        //   0.1 = time window (how long to check for human input)
        super(hood, pf, deciderFactory, 0.1, 0.1);
        this.hood = hood;
    }

    // Called when in Coast state
    // Usually do nothing - let the mechanism coast naturally
    @Override
    protected void coastAction() {
        // Do nothing - let it coast
    }

    // Called when in MachineControl state
    // This is where PID logic goes to maintain the target
    @Override
    protected void calibratedMachineControlAction() {
        var target = hood.getTargetValue();  // Get the target angle
        if (target != null) {
            hood.runServo();  // Move hood to target using PID
        }
    }

    // Returns how far the mechanism is from its target
    // Used to determine if we are "close enough"
    @Override
    protected double getErrorMagnitude() {
        return Math.abs(hood.getTargetValue() - hood.getCurrentValue());
    }

    // Returns the human's input value (joystick position, etc.)
    // Return 0.0 if no human override for this mechanism
    @Override
    protected Double getHumanInput() {
        return 0.0;  // No manual override for the hood
    }

    // Returns the magnitude (absolute value) of human input
    // Used by the state machine to detect if human is actively controlling
    @Override
    protected double getHumanInputMagnitude() {
        return 0.0;  // No human input means we are always in MachineControl
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
// In an autonomous routine:
new SequentialCommandGroup(
    new SetShooterTargetCommand(5000),            // 1. Set shooter target to 5000 RPM
    new WaitForMaintainerCommand(shooter),        // 2. Wait until shooter reaches 5000 RPM
    new ShooterFeederFireCommand()                // 3. Fire the game piece
);
```

<details>
<summary><strong>How does WaitForMaintainerCommand work?</strong></summary>

`WaitForMaintainerCommand` is a simple command that does nothing except wait. It checks if the maintainer has reached its target and only finishes when it has.

```java
public class WaitForMaintainerCommand extends Command {
    private final Subsystem subsystem;

    @Override
    public boolean isFinished() {
        // Check if the subsystem's maintainer is at target
        return subsystem.isAtTarget();
    }
}
```

**Why use it in autonomous:** In autonomous, you cannot rely on a driver to wait for the shooter to spin up. `WaitForMaintainerCommand` ensures the shooter is at speed before firing, making autonomous more consistent.

**Without WaitForMaintainerCommand:**
```
Set target → immediately fire → game piece shoots out at low speed (shooter not ready)
```

**With WaitForMaintainerCommand:**
```
Set target → wait → shooter reaches 5000 RPM → fire → game piece shoots at full speed
```

</details>

---

## Quiz

**Q1:** What are the four states in the maintainer state machine?

- [ ] A) Start, Run, Stop, Reset
- [ ] B) Coast, HumanControl, InitializeMachineControl, MachineControl
- [ ] C) Auto, Teleop, Test, Disabled
- [ ] D) Forward, Reverse, Stop, Coast

<details>
<summary>Answer</summary>

**B) Coast, HumanControl, InitializeMachineControl, MachineControl**

**Why:** These four states manage the transition between human and automatic control. Coast gives a brief pause when the human releases input. HumanControl gives direct control to the driver. InitializeMachineControl sets the target to the current position for a smooth handoff. MachineControl uses PID to maintain the target. Options A, C, and D are unrelated to the maintainer state machine.

</details>

**Q2:** When does the maintainer switch from HumanControl to MachineControl?

- [ ] A) Immediately when human stops
- [ ] B) After a brief delay with no human input
- [ ] C) Only during autonomous
- [ ] D) When the robot is disabled

<details>
<summary>Answer</summary>

**B) After a brief delay with no human input**

**Why:** The maintainer waits briefly after human input stops (Coast state) before switching to MachineControl. This prevents jerky behavior and gives the mechanism time to settle. Option A would cause the mechanism to jerk when the driver releases the joystick. Option C is wrong -- maintainers work in both auto and teleop. Option D is wrong -- maintainers stop when the robot is disabled.

</details>

**Q3:** What does `WaitForMaintainerCommand` do?

- [ ] A) Stops the maintainer
- [ ] B) Waits until the maintainer reaches its goal before continuing
- [ ] C) Resets the PID values
- [ ] D) Switches to human control

<details>
<summary>Answer</summary>

**B) Waits until the maintainer reaches its goal before continuing**

**Why:** `WaitForMaintainerCommand` is used in command groups to pause execution until a subsystem reaches its target. It checks `isFinished()` every loop and only returns true when the maintainer reports being at target. This is essential in autonomous routines where you need to wait for a mechanism to be ready before proceeding. Option A is wrong -- it does not stop anything. Option C is wrong -- it does not change PID values. Option D is wrong -- it does not affect control mode.

</details>
