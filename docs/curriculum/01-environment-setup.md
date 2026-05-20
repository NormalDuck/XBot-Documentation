# Environment Setup

Get your computer ready for FRC programming.

## Requirements

- **Java 17** (required by WPILib)
- **VSCode** with WPILib extension
- **Git**

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

## Verify Installation

1. Open VSCode
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type **"WPILib"** - you should see WPILib commands appear

## Clone XbotEdu

XbotEdu is the practice repo with unit tests. You can code without a physical robot.

```bash
git clone https://github.com/Team488/XbotEdu.git
cd XbotEdu
```

## Build the Project

```bash
# Windows
gradlew.bat build

# macOS / Linux
./gradlew build
```

## Run Tests

```bash
# Windows
gradlew.bat test

# macOS / Linux
./gradlew test
```

You should see test results in the terminal. If all tests pass, you're ready.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `./gradlew: Permission denied` | Run `chmod +x gradlew` |
| Java version error | Install Java 17 from [Adoptium](https://adoptium.net/) |
| VSCode doesn't show WPILib | Reinstall the WPILib extension from the marketplace |

---

## Quiz

**Q1:** Which Java version does WPILib require?

- [ ] A) Java 11
- [ ] B) Java 17
- [ ] C) Java 21
- [ ] D) Java 8

<details><summary>Answer</summary>B) Java 17</details>

**Q2:** What command builds the project on macOS/Linux?

- [ ] A) `gradle build`
- [ ] B) `./gradlew build`
- [ ] C) `make build`
- [ ] D) `npm build`

<details><summary>Answer</summary>B) `./gradlew build`</details>

**Q3:** Why does XbotEdu use unit tests?

- [ ] A) To slow down development
- [ ] B) So you can practice without a physical robot
- [ ] C) To replace the driver station
- [ ] D) To generate robot logs

<details><summary>Answer</summary>B) So you can practice without a physical robot</details>
