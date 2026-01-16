// 游戏状态
let currentLevel = 0;
let level2Answer = [];

// 初始化粒子背景
function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// 开始游戏
function startGame() {
    currentLevel = 1;
    showScreen('level1');
    document.getElementById('progressBar').classList.add('show');
    updateProgress(1);
}

// 显示指定屏幕
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // 隐藏开始和结束界面的进度条
    if (screenId === 'startScreen' || screenId === 'endScreen') {
        document.getElementById('progressBar').classList.remove('show');
    }
}

// 更新进度指示器
function updateProgress(level) {
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index + 1 < level) {
            dot.classList.add('completed');
        } else if (index + 1 === level) {
            dot.classList.add('active');
        }
    });
}

// 第一关：数字密码验证
function checkLevel1() {
    const inputs = document.querySelectorAll('#codeInputs1 .code-digit');
    let code = '';
    inputs.forEach(input => {
        code += input.value;
    });
    
    const resultEl = document.getElementById('result1');
    
    if (code === '108') {
        resultEl.className = 'result-message success';
        resultEl.textContent = '✓ 密码正确！梁山108好汉！';
        
        // 震动反馈
        if (navigator.vibrate) navigator.vibrate(100);
        
        setTimeout(() => {
            currentLevel = 2;
            showScreen('level2');
            updateProgress(2);
            initLevel2();
        }, 1500);
    } else {
        resultEl.className = 'result-message error';
        resultEl.textContent = '✗ 密码错误，再想想...';
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
        
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
}

// 第一关输入框自动跳转
document.querySelectorAll('#codeInputs1 .code-digit').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        if (e.target.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

// 第二关：初始化拖拽
function initLevel2() {
    level2Answer = [];
    const chars = document.querySelectorAll('.char-tile');
    const slots = document.querySelectorAll('.drop-slot');
    
    // 重置状态
    chars.forEach(char => {
        char.classList.remove('placed');
        char.style.display = 'flex';
    });
    slots.forEach(slot => {
        slot.textContent = '';
        slot.classList.remove('filled');
        slot.dataset.char = '';
    });
    
    // 拖拽事件
    chars.forEach(char => {
        char.draggable = true;
        
        char.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', char.dataset.char);
            char.classList.add('dragging');
        });
        
        char.addEventListener('dragend', () => {
            char.classList.remove('dragging');
        });
        
        // 触摸支持
        char.addEventListener('touchstart', handleTouchStart);
        char.addEventListener('touchmove', handleTouchMove);
        char.addEventListener('touchend', handleTouchEnd);
    });
    
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('hover');
        });
        
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('hover');
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('hover');
            const char = e.dataTransfer.getData('text/plain');
            placeChar(slot, char);
        });
    });
}

let touchedChar = null;
let touchClone = null;

function handleTouchStart(e) {
    touchedChar = e.target;
    touchedChar.classList.add('dragging');
    
    // 创建跟随手指的副本
    touchClone = touchedChar.cloneNode(true);
    touchClone.style.position = 'fixed';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.zIndex = '1000';
    touchClone.style.opacity = '0.8';
    document.body.appendChild(touchClone);
    
    updateClonePosition(e.touches[0]);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (touchClone) {
        updateClonePosition(e.touches[0]);
    }
    
    // 检测是否悬停在槽位上
    const touch = e.touches[0];
    const slots = document.querySelectorAll('.drop-slot');
    slots.forEach(slot => {
        const rect = slot.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            slot.classList.add('hover');
        } else {
            slot.classList.remove('hover');
        }
    });
}

function handleTouchEnd(e) {
    if (touchClone) {
        document.body.removeChild(touchClone);
        touchClone = null;
    }
    
    if (touchedChar) {
        touchedChar.classList.remove('dragging');
        
        // 检测放置位置
        const touch = e.changedTouches[0];
        const slots = document.querySelectorAll('.drop-slot');
        slots.forEach(slot => {
            slot.classList.remove('hover');
            const rect = slot.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                placeChar(slot, touchedChar.dataset.char);
            }
        });
        
        touchedChar = null;
    }
}

function updateClonePosition(touch) {
    if (touchClone) {
        touchClone.style.left = (touch.clientX - 35) + 'px';
        touchClone.style.top = (touch.clientY - 35) + 'px';
    }
}

