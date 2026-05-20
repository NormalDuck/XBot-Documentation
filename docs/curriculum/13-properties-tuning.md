# Properties & Tuning

Runtime-tunable values stored on the roboRIO.

## What Are Properties?

Properties are values you can change **without rebuilding code**. They persist across robot reboots.

<details>
<summary><strong>Why not just hardcode values?</strong></summary>

Hardcoding values means every time you want to change something, you need to:
1. Edit the code
2. Rebuild (30+ seconds)
3. Deploy to the robot (10+ seconds)
4. Test

With properties, you just change the value in a dashboard and test immediately.

**Scenario at a competition:**
```
Hardcoded: "Our shooter is overshooting. Let me rebuild with a lower P value..."
  → 40 seconds later → test → still wrong → repeat

Properties: "Our shooter is overshooting. Let me lower P from 4.0 to 3.0..."
  → Change value in dashboard → test immediately → repeat
```

Properties also **persist across reboots**, so your tuned values are saved even if the robot restarts.

</details>

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
// Set the prefix for this class - properties will be grouped under this name in the dashboard
pf.setPrefix(this);

// Create a persistent property that is saved to the roboRIO's storage
// "DrivingPowerScale" = the name shown in the dashboard
// 1.0 = the default value (used the first time, or if the stored value is deleted)
DoubleProperty drivingPowerScale = pf.createPersistentProperty(
    "DrivingPowerScale",   // Name
    1.0                     // Default value
);

// Read the current value - use this in your code instead of a hardcoded number
double power = drivingPowerScale.get();

// Write a new value - this updates the property and saves it to the roboRIO
// Usually done from a dashboard, but you can also do it in code
drivingPowerScale.set(0.8);
```

<details>
<summary><strong>Where do I see and edit properties?</strong></summary>

Properties are visible on dashboards connected to the robot:

**AdvantageScope** (recommended):
- Connect to the robot via the Driver Station
- Open AdvantageScope
- Find your properties under the "AdvantageKit" tab
- Double-click a value to edit it

**SmartDashboard / Shuffleboard:**
- Open the dashboard tool from VSCode (WPILib menu)
- Properties appear as editable fields
- Change values in real-time

```
Driver Station laptop
       │
       ├── AdvantageScope  ← View and edit properties
       ├── Shuffleboard    ← View and edit properties
       └── SmartDashboard  ← View and edit properties
```

Changes take effect immediately -- no rebuild needed.

</details>

## Property Levels

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

Control which properties are visible by default:

| Level | Shown By Default |
|-------|-----------------|
| `Important` | Yes - key tuning values |
| `Debug` | No - hidden unless requested |

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
// Set the default level to "Important" - these properties show up in the dashboard
pf.setDefaultLevel(Property.PropertyLevel.Important);
DoubleProperty powerScale = pf.createPersistentProperty("DrivingPowerScale", 1.0);

// Switch to "Debug" level - these properties are hidden by default
// Useful for internal values that drivers should not accidentally change
pf.setDefaultLevel(Property.PropertyLevel.Debug);
DoubleProperty debugValue = pf.createPersistentProperty("InternalThing", 0.0);
```

<details>
<summary><strong>When should I use Debug vs Important?</strong></summary>

**Important:** Properties that need to be tuned regularly or checked during a match.
- PID gains (P, I, D)
- Power scales
- Height presets
- Anything a driver or mentor might need to adjust

**Debug:** Properties used for development or troubleshooting that should not clutter the dashboard.
- Internal thresholds
- Test values
- Diagnostic flags
- Anything that is set once and rarely changed

**Rule of thumb:** If a mentor might need to change it at a competition, make it Important. If only a programmer cares about it, make it Debug.

</details>

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
// PID gains as properties - tune them at competitions without rebuilding
DoubleProperty pGain = pf.createPersistentProperty("P Gain", 4.0);
DoubleProperty iGain = pf.createPersistentProperty("I Gain", 0.0);
DoubleProperty dGain = pf.createPersistentProperty("D Gain", 0.0);

// Use the property values in your PID calculations
// The .get() reads the current value (which may have been changed in the dashboard)
double output = pid.calculate(target, current, pGain.get(), iGain.get(), dGain.get());
```

### Scale Factors

[Source: TeamXbot2026 SwerveDriveWithJoysticksCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/drive/commands/SwerveDriveWithJoysticksCommand.java)

```java
// Power scale - reduce max drive speed if the robot is too twitchy
DoubleProperty drivingPowerScale = pf.createPersistentProperty("DrivingPowerScale", 1.0);

