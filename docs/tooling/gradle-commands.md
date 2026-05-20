# Gradle Commands

Build, test, and deploy robot code.

## What Is `gradlew`?

`gradlew` is the **Gradle Wrapper**. It ensures everyone uses the same Gradle version.

- `gradlew` (no extension) = macOS/Linux script
- `gradlew.bat` = Windows batch file
- **Never run `gradle` directly** - always use `gradlew`

## Build & Deploy

```bash
# Build only (compile + run tests)
./gradlew build           # macOS/Linux
gradlew.bat build         # Windows

# Deploy to robot (build + send to roboRIO)
./gradlew deploy          # macOS/Linux
gradlew.bat deploy        # Windows

# Build and deploy
./gradlew build deploy
```

## Testing

```bash
# Run all tests
./gradlew test

# Run with detailed output
./gradlew test --info

# Run a specific test class
./gradlew test --tests "competition.subsystems.drive.TankDriveTest"

# Run with code coverage report
./gradlew jacocoTestReport
```

## Code Quality

```bash
# Check code style (checkstyle)
./gradlew checkstyle

# Clean build artifacts
./gradlew clean

# Clean and rebuild
./gradlew clean build
```

## XBot-Specific Commands

```bash
# Build with local SeriouslyCommonLib (for library development)
./gradlew build -DuseLocalCommonLib=true

# Copy resources to roboRIO (log4j config, etc.)
./gradlew copyResources
```

## Common Flags

| Flag | Description |
|------|-------------|
| `--info` | Show detailed build output |
| `--debug` | Show debug-level output |
| `--stacktrace` | Show full error stack trace |
| `--offline` | Build without network access |
| `-DuseLocalCommonLib=true` | Use local SeriouslyCommonLib |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `BUILD FAILED` - dependency error | Run `./gradlew clean` then rebuild |
| Tests fail unexpectedly | Run `./gradlew test --info` for details |
| Deploy fails | Check robot is on the network and team number is correct |
| "Java version mismatch" | Ensure Java 17 is installed and `JAVA_HOME` is set |
