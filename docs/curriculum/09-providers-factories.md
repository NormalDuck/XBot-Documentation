# Providers & Factories

Creating objects that need runtime parameters.

## The Problem

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

Dagger can inject dependencies, but what if you need to create objects with values only known at runtime?

```java
// Dagger can't provide these - they're runtime values
new PIDManager("MyPID", 4.0, 0.0, 0.0);  // P, I, D vary per subsystem
new MotorController("FrontLeft", 11);     // CAN ID varies per robot
```

## The Solution: Assisted Injection

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

XBot uses **Dagger Assisted Injection** to combine Dagger-provided dependencies with runtime values.

### Defining a Factory

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

```java
@AssistedFactory
public abstract static class PIDManagerFactory {
    public abstract PIDManager create(
        String functionName,
        @Assisted("defaultP") double defaultP,
        @Assisted("defaultI") double defaultI,
        @Assisted("defaultD") double defaultD,
        @Assisted("defaultF") double defaultF,
        @Assisted("defaultMaxOutput") double defaultMaxOutput,
        @Assisted("defaultMinOutput") double defaultMinOutput
    );
}
```

### Constructor with @AssistedInject

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

```java
@AssistedInject
public PIDManager(
    @Assisted String functionName,
    PropertyFactory propMan,              // Provided by Dagger
    RobotAssertionManager assertionManager, // Provided by Dagger
    @Assisted("defaultP") double defaultP,
    @Assisted("defaultI") double defaultI,
    @Assisted("defaultD") double defaultD,
    // ... more assisted params
) {
    // Mix Dagger-provided and runtime-provided values
}
```

## Common XBot Factories

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

| Factory | Creates |
|---------|---------|
| `XCANMotorController.XCANMotorControllerFactory` | Motor controllers |
| `PIDManager.PIDManagerFactory` | PID controllers |
| `HumanVsMachineDecider.HumanVsMachineDeciderFactory` | Human/machine state machines |
| `HeadingModule.HeadingModuleFactory` | Heading PID modules |
| `XDigitalInput.XDigitalInputFactory` | Digital sensors |
| `XLaserCAN.XLaserCANFactory` | Laser distance sensors |

## Usage Pattern

[Source: TeamXbot2025 ElevatorSubsystem](https://github.com/Team488/TeamXbot2025/blob/main/src/main/java/competition/subsystems/elevator/ElevatorSubsystem.java)

```java
public class MySubsystem extends BaseSubsystem {
    private final XCANMotorController motor;
    private final PIDManager pid;

    @Inject
    public MySubsystem(
        XCANMotorController.XCANMotorControllerFactory motorFactory,
        PIDManager.PIDManagerFactory pidFactory,
        ElectricalContract contract,
        PropertyFactory pf) {

        // Use factory with runtime values
        this.motor = motorFactory.create(
            contract.getMyMotor(),     // Runtime value from contract
            this.getPrefix(),           // Runtime value
            "MyMotorPID"                // Runtime value
        );

        this.pid = pidFactory.create(
            "MyPID",
            1.0, 0.0, 0.0,  // P, I, D
            1.0, -1.0        // max, min output
        );
    }
}
```

## Why Not Just Use `new`?

[Source: XbotEdu Test Components](https://github.com/Team488/XbotEdu/tree/main/src/test/java/injection/components)

Using factories keeps the code testable. In tests, you can provide mock factories that return fake objects instead of real hardware.

---

## Quiz

**Q1:** Why use factories instead of `new` to create objects?

- [ ] A) Factories are slower but safer
- [ ] B) Factories allow Dagger to inject dependencies into objects with runtime parameters
- [ ] C) `new` is not valid Java
- [ ] D) Factories use less memory

<details><summary>Answer</summary>B) Factories allow Dagger to inject dependencies into objects with runtime parameters</details>

**Q2:** Which annotation marks parameters that are provided at runtime (not by Dagger)?

- [ ] A) `@Inject`
- [ ] B) `@Singleton`
- [ ] C) `@Assisted`
- [ ] D) `@Override`

<details><summary>Answer</summary>C) `@Assisted`</details>

**Q3:** Which factory creates motor controllers in XBot?

- [ ] A) `MotorFactory`
- [ ] B) `XCANMotorController.XCANMotorControllerFactory`
- [ ] C) `TalonFXFactory`
- [ ] D) `DeviceFactory`

<details><summary>Answer</summary>B) `XCANMotorController.XCANMotorControllerFactory`</details>
