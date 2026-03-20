class GitSimulator {
    constructor() {
        this.commits = [];
        this.branches = { main: null };
        this.currentBranch = 'main';
        this.HEAD = null;
        this.commitCounter = 0;
        this.level = 1;
        this.score = 0;
        this.protectedBranches = ['main', 'dev'];
        this.userName = null;
        this.repoName = null;
        this.repoCreated = false;
        this.repoInitialized = false;
        this.filesStaged = false;
        this.remoteUrl = null;
        this.pushed = false;
    }

    createRepo(name) {
        if (this.repoCreated) return { error: `Repository already created` };
        this.repoName = name;
        this.repoCreated = true;
        return { success: `repo_created`, name };
    }

    init() {
        if (!this.repoCreated) return { error: `Create a GitHub repo first using curl` };
        if (this.repoInitialized) return { error: `Git repository already initialized` };
        this.repoInitialized = true;
        return { success: `Initialized empty Git repository in ./${this.repoName}/.git/` };
    }

    add(file) {
        if (!this.repoInitialized) return { error: `Not a git repository. Run git init first` };
        this.filesStaged = true;
        return { success: file === '.' ? `Added all files to staging area` : `Added '${file}' to staging area` };
    }

    remoteAdd(name, url) {
        if (!this.repoInitialized) return { error: `Not a git repository. Run git init first` };
        if (!this.repoCreated) return { error: `fatal: Remote repo not found. You need to create a repository on GitHub first!\nTry: curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user/repos -d '{"name":"yourrepo"}'` };
        if (this.remoteUrl) return { error: `Remote '${name}' already exists` };
        this.remoteUrl = url;
        return { success: `Remote '${name}' added → ${url}` };
    }

    push(remote, branch) {
        if (!this.repoCreated) return { error: `fatal: Remote repo does not exist on GitHub!\nYou must create it first using curl before you can push.` };
        if (!this.remoteUrl) return { error: `No remote configured. Use git remote add origin <url>` };
        if (this.commits.length === 0) return { error: `Nothing to push. Make a commit first` };
        this.pushed = true;
        return { success: `push_complete`, remote, branch };
    }

    config(key, value) {
        if (key === 'user.name') {
            this.userName = value;
            updateUserBadge(value);
            return { success: `Set user.name to '${value}'` };
        }
        return { error: `Unknown config key: ${key}` };
    }

    commit(message = '') {
        if (!this.userName) {
            return { error: "Please set your name first: git config user.name \"Your Name\"" };
        }
        this.commitCounter++;
        const commit = {
            id: `C${this.commitCounter}`,
            message,
            parent: this.HEAD,
            branch: this.currentBranch,
            author: this.userName
        };
        this.commits.push(commit);
        this.HEAD = commit.id;
        this.branches[this.currentBranch] = commit.id;
        return commit;
    }

    branch(name) {
        if (this.branches[name] !== undefined) return { error: `Branch '${name}' already exists` };
        this.branches[name] = this.HEAD;
        return { success: `Created branch '${name}'` };
    }

    deleteBranch(name) {
        if (this.branches[name] === undefined) return { error: `Branch '${name}' does not exist` };
        if (this.protectedBranches.includes(name)) return { error: `Cannot delete protected branch '${name}'` };
        if (name === this.currentBranch) return { error: `Cannot delete the current branch '${name}'` };
        delete this.branches[name];
        // Remove orphaned commits not reachable from any remaining branch
        const reachable = new Set();
        Object.values(this.branches).forEach(commitId => {
            const visited = new Set();
            let id = commitId;
            while (id && !visited.has(id)) {
                visited.add(id);
                reachable.add(id);
                const c = this.commits.find(cm => cm.id === id);
                if (c) {
                    id = c.parent;
                    if (c.mergeParent) reachable.add(c.mergeParent);
                } else break;
            }
        });
        const removed = this.commits.filter(c => !reachable.has(c.id));
        this.commits = this.commits.filter(c => reachable.has(c.id));
        return { success: `Deleted branch '${name}'`, removedCount: removed.length };
    }

    checkout(name) {
        if (this.branches[name] === undefined) return { error: `Branch '${name}' does not exist` };
        this.currentBranch = name;
        this.HEAD = this.branches[name];
        return { success: `Switched to branch '${name}'` };
    }

    merge(branchName) {
        if (this.branches[branchName] === undefined) return { error: `Branch '${branchName}' does not exist` };
        if (branchName === this.currentBranch) return { error: `Cannot merge branch into itself` };

        this.commitCounter++;
        const mergeCommit = {
            id: `M${this.commitCounter}`,
            message: `Merge ${branchName} into ${this.currentBranch}`,
            parent: this.HEAD,
            mergeParent: this.branches[branchName],
            branch: this.currentBranch
        };
        this.commits.push(mergeCommit);
        this.HEAD = mergeCommit.id;
        this.branches[this.currentBranch] = mergeCommit.id;
        return { success: `Merged '${branchName}' into '${this.currentBranch}'` };
    }

    reset() {
        this.commits = [];
        this.branches = { main: null };
        this.currentBranch = 'main';
        this.HEAD = null;
        this.commitCounter = 0;
        this.userName = null;
        this.repoName = null;
        this.repoCreated = false;
        this.repoInitialized = false;
        this.filesStaged = false;
        this.remoteUrl = null;
        this.pushed = false;
    }

    getCommitsByBranch() {
        const result = {};
        Object.keys(this.branches).forEach(branch => {
            result[branch] = [];
            let commitId = this.branches[branch];
            const visited = new Set();
            while (commitId && !visited.has(commitId)) {
                visited.add(commitId);
                const commit = this.commits.find(c => c.id === commitId);
                if (commit) {
                    result[branch].unshift(commit);
                    commitId = commit.parent;
                }
            }
        });
        return result;
    }
}

