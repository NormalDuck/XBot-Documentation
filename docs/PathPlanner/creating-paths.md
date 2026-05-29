# Creating Paths and Autos in PathPlanner

This guide explains how to create paths, configure constraints, add event markers, and build full autonomous routines using the PathPlanner GUI.

---

## Creating a New Path

1. Open the PathPlanner desktop app.
2. Click **New Path**.
3. Place the start point on the field.
4. Place the end point.
5. Add waypoints to shape the trajectory.

### Tips for Waypoints
- Use as few waypoints as possible.
- Avoid sharp turns unless necessary.
- Keep spacing consistent for smoother motion.

---

## Setting Path Constraints

Each path can have its own motion constraints:

- **Max Velocity**
- **Max Acceleration**
- **Holonomic Rotation Targets** (swerve only)

These constraints should match your drivetrain’s capabilities.

### Recommended Starting Values (Swerve)
- Max Velocity: 3–4 m/s
- Max Acceleration: 2–3 m/s²
- Rotation P: 5.0 (tune later)

---

## Holonomic Rotation (Swerve)

For swerve drives, you can set the robot’s facing direction at any point along the path.

- Click the rotation handle on a waypoint.
- Drag to set the desired heading.
- Use this for:
    - Facing game pieces
    - Facing scoring targets
    - Preparing for shooting

---

## Event Markers

Event markers allow you to trigger commands during a path.

### Types of Markers
- **Instant** — triggers immediately when reached.
- **Deferred** — triggers when the robot reaches the marker’s position.

### Usage Examples
- Start intake when approaching a game piece.
- Raise elevator before scoring.
- Shoot at a specific location.

### Important
Marker names must match the names registered in code using `NamedCommands`.

---

## Creating Autos (Multi‑Path Routines)

Autos combine multiple paths and commands into a full autonomous routine.

1. Click **New Auto**.
2. Add paths in sequence.
3. Insert commands before, after, or between paths.
4. Save the auto.

Autos are saved as `.auto` files and loaded using AutoBuilder.

---

## Alliance Mirroring

Enable **Automatic Alliance Mirroring** in PathPlanner settings.

This flips paths for red/blue alliance automatically based on the robot’s alliance color.

---

## File Locations

All paths and autos must be saved in:

```
src/main/deploy/pathplanner/
```

These files deploy automatically when you build or deploy robot code.
