import csv
import io
import json
import os
import random
from flask import Flask, Response, jsonify, render_template, request

app = Flask(__name__)

# Load quotes dataset
QUOTES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'quotes.json')

def load_quotes():
    if not os.path.exists(QUOTES_FILE):
        return []
    with open(QUOTES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

quotes_data = load_quotes()

@app.route('/')
def index():
    """Render the single-page application."""
    return render_template('index.html')

@app.route('/api/quotes/random', methods=['GET'])
def get_random_quote():
    """
    Return a single random quote.
    Optionally filter by category or author.
    """
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()

    filtered = quotes_data

    if category and category != 'all':
        filtered = [q for q in filtered if q['category'].lower() == category]

    if author:
        filtered = [q for q in filtered if author in q['author'].lower()]

    if not filtered:
        return jsonify({
            'error': 'No quotes found matching the specified criteria.'
        }), 404

    selected = random.choice(filtered)
    return jsonify({
        'quote': selected,
        'pool_size': len(filtered)
    })

@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    """
    Return quotes matching search keywords, author, or category.
    Query params:
      - q: substring search across quote text and author name
      - author: substring search for author name
      - category: exact match for category
    """
    query = request.args.get('q', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()

    results = quotes_data

    if category and category != 'all':
        results = [q for q in results if q['category'].lower() == category]

    if author:
        results = [q for q in results if author in q['author'].lower()]

    if query:
        results = [
            q for q in results
            if query in q['quote'].lower() or query in q['author'].lower()
        ]

    return jsonify({
        'total': len(results),
        'quotes': results
    })

@app.route('/api/quotes/export/csv', methods=['GET'])
def export_quotes_csv():
    """
    Export quotes matching query params as a downloadable CSV file.
    """
    query = request.args.get('q', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()

    results = quotes_data

    if category and category != 'all':
        results = [q for q in results if q['category'].lower() == category]

    if author:
        results = [q for q in results if author in q['author'].lower()]

    if query:
        results = [
            q for q in results
            if query in q['quote'].lower() or query in q['author'].lower()
        ]

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['ID', 'Quote', 'Author', 'Category'])

    for q in results:
        writer.writerow([q['id'], q['quote'], q['author'], q['category']])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=quotes.csv'}
    )

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Return a sorted list of unique categories."""
    categories = sorted(list({q['category'] for q in quotes_data}))
    return jsonify({
        'categories': categories
    })

@app.route('/api/authors', methods=['GET'])
def get_authors():
    """Return a sorted list of unique authors."""
    authors = sorted(list({q['author'] for q in quotes_data}))
    return jsonify({
        'authors': authors
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
