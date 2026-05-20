# Environment Setup

Get your computer ready for FRC programming.

## Requirements

- **Java 17** (required by WPILib)
- **VSCode** with WPILib extension
- **Git**

<details>
<summary><strong>What is WPILib?</strong></summary>

**WPILib** (WPI Library) is the official software library for FRC robots. It is maintained by Worcester Polytechnic Institute and provides all the building blocks you need to control a robot: motor control, sensors, communication, and the command-based framework.

**Analogy:** If building a robot were like building a house, WPILib would be the pre-made doors, windows, and plumbing. You could make everything from scratch, but why would you when the basics are already provided?

**What WPILib gives you:**
- Motor controller libraries (SparkMax, TalonFX, etc.)
- Sensor libraries (gyros, encoders, cameras)
- Command-based programming framework
- Robot simulation (test without a real robot)
- Dashboard tools (SmartDashboard, Shuffleboard)

</details>

<details>
<summary><strong>What is VSCode and why do we use it?</strong></summary>

**VSCode** (Visual Studio Code) is a free code editor made by Microsoft. It is the official editor for FRC because WPILib provides a VSCode extension that integrates everything you need.

**Why VSCode over other editors:**
- Free and works on Windows, macOS, and Linux
- WPILib extension provides one-click build, deploy, and test
- Built-in terminal for running commands
- Git integration for version control
- IntelliSense (autocomplete) for Java code

**Do not use:** IntelliJ, Eclipse, or Notepad for FRC. The WPILib extension only works with VSCode.

</details>

## Install WPILib

Download the installer from [GitHub Releases](https://github.com/wpilibsuite/allwpilib/releases).

### Windows

1. Run the `.exe` installer
2. Select **"Install VSCode + WPILib"**
3. Follow the prompts

### macOS

1. Run the `.dmg` file
2. Drag VSCode to Applications
3. If blocked, go to **System Settings > Privacy & Security** and click **"Open Anyway"**

### Linux

1. Extract the `.zip` installer
2. Run the install script:
   ```bash
   sudo ./Install-WPILib.sh
   ```

<details>
<summary><strong>Why does macOS block the installer?</strong></summary>

macOS has a security feature called **Gatekeeper** that blocks apps not downloaded from the App Store or identified developers. WPILib is safe, but Apple does not know that.

**What to do:**
1. Try to open the app normally (it will be blocked)
2. Go to **System Settings > Privacy & Security**
3. Scroll down and click **"Open Anyway"**
4. Confirm you want to open it

This is normal for many developer tools on macOS.

</details>

## Verify Installation

1. Open VSCode
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type **"WPILib"** - you should see WPILib commands appear

<details>
<summary><strong>What is the Command Palette?</strong></summary>

The **Command Palette** (opened with `Ctrl+Shift+P` or `Cmd+Shift+P`) is VSCode's universal search bar for commands. Instead of clicking through menus, you type what you want to do.

**Analogy:** Think of it like Siri or Google Assistant for VSCode. Instead of navigating through settings, you just tell it what you want.

**Useful commands you will use:**
- `WPILib: Build Robot Code` - compiles your code
- `WPILib: Deploy Robot Code` - sends code to the robot
- `WPILib: Start Tool` - opens Shuffleboard, SmartDashboard, etc.
- `WPILib: Create a new project` - starts a new robot project

</details>

## Clone XbotEdu

XbotEdu is the practice repo with unit tests. You can code without a physical robot.

```bash
git clone https://github.com/Team488/XbotEdu.git
cd XbotEdu
```

<details>
<summary><strong>What does "clone" mean?</strong></summary>

**Cloning** downloads a complete copy of a GitHub repository to your computer, including all files and the entire history of changes.

**Analogy:** Think of cloning like making a photocopy of a shared notebook. You get your own copy to write in, and the original on GitHub stays unchanged. When you are done, you can send your changes back to the original (that is called a Pull Request).

```
GitHub (original)  ----clone---->  Your computer (copy)
```

After cloning, you will have a folder on your computer with all the project files.

</details>

## Build the Project

```bash
# Windows
gradlew.bat build

# macOS / Linux
./gradlew build
```

<details>
<summary><strong>What is Gradle and what does "build" do?</strong></summary>

**Gradle** is a build tool that takes your Java source code and turns it into a program the roboRIO can run.

**What happens when you run `build`:**
1. Gradle downloads all dependencies (libraries your code uses)
2. Compiles your `.java` files into `.class` files (bytecode)
3. Runs any tests
4. Packages everything into a deployable format

**Analogy:** Think of Gradle like a chef following a recipe. Your Java code is the recipe ingredients, and Gradle follows the instructions (`build.gradle`) to cook everything together into a finished dish.

**First build takes longer** because Gradle needs to download all the dependencies. Subsequent builds are faster.

</details>

## Run Tests

```bash
# Windows
gradlew.bat test

# macOS / Linux
./gradlew test
```

You should see test results in the terminal. If all tests pass, you are ready.

<details>
<summary><strong>What are unit tests and why do we need them?</strong></summary>

**Unit tests** are small programs that test individual pieces of your code to make sure they work correctly.

**Analogy:** Before a chef serves a dish, they taste it to make sure it is right. Unit tests are like tasting each ingredient separately before combining them.

**Why XbotEdu uses tests:**
- You do not need a physical robot to practice
- Tests catch bugs before you deploy to the real robot
- They show you what the correct behavior should be
- Mentors can review your work automatically

**Example:**
```java
// This test checks that add() returns the correct result
@Test
public void testAddition() {
    assertEquals(5, calculator.add(2, 3));  // Should pass
    assertEquals(0, calculator.add(1, 1));  // Should FAIL - catches a bug!
}
```

</details>

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `./gradlew: Permission denied` | Run `chmod +x gradlew` |
| Java version error | Install Java 17 from [Adoptium](https://adoptium.net/) |
| VSCode does not show WPILib | Reinstall the WPILib extension from the marketplace |
| Build fails on first run | Wait for dependencies to download, then try again |

<details>
<summary><strong>What does `chmod +x` do?</strong></summary>

`chmod +x` makes a file **executable** on macOS and Linux. Windows does not need this.

**Why it is needed:** The `gradlew` script is a program that runs Gradle. By default, downloaded files are not allowed to run as programs for security reasons. `chmod +x` tells the system "this file is safe to run as a program."

```bash
chmod +x gradlew    # Make gradlew executable
./gradlew build     # Now it will work
```

The `+x` means "add execute permission."

</details>

---

## Quiz

**Q1:** Which Java version does WPILib require?

- [ ] A) Java 11
- [ ] B) Java 17
- [ ] C) Java 21
- [ ] D) Java 8

