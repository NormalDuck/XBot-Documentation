# Electrical Contract

The single source of truth for how the robot is wired.

## What Is It?

[Source: SeriouslyCommonLib XSwerveDriveElectricalContract](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/electrical_contract/XSwerveDriveElectricalContract.java)

The **Electrical Contract** maps every motor, sensor, and device to its CAN ID, port, and type. Instead of hardcoding CAN IDs throughout the codebase, everything goes through the contract.

<details>
<summary><strong>What is a CAN ID?</strong></summary>

A **CAN ID** is a unique number assigned to each device on the CAN bus. It is how the roboRIO identifies which device to talk to.

**Analogy:** Think of CAN IDs like phone numbers. If you want to call your friend, you need their specific number. If the roboRIO wants to talk to the front-left drive motor, it needs that motor's CAN ID.

```
roboRIO: "Hey, device #11, spin at 50%!"
CAN Bus:  ───────────────────────────────
Devices:  #11 (SparkMax) ← this one responds
          #22 (TalonFX)  ← ignores this
          #33 (SparkMax) ← ignores this
```

**CAN ID rules:**
- Each device on the same CAN bus must have a unique ID
- IDs are typically 1-63
- The electrical team assigns these when wiring the robot
- Common convention: 1-10 for mechanism motors, 11-20 for swerve, etc.

**Where to find CAN IDs:** Look at the electrical contract or ask the electrical team. Do not guess!

</details>

## Why Use It?

[Source: TeamXbot2026 ElectricalContract](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/electrical_contract/ElectricalContract.java)

- Change wiring in **one place** instead of searching through code
- Swap between practice bot and competition robot easily
- New members can see the wiring without asking

<details>
<summary><strong>What happens without an electrical contract?</strong></summary>

Without a contract, CAN IDs are scattered throughout the codebase:

```java
// BAD: CAN IDs everywhere, hard to find and change
// ShooterSubsystem.java
new TalonFX(15);  // What is port 15?

// IntakeSubsystem.java
new SparkMax(15);  // Wait, is this the same port 15? Different motor?

// ElevatorSubsystem.java
new TalonFX(7);  // Where did 7 come from?
```

If the electrical team changes the shooter motor from port 15 to port 20, you have to search through every file to find all references to port 15. You might miss one and break the robot.

```java
// GOOD: All wiring in one place
// ElectricalContract.java
public CANMotorControllerInfo getShooterMotor() {
    return new CANMotorControllerInfo("Shooter", CANBusId.RIO, 20);  // Change here only!
}

// Every subsystem reads from the contract
// ShooterSubsystem.java
factory.create(contract.getShooterMotor(), ...);  // Always up to date
```

</details>

## The Pattern

[Source: SeriouslyCommonLib XSwerveDriveElectricalContract](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/electrical_contract/XSwerveDriveElectricalContract.java)

### Abstract Contract (defines WHAT exists)

[Source: SeriouslyCommonLib XSwerveDriveElectricalContract](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/electrical_contract/XSwerveDriveElectricalContract.java)

```java
// Abstract class: defines the structure but not the actual values
// Think of this as a template that says "every contract must have these methods"
public abstract class ElectricalContract
    implements XSwerveDriveElectricalContract, XCameraElectricalContract {

    // Each method returns info about a specific motor or device
    // Subclasses must provide the actual CAN IDs
    public abstract CANMotorControllerInfo getDriveMotor(SwerveInstance instance);
    public abstract CANMotorControllerInfo getSteeringMotor(SwerveInstance instance);
    public abstract DeviceInfo getSteeringEncoder(SwerveInstance instance);

    // "Ready" methods tell subsystems if a device is wired and available
    public abstract boolean isDriveReady();
}
```

### Concrete Implementation (defines actual CAN IDs)

[Source: TeamXbot2026 ElectricalContract](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/electrical_contract/ElectricalContract.java)

```java
// CompetitionContract: the actual wiring for THIS year's competition robot
// "extends ElectricalContract" means we must implement all the abstract methods
public class CompetitionContract extends ElectricalContract {
    @Override
    public CANMotorControllerInfo getDriveMotor(SwerveInstance instance) {
        // Return the correct CAN ID based on which swerve module we are asking about
        switch (instance.label()) {
            case "FrontLeft":
                // "FLDrive" = name for logging, CANBusId.RIO = which CAN bus, 11 = CAN ID
                return new CANMotorControllerInfo("FLDrive", CANBusId.RIO, 11);
            case "FrontRight":
                return new CANMotorControllerInfo("FRDrive", CANBusId.RIO, 22);
            // ... more modules (RearLeft, RearRight)
        }
    }

    @Override
    public boolean isDriveReady() {
        // Return true if the drive motors are wired and configured
        // Return false during testing if drive is not connected yet
        return true;
    }
}
```

