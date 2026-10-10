# Nexus Scientific Calculator | CodeAlpha Internship

A premium, feature-rich scientific calculator built entirely from scratch using **Vanilla HTML, CSS, and JavaScript**. Designed to demonstrate advanced frontend skills, secure coding practices, and a polished UI/UX for the CodeAlpha Frontend Development Internship.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-No_Frameworks-3178C6?style=flat)

##  Features

### Core Functionality
- **Standard & Scientific Modes:** Smooth toggle to reveal advanced functions (`sin`, `cos`, `tan`, `log`, `ln`, `√`, `^`, `π`, `e`).
- **Safe Math Engine:** Evaluates complex expressions (e.g., `2 + 3 * (4 - 1)^2`) using a **custom Recursive Descent Parser**. **No unsafe `eval()` or `new Function()` used.**
- **Smart Percentage:** Context-aware percentage calculations (e.g., `100 × 10% = 10`).
- **Implicit Multiplication:** Automatically understands expressions like `2π` or `2(3+4)` without needing a multiplication sign.
- **BODMAS/Precedence:** Strictly follows mathematical order of operations.

### UI/UX & Interactions
- **3D Tilt Effect:** Subtle, mouse-tracking 3D perspective effect on desktop for a premium feel.
- **Dynamic Themes:** 3 built-in themes (Aurora Glass, Cyber Neon, Obsidian Minimal) switchable in real-time.
- **Persistent History:** Saves the last 20 calculations in `localStorage`. Click any history item to reload it.
- **Full Keyboard Support:** Maps all standard keyboard inputs (Numbers, Operators, Enter, Backspace, Escape) to calculator functions.
- **Responsive Design:** Fluid layout that adapts perfectly to desktop, tablet, and mobile screens without scrolling.
- **Accessibility:** Semantic HTML, ARIA labels, visible focus states, and `prefers-reduced-motion` support.

## 🛠️ Tech Stack

- **HTML5:** Semantic structure and accessible markup.
- **CSS3:** CSS Grid, Flexbox, Custom Properties (Variables), Backdrop Filter (Glassmorphism), 3D Transforms, and Media Queries.
- **Vanilla JavaScript (ES6+):** IIFE pattern, LocalStorage API, Custom Parser implementation, Event Delegation.

## 🚀 How to Run Locally

No build tools, no npm install, and no dependencies required.

1. Clone or download this repository.
2. Open the folder in **VS Code** (or any code editor).
3. Open `index.html` in your browser, or use the **Live Server** extension for a better development experience.

##  How to Test

### Basic Operations
- `5 + 3 =` ➡️ `8`
- `10 ÷ 2 =` ➡️ `5`
- `100 × 10 % =` ➡️ `10` (Smart percentage)

### Advanced / Scientific
- Toggle **Scientific Mode** ON.
- `√(16) + 2^3 =` ➡️ `12`
- `sin(0) + cos(0) =` ️ `1`
- `log(100) =` ➡️ `2`

### Edge Cases & Security
- `10 ÷ 0 =` ➡️ Shows "Error" gracefully (no crash).
- `2 + 3 × 4 =` ➡️ `14` (Correct BODMAS precedence).

## 📁 Project Structure
 
CodeAlpha_Calculator/
├── index.html # Semantic HTML structure
├── style.css # CSS3 styling, themes, and responsive layout
├── script.js # Vanilla JS logic and custom math parser
└── README.md # Project documentation