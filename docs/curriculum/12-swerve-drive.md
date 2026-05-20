# Swerve Drive

Holonomic driving with independent wheel control.

## What Is Swerve?

[Source: SeriouslyCommonLib SwerveModuleSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveModuleSubsystem.java)

Each wheel can **drive** (forward/backward) AND **steer** (rotate) independently, allowing:
- Holonomic movement (strafe sideways)
- Field-oriented driving
- Rotation while translating

## XBot's Swerve Architecture

[Source: SeriouslyCommonLib SwerveModuleSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveModuleSubsystem.java)

```
SwerveModuleSubsystem (one per wheel)
├── SwerveDriveSubsystem       (drive motor + velocity PID)
└── SwerveSteeringSubsystem    (steering motor + absolute encoder)
```

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
    XYPair translationIntent = getRawHumanTranslationIntent();
    double rawRotationIntent = getRawHumanRotationIntent();

    // 2. Apply alliance color flip (red vs blue)
    if (alliance == Red) {
        translationIntent.rotate(180);
    }

    // 3. Apply precision mode scaling
    if (precisionModeActive) {
        translationIntent = translationIntent.scale(0.1);
    }

    // 4. Check for heading snapping (right joystick near cardinal directions)
    double rotationIntent = getSuggestedRotationIntent(rawRotationIntent);

    // 5. Field-oriented drive - converts to individual wheel commands
    drive.fieldOrientedDrive(
        translationIntent,
        rotationIntent,
        currentRobotHeading,
        centerOfRotation
    );
}
```

## The Swerve Algorithm

1. Human wants to move: X=0.5, Y=0.3, Rotate=0.2
2. `SwerveDriveKinematics.toSwerveModuleStates()` converts to 4 wheel states
3. Each `SwerveModuleSubsystem` sets its drive speed and steering angle
4. Wheels update ~50 times per second

[Source: XbotEdu SwerveDriveSubsystem](https://github.com/Team488/XbotEdu/blob/main/src/main/java/competition/subsystems/drive/SwerveDriveSubsystem.java)

```java
// Simplified swerve move()
public void move(double xVelocity, double yVelocity, double radiansPerSecond) {
    var desiredStates = kinematics.toSwerveModuleStates(
        new ChassisSpeeds(xVelocity, yVelocity, radiansPerSecond)
    );

    // For each module:
    // 1. Set steering angle from desiredStates[i].angle
    // 2. Set drive speed from desiredStates[i].speedMetersPerSecond
}
```

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

<details><summary>Answer</summary>B) 4</details>

**Q2:** What does `SwerveDriveKinematics.toSwerveModuleStates()` do?

- [ ] A) Reads sensor data from the modules
- [ ] B) Converts chassis velocity goals into individual wheel angles and speeds
- [ ] C) Calibrates the encoders
- [ ] D) Updates the gyro

<details><summary>Answer</summary>B) Converts chassis velocity goals into individual wheel angles and speeds</details>

**Q3:** What is field-oriented driving?

- [ ] A) Driving relative to the robot's front
- [ ] B) Driving relative to the field, regardless of robot orientation
- [ ] C) Driving only on the field perimeter
- [ ] D) Driving with the gyro disabled

<details><summary>Answer</summary>B) Driving relative to the field, regardless of robot orientation</details>
