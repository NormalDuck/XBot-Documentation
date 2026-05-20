# Providers & Factories

Creating objects that need runtime parameters.

## The Problem

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

Dagger can inject dependencies, but what if you need to create objects with values only known at runtime?

```java
// Dagger can't provide these - they're runtime values that change per subsystem
new PIDManager("MyPID", 4.0, 0.0, 0.0);  // P, I, D vary per mechanism
new MotorController("FrontLeft", 11);     // CAN ID varies per robot
```

<details>
<summary><strong>What are "runtime values"?</strong></summary>

**Runtime values** are values that are not known until the program is actually running. They cannot be determined at compile time.

**Analogy:** Think of ordering food:
- Compile time = writing the menu (you know what dishes exist)
- Runtime = a customer ordering (you do not know what they will pick until they order)

```java
// Compile-time known (Dagger can provide these):
// - The PIDManagerFactory itself
// - The PropertyFactory
// - The RobotAssertionManager

// Runtime-only known (Dagger CANNOT provide these):
// - "MyPID" (the name depends on which subsystem is being created)
// - 4.0 (the P value depends on the mechanism being controlled)
// - 11 (the CAN ID depends on how the robot is wired)
```

Dagger works at compile time. It cannot know what values you will need at runtime. That is where factories come in.

</details>

## The Solution: Assisted Injection

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

XBot uses **Dagger Assisted Injection** to combine Dagger-provided dependencies with runtime values.

### Defining a Factory

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

```java
// @AssistedFactory tells Dagger: "Generate an implementation of this factory"
// The factory will combine Dagger-provided dependencies with runtime parameters
@AssistedFactory
public abstract static class PIDManagerFactory {
    // This method defines what runtime values are needed to create a PIDManager
    // @Assisted marks parameters that the caller provides (not Dagger)
    public abstract PIDManager create(
        String functionName,                              // Runtime: name for this PID
        @Assisted("defaultP") double defaultP,            // Runtime: P value
        @Assisted("defaultI") double defaultI,            // Runtime: I value
        @Assisted("defaultD") double defaultD,            // Runtime: D value
        @Assisted("defaultF") double defaultF,            // Runtime: F value
        @Assisted("defaultMaxOutput") double defaultMaxOutput,  // Runtime: max output
        @Assisted("defaultMinOutput") double defaultMinOutput   // Runtime: min output
    );
}
```

### Constructor with @AssistedInject

[Source: SeriouslyCommonLib PIDManager](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/math/PIDManager.java)

```java
// @AssistedInject tells Dagger: "This constructor mixes Dagger deps with runtime params"
@AssistedInject
public PIDManager(
    @Assisted String functionName,                        // From caller (runtime)
    PropertyFactory propMan,                              // From Dagger (compile-time)
    RobotAssertionManager assertionManager,               // From Dagger (compile-time)
    @Assisted("defaultP") double defaultP,                // From caller (runtime)
    @Assisted("defaultI") double defaultI,                // From caller (runtime)
    @Assisted("defaultD") double defaultD,                // From caller (runtime)
    // ... more assisted params
) {
    // Mix Dagger-provided and runtime-provided values
    // Dagger handles propMan and assertionManager
    // Caller provides functionName, P, I, D, etc.
}
```

<details>
<summary><strong>How does assisted injection work step by step?</strong></summary>

```
Step 1: Dagger creates the Factory (at compile time)
  Dagger generates the code that implements PIDManagerFactory

Step 2: Your subsystem requests the Factory (via @Inject)
  @Inject
  MySubsystem(PIDManagerFactory factory) {
      // Dagger provides the factory
  }

Step 3: Your code calls the factory with runtime values
  PIDManager pid = factory.create("ElevatorPID", 4.0, 0.0, 0.0, ...);

Step 4: The factory combines everything
  - Dagger-provided: PropertyFactory, RobotAssertionManager
  - Caller-provided: "ElevatorPID", 4.0, 0.0, 0.0, ...
  → Creates a fully configured PIDManager
```

The key insight: **Dagger provides the factory, you provide the runtime values.**

