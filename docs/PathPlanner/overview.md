# PathPlanner Overview

PathPlanner is a motion‑planning tool used in FRC to create autonomous paths and full autonomous routines. It allows teams to design smooth, constraint‑aware trajectories and embed event markers that trigger robot commands during autonomous.

## Why PathPlanner?
- Visual path creation
- Built‑in holonomic and differential drive support
- Automatic alliance mirroring
- Event markers that trigger commands
- Full autonomous routine builder (multi‑path autos)
- Integrates directly with WPILib through PathPlannerLib

## Where files are stored
PathPlanner saves all paths and autos into your robot project under:

```
src/main/deploy/pathplanner/
```

This folder is deployed to the roboRIO automatically when you build or deploy code.

## Key Concepts
### Paths
A *path* is a single trajectory with:
- Start and end poses
- Waypoints
- Constraints (max velocity, acceleration)
- Event markers

### Autos
An *auto* is a sequence of:
- One or more paths
- Commands triggered by markers
- Additional commands before/after paths

Autos are built in the PathPlanner GUI and executed in code using AutoBuilder.