// Precision mode scale - used when the driver holds a button for fine control
DoubleProperty precisionScale = pf.createPersistentProperty("PrecisionScale", 0.1);
```

### Height Presets

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
// Elevator height presets for different scoring levels
// Use DistanceProperty to include units (Inches, Meters, etc.)
// These can be tuned at competitions if the mechanism is slightly off
DistanceProperty l2Height = pf.createPersistentProperty("l2Height", Inches.of(0.25));
DistanceProperty l3Height = pf.createPersistentProperty("l3Height", Inches.of(15.25));
DistanceProperty l4Height = pf.createPersistentProperty("l4Height", Inches.of(47.5));
```

<details>
<summary><strong>Why use DistanceProperty instead of DoubleProperty for heights?</strong></summary>

`DistanceProperty` stores values with units, preventing confusion about what unit a number represents.

```java
// With DoubleProperty (ambiguous):
DoubleProperty l4Height = pf.createPersistentProperty("l4Height", 47.5);
// Is this inches? centimeters? meters? Who knows!

// With DistanceProperty (clear):
DistanceProperty l4Height = pf.createPersistentProperty("l4Height", Inches.of(47.5));
// Clearly 47.5 inches. Can convert to other units:
double meters = l4Height.get().in(Meters);  // 1.2065 meters
```

Using `DistanceProperty` also means the dashboard can display the unit alongside the value, making it clearer for drivers and mentors.

</details>

## Checking for Changes

Properties can notify you when they change:

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
// Check if a property has been changed since the last time we checked
// If someone changed the value in the dashboard, reconfigure the motor
if (motionMagicAcceleration.hasChangedSinceLastCheck()) {
    configureMotionMagicConstraints();  // Apply the new value to the motor controller
}
```

<details>
<summary><strong>Why check for changes instead of reading every loop?</strong></summary>

Reading a property every loop works, but `hasChangedSinceLastCheck()` is more efficient. It only triggers when the value actually changes, avoiding unnecessary work.

**Without change detection:**
```java
// Every 20ms, check and apply (wasteful if value did not change)
motor.setP(pGain.get());  // Called 50 times per second, even if P did not change
```

**With change detection:**
```java
// Only apply when the value actually changes
if (pGain.hasChangedSinceLastCheck()) {
    motor.setP(pGain.get());  // Only called when someone changes P in the dashboard
}
```

This is especially important for expensive operations like reconfiguring motor controllers.

</details>

---

## Quiz

**Q1:** What happens when you change a property value at runtime?

- [ ] A) You must rebuild and redeploy the code
- [ ] B) The change takes effect immediately and persists across reboots
- [ ] C) The robot crashes
- [ ] D) The change is lost when the robot is disabled

<details>
<summary>Answer</summary>

**B) The change takes effect immediately and persists across reboots**

**Why:** Properties are stored in the roboRIO's persistent storage (Preferences). When you change a value in a dashboard, it updates immediately and is saved to disk. The next time the robot restarts, the saved value is loaded. Option A is the opposite of why properties exist. Option C is wrong -- changing properties is safe. Option D is wrong -- properties persist across disable/enable cycles and even full reboots.

</details>

**Q2:** What is the difference between `Important` and `Debug` property levels?

- [ ] A) `Important` properties are shown by default; `Debug` are hidden unless requested
- [ ] B) `Debug` properties are saved to disk; `Important` are not
- [ ] C) `Important` properties can only be changed by mentors
- [ ] D) There is no difference

<details>
<summary>Answer</summary>

**A) `Important` properties are shown by default; `Debug` are hidden unless requested**

**Why:** Property levels control visibility in dashboards. `Important` properties appear by default so drivers and mentors can easily find and tune them. `Debug` properties are hidden to keep the dashboard clean, but can be revealed if needed for troubleshooting. Option B is wrong -- both types are saved. Option C is wrong -- there is no access control on properties. Option D is wrong -- the visibility difference is significant.

</details>

**Q3:** Which property type would you use for a PID gain?

- [ ] A) `BooleanProperty`
- [ ] B) `DistanceProperty`
- [ ] C) `DoubleProperty`
- [ ] D) `StringProperty`

<details>
<summary>Answer</summary>

**C) `DoubleProperty`**

**Why:** PID gains are decimal numbers (like 4.0, 0.01, 0.5), so `DoubleProperty` is the correct type. `BooleanProperty` is for true/false flags. `DistanceProperty` is for measurements with units (inches, meters). `StringProperty` is for text values. The naming tells you what each stores: "Double" = decimal number.

```java
// Correct: PID gains are decimal numbers
DoubleProperty pGain = pf.createPersistentProperty("P Gain", 4.0);

// Wrong: BooleanProperty cannot hold a decimal number
BooleanProperty pGain = pf.createPersistentProperty("P Gain", true);  // Does not make sense
```

</details>
