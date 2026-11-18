# Words of Wisdom &bull; 100 Well-Known Quotes Web App

A clean, responsive web application built with **Python Flask**, **Vanilla JavaScript**, and **HTML5/CSS3** to explore, randomize, search, filter, and export a curated collection of 100 well-known quotes.

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-green.svg)](https://flask.palletsprojects.com/)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- **Curated 100 Quotes Dataset**: Exactly 100 timeless quotes from historical thinkers, philosophers, scientists, and leaders (Aristotle, Socrates, Albert Einstein, Maya Angelou, Mark Twain, Steve Jobs, and more).
- **Random Quote Generator**: Hero card with a "New Random Quote" button that smoothly transitions between quotes.
- **Search & Author Filtering**: Instant, debounced text search matching both quote text and author names.
- **Category Filtering**: Filter quotes across 8 categories (*Inspiration, Philosophy, Science, Wisdom, Leadership, Humor, Literature, Life*) via dropdown or interactive quick-filter pills.
- **📋 Copy to Clipboard**:
  - Dedicated "Copy to Clipboard" button on each quote card and the hero section.
  - Interactive visual confirmation ("Copied!") and toast notifications.
  - Formats quote cleanly as `"{quote}" — {author}`.
- **📥 Export to CSV**:
  - One-click "Export to CSV" button that exports all or currently filtered quotes.
  - Backed by both client download and a server-side CSV streaming endpoint.
- **Zero Frontend Build Dependencies**: Pure HTML5, modern CSS3 (Flexbox & CSS Grid), and plain Vanilla JavaScript.

---

## 📁 Project Structure

```text
apg-cli-projects/
├── app.py                 # Flask server & REST API endpoints
├── quotes.json            # Curated dataset of 100 quotes
├── requirements.txt       # Dependencies (Flask, pytest)
├── .gitignore             # Git ignore rules for Python, virtual envs, OS
├── README.md              # Project documentation
├── static/
│   ├── css/
│   │   └── style.css      # Responsive styles & animations
│   └── js/
│       └── app.js         # Vanilla JS client logic (Fetch API, DOM, Copy, CSV)
├── templates/
│   └── index.html         # Single-page HTML5 template
└── tests/
    └── test_app.py        # Automated test suite (13 pytest tests)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `GET` | `/` | Serves the web application | None |
| `GET` | `/api/quotes/random` | Returns a random quote | `category` (optional), `author` (optional) |
| `GET` | `/api/quotes` | Returns list of quotes matching filters | `q` (search text), `category`, `author` |
| `GET` | `/api/quotes/export/csv` | Streams quotes matching filters as CSV | `q`, `category`, `author` |
| `GET` | `/api/categories` | Returns sorted list of distinct categories | None |
| `GET` | `/api/authors` | Returns sorted list of distinct authors | None |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:magicsquares137/whimsical-wisdom-100.git
   cd whimsical-wisdom-100
   ```

2. Create and activate a virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

Start the Flask server:
```bash
python app.py
```
Then navigate to **`http://127.0.0.1:5000`** in your browser.

---

## 🧪 Running Tests

The test suite validates data integrity, schema compliance, API routing, search/filter logic, and CSV generation:

```bash
pytest tests/test_app.py -v
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
