# Java Basics

A quick crash course in Java. You only need to know enough to write robot code.

<details>
<summary><strong>Do I need to learn all of Java?</strong></summary>

**No!** You only need a subset of Java to write robot code. This module covers exactly what you will use. Think of it like learning to drive -- you do not need to know how the engine works, just how to steer, brake, and accelerate.

**What you WILL use:** variables, methods, classes, inheritance, interfaces
**What you will NOT need (for now):** generics, streams, reflection, multithreading

Focus on understanding the concepts here. You will learn more as you go.

</details>

## Variables

```java
int count = 5;              // Whole numbers (no decimals): 1, 42, -7
double speed = 0.75;        // Decimal numbers: 3.14, -0.5, 100.0
String name = "XBot";       // Text (must be in quotes): "Hello", "FrontLeft"
boolean isEnabled = true;   // True or false only: true, false
```

<details>
<summary><strong>Why are there different types of numbers?</strong></summary>

Java is a **strongly typed** language, meaning every variable must have a specific type. This prevents bugs.

**Analogy:** Think of variable types like different containers:
- `int` = a box that only holds whole items (you cannot put half an apple in it)
- `double` = a measuring cup that can hold any amount (1.5 cups, 0.75 cups)

**When to use which:**
- Use `int` for counting things: number of motors, CAN IDs, array indices
- Use `double` for measurements: speed, voltage, PID values, distances

```java
int motorPort = 5;          // Port numbers are always whole numbers
double motorSpeed = 0.75;   // Speed can be any value between -1.0 and 1.0
```

**Common mistake:** `int speed = 0.75;` will not compile! You cannot put a decimal in an int.

</details>

## Methods

```java
// Returns a value - the caller gets the result back
// "public" means any other class can call this method
// "double" is the return type - this method gives back a decimal number
public double add(double a, double b) {
    return a + b;  // "return" sends the result back to whoever called this
}

// Does something, returns nothing (void)
// "void" means this method does not give anything back - it just does work
public void stopMotor() {
    motor.setPower(0);  // Sets motor power to 0 (stopped)
}
```

<details>
<summary><strong>What is the difference between returning a value and void?</strong></summary>

**Returning a value** is like asking someone a question -- you get an answer back.
**Void** is like giving someone an order -- they just do it, no answer needed.

```java
// Returns a value - like asking "what is 2 + 3?"
double result = add(2, 3);  // result is now 5.0

// Void - like saying "stop the motor!"
stopMotor();  // Just does it, nothing to receive
```

**How to tell:** Look at the method signature:
- `public double add(...)` -- returns a `double`, you must use `return` inside
- `public void stopMotor()` -- returns nothing (`void`), no `return` needed

</details>

## Classes & Objects

A **class** is a blueprint. An **object** is a specific instance.

```java
public class Motor {
    private int port;  // "private" means only code inside this class can access this

    // Constructor - runs automatically when you create a new Motor
    // The parameter (int port) is the information needed to create this Motor
    public Motor(int port) {
        this.port = port;  // "this.port" = this object's port, "port" = the parameter
    }

    // Method - something this Motor can do
    public void setPower(double power) {
        // Send power to motor at this port
        // In real code, this would communicate with the actual hardware
    }
}

// Create an object (an actual Motor, not just the blueprint)
// "new Motor(1)" calls the constructor with port = 1
Motor leftMotor = new Motor(1);
leftMotor.setPower(0.5);  // Set this specific motor to 50% power
```

<details>
<summary><strong>Class vs Object -- what is the difference?</strong></summary>

**Analogy:** A class is like a cookie cutter. An object is an actual cookie made from that cutter.

```
Class (blueprint):     Motor                    -- Just the design
Objects (instances):   leftMotor, rightMotor    -- Actual motors you use
```

You can create many objects from one class:
```java
Motor leftMotor = new Motor(1);    // Motor on port 1
Motor rightMotor = new Motor(2);   // Motor on port 2
Motor armMotor = new Motor(3);     // Motor on port 3

// Each is independent - changing one does not affect the others
leftMotor.setPower(0.5);    // Only left motor moves
rightMotor.setPower(-0.5);  // Only right motor moves (reverse)
```

**In robot code:** You will have one class (like `ShooterSubsystem`) but might create multiple objects from it (left shooter, right shooter).

