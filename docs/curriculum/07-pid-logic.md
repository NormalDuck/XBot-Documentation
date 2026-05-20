# PID Logic

How PID keeps robots stable and accurate.

## What Is PID?

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

PID adjusts output to reach and maintain a target value.

| Term | What It Does | Analogy |
|------|-------------|---------|
| **P (Proportional)** | Reacts to current error | "How far am I from the goal?" |
| **I (Integral)** | Reacts to accumulated error | "Have I been off for a while?" |
| **D (Derivative)** | Reacts to rate of change | "Am I approaching too fast?" |

<details>
<summary><strong>What is "error" in PID?</strong></summary>

**Error** is the difference between where you are and where you want to be.

```
error = target - current
```

**Example:** You want the elevator at 47.5 inches (L4 height), but it is currently at 20 inches.
```
error = 47.5 - 20 = 27.5 inches
```

The bigger the error, the harder PID pushes to correct it. When error is zero, you are at the target.

**Analogy:** Error is like the distance between you and the refrigerator when you are hungry. The farther away you are, the faster you walk. As you get closer, you slow down so you do not crash into it.

</details>

## Visual Example

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

Imagine driving to a stop sign:
- **P**: Brake harder the closer you get
- **I**: You have been creeping forward for a while, brake more
- **D**: You are approaching fast, ease off the gas

<details>
<summary><strong>A better analogy: Filling a bucket with water</strong></summary>

Imagine you need to fill a bucket to exactly the 1-liter mark.

**P (Proportional) -- "How far from the target?"**
- Bucket is empty → open faucet fully
- Bucket is half full → open faucet halfway
- Bucket is almost full → barely open faucet
- **Problem:** If you only use P, you might never reach exactly 1 liter because the trickle is too small to overcome evaporation

**I (Integral) -- "How long have I been off?"**
- You have been slightly under 1 liter for 30 seconds → open faucet a bit more
- The longer you are off-target, the more I pushes to correct it
- **Problem:** If I is too high, you will overshoot and flood the bucket

**D (Derivative) -- "How fast am I approaching?"**
- Water level is rising quickly → close faucet sooner to prevent overshoot
- Water level is barely moving → no need to slow down
- **Problem:** If D is too high, you will be too cautious and never fill the bucket

**All three together:** P gets you close fast, I eliminates the remaining gap, D prevents overshooting.

</details>

## XBot's PIDManager

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

```java
// Create a PID controller using the factory
// Each parameter controls a different aspect of the PID behavior
PIDManager pid = pidManagerFactory.create(
    "ElevatorPID",    // Name - used for logging and dashboard display
    4.0,              // P (Proportional) - reacts to current error
    0.0,              // I (Integral) - reacts to accumulated error over time
    0.0,              // D (Derivative) - reacts to rate of change
    0.750,            // Feedforward (F) - constant power to overcome gravity/friction
    1.0,              // Max output - never output more than this (safety limit)
    -0.4              // Min output - never output less than this (safety limit)
);

// Calculate the PID output given a target and current value
// target = where you want to be, current = where you are now
// Returns the power to apply to the motor
double output = pid.calculate(target, current);
```

<details>
<summary><strong>What is Feedforward (F)?</strong></summary>

**Feedforward** is a constant power added to the PID output to handle known forces.

**Why you need it:** Imagine holding a book at arm's length. Even if the book is not moving (error = 0), you still need to apply force to keep it from falling. That is what feedforward does for mechanisms fighting gravity.

```java
// Without feedforward:
// Elevator at target → error = 0 → PID output = 0 → elevator falls!
// PID then tries to correct → elevator goes up → error = 0 → falls again
// Result: elevator oscillates around target

// With feedforward:
// Elevator at target → error = 0 → PID output = 0
// But feedforward adds 0.750 power to hold the elevator up
// Result: elevator stays at target
```

**When to use feedforward:**
- Elevators (fighting gravity)
- Arms (fighting gravity)
- Any mechanism that needs power just to stay in place

**When you do not need it:**
- Horizontal mechanisms (no gravity to fight)
- Drive motors (on a flat surface)

</details>

## Tuning Guide

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

1. **Set I=0, D=0, F=0**
2. **Increase P** until the system oscillates, then back off by ~50%
3. **Add D** to reduce overshoot
4. **Add I** to eliminate steady-state error (small values!)
5. **Add F** (feedforward) for known power needed to hold position

<details>
<summary><strong>Step-by-step tuning example</strong></summary>

Let us tune an elevator PID from scratch:

**Step 1: Start with P only**
```java
P = 1.0, I = 0, D = 0, F = 0
```
Result: Elevator barely moves. P is too low.

**Step 2: Increase P**
```java
P = 4.0, I = 0, D = 0, F = 0
```
Result: Elevator moves but oscillates up and down around the target. P is too high.

**Step 3: Back off P**
```java
P = 2.0, I = 0, D = 0, F = 0
```
Result: Elevator reaches target with small oscillations. Better!

**Step 4: Add D to dampen oscillations**
```java
P = 2.0, I = 0, D = 0.5, F = 0
```
Result: Elevator reaches target smoothly with minimal oscillation.

**Step 5: Add F to hold position against gravity**
```java
P = 2.0, I = 0, D = 0.5, F = 0.3
```
Result: Elevator holds position without sagging.