<details>
<summary><strong>What is CANBusId.RIO?</strong></summary>

**CANBusId.RIO** means the device is connected to the roboRIO's built-in CAN bus.

Some robots have multiple CAN buses:
- `RIO` = the main CAN bus on the roboRIO (most devices)
- `CANivore` = a separate CAN bus using a CTRE CANivore device (faster, used for swerve)

**Analogy:** Think of CAN buses like different phone networks. Most phones are on the main network (RIO), but some high-performance devices use a dedicated line (CANivore) for faster communication.

```java
// Device on the roboRIO's CAN bus
new CANMotorControllerInfo("Shooter", CANBusId.RIO, 15);

// Device on a CANivore bus (faster, used for swerve modules)
new CANMotorControllerInfo("FLDrive", CANBusId.CANivore, 11);
```

</details>

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
// Read the stored preference from the roboRIO's persistent storage
// "ContractToUse" is the key, "Competition" is the default if not set
String chosenContract = Preferences.getString("ContractToUse", "Competition");

// Create the appropriate component based on which contract is selected
switch (chosenContract) {
    case "2023": return DaggerRobotComponent2023.create();  // Last year's robot
    case "2025": return DaggerRobotComponent2025.create();  // Practice bot
    case "Robox": return DaggerRoboxComponent.create();      // Test rig
    default: return DaggerRobotComponent.create();           // Competition robot
}
```

This means you can flash the same code to different robots and just change the preference.

<details>
<summary><strong>Why would you switch contracts?</strong></summary>

**Scenario 1: Practice robot vs Competition robot**
The practice robot (Robox) might have different wiring than the competition robot. With contracts, you use the same code for both -- just switch the contract.

**Scenario 2: Mid-season rewiring**
If the electrical team moves a motor from port 5 to port 10, you update the contract and redeploy. No need to search through subsystem code.

**Scenario 3: Reusing last year's code**
Start with last year's contract as a template. Update the CAN IDs for this year's wiring. All the subsystem logic stays the same.

```
Same code + Different contract = Works on any robot
```

</details>

## Adding a New Device

[Source: TeamXbot2026 ElectricalContract](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/electrical_contract/ElectricalContract.java)

1. Add an abstract method to `ElectricalContract`:
   ```java
   // Define what info the subsystem needs about this device
   public abstract CANMotorControllerInfo getClimberMotor();
   public abstract boolean isClimberReady();
   ```

2. Implement it in each contract:
   ```java
   @Override
   public CANMotorControllerInfo getClimberMotor() {
       // "Climber" = name, CANBusId.RIO = bus, 15 = CAN ID
       return new CANMotorControllerInfo("Climber", CANBusId.RIO, 15);
   }

   @Override
   public boolean isClimberReady() {
       // Return true if the climber motor is wired
       return true;
   }
   ```

3. Use it in your subsystem:
   ```java
   // Always check ready before creating the motor
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

<details>
<summary>Answer</summary>

**B) You change wiring in ONE place instead of searching through code**

**Why:** The electrical contract centralizes all wiring information. When a CAN ID changes, you update it in the contract and every subsystem automatically uses the new value. Without a contract, you would need to find and update every file that references that CAN ID. Options A, C, and D are unrelated to what an electrical contract does.

</details>

**Q2:** Which type is used for CAN motors like TalonFX or SparkMax?

- [ ] A) `DeviceInfo`
- [ ] B) `IMUInfo`
- [ ] C) `CANMotorControllerInfo`
- [ ] D) `PDHPort`

<details>
<summary>Answer</summary>

**C) `CANMotorControllerInfo`**

**Why:** `CANMotorControllerInfo` stores the name, CAN bus, and CAN ID for a motor controller. `DeviceInfo` is for generic devices like encoders. `IMUInfo` is specifically for gyroscopes (Inertial Measurement Units). `PDHPort` is for Power Distribution Hub ports. The naming tells you what each is for: "CAN" + "Motor" + "Controller" + "Info".

</details>

**Q3:** How does XBot switch between practice and competition contracts?

- [ ] A) By editing `build.gradle`
- [ ] B) By recompiling with a different flag
- [ ] C) At runtime based on a stored preference
- [ ] D) It cannot switch contracts

<details>
<summary>Answer</summary>

**C) At runtime based on a stored preference**

**Why:** XBot reads a preference stored on the roboRIO (`Preferences.getString("ContractToUse", ...)`) and creates the appropriate Dagger component. This means you can switch contracts without rebuilding or redeploying code -- just change the preference value. Options A and B would require recompiling. Option D is wrong because switching contracts is a core feature of XBot's architecture.

</details>
