# Swerve Drive Command

Full source: [TeamXbot2026 SwerveDriveWithJoysticksCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/drive/commands/SwerveDriveWithJoysticksCommand.java)

## Overview

This command handles teleop swerve driving with:
- Field-oriented control
- Alliance color flipping (red vs blue)
- Precision driving modes
- Heading snapping to cardinal directions

## Reading Joystick Input

### Translation (left stick)

```java
private XYPair getRawHumanTranslationIntent() {
    double xIntent = MathUtils.deadband(oi.driverGamepad.getLeftVector().getX(), 0.15);
    double yIntent = MathUtils.deadband(oi.driverGamepad.getLeftVector().getY(), 0.15);

    XYPair translationIntent = new XYPair(xIntent, yIntent);

    // Flip for red alliance
    if (DriverStation.getAlliance().orElse(DriverStation.Alliance.Blue) == DriverStation.Alliance.Red) {
        translationIntent.rotate(180);
    }

    // Fix alignment offset
    return translationIntent.rotate(-90);
}
```

### Rotation (triggers)

```java
private double getRawHumanRotationIntent() {
    double rotateLeftIntent = MathUtils.deadband(oi.driverGamepad.getLeftTrigger(), 0.05);
    double rotateRightIntent = MathUtils.deadband(oi.driverGamepad.getRightTrigger(), 0.05);

    // Left = positive, right = negative
    return rotateLeftIntent - rotateRightIntent;
}
```

## Processing Input

### Translation Processing

```java
private XYPair getSuggestedTranslationIntent(XYPair intent) {
    // Normalize to prevent diagonal movement being faster
    if (intent.getMagnitude() != 0) {
        intent = intent.scale(1 / intent.getMagnitude());
        intent = intent.scale(Math.abs(intent.x), Math.abs(intent.y));
    }

    // Apply precision mode scaling
    if (drive.isExtremePrecisionTranslationActive()) {
        intent = intent.scale(extremePrecisionTranslationScale.get());
    } else if (drive.isPrecisionTranslationActive()) {
        intent = intent.scale(precisionTranslationScale.get());
    }

    return intent;
}
```

### Rotation with Heading Snapping

```java
public double getSuggestedRotationIntent(double triggerRotateIntent) {
    // Check if right joystick is near a cardinal direction for snapping
    Translation2d joystickInput = oi.driverGamepad.getRightVector();
    Translation2d processedInput = new Translation2d(
        -joystickInput.getX(),
        joystickInput.getY()
    ).rotateBy(Rotation2d.fromDegrees(-90));

    SwerveSuggestedRotation suggested = advisor.getSuggestedRotationValue(
        processedInput, triggerRotateIntent);

    return processSuggestedRotationValueIntoPower(suggested);
}

private double processSuggestedRotationValueIntoPower(SwerveSuggestedRotation suggested) {
    return switch (suggested.type) {
        case DesiredHeading -> headingModule.calculateHeadingPower(suggested.value);
        case HumanControlHeadingPower -> {
            if (drive.isPrecisionRotationActive()) {
                yield suggested.value *= precisionRotationScale.get();
            } else {
                yield suggested.value;
            }
        }
    };
}
```

## Field-Oriented Drive

```java
@Override
public void execute() {
    XYPair translationIntent = getRawHumanTranslationIntent();
    double rawRotationIntent = getRawHumanRotationIntent();

    translationIntent = getSuggestedTranslationIntent(translationIntent);
    double rotationIntent = getSuggestedRotationIntent(rawRotationIntent);

    // Apply power scaling
    translationIntent = translationIntent.scale(overallDrivingPowerScale.get());
    rotationIntent *= overallTurningPowerScale.get();

    // Field-oriented drive - converts to individual wheel commands
    drive.fieldOrientedDrive(
        translationIntent,
        rotationIntent,
        pose.getCurrentHeading().getDegrees(),
        new XYPair(0, 0)
    );
}
```

## Precision Mode Properties

All scale factors are tunable at runtime:

```java
this.overallDrivingPowerScale = pf.createPersistentProperty("DrivingPowerScale", 1.0);
this.overallTurningPowerScale = pf.createPersistentProperty("TurningPowerScale", 1.0);
this.precisionTranslationScale = pf.createPersistentProperty("PrecisionTranslationScale", 0.1);
this.extremePrecisionTranslationScale = pf.createPersistentProperty("ExtremePrecisionTranslationScale", 0.15);
this.precisionRotationScale = pf.createPersistentProperty("PrecisionRotationScale", 0.2);
```
