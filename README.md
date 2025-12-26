# Minesweeper (Vanilla JS)

![Status](https://img.shields.io/badge/Status-Complete-success)
![Language](https://img.shields.io/badge/Language-JavaScript-F7DF1E)

A classic Minesweeper implementation built from scratch using **Vanilla JavaScript** (ES6+). This project demonstrates DOM manipulation, recursive algorithms, and state management without the use of external frameworks.

### 🎮 [Play the Live Demo](https://tonytheslacker.github.io/minesweepr/)

---

## 🧩 Features

* **Recursive Flood-Fill Algorithm:** Automatically clears empty areas and expands the frontier when a zero-value tile is clicked.
* **Persistent High Scores:** Uses the browser's `localStorage` API to save and track "Best Times" for each difficulty level locally.
* **Dynamic Grid Generation:** Supports switching between Beginner (9x9), Intermediate (16x16), and Expert (16x30) modes instantly.
* **Keyboard Accessibility:** Fully playable using `Tab`, `Space`, and `Enter` keys for accessibility.
* **Custom State Management:** Tracks game states (Playing, Won, Game Over) and updates the UI/Smiley face reactively.

## 🛠️ Technical Stack

* **Logic:** JavaScript (ES6)
* **Styling:** CSS3 (CSS Grid & CSS Variables for Dark Mode)
* **Structure:** Semantic HTML5

## 📐 How It Works

### The Flood-Fill Recursion
When a cell with `0` adjacent mines is clicked, the game triggers a recursive function to check all 8 surrounding neighbors. If those neighbors are also `0`, they trigger their own checks, creating a cascading clearing effect.

```javascript
// Snippet from app.js
function openCell(r,c) {
  // ...
  if (cell.count === 0) {
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      // Recursively open neighbors
      openCell(nr, nc);
    }
  }
}

```

### Local Storage Implementation
Best times are stored as strings in the browser's local storage to ensure data persistence across sessions.

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
     git clone [https://github.com/TonyTheSlacker/minesweepr.git](https://github.com/TonyTheSlacker/minesweepr.git/)
   ```
2. **Open the game:** double-click index.html to run it in your browser. No build step or Node.js server required.



