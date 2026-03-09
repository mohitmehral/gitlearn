# Learn Git Branching - Interactive Tutorial

An interactive, visual web application for learning Git branching and merging concepts through level-based exercises.

## Features

- 8 Progressive Levels - From basic commits to complex merge workflows
- Terminal Interface - Real Git command experience
- Visual Git Graph - See branches and commits in real-time
- Auto-Save Progress - Resume from where you left off
- Branch Protection - Learn about protected branches (main, dev)
- Dark Theme - VS Code-inspired UI
- Accessible - Full ARIA support and semantic HTML
- Responsive Design - Works on desktop and mobile

## Learning Path

1. Your First Commit - Save your work with git commit
2. Branching in Git - Master git branch and checkout
3. Merging in Git - Understand git merge workflow
4. Moving Around in Git - Practice branch navigation
5. Deleting Branches - Learn branch cleanup with git branch -d
6. Merge Conflict Simulation - Handle complex merge scenarios
7. Rebase - Rewriting History - Understand linear history
8. Final Boss - Complex multi-branch workflow

## Commands Supported

- `git config user.name "Name"` - Set your name
- `git commit` - Create a new commit
- `git branch <name>` - Create a new branch
- `git branch -d <name>` - Delete a branch (protected: main, dev)
- `git checkout <name>` - Switch to a branch
- `git merge <name>` - Merge a branch into current branch

## Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings -> Pages
3. Select "GitHub Actions" as source
4. The included workflow will deploy automatically on every push to main

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