function placeChar(slot, char) {
    if (slot.dataset.char) return; // 已有字符
    
    slot.textContent = char;
    slot.dataset.char = char;
    slot.classList.add('filled');
    
    // 隐藏原字符块
    const charTile = document.querySelector(`.char-tile[data-char="${char}"]`);
    if (charTile) {
        charTile.classList.add('placed');
    }
    
    // 更新答案数组
    const slotIndex = parseInt(slot.dataset.slot);
    level2Answer[slotIndex] = char;
}

// 第二关验证
function checkLevel2() {
    const answer = level2Answer.join('');
    const resultEl = document.getElementById('result2');
    
    if (answer === '黄诗怡') {
        resultEl.className = 'result-message success';
        resultEl.textContent = '✓ 正确！目标姓名：黄诗怡';
        
        if (navigator.vibrate) navigator.vibrate(100);
        
        setTimeout(() => {
            currentLevel = 3;
            showScreen('level3');
            updateProgress(3);
        }, 1500);
    } else if (answer.length === 3) {
        resultEl.className = 'result-message error';
        resultEl.textContent = '✗ 顺序不对，重新排列！';
        
        // 重置
        setTimeout(() => {
            initLevel2();
            resultEl.style.display = 'none';
        }, 1000);
        
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } else {
        resultEl.className = 'result-message error';
        resultEl.textContent = '✗ 请将所有文字放入槽位';
    }
}

// 第三关验证
function checkLevel3() {
    const input = document.getElementById('level3Input').value;
    const resultEl = document.getElementById('result3');
    
    if (input === '猪') {
        resultEl.className = 'result-message success';
        resultEl.textContent = '✓ 正确！生物特征确认：猪';
        
        if (navigator.vibrate) navigator.vibrate(100);
        
        setTimeout(() => {
            currentLevel = 4;
            showScreen('level4');
            updateProgress(4);
            initLevel4();
        }, 1500);
    } else {
        resultEl.className = 'result-message error';
        resultEl.textContent = '✗ 不对哦，看看那些表情...';
        document.getElementById('level3Input').value = '';
        
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
}

// 第四关初始化
function initLevel4() {
    const options = document.querySelectorAll('.option-btn');
    options.forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
        btn.onclick = () => selectFinalAnswer(btn);
    });
}

function selectFinalAnswer(btn) {
    const answer = btn.dataset.answer;
    const resultEl = document.getElementById('result4');
    const options = document.querySelectorAll('.option-btn');
    
    // 移除之前的选择
    options.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    if (answer === '猪') {
        btn.classList.add('correct');
        resultEl.className = 'result-message success';
        resultEl.textContent = '✓ 真相大白！';
        
        // 更新等式
        document.querySelector('.animal-part').textContent = '🐷 猪';
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        setTimeout(() => {
            showEndScreen();
        }, 2000);
    } else {
        btn.classList.add('wrong');
        resultEl.className = 'result-message error';
        resultEl.textContent = '✗ 再想想，线索都在前面...';
        
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        
        setTimeout(() => {
            btn.classList.remove('selected', 'wrong');
            resultEl.style.display = 'none';
        }, 1500);
    }
}

// 显示结束界面
function showEndScreen() {
    showScreen('endScreen');
    initConfetti();
}

// 彩带效果
function initConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    const colors = ['#ff3366', '#00ff88', '#667eea', '#ffd700', '#ff69b4'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        container.appendChild(confetti);
    }
}

// 重新开始游戏
function restartGame() {
    currentLevel = 0;
    level2Answer = [];
    
    // 重置所有输入
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.querySelectorAll('.result-message').forEach(el => {
        el.className = 'result-message';
        el.style.display = 'none';
    });
    
    // 重置第四关等式
    document.querySelector('.animal-part').textContent = '?';
    
    showScreen('startScreen');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    
    // 点击槽位可以移除字符
    document.querySelectorAll('.drop-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            if (slot.dataset.char) {
                const char = slot.dataset.char;
                const charTile = document.querySelector(`.char-tile[data-char="${char}"]`);
                if (charTile) {
                    charTile.classList.remove('placed');
                }
                
                const slotIndex = parseInt(slot.dataset.slot);
                level2Answer[slotIndex] = undefined;
                
                slot.textContent = '';
                slot.dataset.char = '';
                slot.classList.remove('filled');
            }
        });
    });
});
