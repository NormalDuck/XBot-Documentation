# Curriculum Overview

Welcome to the XBot programming curriculum. By the end, you'll be able to write robot code that drives, shoots, and scores.

## Learning Path

### Getting Started
| Module | Topic | Time |
|--------|-------|------|
| [1. Environment Setup](01-environment-setup) | Install Java, VSCode, WPILib, Git | 30 min |
| [2. Java Basics](02-java-basics) | Variables, methods, classes, interfaces | 45 min |
| [3. Git & GitHub](03-git-github) | Clone, commit, branch, pull requests | 30 min |

### Robot Fundamentals
| Module | Topic | Time |
|--------|-------|------|
| [4. Robot Architecture](04-robot-architecture) | How XBot code is organized | 20 min |
| [5. Electrical Contract](05-electrical-contract) | Wiring definitions as code | 20 min |
| [6. Motor Control](06-motor-control) | Controlling motors safely | 30 min |
| [7. PID Logic](07-pid-logic) | Proportional-Integral-Derivative control | 30 min |

### XBot Patterns
| Module | Topic | Time |
|--------|-------|------|
| [8. Dependency Injection](08-dependency-injection) | Dagger and automatic wiring | 30 min |
| [9. Providers & Factories](09-providers-factories) | Creating objects with runtime params | 20 min |
| [10. Command-Based](10-command-based) | WPILib command framework | 30 min |
| [11. Maintainers](11-maintainers) | Continuous PID maintenance | 25 min |
| [12. Swerve Drive](12-swerve-drive) | Holonomic driving | 40 min |
| [13. Properties & Tuning](13-properties-tuning) | Runtime-tunable values | 15 min |

## Practice Repo

All exercises use [XbotEdu](https://github.com/Team488/XbotEdu) - a practice robot project with unit tests so you can code without a physical robot.

```bash
git clone https://github.com/Team488/XbotEdu.git
cd XbotEdu
./gradlew test
```
