# Electrical Contract

The single source of truth for how the robot is wired.

## What Is It?

[Source: SeriouslyCommonLib XSwerveDriveElectricalContract](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/electrical_contract/XSwerveDriveElectricalContract.java)

The **Electrical Contract** maps every motor, sensor, and device to its CAN ID, port, and type. Instead of hardcoding CAN IDs throughout the codebase, everything goes through the contract.

## Why Use It?

[Source: TeamXbot2026 ElectricalContract](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/electrical_contract/ElectricalContract.java)

- Change wiring in **one place** instead of searching through code
- Swap between practice bot and competition robot easily
- New members can see the wiring without asking

## The Pattern

[Source: SeriouslyCommonLib XSwerveDriveElectricalContract](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/electrical_contract/XSwerveDriveElectricalContract.java)

### Abstract Contract (defines WHAT exists)

[Source: SeriouslyCommonLib XSwerveDriveElectricalContract](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/electrical_contract/XSwerveDriveElectricalContract.java)

```java
public abstract class ElectricalContract
    implements XSwerveDriveElectricalContract, XCameraElectricalContract {

    public abstract CANMotorControllerInfo getDriveMotor(SwerveInstance instance);
    public abstract CANMotorControllerInfo getSteeringMotor(SwerveInstance instance);
    public abstract DeviceInfo getSteeringEncoder(SwerveInstance instance);
    public abstract boolean isDriveReady();
}
```

### Concrete Implementation (defines actual CAN IDs)

[Source: TeamXbot2026 ElectricalContract](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/electrical_contract/ElectricalContract.java)

```java
public class CompetitionContract extends ElectricalContract {
    @Override
    public CANMotorControllerInfo getDriveMotor(SwerveInstance instance) {
        switch (instance.label()) {
            case "FrontLeft":
                return new CANMotorControllerInfo("FLDrive", CANBusId.RIO, 11);
            case "FrontRight":
                return new CANMotorControllerInfo("FRDrive", CANBusId.RIO, 22);
            // ... more modules
        }
    }

    @Override
    public boolean isDriveReady() {
        return true;
    }
}
```

## Device Info Types

[Source: SeriouslyCommonLib Electrical Contract](https://github.com/Team488/SeriouslyCommonLib/tree/main/src/main/java/xbot/common/injection/electrical_contract)

| Type | Used For |
|------|----------|
| `CANMotorControllerInfo` | CAN motors (TalonFX, SparkMax) |
| `DeviceInfo` | Encoders, sensors, servos |
| `CANLightControllerInfo` | LED controllers (Candle) |
| `IMUInfo` | Gyroscope (Pigeon, NavX) |
| `PDHPort` | Power Distribution Hub ports |

## Switching Contracts

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

XBot switches contracts at runtime based on a stored preference:

[Source: TeamXbot2026 Robot.java](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/Robot.java)

```java
// In Robot.java
String chosenContract = Preferences.getString("ContractToUse", "Competition");

switch (chosenContract) {
    case "2023": return DaggerRobotComponent2023.create();
    case "2025": return DaggerRobotComponent2025.create();
    case "Robox": return DaggerRoboxComponent.create();
    default: return DaggerRobotComponent.create(); // Competition
}
```

This means you can flash the same code to different robots and just change the preference.

## Adding a New Device

[Source: TeamXbot2026 ElectricalContract](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/electrical_contract/ElectricalContract.java)

1. Add an abstract method to `ElectricalContract`:
   ```java
   public abstract CANMotorControllerInfo getClimberMotor();
   public abstract boolean isClimberReady();
   ```

2. Implement it in each contract:
   ```java
   @Override
   public CANMotorControllerInfo getClimberMotor() {
       return new CANMotorControllerInfo("Climber", CANBusId.RIO, 15);
   }

   @Override
   public boolean isClimberReady() {
       return true;
   }
   ```

3. Use it in your subsystem:
   ```java
   if (contract.isClimberReady()) {
       this.motor = motorFactory.create(contract.getClimberMotor(), ...);
   }
   ```

---

## Quiz

**Q1:** What is the main benefit of using an Electrical Contract?

- [ ] A) It makes the robot drive faster
- [ ] B) You change wiring in ONE place instead of searching through code
- [ ] C) It replaces the need for a roboRIO
- [ ] D) It auto-generates PID values

<details><summary>Answer</summary>B) You change wiring in ONE place instead of searching through code</details>

**Q2:** Which type is used for CAN motors like TalonFX or SparkMax?

- [ ] A) `DeviceInfo`
- [ ] B) `IMUInfo`
- [ ] C) `CANMotorControllerInfo`
- [ ] D) `PDHPort`

<details><summary>Answer</summary>C) `CANMotorControllerInfo`</details>

**Q3:** How does XBot switch between practice and competition contracts?

- [ ] A) By editing `build.gradle`
- [ ] B) By recompiling with a different flag
- [ ] C) At runtime based on a stored preference
- [ ] D) It cannot switch contracts

<details><summary>Answer</summary>C) At runtime based on a stored preference</details>