const levels = [
    {
        id: 1,
        title: "Create Your First Repository",
        instruction: `<p>Welcome, future Git master! 👋</p>
        <p>Before you can track code, you need a <strong>repository</strong>. In the real world you'd create one on GitHub, then set it up locally.</p>
        <p>Let's simulate the entire workflow!</p>
        <p><strong>Your mission (follow each step):</strong></p>
        <p>1. Set your name: <code>git config user.name "Your Name"</code></p>
        <p>2. Create a GitHub repo (simulated):<br>
        <code>curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user/repos -d '{"name":"myproject"}'</code><br>
        <small>💡 Use any repo name you like — the token is simulated!</small></p>
        <p>3. Initialize locally: <code>git init</code></p>
        <p>4. Stage your files: <code>git add .</code></p>
        <p>5. Make your first commit: <code>git commit -m "Initial commit"</code></p>
        <p>6. Link to GitHub: <code>git remote add origin https://github.com/you/myproject.git</code></p>
        <p>7. Push it live: <code>git push -u origin main</code></p>`,
        goal: () => git.repoCreated && git.repoInitialized && git.commits.length >= 1 && git.pushed,
        points: 15,
        showCode: true,
        codeContent: `# boss.py — your first project file!
def main():
    print("I am the Boss")
    print("I consent to show my name!")

if __name__ == "__main__":
    main()`
    },
    {
        id: 2,
        title: "Branching & Committing",
        instruction: `<p>Branches in Git are incredibly lightweight. They are simply pointers to a specific commit — nothing more.</p>
        <p>This is why many Git enthusiasts chant the mantra: <em>branch early, and branch often</em></p>
        <p><strong>To complete this level:</strong></p>
        <p>1. Create a new branch: <code>git branch feature1</code><br>
        2. Switch to it: <code>git checkout feature1</code><br>
        3. Make 2 commits on <code>feature1</code> (use <code>git commit -m "your message"</code>)<br>
        4. Switch back to main: <code>git checkout main</code></p>
        <p>Watch the graph — your commits will appear on a separate lane! 🎯</p>`,
        goal: () => git.branches.feature1 !== undefined && git.commits.filter(c => c.branch === 'feature1').length >= 2 && git.currentBranch === 'main',
        points: 20
    },
    {
        id: 3,
        title: "Merging a Feature Branch",
        instruction: `<p>Now let's learn how to combine work from two branches using <code>git merge</code>.</p>
        <p>Merging creates a special commit that has two unique parents — it ties the histories together.</p>
        <p><strong>To complete this level:</strong></p>
        <p>1. Create branch <code>feature2</code>: <code>git branch feature2</code><br>
        2. Switch to it: <code>git checkout feature2</code><br>
        3. Make 2 commits on <code>feature2</code><br>
        4. Switch back: <code>git checkout main</code><br>
        5. Merge it in: <code>git merge feature2</code></p>
        <p>See the diamond-shaped merge commit appear in the graph! 💎</p>`,
        goal: () => {
            const hasFeature2 = git.branches.feature2 !== undefined;
            const feature2Commits = git.commits.filter(c => c.branch === 'feature2').length >= 2;
            const hasMerge = git.commits.some(c => c.id.startsWith('M'));
            return hasFeature2 && feature2Commits && hasMerge && git.currentBranch === 'main';
        },
        points: 30
    },
    {
        id: 4,
        title: "Multi-Feature Merge",
        instruction: `<p>In real projects, multiple features are developed in parallel and merged into <code>main</code> one by one.</p>
        <p>You already have <code>feature1</code> and <code>feature2</code> from previous levels. Now let's add a third and merge them all!</p>
        <p><strong>To complete this level:</strong></p>
        <p>1. Create branch <code>feature3</code>: <code>git branch feature3</code><br>
        2. Switch to it: <code>git checkout feature3</code><br>
        3. Make 2 commits on <code>feature3</code><br>
        4. Switch back: <code>git checkout main</code><br>
        5. Merge <code>feature1</code>: <code>git merge feature1</code><br>
        6. Merge <code>feature3</code>: <code>git merge feature3</code></p>
        <p>Watch the graph light up with multiple merge lines! 🚀</p>`,
        goal: () => {
            const hasFeature3 = git.branches.feature3 !== undefined;
            const feature3Commits = git.commits.filter(c => c.branch === 'feature3').length >= 2;
            const mergeCount = git.commits.filter(c => c.id.startsWith('M')).length;
            return hasFeature3 && feature3Commits && mergeCount >= 3 && git.currentBranch === 'main';
        },
        points: 40
    },
    {
        id: 5,
        title: "Deleting Branches",
        instruction: `<p>After merging, it's good practice to <strong>clean up</strong> old feature branches to keep your repo tidy.</p>
        <p>You can delete a branch using <code>git branch -d branchname</code>. Note: <code>main</code> and <code>dev</code> are protected and cannot be deleted.</p>
        <p>You currently have <code>feature1</code>, <code>feature2</code>, and <code>feature3</code>. Let's clean up the oldest one!</p>
        <p><strong>To complete this level:</strong></p>
        <p>1. Delete the oldest feature branch: <code>git branch -d feature1</code></p>
        <p>Watch the graph — <code>feature1</code> and its commits will disappear! The branch is gone, but merged work stays safe in <code>main</code>. 🧹</p>`,
        goal: () => {
            return git.branches.feature1 === undefined && git.currentBranch === 'main';
        },
        points: 50
    },
    {
        id: 6,
        title: "Merge Conflict Simulation",
        instruction: `<p>In real projects, merge conflicts happen when two branches modify the same part of code.</p>
        <p>Let's simulate a merge conflict scenario and resolution.</p>
        <p><strong>Challenge:</strong></p>
        <p>1. Create branch <code>feature1</code> and make 1 commit<br>
        2. Checkout to <code>main</code> and make 1 commit<br>
        3. Create branch <code>feature2</code> from <code>main</code> and make 1 commit<br>
        4. Checkout to <code>main</code><br>
        5. Merge <code>feature1</code> into <code>main</code><br>
        6. Merge <code>feature2</code> into <code>main</code> (this simulates resolving conflicts)</p>`,
        goal: () => {
            const mergeCount = git.commits.filter(c => c.id.startsWith('M')).length;
            const hasFeature1 = git.branches.feature1 !== undefined;
            const hasFeature2 = git.branches.feature2 !== undefined;
            return mergeCount >= 2 && hasFeature1 && hasFeature2 && git.currentBranch === 'main';
        },
        points: 100
    },
    {
        id: 7,
        title: "Rebase - Rewriting History",
        instruction: `<p>Git rebase is an alternative to merge. Instead of creating a merge commit, it moves your commits to a new base.</p>
        <p>While we don't have a rebase command here, let's simulate the workflow by creating a clean linear history.</p>
        <p><strong>Challenge:</strong></p>
        <p>1. Create branch <code>experiment</code> and make 2 commits<br>
        2. Checkout to <code>main</code> and make 1 commit<br>
        3. Create branch <code>polish</code> from <code>main</code><br>
        4. Make 1 commit on <code>polish</code></p>`,
        goal: () => {
            const experimentCommits = git.commits.filter(c => c.branch === 'experiment').length >= 2;
            const polishExists = git.branches.polish !== undefined;
            return experimentCommits && polishExists;
        },
        points: 80
    },
    {
        id: 8,
        title: "Final Boss - Complex Workflow",
        instruction: `<p>Time to put everything together! This is a real-world scenario.</p>
        <p><strong>Epic Challenge:</strong></p>
        <p>1. Create <code>develop</code> branch and make 1 commit<br>
        2. Create <code>feature-a</code> from <code>develop</code>, make 2 commits<br>
        3. Checkout <code>develop</code>, create <code>feature-b</code>, make 1 commit<br>
        4. Merge <code>feature-a</code> into <code>develop</code><br>
        5. Merge <code>feature-b</code> into <code>develop</code><br>
        6. Checkout <code>main</code> and merge <code>develop</code> into <code>main</code></p>`,
        goal: () => {
            const mergeCount = git.commits.filter(c => c.id.startsWith('M')).length;
            const hasDevelop = git.branches.develop !== undefined;
            const hasFeatureA = git.branches['feature-a'] !== undefined;
            const hasFeatureB = git.branches['feature-b'] !== undefined;
            return mergeCount >= 3 && hasDevelop && hasFeatureA && hasFeatureB && git.currentBranch === 'main';
        },
        points: 150
    }
];

