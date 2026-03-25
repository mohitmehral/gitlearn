# Learn Git Branching - Interactive Tutorial

An interactive, visual web application for learning Git branching and merging concepts through level-based exercises. You dont required to install git cli for that

## Features

- 8 Progressive Levels - From repo creation to complex merge workflows
- Terminal Interface - Real Git command experience
- Visual Git Graph - See branches and commits in real-time
- Auto-Save Progress - Resume from where you left off
- Responsive Design - Works on desktop and mobile

## Learning Path

1. Create Your First Repository - Simulate GitHub repo creation, git init, commit & push
2. Branching & Committing - Create feature1 branch, make commits, switch between branches
3. Merging a Feature Branch - Create feature2, commit, and merge into main
4. Multi-Feature Merge - Create feature3 and merge all features into main
5. Deleting Branches - Clean up old feature branches and watch them disappear from the graph
6. Merge Conflict Simulation - Handle complex merge scenarios
7. Rebase - Rewriting History - Understand linear history
8. Final Boss - Complex multi-branch workflow

## Commands Supported

- `curl` - Simulate GitHub API repo creation
- `git init` - Initialize a local repository
- `git add .` - Stage files
- `git config user.name "Name"` - Set your name
- `git commit` / `git commit -m "msg"` - Create a new commit
- `git branch <name>` - Create a new branch
- `git branch -d <name>` - Delete a branch (protected: main, dev)
- `git checkout <name>` - Switch to a branch
- `git merge <name>` - Merge a branch into current branch
- `git remote add origin <url>` - Add a remote
- `git push -u origin main` - Push to remote

## Creating a GitHub Personal Access Token (PAT) for Real CLI Usage

In this tutorial, the `curl` command and token are simulated. But if you want to create repos from the CLI for real, you'll need a GitHub **Personal Access Token (PAT)**.

### How to Create a PAT

1. Go to [GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Under **Permissions → Repository permissions**, enable:
   - **Administration** → Read and write (required to create/delete repos)
   - **Contents** → Read and write (required to push code)
   - **Metadata** → Read-only (auto-selected)
3. Click **"Generate token"** and **copy it immediately** — you won't see it again!

### Using the PAT to Create a Repo from CLI

```bash
curl -H "Authorization: token ghp_xxxxxxxxxxxxxxxxxxxx" \
     https://api.github.com/user/repos \
     -d '{"name":"my-new-repo","private":false}'
```

### Then Push Your Local Code

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/my-new-repo.git
git push -u origin main
```

> **Security Tips:**
>
> - Never commit your PAT to a repository
> - Use fine-grained tokens over classic tokens — they follow the principle of least privilege

## Local Development

Simply open `index.html` in your browser. No build process required.

```bash
open index.html
```

## Technologies

- Pure HTML5, CSS3, JavaScript (ES6+)
- LocalStorage API for progress persistence
- SVG for Git graph visualization
- No dependencies or frameworks
- Works offline after first load

## License

MIT License

Copyright (c) 2025 Mohit Mehral

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
