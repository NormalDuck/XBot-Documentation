# Dependency Injection

How XBot uses Dagger to wire everything together automatically.

<details>
<summary><strong>What is Dependency Injection?</strong></summary>

**Dependency Injection (DI)** is a pattern where instead of an object creating its own dependencies, they are provided (injected) from the outside.

**Analogy:** Imagine you are making a sandwich:

```
Without DI (making everything yourself):
  You grow wheat → make bread → raise cows → make cheese → make sandwich
  (You do EVERYTHING -- lots of work, hard to change ingredients)

With DI (someone provides the ingredients):
  Someone hands you bread, cheese, and lettuce → you assemble the sandwich
  (You focus on assembly, ingredients can be swapped easily)
```

In code:
```java
// Without DI: ShooterSubsystem creates its own dependencies
class ShooterSubsystem {
    private Motor motor = new TalonFX(15);        // Hardcoded!
    private PIDManager pid = new PIDManager(...);  // Hardcoded!
}

// With DI: Dependencies are provided
class ShooterSubsystem {
    private final Motor motor;
    private final PIDManager pid;

    @Inject
    ShooterSubsystem(Motor motor, PIDManager pid) {  // Provided for you!
        this.motor = motor;
        this.pid = pid;
    }
}
```

</details>

## The Problem

Without DI, you would create dependencies manually:

[Source: TeamXbot2026 ShooterSubsystem](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/ShooterSubsystem.java)

```java
// BAD: Hard to test, tightly coupled
// Every dependency is hardcoded inside the class
public class ShooterSubsystem() {
    private ElectricalContract contract = new CompetitionContract();  // Always this contract
    private PIDManager pid = new PIDManager(...);                      // Always these values
    private MotorController motor = new TalonFX(...);                  // Always this motor type
}
```

This makes testing impossible and couples your code to specific hardware.

<details>
<summary><strong>Why is this bad for testing?</strong></summary>

When dependencies are hardcoded inside a class, you cannot replace them with fake versions for testing.

**Scenario:** You want to test your shooter code, but you do not have a physical robot. With hardcoded dependencies, your test tries to create a real TalonFX motor controller, which fails because there is no robot connected.

```java
// With hardcoded dependencies:
@Test
public void testShooter() {
    ShooterSubsystem shooter = new ShooterSubsystem();
    // CRASH! Tries to create real hardware that does not exist
}

// With DI:
@Test
public void testShooter() {
    // Create fake (mock) dependencies
    ElectricalContract fakeContract = mock(ElectricalContract.class);
    PIDManager fakePid = mock(PIDManager.class);

    ShooterSubsystem shooter = new ShooterSubsystem(fakeContract, fakePid);
    // Works! No real hardware needed
    shooter.setTargetVelocity(5000);
    // Now you can test the logic without a robot
}
```

</details>

## The XBot Solution: Dagger

[Source: TeamXbot2026 ShooterSubsystem](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/ShooterSubsystem.java)

Dagger creates and provides dependencies automatically:

```java
// GOOD: Dependencies are injected
// @Singleton means only ONE ShooterSubsystem exists for the whole robot
@Singleton
public class ShooterSubsystem {
    // "final" means these cannot be changed after construction -- safe and predictable
    private final ElectricalContract contract;
    private final PIDManager pid;
    private final XCANMotorController motor;

    // @Inject tells Dagger: "Call this constructor to create a ShooterSubsystem"
    // Dagger will automatically find and provide all these parameters
    @Inject
    public ShooterSubsystem(
        ElectricalContract contract,                                    // Provided by Dagger
        PIDManager.PIDManagerFactory pidFactory,                        // Provided by Dagger
        XCANMotorController.XCANMotorControllerFactory motorFactory) {  // Provided by Dagger
        this.contract = contract;
        // Use the factory to create PID with runtime values (name, P, I, D)
        this.pid = pidFactory.create("ShooterPID", ...);
        // Use the factory to create motor with runtime values (contract info)
        this.motor = motorFactory.create(contract.getShooterMotor(), ...);
    }
}
```

<details>
<summary><strong>What is Dagger?</strong></summary>

**Dagger** is a dependency injection library for Java. It analyzes your code at compile time and generates the code that creates and connects all your objects.

**Analogy:** Dagger is like a wedding planner. Instead of you manually coordinating every vendor (caterer, florist, DJ), you tell the planner what you need and they handle all the connections.

```
You tell Dagger:
  "ShooterSubsystem needs a Motor and a PIDManager"

Dagger figures out:
  1. Create ElectricalContract first
  2. Create PIDManagerFactory
  3. Create MotorControllerFactory
  4. Create ShooterSubsystem with all of the above
  5. Done!
```

