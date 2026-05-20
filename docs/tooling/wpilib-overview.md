# WPILib Overview

The standard FRC software library.

## What Is WPILib?

WPILib (WPI Robotics Library) provides classes for interfacing with the FRC control system: motors, sensors, driver station, and more.

## Key Packages

| Package | Purpose |
|---------|---------|
| `edu.wpi.first.wpilibj` | Core classes (MotorController, Joystick, Timer) |
| `edu.wpi.first.wpilibj2.command` | Command-based framework |
| `edu.wpi.first.math` | Math utilities (geometry, kinematics) |
| `edu.wpi.first.math.kinematics` | Swerve/differential drive math |
| `edu.wpi.first.networktables` | Data sharing between robot and dashboard |
| `edu.wpi.first.cameraserver` | Camera streaming |
| `edu.wpi.first.wpilibj.drive` | Mecanum/differential drive helpers |

## Supported Languages

| Language | Library | Notes |
|----------|---------|-------|
| **Java** | WPILibJ | Recommended for beginners |
| **C++** | WPILibC | Better performance, more complex |
| **Python** | RobotPy | Interpreted, easier to debug |

XBot uses **Java**.

## Useful Links

- [WPILib Documentation](https://docs.wpilib.org/en/stable/)
- [Java API Reference](https://github.wpilib.org/allwpilib/docs/release/java/index.html)
- [Source Code](https://github.com/wpilibsuite/allwpilib)

## Common Classes

### Motor Controllers

```java
// PWM motors
Spark spark = new Spark(0);
spark.set(0.5);

// CAN motors (via vendor libraries)
TalonFX talon = new TalonFX(1);
talon.set(0.5);
```

### Sensors

```java
// Gyro
PigeonIMU gyro = new PigeonIMU(new CANBus());
double heading = gyro.getYaw();

// Limit switch
DigitalInput limit = new DigitalInput(0);
boolean isPressed = limit.get();
```

### Joystick

```java
XboxController controller = new XboxController(0);
double leftY = controller.getLeftY();
boolean aPressed = controller.getRawButtonPressed(1);
```

### Timer

```java
Timer timer = new Timer();
timer.start();
double elapsed = timer.get();
```