const git = new GitSimulator();
let currentLevel = 0;
const APP_VERSION = '2.1.0';

function updateUserBadge(name) {
    const vizBadge = document.getElementById('viz-user-badge');
    const vizDisplay = document.getElementById('viz-user-name');
    
    if (name) {
        vizDisplay.textContent = name;
        vizBadge.classList.remove('hidden');
    } else {
        vizBadge.classList.add('hidden');
    }
}

function saveProgress() {
    const state = {
        version: APP_VERSION,
        currentLevel,
        commits: git.commits,
        branches: git.branches,
        currentBranch: git.currentBranch,
        HEAD: git.HEAD,
        commitCounter: git.commitCounter,
        score: git.score,
        userName: git.userName,
        repoName: git.repoName,
        repoCreated: git.repoCreated,
        repoInitialized: git.repoInitialized,
        filesStaged: git.filesStaged,
        remoteUrl: git.remoteUrl,
        pushed: git.pushed
    };
    localStorage.setItem('gitLearningProgress', JSON.stringify(state));
}

function loadProgress() {
    const saved = localStorage.getItem('gitLearningProgress');
    if (!saved) return false;
    
    try {
        const state = JSON.parse(saved);
        if (state.version !== APP_VERSION) {
            localStorage.removeItem('gitLearningProgress');
            return false;
        }
        
        currentLevel = state.currentLevel || 0;
        git.commits = state.commits || [];
        git.branches = state.branches || { main: null };
        git.currentBranch = state.currentBranch || 'main';
        git.HEAD = state.HEAD || null;
        git.commitCounter = state.commitCounter || 0;
        git.score = state.score || 0;
        git.userName = state.userName || null;
        git.repoName = state.repoName || null;
        git.repoCreated = state.repoCreated || false;
        git.repoInitialized = state.repoInitialized || false;
        git.filesStaged = state.filesStaged || false;
        git.remoteUrl = state.remoteUrl || null;
        git.pushed = state.pushed || false;
        return true;
    } catch (e) {
        localStorage.removeItem('gitLearningProgress');
        return false;
    }
}