**Why Dagger over manual DI:**
- No boilerplate code to wire things together
- Catches missing dependencies at compile time (not runtime crashes)
- Handles complex dependency chains automatically
- Generates efficient code (no reflection overhead)

</details>

## How Dagger Works in XBot

[Source: TeamXbot2026 RobotComponent](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/injection/components/RobotComponent.java)

### 1. Component (the entry point)

[Source: TeamXbot2026 RobotComponent](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/injection/components/RobotComponent.java)

```java
// @Singleton means this component creates singletons (one instance each)
// @Component tells Dagger: "This is the entry point for dependency injection"
@Singleton
@Component(modules = {
    RobotModule.class,        // Core bindings (timer, dashboard, etc.)
    RealDevicesModule.class,  // Real hardware bindings (motors, sensors)
    RealControlsModule.class, // Real controller bindings (gamepads)
    CompetitionModule.class,  // Competition-specific bindings
    CommonModule.class        // Shared code bindings
})
public abstract class RobotComponent extends BaseRobotComponent { }
```

Dagger generates `DaggerRobotComponent` at compile time.

<details>
<summary><strong>What are Dagger modules?</strong></summary>

**Modules** are classes that tell Dagger how to create specific types of objects.

**Analogy:** If the Component is a recipe book, Modules are the individual recipes. Each module knows how to make a specific category of things.

```java
@Module
public abstract class RobotModule {
    // @Binds means: "When someone needs XTimerImpl, give them TimerWpiAdapter"
    @Binds
    @Singleton
    abstract XTimerImpl getTimer(TimerWpiAdapter impl);

    // @Binds means: "When someone needs ITableProxy, give them SmartDashboardTableWrapper"
    @Binds
    @Singleton
    abstract ITableProxy getTableProxy(SmartDashboardTableWrapper impl);
}
```

Think of it as a mapping:
```
When code asks for:     Dagger provides:
─────────────────       ──────────────────
XTimerImpl         →    TimerWpiAdapter
ITableProxy        →    SmartDashboardTableWrapper
ElectricalContract →    CompetitionContract (from CompetitionModule)
```

</details>

### 2. Module (maps interfaces to implementations)

[Source: SeriouslyCommonLib RobotModule](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/modules/RobotModule.java)

```java
@Module
public abstract class RobotModule {
    @Binds
    @Singleton
    abstract XTimerImpl getTimer(TimerWpiAdapter impl);

    @Binds
    @Singleton
    abstract ITableProxy getTableProxy(SmartDashboardTableWrapper impl);
}
```

This says: "When someone asks for `XTimerImpl`, give them `TimerWpiAdapter`."

### 3. @Inject (requests a dependency)

[Source: TeamXbot2026 SwerveDriveWithJoysticksCommand](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/drive/commands/SwerveDriveWithJoysticksCommand.java)

```java
// @Inject tells Dagger: "Use this constructor to create the object"
// Dagger will automatically provide all these parameters
@Inject
public SwerveDriveWithJoysticksCommand(
    OperatorInterface oi,                    // Gamepad/controller interface
    DriveSubsystem drive,                    // Drive mechanism
    PoseSubsystem pose,                      // Robot position tracking
    PropertyFactory pf,                      // Creates tunable properties
    HeadingModuleFactory headingModuleFactory) {  // Creates heading PID modules
    // All parameters are provided by Dagger automatically
    // You do NOT need to create any of these yourself
}
```

<details>
<summary><strong>How does Dagger know what to provide?</strong></summary>

Dagger builds a **dependency graph** -- a map of every object and what it needs.

**Example:**
```
ShooterSubsystem needs:
  ├── ElectricalContract (from CompetitionModule)
  ├── PIDManagerFactory (from CommonModule)
  └── MotorControllerFactory (from RealDevicesModule)

Dagger builds this chain:
  1. CompetitionModule provides ElectricalContract
  2. CommonModule provides PIDManagerFactory
  3. RealDevicesModule provides MotorControllerFactory
  4. All three are passed to ShooterSubsystem constructor
  5. Done!
```

If Dagger cannot find a way to provide a dependency, you get a **compile error** (not a runtime crash). This is much better than discovering the problem when the robot is on the field.

</details>

## Scopes

[Source: SeriouslyCommonLib SwerveSingleton](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/swerve/SwerveSingleton.java)

| Scope | Meaning |
|-------|---------|
| `@Singleton` | One instance for the entire robot |
| `@SwerveSingleton` | One instance per swerve module (4 total) |