</details>

## Inheritance

A child class **extends** a parent class and can override its methods.

```java
// Parent class (also called "base class" or "superclass")
// Defines behavior that all subsystems share
public class Subsystem {
    public void periodic() { }  // Empty by default - child classes can fill this in
}

// Child class (also called "derived class")
// "extends Subsystem" means DriveSubsystem IS A Subsystem with extra features
public class DriveSubsystem extends Subsystem {
    // @Override tells Java: "I am replacing the parent's version of this method"
    @Override
    public void periodic() {
        // Called every robot loop (~20ms)
        // This code runs 50 times per second while the robot is on
        // Update motor speeds, read sensors, etc.
    }
}
```

<details>
<summary><strong>Why use inheritance?</strong></summary>

**Inheritance** lets you reuse code. Instead of writing the same code in every subsystem, you put common behavior in a parent class and only write the differences in child classes.

**Analogy:** Think of a school uniform policy. The school (parent class) says "all students wear a uniform." Each student (child class) follows that rule but can personalize it (different shoes, accessories).

```java
// Without inheritance (repeating code):
public class DriveSubsystem {
    public void periodic() { /* update motors */ }
    public void logData() { /* send to dashboard */ }
}
public class ShooterSubsystem {
    public void periodic() { /* update shooter */ }
    public void logData() { /* send to dashboard */ }  // Same code!
}

// With inheritance (no repetition):
public class Subsystem {
    public void periodic() { }       // Common behavior
    public void logData() { }        // Common behavior
}
public class DriveSubsystem extends Subsystem {
    @Override
    public void periodic() { /* update motors */ }  // Only the difference
}
public class ShooterSubsystem extends Subsystem {
    @Override
    public void periodic() { /* update shooter */ }  // Only the difference
}
```

**In XBot:** Most of your subsystems will extend `BaseSubsystem` which provides logging, periodic calls, and other common features.

</details>

## Interfaces

An **interface** defines a contract. Any class that `implements` it must provide the methods.

```java
// Interface: defines WHAT methods must exist, but not HOW they work
// Think of this as a job description - it lists requirements but does not do the work
public interface ElectricalContract {
    CANMotorControllerInfo getLeftMotor();   // Must provide this method
    CANMotorControllerInfo getRightMotor();  // Must provide this method too
}

// Concrete class: actually implements the interface
// "implements ElectricalContract" promises to provide all methods the interface requires
public class CompetitionContract implements ElectricalContract {
    @Override  // We are providing the interface's required method
    public CANMotorControllerInfo getLeftMotor() {
        return new CANMotorControllerInfo("Left", CANBusId.RIO, 1);  // Port 1
    }

    @Override
    public CANMotorControllerInfo getRightMotor() {
        return new CANMotorControllerInfo("Right", CANBusId.RIO, 2);  // Port 2
    }
}
```

<details>
<summary><strong>Interface vs Class -- when to use which?</strong></summary>

**Interface** = a contract that says "any class implementing me must have these methods"
**Class** = actual implementation with working code

**Analogy:** An interface is like a restaurant menu listing what dishes are available. The class is the kitchen that actually cooks the food.

```java
// Interface: "Any contract must be able to tell me about motors"
interface ElectricalContract {
    CANMotorControllerInfo getMotor(String name);
    boolean isMotorReady(String name);
}

// Implementation 1: Competition robot wiring
class CompetitionContract implements ElectricalContract {
    public CANMotorControllerInfo getMotor(String name) {
        // Returns actual CAN IDs for the competition robot
    }
}

// Implementation 2: Practice robot (different wiring!)
class PracticeContract implements ElectricalContract {
    public CANMotorControllerInfo getMotor(String name) {
        // Returns different CAN IDs for the practice robot
    }
}

// Your subsystem code uses the INTERFACE, not a specific implementation:
ElectricalContract contract = ...;  // Could be either!
contract.getMotor("LeftMotor");     // Works with either robot
```

**Why this matters:** Your subsystem code does not care which robot it is on. It just asks the contract for motor info. Swap contracts and the same code works on any robot.

</details>

## Annotations You Will See

