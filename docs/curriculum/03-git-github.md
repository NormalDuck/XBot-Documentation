# Git & GitHub

How to manage code versions and collaborate with your team.

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

## Basic Workflow

```bash
# 1. Clone the repo
git clone https://github.com/Team488/TeamXbot2026.git
cd TeamXbot2026

# 2. Create a branch for your feature
git checkout -b my-feature-branch

# 3. Make your code changes...

# 4. Stage all changes
git add .

# 5. Commit with a message
git commit -m "Add elevator height control"

# 6. Push to GitHub
git push origin my-feature-branch
```

## Creating a Pull Request

1. Go to the repo on GitHub
2. Click **"Compare & pull request"**
3. Add a description of what you changed
4. Request a review from a mentor

## Common Commands

```bash
git status              # See what files changed
git diff                # See exact line changes
git log                 # See commit history
git pull                # Get latest changes from remote
git checkout main       # Switch to main branch
git branch              # List all branches
```

## Commit Message Rules

- Use present tense: `"Add motor controller"` not `"Added motor controller"`
- Be specific: `"Fix shooter velocity PID"` not `"Fix stuff"`
- Keep it under 72 characters

## Resolving Conflicts

When two people edit the same file:

1. Pull the latest changes: `git pull origin main`
2. Git will mark conflicts in the file with `<<<<<<` and `>>>>>>`
3. Edit the file to keep the correct code
4. Stage and commit: `git add . && git commit`

---

## Quiz

**Q1:** What does `git checkout -b my-feature` do?

- [ ] A) Deletes the branch named "my-feature"
- [ ] B) Creates and switches to a new branch called "my-feature"
- [ ] C) Merges "my-feature" into the current branch
- [ ] D) Renames the current branch to "my-feature"

<details><summary>Answer</summary>B) Creates and switches to a new branch called "my-feature"</details>

**Q2:** What is a Pull Request (PR)?

- [ ] A) A way to delete code from the repo
- [ ] B) A request to merge your changes into another branch
- [ ] C) A command to download code
- [ ] D) A type of Git error

<details><summary>Answer</summary>B) A request to merge your changes into another branch</details>

**Q3:** Which command shows what files have changed?

- [ ] A) `git log`
- [ ] B) `git push`
- [ ] C) `git status`
- [ ] D) `git pull`

<details><summary>Answer</summary>C) `git status`</details>