### Swerve Singleton Example

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
// @SwerveSingleton means Dagger creates 4 instances of this class
// One for each swerve module: FrontLeft, FrontRight, RearLeft, RearRight
@SwerveSingleton
public class SwerveDriveSubsystem {
    @Inject
    public SwerveDriveSubsystem(
        SwerveInstance swerveInstance,  // "FrontLeft", "FrontRight", etc. - tells which module this is
        XCANMotorControllerFactory mcFactory,
        PropertyFactory pf,
        XSwerveDriveElectricalContract contract) { ... }
}
```

Each of the 4 swerve modules gets its own `SwerveDriveSubsystem` instance.

<details>
<summary><strong>Why does swerve need its own scope?</strong></summary>

A swerve drive has **4 identical modules** (front-left, front-right, rear-left, rear-right). Each module needs its own motor controllers, encoders, and PID values, but they all use the same code.

`@SwerveSingleton` tells Dagger: "Create one instance of this class for each swerve module."

```
Without @SwerveSingleton:
  1 SwerveDriveSubsystem → controls all 4 wheels (messy, hard to manage)

With @SwerveSingleton:
  4 SwerveDriveSubsystems → each controls one wheel (clean, independent)
  - FrontLeft instance
  - FrontRight instance
  - RearLeft instance
  - RearRight instance
```

The `SwerveInstance` parameter tells each instance which wheel it controls.

</details>

## Benefits

[Source: TeamXbot2026 RobotComponent](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/injection/components/RobotComponent.java)

- **Testable**: Swap real hardware for mocks in tests
- **Flexible**: Change implementations without touching subsystem code
- **Organized**: All wiring is in one place (modules)

---

## Quiz

**Q1:** What does the `@Inject` annotation tell Dagger?

- [ ] A) Delete this class
- [ ] B) Provide this dependency automatically
- [ ] C) Run this method first
- [ ] D) Skip this class during testing

<details>
<summary>Answer</summary>

**B) Provide this dependency automatically**

**Why:** `@Inject` tells Dagger that this constructor (or field) needs dependencies provided. When Dagger sees `@Inject` on a constructor, it knows to call that constructor and automatically provide all the parameters. Option A is wrong -- Dagger creates objects, it does not delete them. Option C is wrong -- injection order is determined by dependencies, not `@Inject`. Option D is wrong -- testing uses mock modules, not skipping classes.

```java
// Dagger sees @Inject and knows:
// "I need to create ElectricalContract, PIDManagerFactory, and MotorControllerFactory
//  and pass them to this constructor"
@Inject
public ShooterSubsystem(ElectricalContract contract, ...) { }
```

</details>

**Q2:** What does `@Singleton` mean?

- [ ] A) The class has only one method
- [ ] B) Only ONE instance exists for the whole robot
- [ ] C) The class is deprecated
- [ ] D) The class runs in simulation only

<details>
<summary>Answer</summary>

**B) Only ONE instance exists for the whole robot**

**Why:** `@Singleton` is a scope that tells Dagger to create exactly one instance of this class and reuse it everywhere it is needed. This is important for things like subsystems -- you only want one DriveSubsystem, not multiple copies. Option A is unrelated to singleton (that would just be a class design choice). Option C uses `@Deprecated`. Option D is wrong -- singletons work in both real and simulation modes.

```java
@Singleton
public class DriveSubsystem { }

// Everywhere in the code that asks for DriveSubsystem gets THE SAME instance
DriveSubsystem drive1 = ...;  // The one and only
DriveSubsystem drive2 = ...;  // Same instance as drive1!
drive1 == drive2;  // true
```

</details>

**Q3:** What is a Dagger Component?

- [ ] A) A physical robot part
- [ ] B) The entry point that builds the dependency graph
- [ ] C) A type of motor controller
- [ ] D) A test framework

<details>
<summary>Answer</summary>

**B) The entry point that builds the dependency graph**

**Why:** A Dagger Component is an interface that tells Dagger how to connect all the pieces together. It lists the modules that provide dependencies and serves as the entry point for creating objects. Dagger generates an implementation (like `DaggerRobotComponent`) that actually builds the dependency graph. Options A, C, and D are unrelated to Dagger components.

```java
// The component is the "root" of the dependency tree
@Component(modules = {RobotModule.class, CompetitionModule.class, ...})
public interface RobotComponent {
    // Dagger generates the implementation that wires everything together
}

// Usage in Robot.java:
RobotComponent component = DaggerRobotComponent.create();  // Build the graph
```

</details>