**Step 6: Add small I if needed**
```java
P = 2.0, I = 0.01, D = 0.5, F = 0.3
```
Result: Elevator reaches exact target (I eliminates the tiny remaining error).

**Final values:** P=2.0, I=0.01, D=0.5, F=0.3

</details>

## Real Example: Elevator PID

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
// Create the elevator motor with PID configuration
this.masterMotor = motorFactory.create(
    contract.getElevatorMotor(),    // Get motor info from electrical contract
    this.getPrefix(),                // "Elevator" - name prefix for logging
    "ElevatorMotorPID",              // PID property prefix for tuning
    new XCANMotorControllerPIDProperties(
        4,        // P - proportional gain (reacts to current error)
        0,        // I - integral gain (not used here, would be small like 0.01)
        0,        // D - derivative gain (not used here, would help reduce overshoot)
        0,        // F - feedforward (not used in this constructor variant)
        0.750,    // Max output - limit to 75% power for safety
        1,        // (unused parameter in this constructor)
        -0.4      // Min output - limit to -40% power (prevents slamming down)
    )
);
```

## Why Properties?

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

XBot stores PID values as **properties** so you can tune at runtime:

```java
// These values appear in AdvantageKit/SmartDashboard
// Create properties with default values that can be changed without rebuilding code
pf.createPersistentProperty("P Gain", 4.0);
pf.createPersistentProperty("I Gain", 0.0);
pf.createPersistentProperty("D Gain", 0.0);
```

Change them during a match without rebuilding code.

<details>
<summary><strong>How do you tune properties at a competition?</strong></summary>

At a competition, you can change PID values in real-time using a dashboard:

1. Connect the robot to the Driver Station laptop
2. Open Shuffleboard or AdvantageScope on the laptop
3. Find the PID properties in the dashboard
4. Change the values and see the effect immediately

**Competition tuning workflow:**
```
Run a test → elevator overshoots → increase D → test again → repeat
```

No need to rebuild and redeploy code. Just change the number in the dashboard.

**Why this matters:** At a competition, you might have 5 minutes between matches. Rebuilding code takes 30+ seconds. Changing a property takes 2 seconds.

</details>

## Common Issues

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Oscillating | P too high | Decrease P |
| Slow to reach target | P too low | Increase P |
| Overshoot | D too low | Increase D |
| Never reaches exact target | Need I or F | Add small I or add F |
| Jittery | D too high | Decrease D |

<details>
<summary><strong>What does "oscillating" look like?</strong></summary>

**Oscillating** means the mechanism goes back and forth around the target instead of settling at it.

```
Target: 47.5 inches

With P too high:
  47.5 ┤    ╱╲    ╱╲    ╱╲
       │   ╱  ╲  ╱  ╲  ╱  ╲
       │  ╱    ╳╱    ╳╱    ╳
       │ ╱    ╱ ╲    ╱ ╲
       │╱    ╱   ╲  ╱   ╲
       └────┴─────┴─┴─────┴──→ time
       It never settles!
```

**Fix:** Decrease P by about 50%. If P=4.0 causes oscillation, try P=2.0.

</details>

---

## Quiz

**Q1:** Which PID term reacts to accumulated error over time?

- [ ] A) Proportional (P)
- [ ] B) Integral (I)
- [ ] C) Derivative (D)
- [ ] D) Feedforward (F)

<details>
<summary>Answer</summary>

**B) Integral (I)**

**Why:** The Integral term adds up (integrates) the error over time. If the system has been slightly off-target for a while, I grows and pushes harder to correct it. P only reacts to the current error (right now). D reacts to how fast the error is changing. F is a constant offset, not related to error at all.

```
P = error right now
I = sum of all errors over time (accumulates)
D = how fast error is changing
F = constant value (does not depend on error)
```

</details>

**Q2:** What is the recommended first step when tuning PID?

- [ ] A) Set all values to 1.0
- [ ] B) Set I=0, D=0, F=0 and increase P until oscillation
- [ ] C) Set P=0 and increase D first
- [ ] D) Copy values from last year's robot

<details>
<summary>Answer</summary>

**B) Set I=0, D=0, F=0 and increase P until oscillation**

**Why:** Starting with only P isolates the most important term. Once you find the P value that causes oscillation, you know the upper limit and can back off. Option A is wrong because different mechanisms need very different values. Option C is wrong because D has no effect without P (D reacts to change, but P provides the initial response). Option D might give you a starting point, but every robot is different -- you still need to tune from scratch.

</details>

**Q3:** Why does XBot store PID values as properties?

- [ ] A) To make the code harder to read
- [ ] B) So you can tune at runtime without rebuilding
- [ ] C) To save storage space
- [ ] D) Because Dagger requires it

<details>
<summary>Answer</summary>

**B) So you can tune at runtime without rebuilding**

**Why:** Properties are stored on the roboRIO and can be changed via SmartDashboard, Shuffleboard, or AdvantageScope while the robot is running. This means you can tune PID values during a competition without stopping to rebuild and redeploy code. Option A is the opposite of the goal. Option C is wrong -- properties actually use more storage than hardcoded values. Option D is wrong -- properties are independent of Dagger.

</details>
