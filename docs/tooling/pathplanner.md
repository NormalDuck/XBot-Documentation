# PathPlanner

Create autonomous paths visually.

## What Is PathPlanner?

PathPlanner is a tool for designing autonomous robot paths. You draw paths on a field image and set speed/acceleration constraints.

## Installation

Download from [pathplanner.io](https://pathplanner.io). Available for Windows, macOS, and Linux.

## Creating Paths

1. Open PathPlanner
2. Set the field to the current game
3. Click to add **waypoints** (points the robot passes through)
4. Set **constraints** (max speed, max acceleration)
5. Add **events** to trigger commands at specific points

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Waypoint** | A point the robot path passes through |
| **Constraint** | Max speed and acceleration for a path segment |
| **Event** | Triggers a command at a specific point on the path |
| **Holonomic** | Uses swerve's ability to rotate independently while moving |
| **Choreo** | Alternative path planner (also supported by WPILib) |

## Integration with XBot

XBot includes PathPlannerLib as a vendor dependency:

```gradle
// build.gradle
maven { url "https://3015rangerrobotics.github.io/pathplannerlib/repo"}
```

PathPlanner is configured in the robot initialization:

```java
// In Robot.java
getInjectorComponent().configurePathPlannerLib();
```

## Workflow

1. Design paths in PathPlanner GUI
2. Export paths as JSON files
3. Place JSON files in `src/main/deploy/pathplanner/`
4. Load paths in robot code:

```java
PathPlannerAuto auto = new PathPlannerAuto("MyAutoPath");
```

## Tips

- Keep paths simple - fewer waypoints = smoother paths
- Test in simulation before deploying to robot
- Use events to trigger mechanisms (e.g., raise elevator at a certain point)
- Save multiple path files for different autonomous routines
