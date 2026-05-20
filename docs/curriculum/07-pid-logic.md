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

## Visual Example

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

Imagine driving to a stop sign:
- **P**: Brake harder the closer you get
- **I**: You've been creeping forward for a while, brake more
- **D**: You're approaching fast, ease off the gas

## XBot's PIDManager

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

```java
PIDManager pid = pidManagerFactory.create(
    "ElevatorPID",    // Name
    4.0,              // P
    0.0,              // I
    0.0,              // D
    0.750,            // Feedforward (F)
    1.0,              // Max output
    -0.4              // Min output
);

// Calculate output
double output = pid.calculate(target, current);
```

## Tuning Guide

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

1. **Set I=0, D=0, F=0**
2. **Increase P** until the system oscillates, then back off by ~50%
3. **Add D** to reduce overshoot
4. **Add I** to eliminate steady-state error (small values!)
5. **Add F** (feedforward) for known power needed to hold position

## Real Example: Elevator PID

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
this.masterMotor = motorFactory.create(
    contract.getElevatorMotor(),
    this.getPrefix(),
    "ElevatorMotorPID",
    new XCANMotorControllerPIDProperties(
        4,        // P
        0,        // I
        0,        // D
        0,        // F (not used here)
        0.750,    // Max output
        1,        // (unused param)
        -0.4      // Min output
    )
);
```

## Why Properties?

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

XBot stores PID values as **properties** so you can tune at runtime:

```java
// These values appear in AdvantageKit/SmartDashboard
pf.createPersistentProperty("P Gain", 4.0);
pf.createPersistentProperty("I Gain", 0.0);
pf.createPersistentProperty("D Gain", 0.0);
```

Change them during a match without rebuilding code.

## Common Issues

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Oscillating | P too high | Decrease P |
| Slow to reach target | P too low | Increase P |
| Overshoot | D too low | Increase D |
| Never reaches exact target | Need I or F | Add small I or add F |
| Jittery | D too high | Decrease D |

---

## Quiz

**Q1:** Which PID term reacts to accumulated error over time?

- [ ] A) Proportional (P)
- [ ] B) Integral (I)
- [ ] C) Derivative (D)
- [ ] D) Feedforward (F)

<details><summary>Answer</summary>B) Integral (I)</details>

**Q2:** What is the recommended first step when tuning PID?

- [ ] A) Set all values to 1.0
- [ ] B) Set I=0, D=0, F=0 and increase P until oscillation
- [ ] C) Set P=0 and increase D first
- [ ] D) Copy values from last year's robot

<details><summary>Answer</summary>B) Set I=0, D=0, F=0 and increase P until oscillation</details>

**Q3:** Why does XBot store PID values as properties?

- [ ] A) To make the code harder to read
- [ ] B) So you can tune at runtime without rebuilding
- [ ] C) To save storage space
- [ ] D) Because Dagger requires it

<details><summary>Answer</summary>B) So you can tune at runtime without rebuilding</details>