| Annotation | Meaning |
|------------|---------|
| `@Inject` | Dagger provides this dependency automatically |
| `@Singleton` | Only ONE instance exists for the whole robot |
| `@Override` | You are replacing a parent class method |
| `@Component` | Dagger component - builds the dependency graph |
| `@Module` | Dagger module - maps interfaces to implementations |
| `@Binds` | Tells Dagger "when asked for X, give Y" |

<details>
<summary><strong>What are annotations?</strong></summary>

**Annotations** are metadata -- extra information you attach to code that tools (like Dagger or the Java compiler) can read and act on.

**Analogy:** Think of annotations like sticky notes on a document. The document works fine without them, but the sticky notes give special instructions to specific people.

```java
// Without annotation: Java treats this like any other method
public ShooterSubsystem(ElectricalContract contract) { ... }

// With annotation: Dagger sees @Inject and knows to call this method automatically
@Inject
public ShooterSubsystem(ElectricalContract contract) { ... }
```

You do not need to create your own annotations. Just know what the existing ones mean when you see them.

</details>

## Key Terms

| Term | Meaning |
|------|---------|
| `this` | Reference to the current object |
| `final` | Cannot be changed after assignment |
| `private` | Only accessible inside this class |
| `public` | Accessible from anywhere |
| `abstract` | Cannot be instantiated directly; must be extended |

<details>
<summary><strong>What does `this` mean?</strong></summary>

`this` refers to **the current object** -- the specific instance that the code is running on.

**Why it is needed:** When a parameter has the same name as a field, `this` tells Java which one you mean.

```java
public class Motor {
    private int port;  // This is the field (stored on the object)

    public Motor(int port) {  // This "port" is the parameter
        this.port = port;     // "this.port" = the field, "port" = the parameter
        // Translation: "Set my port field to the port value you were given"
    }
}
```

**Analogy:** If someone named Alex is in a room with another Alex, saying "Alex, come here" is confusing. Saying "this Alex" (pointing) makes it clear. `this` is Java's way of pointing.

</details>

---

## Quiz

**Q1:** Which keyword is used for a class to inherit from another class?

- [ ] A) `implements`
- [ ] B) `inherits`
- [ ] C) `extends`
- [ ] D) `super`

<details>
<summary>Answer</summary>

**C) `extends`**

**Why:** In Java, `extends` is the keyword used for class inheritance. `implements` is used for interfaces (not classes). `inherits` is not a Java keyword (some other languages use it). `super` is used to call the parent class's methods or constructor, but not to declare inheritance.

```java
class Child extends Parent { }       // Correct - class inheritance
class Child implements Interface { } // Correct - interface implementation
class Child inherits Parent { }      // WRONG - not valid Java
```

</details>

**Q2:** What does the `@Override` annotation indicate?

- [ ] A) The method is deprecated
- [ ] B) You are replacing a parent class method
- [ ] C) The method runs on the robot
- [ ] D) The method is private

<details>
<summary>Answer</summary>

**B) You are replacing a parent class method**

**Why:** `@Override` tells the compiler "I intend to replace a method from the parent class." This is a safety check -- if you mistype the method name or use the wrong parameters, the compiler will warn you that you are not actually overriding anything. Option A is wrong because `@Deprecated` marks deprecated methods. Options C and D are unrelated to `@Override`.

```java
class Parent {
    public void doThing() { }
}

class Child extends Parent {
    @Override
    public void doThing() { }  // Replaces Parent's doThing()
}
```

</details>

**Q3:** What is the difference between an interface and a class?

- [ ] A) Interfaces can have method bodies
- [ ] B) Classes define a contract; interfaces implement it
- [ ] C) Interfaces define a contract; classes implement it
- [ ] D) There is no difference

<details>
<summary>Answer</summary>

**C) Interfaces define a contract; classes implement it**

**Why:** An interface only declares method signatures (what methods exist) without providing the actual code. A class provides the actual implementation (the working code). Option A is mostly wrong -- traditional interfaces cannot have method bodies (though Java 8+ allows default methods, which you will not use in FRC). Option B has it backwards. Option D is wrong because they serve very different purposes.

```java
// Interface: declares WHAT exists (the contract)
interface MotorController {
    void setPower(double power);  // No body - just the signature
}

// Class: provides HOW it works (the implementation)
class SparkMax implements MotorController {
    public void setPower(double power) {
        // Actual code that sends power to the motor
    }
}
```

</details>