function clearProgress() {
    localStorage.removeItem('gitLearningProgress');
}

function init() {
    const hasProgress = loadProgress();
    loadLevel(currentLevel);
    if (hasProgress) {
        addOutput('Welcome back! Your progress has been restored.', 'success');
        visualize();
        if (git.userName) {
            updateUserBadge(git.userName);
        }
    }
    document.getElementById('command-input').addEventListener('keypress', handleCommand);
    document.getElementById('reset-btn').addEventListener('click', resetLevel);
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentLevel > 0) {
            currentLevel--;
            loadLevel(currentLevel);
            saveProgress();
        }
    });
    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentLevel < levels.length - 1) {
            currentLevel++;
            loadLevel(currentLevel);
            saveProgress();
        }
    });
    updateNavButtons();
}

function applyZoom() {}

function handleCommand(e) {
    if (e.key !== 'Enter') return;
    
    const input = e.target.value.trim();
    e.target.value = '';
    
    if (!input) return;
    
    addOutput(`git$ ${input}`, 'info');
    
    const parts = input.split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    
    let result;
    
    if (command === 'curl') {
        const fullCmd = input;
        const nameMatch = fullCmd.match(/"name"\s*:\s*"([^"]+)"/);
        if (nameMatch) {
            result = git.createRepo(nameMatch[1]);
            if (result.error) {
                addOutput(result.error, 'error');
            } else {
                addOutput(`{`, 'success');
                addOutput(`  "id": ${Math.floor(Math.random() * 900000000) + 100000000},`, 'success');
                addOutput(`  "name": "${result.name}",`, 'success');
                addOutput(`  "full_name": "${git.userName || 'you'}/${result.name}",`, 'success');
                addOutput(`  "html_url": "https://github.com/${git.userName || 'you'}/${result.name}",`, 'success');
                addOutput(`  "created_at": "${new Date().toISOString()}"`, 'success');
                addOutput(`}`, 'success');
                addOutput(`✓ Repository '${result.name}' created on GitHub!`, 'success');
            }
        } else {
            addOutput('Could not parse repo name. Use: curl ... -d \'{"name":"reponame"}\'', 'error');
        }
    } else if (command === 'git') {
        const gitCmd = args[0];
        const gitArgs = args.slice(1);
        
        switch(gitCmd) {
            case 'config':
                if (gitArgs.length >= 2) {
                    const key = gitArgs[0];
                    const value = gitArgs.slice(1).join(' ').replace(/["']/g, '');
                    result = git.config(key, value);
                    addOutput(result.success || result.error, result.success ? 'success' : 'error');
                } else {
                    addOutput('Usage: git config user.name "Your Name"', 'error');
                }
                break;
            case 'init':
                result = git.init();
                addOutput(result.success || result.error, result.success ? 'success' : 'error');
                break;
            case 'add':
                result = git.add(gitArgs[0] || '.');
                addOutput(result.success || result.error, result.success ? 'success' : 'error');
                break;
            case 'remote':
                if (gitArgs[0] === 'add' && gitArgs[1] && gitArgs[2]) {
                    result = git.remoteAdd(gitArgs[1], gitArgs[2]);
                    addOutput(result.success || result.error, result.success ? 'success' : 'error');
                } else {
                    addOutput('Usage: git remote add <name> <url>', 'error');
                }
                break;
            case 'push':
                const pushFlags = gitArgs.filter(a => a.startsWith('-'));
                const pushPositional = gitArgs.filter(a => !a.startsWith('-'));
                result = git.push(pushPositional[0] || 'origin', pushPositional[1] || 'main');
                if (result.error) {
                    addOutput(result.error, 'error');
                } else {
                    addOutput(`Enumerating objects: ${git.commits.length}, done.`, 'info');
                    addOutput(`Counting objects: 100% (${git.commits.length}/${git.commits.length}), done.`, 'info');
                    addOutput(`Writing objects: 100%, done.`, 'info');
                    if (levels[currentLevel].id === 1) {
                        addOutput(``, '');
                        addOutput(`📁 Pushing project to ${git.remoteUrl}`, 'info');
                        addOutput(`  ${git.repoName}/`, 'info');
                        addOutput(`  ├── .git/`, 'info');
                        addOutput(`  │   ├── HEAD`, 'info');
                        addOutput(`  │   ├── config`, 'info');
                        addOutput(`  │   ├── objects/`, 'info');
                        addOutput(`  │   └── refs/`, 'info');
                        addOutput(`  └── boss.py`, 'success');
                        addOutput(``, '');
                    }
                    addOutput(`To ${git.remoteUrl}`, 'success');
                    addOutput(` * [new branch]      ${result.branch} -> ${result.branch}`, 'success');
                    if (pushFlags.includes('-u')) {
                        addOutput(`Branch '${result.branch}' set up to track remote branch '${result.branch}'.`, 'success');
                    }
                    addOutput(`✓ Push complete! Your code is live on GitHub!`, 'success');
                }
                break;
            case 'commit':
                const msgFlag = gitArgs.indexOf('-m');
                const msg = msgFlag !== -1 ? gitArgs.slice(msgFlag + 1).join(' ').replace(/["']/g, '') : gitArgs.join(' ');
                result = git.commit(msg);
                if (result.error) {
                    addOutput(result.error, 'error');
                } else {
                    addOutput(`[${git.currentBranch} ${result.id}] ${result.message || 'Commit created'} by ${result.author}`, 'success');
                    if (levels[currentLevel].id === 1) {
                        addOutput(`💾 boss.py saved! Your work is now tracked by Git.`, 'success');
                        const indicator = document.getElementById('save-indicator');
                        indicator.textContent = '✓ saved';
                        indicator.className = 'saved-indicator';
                    }
                }
                break;
            case 'branch':
                if (gitArgs[0] === '-d' && gitArgs[1]) {
                    result = git.deleteBranch(gitArgs[1]);
                    if (result.success) {
                        addOutput(result.success, 'success');
                        if (result.removedCount > 0) {
                            addOutput(`🧹 Cleaned up ${result.removedCount} orphaned commit(s) from the graph.`, 'warning');
                        }
                    } else {
                        addOutput(result.error, 'error');
                    }
                } else {
                    result = git.branch(gitArgs[0]);
                    addOutput(result.success || result.error, result.success ? 'success' : 'error');
                }
                break;
            case 'checkout':
                result = git.checkout(gitArgs[0]);
                addOutput(result.success || result.error, result.success ? 'success' : 'error');
                break;
            case 'merge':
                result = git.merge(gitArgs[0]);
                addOutput(result.success || result.error, result.success ? 'success' : 'error');
                break;
            default:
                addOutput(`Unknown command: ${gitCmd}`, 'error');
        }
    } else {
        addOutput(`Command not found. Try 'git' or 'curl' commands.`, 'error');
    }
    
    visualize();
    checkLevelComplete();
    saveProgress();
}

function addLevelDivider(levelId, title) {
    const output = document.getElementById('output');
    const now = new Date();
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const divider = document.createElement('div');
    divider.className = 'level-divider';
    divider.textContent = `── Level ${levelId}: ${title} ── ${dateStr} ${timeStr} ──`;
    output.appendChild(divider);
    output.scrollTop = output.scrollHeight;
}

function addOutput(text, className = '') {
    const output = document.getElementById('output');
    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const lines = text.split('\n');
    lines.forEach(lineText => {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        const stamp = document.createElement('span');
        stamp.className = 'timestamp';
        stamp.textContent = ts;
        line.appendChild(stamp);
        line.appendChild(document.createTextNode(` ${lineText}`));
        output.appendChild(line);
    });
    output.scrollTop = output.scrollHeight;
}

function visualize() {
    const viz = document.getElementById('git-viz');
    viz.innerHTML = '';

    if (git.commits.length === 0) {
        viz.innerHTML = '<div class="viz-empty">Make your first commit to see the graph</div>';
        return;
    }

    const R = 18, COL_W = 90, ROW_H = 80, PAD_X = 40, PAD_TOP = 55, PAD_BOTTOM = 50;
    const NS = 'http://www.w3.org/2000/svg';
    const COLORS = {
        main: '#61afef', bugFix: '#98c379', feature: '#c678dd',
        'feature-a': '#c678dd', 'feature-b': '#56b6c2',
        feature1: '#e06c75', feature2: '#56b6c2',
        dev: '#e5c07b', develop: '#e5c07b',
        experiment: '#d19a66', polish: '#98c379',
        temp: '#be5046', hotfix: '#d19a66'
    };
    const color = b => COLORS[b] || '#abb2bf';

    // --- Assign lanes: main=0, each new branch gets next row ---
    const lane = { main: 0 };
    let nextLane = 1;
    git.commits.forEach(c => { if (!(c.branch in lane)) lane[c.branch] = nextLane++; });

    // --- Assign columns: each commit gets its global index as X slot ---
    // BUT: when a branch diverges from parent, it should start at parent's X+1
    // We track per-branch the last used column to space correctly
    const pos = {}; // id -> {x, y}
    git.commits.forEach((c, i) => {
        pos[c.id] = {
            x: PAD_X + i * COL_W,
            y: PAD_TOP + lane[c.branch] * ROW_H,
            color: color(c.branch),
            branch: c.branch
        };
    });

    const totalLanes = Object.keys(lane).length;
    const svgW = PAD_X + git.commits.length * COL_W + PAD_X;
    const svgH = PAD_TOP + totalLanes * ROW_H + PAD_BOTTOM;

    const el = (tag, attrs) => {
        const e = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        return e;
    };
    const txt = (x, y, content, attrs) => {
        const t = el('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-family': 'monospace', ...attrs });
        t.textContent = content;
        return t;
    };

    const svg = el('svg', { width: svgW, height: svgH, id: 'tree-svg' });

    // --- Lane guide lines ---
    Object.entries(lane).forEach(([b, row]) => {
        const y = PAD_TOP + row * ROW_H;
        const laneCommits = git.commits.filter(c => c.branch === b);
        if (laneCommits.length < 1) return;
        const x1 = pos[laneCommits[0].id].x;
        const x2 = pos[laneCommits[laneCommits.length - 1].id].x;
        svg.appendChild(el('line', { x1, y1: y, x2: x2 + R, y2: y, stroke: color(b), 'stroke-width': 1.5, opacity: 0.15, 'stroke-dasharray': '4,4' }));
    });

    // --- Edges ---
    git.commits.forEach(c => {
        const p = pos[c.id];
        const drawEdge = (fromId, dashed) => {
            const f = pos[fromId];
            if (!f) return;
            const isSameLane = f.y === p.y;
            const d = isSameLane
                ? `M${f.x} ${f.y} L${p.x} ${p.y}`
                : `M${f.x} ${f.y} C${f.x + COL_W * 0.6} ${f.y} ${p.x - COL_W * 0.3} ${p.y} ${p.x} ${p.y}`;
            const attrs = { d, stroke: dashed ? color(c.branch) : f.color, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' };
            if (dashed) attrs['stroke-dasharray'] = '7,4';
            svg.appendChild(el('path', attrs));
        };
        if (c.parent) drawEdge(c.parent, false);
        if (c.mergeParent) drawEdge(c.mergeParent, true);
    });

    // --- Commit nodes with hover tooltip ---
    git.commits.forEach(c => {
        const { x, y, color: col } = pos[c.id];
        const isHead = c.id === git.HEAD;
        const isMerge = c.id.startsWith('M');

        const g = el('g', { class: 'commit-node' });

        // HEAD ring
        if (isHead) g.appendChild(el('circle', { cx: x, cy: y, r: R + 5, fill: 'none', stroke: '#ff6b6b', 'stroke-width': 2, opacity: 0.7 }));

        // Merge commit: diamond shape via rotated rect
        if (isMerge) {
            const d = R + 2;
            g.appendChild(el('rect', { x: x - d, y: y - d, width: d * 2, height: d * 2, rx: 3, fill: col, stroke: '#282c34', 'stroke-width': 2, transform: `rotate(45 ${x} ${y})` }));
        } else {
            g.appendChild(el('circle', { cx: x, cy: y, r: R, fill: col, stroke: '#282c34', 'stroke-width': 2 }));
        }

        g.appendChild(txt(x, y, c.id, { fill: '#1a1d23', 'font-size': 11, 'font-weight': 'bold' }));

        // Tooltip on hover
        const tipW = 160, tipH = 44;
        const tipX = x - tipW / 2, tipY = y - R - tipH - 8;
        const tip = el('g', { class: 'commit-tooltip', opacity: 0 });
        tip.appendChild(el('rect', { x: tipX, y: tipY, width: tipW, height: tipH, rx: 5, fill: '#2c313a', stroke: col, 'stroke-width': 1.5 }));
        tip.appendChild(txt(x, tipY + 14, `${c.id} · ${c.branch}`, { fill: col, 'font-size': 10, 'font-weight': 'bold' }));
        tip.appendChild(txt(x, tipY + 30, c.author ? `by ${c.author}` : 'merge commit', { fill: '#abb2bf', 'font-size': 10 }));
        g.appendChild(tip);

        g.addEventListener('mouseenter', () => tip.setAttribute('opacity', 1));
        g.addEventListener('mouseleave', () => tip.setAttribute('opacity', 0));
        g.addEventListener('touchstart', (e) => {
            e.preventDefault();
            svg.querySelectorAll('.commit-tooltip').forEach(t => t.setAttribute('opacity', 0));
            tip.setAttribute('opacity', 1);
        }, { passive: false });

        svg.appendChild(g);
    });

    // --- Branch labels above latest commit on each branch ---
    Object.entries(git.branches).forEach(([b, commitId]) => {
        if (!commitId || !pos[commitId]) return;
        const { x, y } = pos[commitId];
        const col = color(b);
        const isCurrent = b === git.currentBranch;
        const lw = Math.max(b.length * 7 + 18, 52);
        const lx = x - lw / 2, ly = y - R - 32;

        const g = el('g', {});
        g.appendChild(el('rect', { x: lx, y: ly, width: lw, height: 22, rx: 4, fill: col, stroke: isCurrent ? '#fff' : col, 'stroke-width': isCurrent ? 2 : 0 }));
        g.appendChild(txt(x, ly + 11, b, { fill: '#1a1d23', 'font-size': 11, 'font-weight': 'bold' }));
        g.appendChild(el('line', { x1: x, y1: ly + 22, x2: x, y2: y - R, stroke: col, 'stroke-width': 1.5, opacity: 0.6 }));
        svg.appendChild(g);
    });

    // --- HEAD label below current HEAD ---
    if (git.HEAD && pos[git.HEAD]) {
        const { x, y } = pos[git.HEAD];
        svg.appendChild(el('line', { x1: x, y1: y + R, x2: x, y2: y + R + 12, stroke: '#ff6b6b', 'stroke-width': 1.5 }));
        svg.appendChild(el('rect', { x: x - 22, y: y + R + 12, width: 44, height: 18, rx: 4, fill: '#ff6b6b' }));
        svg.appendChild(txt(x, y + R + 21, 'HEAD', { fill: '#fff', 'font-size': 10, 'font-weight': 'bold' }));
    }

    viz.appendChild(svg);
}

function checkLevelComplete() {
    const level = levels[currentLevel];
    if (level.goal()) {
        git.score += level.points;
        addOutput(`✓ Level Complete! Well done!`, 'success');
        addOutput(`You earned ${level.points} points!`, 'success');
        
        setTimeout(() => {
            if (currentLevel < levels.length - 1) {
                currentLevel++;
                loadLevel(currentLevel);
                saveProgress();
            } else {
                addOutput('🎉 Congratulations! You\'ve completed all levels!', 'success');
                addOutput('You\'re now ready to use Git branching in real projects!', 'success');
                saveProgress();
            }
        }, 2000);
    }
}

function loadLevel(index) {
    const level = levels[index];
    document.getElementById('level-title').textContent = level.title;
    document.getElementById('level-indicator').textContent = `Level ${level.id} of ${levels.length}`;
    document.getElementById('instructions').innerHTML = level.instruction;
    
    // Show/hide code editor
    const codeEditor = document.getElementById('code-editor');
    if (level.showCode) {
        codeEditor.classList.remove('hidden');
        document.getElementById('code-content').textContent = level.codeContent;
        const indicator = document.getElementById('save-indicator');
        indicator.textContent = '● unsaved';
        indicator.className = 'unsaved-indicator';
    } else {
        codeEditor.classList.add('hidden');
    }
    
    addLevelDivider(level.id, level.title);
    addOutput(`Level ${level.id}: ${level.title}`, 'info');
    addOutput('Type your git commands below to complete the level.', 'info');
    visualize();
    updateNavButtons();
}

function updateNavButtons() {
    document.getElementById('prev-btn').disabled = currentLevel === 0;
    document.getElementById('next-btn').disabled = currentLevel === levels.length - 1;
}

function resetLevel() {
    if (confirm('Reset everything? This will clear all progress including your name!')) {
        clearProgress();
        git.reset();
        currentLevel = 0;
        updateUserBadge(null);
        document.getElementById('output').innerHTML = '';
        loadLevel(currentLevel);
        addOutput('Everything reset! Start fresh.', 'warning');
    }
}

init();
