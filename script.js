/* =========================================================
   Nexus Scientific Calculator — Fixed Engine (v2)
   Recursive Descent Parser with proper Percentage logic
   ========================================================= */

(() => {
  'use strict';

  // ---------- DOM ----------
  const expressionEl  = document.getElementById('expression');
  const valueEl       = document.getElementById('value');
  const keypad        = document.getElementById('keypad');
  const sciToggle     = document.getElementById('sciToggle');
  const historyPanel  = document.getElementById('historyPanel');
  const historyList   = document.getElementById('historyList');
  const historyToggle = document.getElementById('historyToggle');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const overlay       = document.getElementById('overlay');
  const themeToggle   = document.getElementById('themeToggle');
  const tiltWrapper   = document.getElementById('tiltWrapper');

  // ---------- State ----------
  let currentExpr    = '';
  let isScientific   = false;
  let history        = JSON.parse(localStorage.getItem('calcHistory')) || [];

  /* =========================================================
     SAFE MATH PARSER — Recursive Descent
     Grammar:
       expression = term (('+' | '-') term)*
       term       = power (('*' | '/' | implicit_mult) power)*
       power      = unary ('^' power)?
       unary      = ('-' | '+')? primary
       primary    = number | function '(' expr ')' | '(' expr ')' | constant | primary '%'
     ========================================================= */
  class MathParser {
    constructor(expr) {
      this.expr = expr
        .replace(/\s+/g, '')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');
      this.pos = 0;
    }

    peek()    { return this.expr[this.pos]; }
    consume() { return this.expr[this.pos++]; }
    isEnd()   { return this.pos >= this.expr.length; }

    match(str) {
      if (this.expr.substr(this.pos, str.length) === str) {
        this.pos += str.length;
        return true;
      }
      return false;
    }

    canStartPrimary() {
      if (this.isEnd()) return false;
      const c = this.peek();
      if (/[0-9.]/.test(c)) return true;
      if (c === '(' || c === 'π') return true;
      if (c === 'e') {
        const next = this.expr[this.pos + 1];
        if (!next || !/[a-z]/i.test(next)) return true;
      }
      const funcs = ['sqrt', '√', 'sin', 'cos', 'tan', 'log', 'ln'];
      return funcs.some(f => this.expr.startsWith(f, this.pos));
    }

    parse() {
      if (this.isEnd()) throw new Error('Empty');
      const result = this.parseExpression();
      if (!this.isEnd()) {
        throw new Error('Unexpected: ' + (this.peek() || 'end'));
      }
      return result;
    }

    parseExpression() {
      let left = this.parseTerm();
      while (!this.isEnd()) {
        if (this.match('+'))      left = left + this.parseTerm();
        else if (this.match('-')) left = left - this.parseTerm();
        else break;
      }
      return left;
    }

    parseTerm() {
      let left = this.parsePower();
      while (!this.isEnd()) {
        if (this.match('*')) {
          left = left * this.parsePower();
        } else if (this.match('/')) {
          const right = this.parsePower();
          if (right === 0) throw new Error('Divide by zero');
          left = left / right;
        } else if (this.canStartPrimary()) {
          left = left * this.parsePower(); // Implicit multiplication
        } else {
          break;
        }
      }
      return left;
    }

    parsePower() {
      const base = this.parseUnary();
      if (this.match('^')) {
        const exp = this.parsePower();
        return Math.pow(base, exp);
      }
      return base;
    }

    parseUnary() {
      if (this.match('-')) return -this.parseUnary();
      if (this.match('+')) return +this.parseUnary();
      return this.parsePrimary();
    }

    // FIXED: parsePrimary now handles '%' as a postfix percentage operator
    parsePrimary() {
      let value;

      // 1. Parentheses
      if (this.match('(')) {
        value = this.parseExpression();
        if (!this.match(')')) throw new Error('Missing )');
      }
      // 2. Constants
      else if (this.match('π')) {
        value = Math.PI;
      }
      else if (this.peek() === 'e') {
        const next = this.expr[this.pos + 1];
        if (!next || !/[a-z]/i.test(next)) {
          this.consume();
          value = Math.E;
        } else {
          throw new Error('Unexpected: e');
        }
      }
      // 3. Functions
      else {
        const funcs = [
          ['sqrt', Math.sqrt], ['√', Math.sqrt],
          ['sin',  Math.sin],  ['cos', Math.cos], ['tan', Math.tan],
          ['log',  Math.log10],['ln',  Math.log]
        ];
        let matched = false;
        for (const [name, fn] of funcs) {
          if (this.match(name)) {
            if (!this.match('(')) throw new Error('Expected ( after ' + name);
            const arg = this.parseExpression();
            if (!this.match(')')) throw new Error('Missing )');
            const res = fn(arg);
            if (!isFinite(res)) throw new Error('Math error');
            value = res;
            matched = true;
            break;
          }
        }
        if (!matched) {
          // 4. Numbers
          if (/[0-9.]/.test(this.peek())) {
            value = this.parseNumber();
          } else {
            throw new Error('Unexpected: ' + (this.peek() || 'end'));
          }
        }
      }

      // 5. Postfix Percentage (%) -> divides the value by 100
      // This makes 100 * 10% = 100 * 0.1 = 10
      while (this.match('%')) {
        value = value / 100;
      }

      return value;
    }

    parseNumber() {
      let numStr = '';
      let hasDot = false;
      while (!this.isEnd() && /[0-9.]/.test(this.peek())) {
        if (this.peek() === '.') {
          if (hasDot) throw new Error('Invalid number');
          hasDot = true;
        }
        numStr += this.consume();
      }
      // Scientific notation
      if (!this.isEnd() && (this.peek() === 'e' || this.peek() === 'E')) {
        const next = this.expr[this.pos + 1];
        if (next === '+' || next === '-' || (next && /[0-9]/.test(next))) {
          numStr += this.consume();
          if (this.peek() === '+' || this.peek() === '-') {
            numStr += this.consume();
          }
          while (!this.isEnd() && /[0-9]/.test(this.peek())) {
            numStr += this.consume();
          }
        }
      }
      const num = parseFloat(numStr);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    }
  }

  const safeEvaluate = (expr) => {
    try {
      if (!expr || !expr.trim()) return '';
      const parser = new MathParser(expr);
      const result = parser.parse();
      if (!isFinite(result)) return 'Error';
      return parseFloat(result.toPrecision(12)).toString();
    } catch (err) {
      const incompleteErrors = ['Empty', 'Missing )', 'Unexpected: end', 'Expected ('];
      if (incompleteErrors.some(m => err.message.startsWith(m))) {
        return null;
      }
      return 'Error';
    }
  };

  const isComplete = (expr) => {
    if (!expr) return false;
    const last = expr.trim().slice(-1);
    return /[0-9)πe%]/.test(last); // Added % to complete list
  };

  /* =========================================================
     DISPLAY & INPUT
     ========================================================= */
  const updateDisplay = () => {
    expressionEl.textContent = currentExpr || '';

    if (!currentExpr) {
      valueEl.textContent = '0';
      valueEl.style.fontSize = '2rem';
      return;
    }

    if (isComplete(currentExpr)) {
      const preview = safeEvaluate(currentExpr);
      if (preview === null) {
        valueEl.textContent = currentExpr;
      } else if (preview === 'Error') {
        valueEl.textContent = 'Error';
      } else {
        valueEl.textContent = preview;
      }
    } else {
      valueEl.textContent = currentExpr;
    }

    const len = valueEl.textContent.length;
    if (len > 16) valueEl.style.fontSize = '1.4rem';
    else if (len > 12) valueEl.style.fontSize = '1.7rem';
    else if (len > 8)  valueEl.style.fontSize = '1.9rem';
    else valueEl.style.fontSize = '2rem';
  };

  const handleInput = (action, value) => {
    if (valueEl.textContent === 'Error' && action !== 'clear') {
      currentExpr = '';
    }

    switch (action) {
      case 'insert': {
        const lastChar = currentExpr.slice(-1);
        const ops = ['+', '-', '×', '÷', '^', '%'];
        const isOp = ops.includes(value);
        const lastIsOp = ops.includes(lastChar);

        if (isOp && lastIsOp) {
          currentExpr = currentExpr.slice(0, -1) + value;
        } else if (value === '(' && /[0-9)πe%]/.test(lastChar)) {
          currentExpr += '×' + value;
        } else if (value === ')' && lastIsOp) {
          return;
        } else {
          currentExpr += value;
        }
        break;
      }
      case 'delete': {
        const multiTokens = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', '√('];
        let deleted = false;
        for (const token of multiTokens) {
          if (currentExpr.endsWith(token)) {
            currentExpr = currentExpr.slice(0, -token.length);
            deleted = true;
            break;
          }
        }
        if (!deleted) currentExpr = currentExpr.slice(0, -1);
        break;
      }
      case 'clear':
        currentExpr = '';
        break;
      case 'evaluate': {
        if (!currentExpr) return;
        const result = safeEvaluate(currentExpr);

        if (result === null || result === 'Error') {
          valueEl.textContent = 'Error';
          expressionEl.textContent = currentExpr + ' =';
          return;
        }

        addToHistory(currentExpr, result);
        expressionEl.textContent = currentExpr + ' =';
        currentExpr = result;
        valueEl.textContent = result;
        valueEl.classList.add('pop');
        setTimeout(() => valueEl.classList.remove('pop'), 200);
        return;
      }
    }
    updateDisplay();
  };

  /* =========================================================
     HISTORY & UI EVENTS
     ========================================================= */
  const renderHistory = () => {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
      return;
    }
    history.slice().reverse().forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<div class="history-expr">${item.expr}</div><div class="history-res">= ${item.res}</div>`;
      div.addEventListener('click', () => {
        currentExpr = item.res;
        updateDisplay();
        toggleHistory(false);
      });
      historyList.appendChild(div);
    });
  };

  const addToHistory = (expr, res) => {
    history.push({ expr, res, timestamp: Date.now() });
    if (history.length > 20) history.shift();
    localStorage.setItem('calcHistory', JSON.stringify(history));
    renderHistory();
  };

  const toggleHistory = (forceState) => {
    const isOpen = forceState !== undefined ? forceState : !historyPanel.classList.contains('open');
    historyPanel.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
  };

  keypad.addEventListener('click', (e) => {
    const btn = e.target.closest('.key');
    if (!btn) return;
    handleInput(btn.dataset.action, btn.dataset.value);
  });

  sciToggle.addEventListener('click', () => {
    isScientific = !isScientific;
    keypad.classList.toggle('scientific', isScientific);
    sciToggle.classList.toggle('active', isScientific);
  });

  historyToggle.addEventListener('click', () => toggleHistory());
  overlay.addEventListener('click', () => toggleHistory(false));
  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('calcHistory');
    renderHistory();
  });

  const themes = ['aurora', 'cyber', 'minimal'];
  let currentTheme = 0;
  themeToggle.addEventListener('click', () => {
    currentTheme = (currentTheme + 1) % themes.length;
    if (themes[currentTheme] === 'aurora') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themes[currentTheme]);
    }
  });

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      tiltWrapper.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    document.addEventListener('mouseleave', () => {
      tiltWrapper.style.transform = 'rotateX(0) rotateY(0)';
    });
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/^[0-9.]$/.test(key)) {
      e.preventDefault(); handleInput('insert', key);
    } else if (['+', '-', '%', '(', ')', '^'].includes(key)) {
      e.preventDefault(); handleInput('insert', key);
    } else if (key === '*') {
      e.preventDefault(); handleInput('insert', '×');
    } else if (key === '/') {
      e.preventDefault(); handleInput('insert', '÷');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault(); handleInput('evaluate');
    } else if (key === 'Backspace') {
      e.preventDefault(); handleInput('delete');
    } else if (key === 'Escape') {
      e.preventDefault(); handleInput('clear');
    }
  });

  renderHistory();
  updateDisplay();
})();