</details>

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
    private final XCANMotorController motor;  // The actual motor controller
    private final PIDManager pid;             // The PID controller

    // @Inject tells Dagger to call this constructor and provide the factories
    @Inject
    public MySubsystem(
        XCANMotorController.XCANMotorControllerFactory motorFactory,  // Dagger provides
        PIDManager.PIDManagerFactory pidFactory,                      // Dagger provides
        ElectricalContract contract,                                  // Dagger provides
        PropertyFactory pf) {                                         // Dagger provides

        // Use factory with runtime values from the electrical contract
        this.motor = motorFactory.create(
            contract.getMyMotor(),     // Runtime value: which motor (from contract)
            this.getPrefix(),           // Runtime value: subsystem name
            "MyMotorPID"                // Runtime value: PID name for dashboard
        );

        // Use factory with runtime values for PID tuning
        this.pid = pidFactory.create(
            "MyPID",                    // Name for logging
            1.0, 0.0, 0.0,             // P, I, D values
            1.0, -1.0                   // max output, min output
        );
    }
}
```

## Why Not Just Use `new`?

[Source: XbotEdu Test Components](https://github.com/Team488/XbotEdu/tree/main/src/test/java/injection/components)

Using factories keeps the code testable. In tests, you can provide mock factories that return fake objects instead of real hardware.

<details>
<summary><strong>How do factories help with testing?</strong></summary>

In tests, you replace real factories with mock factories that return fake objects:

```java
// Real code (on the robot):
// MotorControllerFactory creates real TalonFX/SparkMax objects

// Test code (on your computer):
@Test
public void testMotor() {
    // Create a fake factory that returns a mock motor
    MotorControllerFactory fakeFactory = new MotorControllerFactory() {
        public XCANMotorController create(...) {
            return mock(XCANMotorController.class);  // Fake motor!
        }
    };

    // Now you can test without real hardware
    MySubsystem subsystem = new MySubsystem(fakeFactory, ...);
    subsystem.setPower(0.5);
    // Verify the motor received the correct command
}
```

If you used `new TalonFX(...)` directly inside the subsystem, you could not replace it with a fake. The test would try to create real hardware and fail.

</details>

---

## Quiz

**Q1:** Why use factories instead of `new` to create objects?

- [ ] A) Factories are slower but safer
- [ ] B) Factories allow Dagger to inject dependencies into objects with runtime parameters
- [ ] C) `new` is not valid Java
- [ ] D) Factories use less memory

<details>
<summary>Answer</summary>

**B) Factories allow Dagger to inject dependencies into objects with runtime parameters**

**Why:** Factories combine Dagger-provided dependencies (like PropertyFactory, RobotAssertionManager) with runtime values (like CAN IDs, PID gains) that Dagger cannot know at compile time. Option A is wrong -- factories are not slower. Option C is wrong -- `new` is perfectly valid Java, it just does not work with DI. Option D is wrong -- factories do not save memory.

</details>

**Q2:** Which annotation marks parameters that are provided at runtime (not by Dagger)?

- [ ] A) `@Inject`
- [ ] B) `@Singleton`
- [ ] C) `@Assisted`
- [ ] D) `@Override`

<details>
<summary>Answer</summary>

**C) `@Assisted`**

**Why:** `@Assisted` marks constructor parameters that the caller provides at runtime, as opposed to `@Inject` which marks parameters that Dagger provides. `@Singleton` is a scope annotation. `@Override` marks methods that replace parent class methods.

```java
@AssistedInject
public PIDManager(
    @Assisted String name,       // Caller provides this at runtime
    PropertyFactory propMan,     // Dagger provides this automatically
    @Assisted double pValue      // Caller provides this at runtime
) { }
```

</details>

**Q3:** Which factory creates motor controllers in XBot?

- [ ] A) `MotorFactory`
- [ ] B) `XCANMotorController.XCANMotorControllerFactory`
- [ ] C) `TalonFXFactory`
- [ ] D) `DeviceFactory`

<details>
<summary>Answer</summary>

**B) `XCANMotorController.XCANMotorControllerFactory`**

**Why:** This is the factory class defined inside `XCANMotorController` that creates motor controller instances. It is a nested class (inner class) of `XCANMotorController`. Options A, C, and D do not exist in XBot's codebase. The naming follows the pattern: `ClassName.ClassNameFactory`.

```java
// Usage:
XCANMotorController motor = motorFactory.create(
    contract.getMotor(),
    "Name",
    "PIDPrefix"
);
```

</details>
