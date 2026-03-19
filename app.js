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
        return { success: `Deleted branch '${name}'` };
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
        title: "Your First Commit - Save Your Work!",
        instruction: `<p>Welcome, future Git master! 👋</p>
        <p>You just wrote your first Python program (check the code editor below). But there's a problem... <strong>it's not saved yet!</strong></p>
        <p>In the real world, you'd press <code>Ctrl+S</code> to save. In Git, we use <code>git commit</code>.</p>
        <p><strong>Your mission:</strong></p>
        <p>1. Set your name: <code>git config user.name "Your Name"</code><br>
        2. Save your work: <code>git commit</code></p>`,
        goal: () => git.commits.length >= 1 && git.userName,
        points: 10,
        showCode: true,
        codeContent: `# boss.py
def main():
    print("I am the Boss")
    print("I consent to show my name!")

if __name__ == "__main__":
    main()`
    },
    {
        id: 2,
        title: "Branching in Git",
        instruction: `<p>Branches in Git are incredibly lightweight as well. They are simply pointers to a specific commit — nothing more.</p>
        <p>This is why many Git enthusiasts chant the mantra: <em>branch early, and branch often</em></p>
        <p>Because there is no storage / memory overhead with making many branches, it's easier to logically divide up your work than have big beefy branches.</p>
        <p><strong>To complete this level:</strong> Create a new branch named <code>bugFix</code> and switch to it.</p>
        <p>Try: <code>git branch bugFix</code> then <code>git checkout bugFix</code></p>`,
        goal: () => git.branches.bugFix !== undefined && git.currentBranch === 'bugFix',
        points: 20
    },
    {
        id: 3,
        title: "Merging in Git",
        instruction: `<p>Great! We now know how to commit and branch. Now we need to learn some kind of way of combining the work from two different branches together.</p>
        <p>The first method to combine work that we will examine is <code>git merge</code>. Merging in Git creates a special commit that has two unique parents.</p>
        <p><strong>To complete this level:</strong></p>
        <p>1. Make a new branch called <code>bugFix</code><br>
        2. Checkout the <code>bugFix</code> branch with <code>git checkout bugFix</code><br>
        3. Commit once<br>
        4. Go back to <code>main</code> with <code>git checkout main</code><br>
        5. Commit again<br>
        6. Merge the branch <code>bugFix</code> into <code>main</code> with <code>git merge bugFix</code></p>`,
        goal: () => {
            const hasFeature = git.branches.bugFix !== undefined;
            const hasMerge = git.commits.some(c => c.id.startsWith('M'));
            return hasFeature && hasMerge && git.currentBranch === 'main';
        },
        points: 30
    },
    {
        id: 4,
        title: "Moving Around in Git",
        instruction: `<p>Before we get to some of the more advanced features of Git, it's important to understand different ways to move through the commit tree.</p>
        <p>Once you're comfortable moving around, your powers with other git commands will be amplified!</p>
        <p><strong>To complete this level:</strong> Create a branch, make some commits, and practice switching between branches.</p>
        <p>Create branch <code>feature</code>, checkout to it, make 2 commits, then return to <code>main</code>.</p>`,
        goal: () => git.commits.filter(c => c.branch === 'feature').length >= 2 && git.currentBranch === 'main',
        points: 40
    },
    {
        id: 5,
        title: "Deleting Branches",
        instruction: `<p>After merging a feature branch, it's good practice to delete it to keep your repository clean.</p>
        <p>You can delete a branch using <code>git branch -d branchname</code>. Note that main and dev branches are protected and cannot be deleted.</p>
        <p><strong>To complete this level:</strong></p>
        <p>1. Create branch <code>temp</code><br>
        2. Make 1 commit on <code>temp</code><br>
        3. Checkout to <code>main</code><br>
        4. Delete the <code>temp</code> branch using <code>git branch -d temp</code></p>`,
        goal: () => {
            const hadTemp = git.commits.some(c => c.branch === 'temp');
            const tempDeleted = git.branches.temp === undefined;
            return hadTemp && tempDeleted && git.currentBranch === 'main';
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
const APP_VERSION = '1.0.0';

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
        userName: git.userName
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
    
    if (command === 'git') {
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
            case 'commit':
                result = git.commit(gitArgs.join(' '));
                if (result.error) {
                    addOutput(result.error, 'error');
                } else {
                    addOutput(`[${git.currentBranch} ${result.id}] Commit created by ${result.author}`, 'success');
                }
                break;
            case 'branch':
                if (gitArgs[0] === '-d' && gitArgs[1]) {
                    result = git.deleteBranch(gitArgs[1]);
                    addOutput(result.success || result.error, result.success ? 'success' : 'error');
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
        addOutput(`Command not found. Use 'git' commands only.`, 'error');
    }
    
    visualize();
    checkLevelComplete();
    saveProgress();
}

function addOutput(text, className = '') {
    const output = document.getElementById('output');
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    line.textContent = text;
    output.appendChild(line);
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
    } else {
        codeEditor.classList.add('hidden');
    }
    
    document.getElementById('output').innerHTML = '';
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
        loadLevel(currentLevel);
        addOutput('Everything reset! Start fresh.', 'warning');
    }
}

init();
