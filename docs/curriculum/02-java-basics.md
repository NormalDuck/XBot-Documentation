# Java Basics

A quick crash course in Java. You only need to know enough to write robot code.

## Variables

```java
int count = 5;              // Whole numbers
double speed = 0.75;        // Decimal numbers
String name = "XBot";       // Text
boolean isEnabled = true;   // True or false
```

## Methods

```java
// Returns a value
public double add(double a, double b) {
    return a + b;
}

// Does something, returns nothing (void)
public void stopMotor() {
    motor.setPower(0);
}
```

## Classes & Objects

A **class** is a blueprint. An **object** is a specific instance.

```java
public class Motor {
    private int port;

    // Constructor - runs when you create a new Motor
    public Motor(int port) {
        this.port = port;
    }

    public void setPower(double power) {
        // Send power to motor at this port
    }
}

// Create an object
Motor leftMotor = new Motor(1);
leftMotor.setPower(0.5);
```

## Inheritance

A child class **extends** a parent class and can override its methods.

```java
public class Subsystem {
    public void periodic() { }
}

public class DriveSubsystem extends Subsystem {
    @Override
    public void periodic() {
        // Called every robot loop (~20ms)
    }
}
```

## Interfaces

An **interface** defines a contract. Any class that `implements` it must provide the methods.

```java
public interface ElectricalContract {
    CANMotorControllerInfo getLeftMotor();
    CANMotorControllerInfo getRightMotor();
}

public class CompetitionContract implements ElectricalContract {
    @Override
    public CANMotorControllerInfo getLeftMotor() {
        return new CANMotorControllerInfo("Left", 1);
    }

    @Override
    public CANMotorControllerInfo getRightMotor() {
        return new CANMotorControllerInfo("Right", 2);
    }
}
```

## Annotations You'll See

| Annotation | Meaning |
|------------|---------|
| `@Inject` | Dagger provides this dependency automatically |
| `@Singleton` | Only ONE instance exists for the whole robot |
| `@Override` | You're replacing a parent class method |
| `@Component` | Dagger component - builds the dependency graph |
| `@Module` | Dagger module - maps interfaces to implementations |
| `@Binds` | Tells Dagger "when asked for X, give Y" |

## Key Terms

| Term | Meaning |
|------|---------|
| `this` | Reference to the current object |
| `final` | Cannot be changed after assignment |
| `private` | Only accessible inside this class |
| `public` | Accessible from anywhere |
| `abstract` | Cannot be instantiated directly; must be extended |

---

## Quiz

**Q1:** Which keyword is used for a class to inherit from another class?

- [ ] A) `implements`
- [ ] B) `inherits`
- [ ] C) `extends`
- [ ] D) `super`

<details><summary>Answer</summary>C) `extends`</details>

**Q2:** What does the `@Override` annotation indicate?

- [ ] A) The method is deprecated
- [ ] B) You're replacing a parent class method
- [ ] C) The method runs on the robot
- [ ] D) The method is private

<details><summary>Answer</summary>B) You're replacing a parent class method</details>

**Q3:** What is the difference between an interface and a class?

- [ ] A) Interfaces can have method bodies
- [ ] B) Classes define a contract; interfaces implement it
- [ ] C) Interfaces define a contract; classes implement it
- [ ] D) There is no difference

<details><summary>Answer</summary>C) Interfaces define a contract; classes implement it</details>
