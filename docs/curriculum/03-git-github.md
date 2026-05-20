# Git & GitHub

How to manage code versions and collaborate with your team.

<details>
<summary><strong>What is Git and why do we need it?</strong></summary>

**Git** is a version control system. It tracks every change made to your code, lets you go back to previous versions, and enables multiple people to work on the same project without overwriting each other.

**Analogy:** Imagine writing an essay with Google Docs. Every change is tracked, you can see who changed what, and you can revert to an earlier version if something goes wrong. Git does the same thing for code, but it works offline and is much more powerful.

**Without Git:**
- "final_final_v3_REALLY_FINAL.java" -- which version is the real one?
- Someone overwrites your changes by accident
- No way to undo a mistake

**With Git:**
- Every change is saved as a "commit" with a message
- You can branch off and experiment without breaking the main code
- You can see exactly who changed what and when

</details>

## Key Terms

| Term | Meaning |
|------|---------|
| **Repository (repo)** | A project folder tracked by Git |
| **Commit** | A saved snapshot of your changes |
| **Branch** | A parallel version of the code |
| **Pull Request (PR)** | A request to merge your changes into main |
| **Clone** | Download a repo to your computer |
| **Push** | Upload your commits to GitHub |
| **Pull** | Download others' changes from GitHub |

<details>
<summary><strong>What is the difference between Git and GitHub?</strong></summary>

**Git** is the tool that runs on your computer and tracks changes.
**GitHub** is a website that hosts Git repositories online so your team can share code.

**Analogy:** Git is like the camera on your phone (takes the photos). GitHub is like Instagram (stores and shares them online).

```
Your computer:  Git tracks changes locally
                      ↕ (push/pull)
GitHub.com:     Repositories are stored online for sharing
```

You can use Git without GitHub (local only), but you cannot use GitHub without Git.

</details>

## Basic Workflow

```bash
# 1. Clone the repo - download the entire project to your computer
git clone https://github.com/Team488/TeamXbot2026.git
cd TeamXbot2026

# 2. Create a branch for your feature
# A branch is a copy of the code where you can work without affecting the main code
git checkout -b my-feature-branch

# 3. Make your code changes...
# Edit files in VSCode, add new features, fix bugs, etc.

# 4. Stage all changes - tell Git which files to include in the next commit
# "." means "all changed files"
git add .

# 5. Commit with a message - save a snapshot of your changes
# The message should describe WHAT you changed and WHY
git commit -m "Add elevator height control"

# 6. Push to GitHub - upload your branch so others can see it
git push origin my-feature-branch
```

<details>
<summary><strong>What is a branch and why use one?</strong></summary>

A **branch** is a separate copy of the code where you can make changes without affecting the main codebase.

**Analogy:** Think of branches like parallel universes. The `main` branch is the "real world" that everyone uses. Your feature branch is an alternate reality where you can experiment. When your experiment works, you merge it back into the real world.

```
main:    A --- B --- C --- D (stable, working code)
                  \
feature:           E --- F --- G (your changes, might break things)
```

**Why branches matter:**
- If you break something on your branch, `main` is still fine
- Multiple people can work on different features at the same time
- Mentors can review your changes before they go into `main`

**Branch naming convention:** Use descriptive names like `add-shooter-pid`, `fix-drive-reverse`, not `my-changes` or `test`.

</details>

## Creating a Pull Request

1. Go to the repo on GitHub
2. Click **"Compare & pull request"**
3. Add a description of what you changed
4. Request a review from a mentor

<details>
<summary><strong>What is a Pull Request and why do we use them?</strong></summary>

A **Pull Request (PR)** is a request to merge your branch's changes into another branch (usually `main`). It lets your team review your code before it becomes part of the official codebase.

**Analogy:** Think of a PR like submitting a homework assignment. You are saying "I finished this, can someone check it before it counts?"

**What happens in a PR:**
1. You create the PR (your code is uploaded to GitHub)
2. GitHub shows exactly what lines you changed
3. A mentor reviews your code and leaves comments
4. You make any requested changes
5. Once approved, your code is merged into `main`

**Why PRs matter:**
- Catches bugs before they reach the robot
- Helps you learn from mentor feedback
- Creates a record of why changes were made
- Prevents broken code from being deployed at competitions

</details>

## Common Commands

```bash
git status              # See what files changed (always run this first!)
git diff                # See exact line changes (what was added/removed)
git log                 # See commit history (who changed what and when)
git pull                # Get latest changes from remote (do this before starting work)
git checkout main       # Switch to main branch
git branch              # List all branches (the * shows your current branch)
```

<details>
<summary><strong>When should I run git pull?</strong></summary>

