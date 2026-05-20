# Dependency Injection

How XBot uses Dagger to wire everything together automatically.

## The Problem

Without DI, you'd create dependencies manually:

[Source: TeamXbot2026 ShooterSubsystem](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/ShooterSubsystem.java)

```java
// BAD: Hard to test, tightly coupled
public class ShooterSubsystem() {
    private ElectricalContract contract = new CompetitionContract();
    private PIDManager pid = new PIDManager(...);
    private MotorController motor = new TalonFX(...);
}
```

This makes testing impossible and couples your code to specific hardware.

## The XBot Solution: Dagger

[Source: TeamXbot2026 ShooterSubsystem](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/subsystems/shooter/ShooterSubsystem.java)

Dagger creates and provides dependencies automatically:

```java
// GOOD: Dependencies are injected
@Singleton
public class ShooterSubsystem {
    private final ElectricalContract contract;
    private final PIDManager pid;
    private final XCANMotorController motor;

    @Inject
    public ShooterSubsystem(
        ElectricalContract contract,
        PIDManager.PIDManagerFactory pidFactory,
        XCANMotorController.XCANMotorControllerFactory motorFactory) {
        this.contract = contract;
        this.pid = pidFactory.create("ShooterPID", ...);
        this.motor = motorFactory.create(contract.getShooterMotor(), ...);
    }
}
```

## How Dagger Works in XBot

[Source: TeamXbot2026 RobotComponent](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/injection/components/RobotComponent.java)

### 1. Component (the entry point)

[Source: TeamXbot2026 RobotComponent](https://github.com/Team488/TeamXbot2026/blob/main/src/main/java/competition/injection/components/RobotComponent.java)

```java
@Singleton
@Component(modules = {
    RobotModule.class,        // Core bindings
    RealDevicesModule.class,  // Real hardware
    RealControlsModule.class, // Real controllers
    CompetitionModule.class,  // Competition-specific
    CommonModule.class        // Shared code
})
public abstract class RobotComponent extends BaseRobotComponent { }
```

Dagger generates `DaggerRobotComponent` at compile time.

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
@Inject
public SwerveDriveWithJoysticksCommand(
    OperatorInterface oi,
    DriveSubsystem drive,
    PoseSubsystem pose,
    PropertyFactory pf,
    HeadingModuleFactory headingModuleFactory) {
    // All parameters are provided by Dagger automatically
}
```

## Scopes

[Source: SeriouslyCommonLib SwerveSingleton](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/injection/swerve/SwerveSingleton.java)

| Scope | Meaning |
|-------|---------|
| `@Singleton` | One instance for the entire robot |
| `@SwerveSingleton` | One instance per swerve module (4 total) |

### Swerve Singleton Example

[Source: SeriouslyCommonLib SwerveDriveSubsystem](https://github.com/Team488/SeriouslyCommonLib/blob/main/src/main/java/xbot/common/subsystems/drive/swerve/SwerveDriveSubsystem.java)

```java
@SwerveSingleton
public class SwerveDriveSubsystem {
    @Inject
    public SwerveDriveSubsystem(
        SwerveInstance swerveInstance,  // "FrontLeft", "FrontRight", etc.
        XCANMotorControllerFactory mcFactory,
        PropertyFactory pf,
        XSwerveDriveElectricalContract contract) { ... }
}
```

Each of the 4 swerve modules gets its own `SwerveDriveSubsystem` instance.

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

<details><summary>Answer</summary>B) Provide this dependency automatically</details>

**Q2:** What does `@Singleton` mean?

- [ ] A) The class has only one method
- [ ] B) Only ONE instance exists for the whole robot
- [ ] C) The class is deprecated
- [ ] D) The class runs in simulation only

<details><summary>Answer</summary>B) Only ONE instance exists for the whole robot</details>

**Q3:** What is a Dagger Component?

- [ ] A) A physical robot part
- [ ] B) The entry point that builds the dependency graph
- [ ] C) A type of motor controller
- [ ] D) A test framework

<details><summary>Answer</summary>B) The entry point that builds the dependency graph</details>
