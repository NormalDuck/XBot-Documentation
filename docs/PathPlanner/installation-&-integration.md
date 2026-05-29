# Installing PathPlanner

## Desktop App

1. Download PathPlanner from the official GitHub releases page. ([Click Me!](https://github.com/mjansen4857/pathplanner/releases))
2. Extract and run the executable.
3. Open your robot project folder (the folder containing `build.gradle`).
4. PathPlanner will automatically detect the `src/main/deploy/pathplanner` directory.

## Integration with XBOT

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


## Key Concepts

| Concept | Description |
|---------|-------------|
| **Waypoint** | A point the robot path passes through |
| **Constraint** | Max speed and acceleration for a path segment |
| **Event** | Triggers a command at a specific point on the path |
| **Holonomic** | Uses swerve's ability to rotate independently while moving |
| **Choreo** | Alternative path planner (also supported by WPILib) |