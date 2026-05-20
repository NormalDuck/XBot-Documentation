# Properties & Tuning

Runtime-tunable values stored on the roboRIO.

## What Are Properties?

Properties are values you can change **without rebuilding code**. They persist across robot reboots.

## Property Types

[Source: SeriouslyCommonLib Properties](https://github.com/Team488/SeriouslyCommonLib/tree/main/src/main/java/xbot/common/properties)

| Type | Use For |
|------|---------|
| `DoubleProperty` | PID gains, scale factors, thresholds |
| `BooleanProperty` | Enable/disable flags |
| `DistanceProperty` | Heights, distances (with units) |

## Creating Properties

[Source: TeamXbot2026 SwerveDriveWithJoysticksCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/drive/commands/SwerveDriveWithJoysticksCommand.java)

```java
pf.setPrefix(this);

// Persistent property (saved across reboots)
DoubleProperty drivingPowerScale = pf.createPersistentProperty(
    "DrivingPowerScale",   // Name
    1.0                     // Default value
);

// Read value
double power = drivingPowerScale.get();

// Write value (tuning at runtime)
drivingPowerScale.set(0.8);
```

## Property Levels

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

Control which properties are visible by default:

| Level | Shown By Default |
|-------|-----------------|
| `Important` | Yes - key tuning values |
| `Debug` | No - hidden unless requested |

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
pf.setDefaultLevel(Property.PropertyLevel.Important);
DoubleProperty powerScale = pf.createPersistentProperty("DrivingPowerScale", 1.0);

pf.setDefaultLevel(Property.PropertyLevel.Debug);
DoubleProperty debugValue = pf.createPersistentProperty("InternalThing", 0.0);
```

## Where Properties Are Stored

[Source: SeriouslyCommonLib PropertyFactory](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/properties/PropertyFactory.java)

Properties are saved to the roboRIO's **Preferences** (persistent storage). You can view and edit them via:
- AdvantageKit dashboard
- SmartDashboard
- Shuffleboard

## Common Use Cases

### PID Gains

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
DoubleProperty pGain = pf.createPersistentProperty("P Gain", 4.0);
DoubleProperty iGain = pf.createPersistentProperty("I Gain", 0.0);
DoubleProperty dGain = pf.createPersistentProperty("D Gain", 0.0);
```

### Scale Factors

[Source: TeamXbot2026 SwerveDriveWithJoysticksCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/drive/commands/SwerveDriveWithJoysticksCommand.java)

```java
DoubleProperty drivingPowerScale = pf.createPersistentProperty("DrivingPowerScale", 1.0);
DoubleProperty precisionScale = pf.createPersistentProperty("PrecisionScale", 0.1);
```

### Height Presets

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
DistanceProperty l2Height = pf.createPersistentProperty("l2Height", Inches.of(0.25));
DistanceProperty l3Height = pf.createPersistentProperty("l3Height", Inches.of(15.25));
DistanceProperty l4Height = pf.createPersistentProperty("l4Height", Inches.of(47.5));
```

## Checking for Changes

Properties can notify you when they change:

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
if (motionMagicAcceleration.hasChangedSinceLastCheck()) {
    configureMotionMagicConstraints();
}
```

---

## Quiz

**Q1:** What happens when you change a property value at runtime?

- [ ] A) You must rebuild and redeploy the code
- [ ] B) The change takes effect immediately and persists across reboots
- [ ] C) The robot crashes
- [ ] D) The change is lost when the robot is disabled

<details><summary>Answer</summary>B) The change takes effect immediately and persists across reboots</details>

**Q2:** What is the difference between `Important` and `Debug` property levels?

- [ ] A) `Important` properties are shown by default; `Debug` are hidden unless requested
- [ ] B) `Debug` properties are saved to disk; `Important` are not
- [ ] C) `Important` properties can only be changed by mentors
- [ ] D) There is no difference

<details><summary>Answer</summary>A) `Important` properties are shown by default; `Debug` are hidden unless requested</details>

**Q3:** Which property type would you use for a PID gain?

- [ ] A) `BooleanProperty`
- [ ] B) `DistanceProperty`
- [ ] C) `DoubleProperty`
- [ ] D) `StringProperty`

<details><summary>Answer</summary>C) `DoubleProperty`</details>
