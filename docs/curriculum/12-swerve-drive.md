# Swerve Drive

Holonomic driving with independent wheel control.

## What Is Swerve?

[Source: SeriouslyCommonLib SwerveModuleSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveModuleSubsystem.java)

Each wheel can **drive** (forward/backward) AND **steer** (rotate) independently, allowing:
- Holonomic movement (strafe sideways)
- Field-oriented driving
- Rotation while translating

<details>
<summary><strong>What does "holonomic" mean?</strong></summary>

**Holonomic** means the robot can move in any direction without turning first. A regular car is non-holonomic -- it can only go forward and backward, and must turn to change direction. A swerve robot can move forward, backward, sideways, diagonally, and rotate all at the same time.

**Analogy:** Think of the difference between a car and an office chair with wheels:
- **Car (non-holonomic):** Can only go forward/backward. To go sideways, you must turn, drive forward, turn again.
- **Office chair (holonomic):** Can roll in any direction instantly without turning.

**Why this matters in FRC:** Holonomic drive lets you:
- Strafe sideways to avoid defenders
- Drive diagonally for faster cross-field movement
- Rotate while moving to aim the shooter on the move

</details>

## XBot's Swerve Architecture

[Source: SeriouslyCommonLib SwerveModuleSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveModuleSubsystem.java)

```
SwerveModuleSubsystem (one per wheel)
├── SwerveDriveSubsystem       (drive motor + velocity PID)
└── SwerveSteeringSubsystem    (steering motor + absolute encoder)
```

<details>
<summary><strong>Why does each wheel need two motors?</strong></summary>

Each swerve module needs **two independent motors** because the wheel needs to do two things at once:

1. **Drive motor:** Spins the wheel to move forward/backward
2. **Steering motor:** Rotates the entire wheel module to point in a direction

```
         Steering motor (rotates the whole module)
              ↻
              │
        ┌─────┴─────┐
        │  Wheel    │ ← Drive motor (spins the wheel)
        └───────────┘
```

**Example:** To drive diagonally forward-right:
- Front-left wheel: points 45 degrees, drives forward
- Front-right wheel: points 45 degrees, drives forward
- Rear-left wheel: points 45 degrees, drives forward
- Rear-right wheel: points 45 degrees, drives forward

Each wheel has a different angle and speed depending on the desired robot movement.

</details>

## Four Modules

[Source: SeriouslyCommonLib SwerveInstance](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/swerve/SwerveInstance.java)

| Instance | Position |
|----------|----------|
| `FrontLeftDrive` | Front-left |
| `FrontRightDrive` | Front-right |
| `RearLeftDrive` | Rear-left |
| `RearRightDrive` | Rear-right |

## Key Classes

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

| Class | Role |
|-------|------|
| `SwerveModuleSubsystem` | Combines drive + steering for one wheel |
| `SwerveDriveSubsystem` | Controls drive motor velocity |
| `SwerveSteeringSubsystem` | Controls steering angle with CANcoder |
| `SwerveDriveWithJoysticksCommand` | Human teleop control |
| `SwerveDriveRotationAdvisor` | Heading snapping / assist |

## How Teleop Driving Works

[Source: TeamXbot2026 SwerveDriveWithJoysticksCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/drive/commands/SwerveDriveWithJoysticksCommand.java)

```java
@Override
public void execute() {
    // 1. Get raw joystick input
    // Left stick: X (left/right) and Y (forward/backward)
    // Right stick: rotation (turn left/right)
    XYPair translationIntent = getRawHumanTranslationIntent();
    double rawRotationIntent = getRawHumanRotationIntent();

    // 2. Apply alliance color flip (red vs blue)
    // On the red alliance, the field is "flipped" from the driver's perspective
    // This makes "forward" always mean "toward the opponent's side"
    if (alliance == Red) {
        translationIntent.rotate(180);  // Flip the direction 180 degrees
    }

    // 3. Apply precision mode scaling
    // When precision mode is active (usually a button hold), reduce speed for fine control
    // Useful for precise positioning during scoring
    if (precisionModeActive) {
        translationIntent = translationIntent.scale(0.1);  // Reduce to 10% speed
    }

    // 4. Check for heading snapping (right joystick near cardinal directions)
    // If the driver pushes the right stick near N/S/E/W, snap to that direction
    // Makes it easier to aim at specific field elements
    double rotationIntent = getSuggestedRotationIntent(rawRotationIntent);

    // 5. Field-oriented drive - converts driver intent to individual wheel commands
    // This is where the math happens:
    //   Input: "move forward at 0.5, strafe right at 0.3, rotate at 0.2"
    //   Output: 4 wheel states (angle + speed for each module)
    drive.fieldOrientedDrive(
        translationIntent,   // X and Y movement intent
        rotationIntent,      // Rotation intent
        currentRobotHeading, // Current robot angle from gyro
        centerOfRotation     // Point the robot rotates around (usually center)
    );
}
```

<details>
<summary><strong>What is field-oriented drive?</strong></summary>

**Field-oriented drive** means the controls are relative to the field, not the robot.

**Without field-oriented (robot-relative):**
- Push stick "forward" → robot moves in the direction it is facing
- If robot is facing backwards, "forward" moves it backwards on the field
- Confusing for drivers!

**With field-oriented (field-relative):**
- Push stick "forward" → robot moves toward the opponent's alliance station
- Regardless of which way the robot is facing
- Intuitive for drivers!

