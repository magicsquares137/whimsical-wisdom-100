/**
 * 100 Well-Known Quotes Application
 * Pure Vanilla JavaScript Client
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const heroCard = document.getElementById('hero-card');
  const heroText = document.getElementById('hero-quote-text');
  const heroAuthor = document.getElementById('hero-quote-author');
  const heroCategory = document.getElementById('hero-quote-category');
  const btnNextRandom = document.getElementById('btn-next-random');
  const btnCopyHero = document.getElementById('btn-copy-hero');

  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const categorySelect = document.getElementById('category-select');
  const authorSelect = document.getElementById('author-select');
  const categoryPillsContainer = document.getElementById('category-pills');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const btnEmptyReset = document.getElementById('btn-empty-reset');

  const resultsCounter = document.getElementById('results-counter');
  const quotesGrid = document.getElementById('quotes-grid');
  const emptyState = document.getElementById('empty-state');
  const toast = document.getElementById('toast');

  // --- State ---
  let currentHeroQuote = null;
  let activeCategory = 'all';
  let activeAuthor = '';
  let searchQuery = '';
  let searchDebounceTimeout = null;
  let toastTimeout = null;

  // --- Initialization ---
  initApp();

  async function initApp() {
    await Promise.all([
      loadCategories(),
      loadAuthors(),
      getRandomQuote()
    ]);
    await fetchQuotes();
    setupEventListeners();
  }

  // --- API Functions ---

  /**
   * Fetch and display a random quote in the hero card.
   */
  async function getRandomQuote() {
    try {
      btnNextRandom.disabled = true;
      heroText.style.opacity = '0.3';

      const res = await fetch('/api/quotes/random');
      if (!res.ok) throw new Error('Failed to fetch random quote');
      const data = await res.json();
      currentHeroQuote = data.quote;

      setTimeout(() => {
        heroText.textContent = `\u201C${currentHeroQuote.quote}\u201D`;
        heroAuthor.textContent = `\u2014 ${currentHeroQuote.author}`;
        heroCategory.textContent = currentHeroQuote.category;
        heroCategory.setAttribute('data-category', currentHeroQuote.category);
        heroText.style.opacity = '1';
        btnNextRandom.disabled = false;
      }, 150);
    } catch (err) {
      console.error('Error fetching random quote:', err);
      heroText.textContent = 'Failed to load quote. Please try again.';
      heroText.style.opacity = '1';
      btnNextRandom.disabled = false;
    }
  }

  /**
   * Fetch available categories and build dropdown + quick pill filters.
   */
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      const categories = data.categories || [];

      // Populate Select
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
      });

      // Populate Quick Pills
      categories.forEach(cat => {
        const pill = document.createElement('button');
        pill.className = 'pill';
        pill.dataset.category = cat;
        pill.textContent = cat;
        categoryPillsContainer.appendChild(pill);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  /**
   * Fetch available authors and build author dropdown.
   */
  async function loadAuthors() {
    try {
      const res = await fetch('/api/authors');
      if (!res.ok) throw new Error('Failed to load authors');
      const data = await res.json();
      const authors = data.authors || [];

      authors.forEach(auth => {
        const opt = document.createElement('option');
        opt.value = auth;
        opt.textContent = auth;
        authorSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading authors:', err);
    }
  }

  /**
   * Fetch quotes matching current search, category, and author filters.
   */
  async function fetchQuotes() {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (activeCategory && activeCategory !== 'all') params.append('category', activeCategory);
      if (activeAuthor) params.append('author', activeAuthor);

      const url = `/api/quotes?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const data = await res.json();

      renderQuotes(data.quotes || [], data.total || 0);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      quotesGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      resultsCounter.textContent = '0 quotes found';
    }
  }

  // --- Rendering ---

  /**
   * Render quote cards into the grid.
   */
  function renderQuotes(quotes, total) {
    resultsCounter.textContent = `Showing ${total} quote${total === 1 ? '' : 's'}`;

    if (total === 0) {
      quotesGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    quotesGrid.innerHTML = quotes.map(q => `
      <article class="quote-card" data-id="${q.id}">
        <div class="quote-card-header">
          <span class="category-tag" data-category="${escapeHtml(q.category)}">${escapeHtml(q.category)}</span>
          <span class="quote-number">#${q.id}</span>
        </div>
        <p class="card-quote-text">&ldquo;${escapeHtml(q.quote)}&rdquo;</p>
        <div class="quote-card-footer">
          <span class="quote-card-author">&mdash; ${escapeHtml(q.author)}</span>
          <button class="btn-card-copy" title="Copy quote" data-quote="${escapeHtml(q.quote)}" data-author="${escapeHtml(q.author)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </article>
    `).join('');
  }

  // --- Event Listeners ---

  function setupEventListeners() {
    // Random quote button
    btnNextRandom.addEventListener('click', getRandomQuote);

    // Hero quote copy button
    btnCopyHero.addEventListener('click', () => {
      if (!currentHeroQuote) return;
      copyQuoteToClipboard(currentHeroQuote.quote, currentHeroQuote.author);
    });

    // Search input (debounced)
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      searchClearBtn.classList.toggle('hidden', searchQuery.length === 0);

      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(() => {
        fetchQuotes();
      }, 250);
    });

    // Search clear button
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.classList.add('hidden');
      searchInput.focus();
      fetchQuotes();
    });

    // Category select dropdown
    categorySelect.addEventListener('change', (e) => {
      setCategory(e.target.value);
    });

    // Quick category pills delegation
    categoryPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      const cat = pill.dataset.category;
      setCategory(cat);
    });

    // Author select dropdown
    authorSelect.addEventListener('change', (e) => {
      activeAuthor = e.target.value;
      fetchQuotes();
    });

    // Reset filters buttons
    btnResetFilters.addEventListener('click', resetAllFilters);
    btnEmptyReset.addEventListener('click', resetAllFilters);

    // Copy button on cards (delegated)
    quotesGrid.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.btn-card-copy');
      if (!copyBtn) return;
      const text = copyBtn.getAttribute('data-quote');
      const author = copyBtn.getAttribute('data-author');
      copyQuoteToClipboard(text, author);
    });
  }

  // --- Helpers ---

  function setCategory(cat) {
    activeCategory = cat;
    categorySelect.value = cat;

    // Update pill styling
    const pills = categoryPillsContainer.querySelectorAll('.pill');
    pills.forEach(pill => {
      const isMatch = pill.dataset.category.toLowerCase() === cat.toLowerCase();
      pill.classList.toggle('active', isMatch);
    });

    fetchQuotes();
  }

  function resetAllFilters() {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.classList.add('hidden');
    authorSelect.value = '';
    activeAuthor = '';
    setCategory('all');
  }

  function copyQuoteToClipboard(quoteText, author) {
    const formatted = `"${quoteText}" — ${author}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(formatted)
        .then(() => showToast('Quote copied to clipboard!'))
        .catch(() => fallbackCopyText(formatted));
    } else {
      fallbackCopyText(formatted);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Quote copied to clipboard!');
    } catch (err) {
      console.error('Fallback copy failed', err);
      showToast('Could not copy quote');
    }
    document.body.removeChild(textArea);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