<details>
<summary>Answer</summary>

**B) Java 17**

**Why:** WPILib is built against Java 17, which is a Long Term Support (LTS) release. This means it receives security updates for several years. Java 11 is too old and lacks features WPILib uses. Java 21 is newer but WPILib has not been updated to support it yet. Java 8 is very outdated and missing many modern Java features.

</details>

**Q2:** What command builds the project on macOS/Linux?

- [ ] A) `gradle build`
- [ ] B) `./gradlew build`
- [ ] C) `make build`
- [ ] D) `npm build`

<details>
<summary>Answer</summary>

**B) `./gradlew build`**

**Why:** `gradlew` (Gradle Wrapper) is a script included in the project that downloads and runs the correct version of Gradle. The `./` prefix means "run the file in the current directory." Option A (`gradle build`) would use a globally installed Gradle which might be the wrong version. Option C (`make`) is a different build system used for C/C++ projects. Option D (`npm`) is for JavaScript/Node.js projects, not Java.

</details>

**Q3:** Why does XbotEdu use unit tests?

- [ ] A) To slow down development
- [ ] B) So you can practice without a physical robot
- [ ] C) To replace the driver station
- [ ] D) To generate robot logs

<details>
<summary>Answer</summary>

**B) So you can practice without a physical robot**

**Why:** Unit tests simulate robot behavior on your computer, so you can write and test code even when you do not have access to the physical robot. This is especially useful during off-season or when working from home. Option A is the opposite of the truth -- tests actually speed up development by catching bugs early. Options C and D are unrelated to what unit tests do.

</details>
