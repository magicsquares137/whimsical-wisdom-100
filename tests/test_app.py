import json
import pytest
from app import app, quotes_data

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_quotes_dataset_count_and_schema():
    """Verify that quotes.json contains exactly 100 quotes with required fields."""
    assert len(quotes_data) == 100, f"Expected 100 quotes, found {len(quotes_data)}"
    ids = set()
    for item in quotes_data:
        assert 'id' in item
        assert 'quote' in item and len(item['quote'].strip()) > 0
        assert 'author' in item and len(item['author'].strip()) > 0
        assert 'category' in item and len(item['category'].strip()) > 0
        ids.add(item['id'])
    assert len(ids) == 100, "IDs are not unique"

def test_index_route(client):
    """Test that GET / returns 200."""
    response = client.get('/')
    assert response.status_code == 200

def test_random_quote(client):
    """Test GET /api/quotes/random returns a valid quote."""
    response = client.get('/api/quotes/random')
    assert response.status_code == 200
    data = response.get_json()
    assert 'quote' in data
    assert 'pool_size' in data
    assert data['pool_size'] == 100
    assert 'id' in data['quote']
    assert 'quote' in data['quote']
    assert 'author' in data['quote']
    assert 'category' in data['quote']

def test_random_quote_filtered(client):
    """Test GET /api/quotes/random with category filter."""
    response = client.get('/api/quotes/random?category=philosophy')
    assert response.status_code == 200
    data = response.get_json()
    assert data['quote']['category'].lower() == 'philosophy'

def test_random_quote_not_found(client):
    """Test GET /api/quotes/random returns 404 when filter doesn't match."""
    response = client.get('/api/quotes/random?category=nonexistentcategory123')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data

def test_get_all_quotes(client):
    """Test GET /api/quotes returns all 100 quotes without query params."""
    response = client.get('/api/quotes')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] == 100
    assert len(data['quotes']) == 100

def test_search_quotes_by_keyword(client):
    """Test searching quotes by keyword."""
    response = client.get('/api/quotes?q=Einstein')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] > 0
    for q in data['quotes']:
        assert 'einstein' in q['author'].lower() or 'einstein' in q['quote'].lower()

def test_filter_quotes_by_category(client):
    """Test filtering quotes by category."""
    response = client.get('/api/quotes?category=Science')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] > 0
    for q in data['quotes']:
        assert q['category'].lower() == 'science'

def test_filter_quotes_by_author(client):
    """Test filtering quotes by author."""
    response = client.get('/api/quotes?author=Confucius')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] > 0
    for q in data['quotes']:
        assert 'confucius' in q['author'].lower()

def test_get_categories(client):
    """Test GET /api/categories."""
    response = client.get('/api/categories')
    assert response.status_code == 200
    data = response.get_json()
    assert 'categories' in data
    assert len(data['categories']) >= 5
    assert 'Philosophy' in data['categories']
    assert 'Science' in data['categories']

def test_get_authors(client):
    """Test GET /api/authors."""
    response = client.get('/api/authors')
    assert response.status_code == 200
    data = response.get_json()
    assert 'authors' in data
    assert len(data['authors']) > 20
    assert 'Albert Einstein' in data['authors']