**Always run `git pull` before starting new work.** This ensures you have the latest changes from your teammates.

**The golden workflow:**
```bash
# Every time you sit down to code:
git checkout main        # Switch to main branch
git pull origin main     # Get the latest changes
git checkout -b my-new-feature  # Create a new branch from the updated main
```

**What happens if you do not pull:**
- You might work on code that someone already changed
- When you try to merge, you will get conflicts
- Resolving conflicts is annoying -- pulling first prevents them

</details>

## Commit Message Rules

- Use present tense: `"Add motor controller"` not `"Added motor controller"`
- Be specific: `"Fix shooter velocity PID"` not `"Fix stuff"`
- Keep it under 72 characters

<details>
<summary><strong>Why do commit message rules matter?</strong></summary>

Good commit messages make it easy to understand the history of the project. Six months from now (or at a competition at 11pm), you will be glad you wrote clear messages.

**Bad commit messages:**
```
"fix"                    -- Fix what?
"stuff"                  -- What stuff?
"asdfasdf"               -- Just do not.
"Updated code"           -- Too vague
```

**Good commit messages:**
```
"Add PID tuning for elevator L4 height"
"Fix drive motor inversion on front-right module"
"Remove unused import in ShooterSubsystem"
```

**Formula:** `[action] [what] [why if needed]`
- Action: Add, Fix, Remove, Update, Refactor
- What: The specific thing you changed
- Why: Only if it is not obvious

</details>

## Resolving Conflicts

When two people edit the same file:

1. Pull the latest changes: `git pull origin main`
2. Git will mark conflicts in the file with `<<<<<<` and `>>>>>>`
3. Edit the file to keep the correct code
4. Stage and commit: `git add . && git commit`

<details>
<summary><strong>What do conflict markers look like?</strong></summary>

When Git cannot automatically merge two changes, it marks the conflict in the file:

```java
<<<<<<< HEAD
// This is YOUR version of the code
motor.setPower(0.5);
=======
// This is THEIR version of the code (from main)
motor.setPower(0.75);
>>>>>>> main
```

**What to do:**
1. Read both versions
2. Decide which one is correct (or combine them)
3. Delete the markers (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Keep only the code you want
5. Run `git add .` and `git commit` to finish

**Example resolution:**
```java
// After resolving - markers removed, correct code kept
motor.setPower(0.75);  // Updated to match new PID tuning
```

**Tip:** If you are unsure which version to keep, ask the person who made the other change!

</details>

---

## Quiz

**Q1:** What does `git checkout -b my-feature` do?

- [ ] A) Deletes the branch named "my-feature"
- [ ] B) Creates and switches to a new branch called "my-feature"
- [ ] C) Merges "my-feature" into the current branch
- [ ] D) Renames the current branch to "my-feature"

<details>
<summary>Answer</summary>

**B) Creates and switches to a new branch called "my-feature"**

**Why:** The `-b` flag means "create a new branch." `checkout` means "switch to." Combined, they create a new branch and switch to it in one command. Option A would be `git branch -d my-feature`. Option C would be `git merge my-feature`. Option D has no single command -- you would need to delete and recreate.

```bash
git checkout -b my-feature   # Create AND switch (two in one)
# Is the same as:
git branch my-feature        # Create branch
git checkout my-feature      # Switch to it
```

</details>

**Q2:** What is a Pull Request (PR)?

- [ ] A) A way to delete code from the repo
- [ ] B) A request to merge your changes into another branch
- [ ] C) A command to download code
- [ ] D) A type of Git error

<details>
<summary>Answer</summary>

**B) A request to merge your changes into another branch**

**Why:** A PR is how you propose changes to a codebase. You push your branch to GitHub, then create a PR asking maintainers to review and merge your changes into the target branch (usually `main`). Option A is wrong -- PRs add code, not delete it. Option C describes `git pull`. Option D is wrong -- a PR is a feature, not an error.

</details>

**Q3:** Which command shows what files have changed?

- [ ] A) `git log`
- [ ] B) `git push`
- [ ] C) `git status`
- [ ] D) `git pull`

<details>
<summary>Answer</summary>

**C) `git status`**

**Why:** `git status` shows which files have been modified, which are staged for commit, and which branch you are on. It is the first command you should run when working with Git. Option A (`git log`) shows commit history, not current changes. Option B (`git push`) uploads commits to GitHub. Option D (`git pull`) downloads changes from GitHub.

```bash
$ git status
On branch my-feature
Changes not staged for commit:
  modified:   ShooterSubsystem.java    <-- This file changed
  modified:   ElectricalContract.java  <-- This file changed too
```

</details>