```
Robot facing forward:  Push stick up → robot moves up (toward opponent)
Robot facing backward: Push stick up → robot moves up (toward opponent)
                       (robot turns itself to compensate)
```

The gyro provides the robot's current heading, and the drive math compensates for it.

</details>

## The Swerve Algorithm

1. Human wants to move: X=0.5, Y=0.3, Rotate=0.2
2. `SwerveDriveKinematics.toSwerveModuleStates()` converts to 4 wheel states
3. Each `SwerveModuleSubsystem` sets its drive speed and steering angle
4. Wheels update ~50 times per second

[Source: XbotEdu SwerveDriveSubsystem](https://github.com/Team488/XbotEdu/blob/main/src/main/java/competition/subsystems/drive/SwerveDriveSubsystem.java)

```java
// Simplified swerve move()
// This is the core algorithm that converts a desired robot movement into wheel commands
public void move(double xVelocity, double yVelocity, double radiansPerSecond) {
    // WPILib's kinematics library does the heavy math:
    // Takes the desired robot movement (X, Y, rotation) and calculates
    // what each wheel needs to do (angle and speed)
    var desiredStates = kinematics.toSwerveModuleStates(
        new ChassisSpeeds(xVelocity, yVelocity, radiansPerSecond)
    );

    // For each of the 4 modules:
    // 1. Set steering angle from desiredStates[i].angle (which direction the wheel points)
    // 2. Set drive speed from desiredStates[i].speedMetersPerSecond (how fast the wheel spins)
}
```

<details>
<summary><strong>What does the kinematics math actually do?</strong></summary>

The swerve kinematics algorithm converts a desired robot movement into individual wheel commands. It is complex math, but you do not need to understand it -- WPILib handles it.

**What goes in:**
```
ChassisSpeeds(
    vx: 0.5 m/s forward,
    vy: 0.3 m/s right,
    omega: 0.2 rad/s clockwise
)
```

**What comes out:**
```
Module 0 (FrontLeft):  angle = 30 degrees, speed = 0.6 m/s
Module 1 (FrontRight): angle = 45 degrees, speed = 0.5 m/s
Module 2 (RearLeft):   angle = 15 degrees, speed = 0.4 m/s
Module 3 (RearRight):  angle = 60 degrees, speed = 0.7 m/s
```

Each wheel gets a unique angle and speed. The combination of all four wheels produces the desired robot movement.

**For XbotEdu:** Your exercise is to implement the `move()` method -- take the desired states and set each motor. The kinematics library gives you the target states; you just need to apply them.

</details>

## XbotEdu Exercise

In XbotEdu, students implement the swerve algorithm in `SwerveDriveSubsystem.move()`. The kinematics library gives you the target states - you need to set each motor.

[Source: XbotEdu SwerveDriveSubsystem](https://github.com/Team488/XbotEdu/blob/main/src/main/java/competition/subsystems/drive/SwerveDriveSubsystem.java)

---

## Quiz

**Q1:** How many swerve modules does a standard robot have?

- [ ] A) 2
- [ ] B) 4
- [ ] C) 6
- [ ] D) 8

<details>
<summary>Answer</summary>

**B) 4**

**Why:** A standard FRC swerve robot has 4 modules, one at each corner: front-left, front-right, rear-left, and rear-right. Each module has a drive motor and a steering motor (8 motors total for drive). Some unusual designs use 6 wheels (like 6-wheel skid-steer), but swerve is always 4. Option A would not be stable. Options C and D are not standard swerve configurations.

</details>

**Q2:** What does `SwerveDriveKinematics.toSwerveModuleStates()` do?

- [ ] A) Reads sensor data from the modules
- [ ] B) Converts chassis velocity goals into individual wheel angles and speeds
- [ ] C) Calibrates the encoders
- [ ] D) Updates the gyro

<details>
<summary>Answer</summary>

**B) Converts chassis velocity goals into individual wheel angles and speeds**

**Why:** This is the core swerve math function. It takes the desired robot movement (forward/backward, left/right, rotation) and calculates what each of the 4 wheels needs to do (angle and speed) to achieve that movement. Option A is done by encoders, not kinematics. Option C is a calibration procedure. Option D is done by the gyro itself.

```java
// Input: "I want the robot to move forward at 0.5 m/s and rotate at 0.2 rad/s"
ChassisSpeeds speeds = new ChassisSpeeds(0.5, 0, 0.2);

// Output: "Front-left: 30 degrees at 0.6 m/s, Front-right: 45 degrees at 0.5 m/s, ..."
SwerveModuleState[] states = kinematics.toSwerveModuleStates(speeds);
```

</details>

**Q3:** What is field-oriented driving?

- [ ] A) Driving relative to the robot's front
- [ ] B) Driving relative to the field, regardless of robot orientation
- [ ] C) Driving only on the field perimeter
- [ ] D) Driving with the gyro disabled

<details>
<summary>Answer</summary>

**B) Driving relative to the field, regardless of robot orientation**

**Why:** Field-oriented drive uses the gyro to compensate for the robot's heading, so pushing the joystick "forward" always moves the robot toward the opponent's alliance station, no matter which way the robot is facing. Option A is robot-relative driving (the opposite of field-oriented). Option C is unrelated. Option D would make field-oriented drive impossible since the gyro provides the heading data.

</details>
