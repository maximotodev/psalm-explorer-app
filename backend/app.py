import random
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- ML Imports ---
import spacy
from transformers import pipeline

# --- Custom Utils ---
from ml_utils import load_and_encode_psalms, find_similar_psalms, get_full_text, model

# --- Initialization ---
app = Flask(__name__)
CORS(app) 

print("Loading NLP models...")
nlp = spacy.load("en_core_web_sm")
print("Loading Zero-Shot Classification model (facebook/bart-large-mnli)...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("All models loaded.")

# --- Single Source of Truth for Data ---
ALL_PSALMS, ALL_EMBEDDINGS = load_and_encode_psalms()
CHAPTER_TO_INDEX = {psalm['chapter']: i for i, psalm in enumerate(ALL_PSALMS)}
print(f"\n✅ Server ready. {len(ALL_PSALMS)} psalms loaded and indexed.")


# --- Helper Functions (CORRECTED) ---
def classify_psalm_type(text):
    """
    Classifies a psalm's text into predefined categories using a zero-shot model.
    """
    # CORRECTED: Removed duplicate 'trust' category
    psalm_categories = ["praise", "lament", "trust", "royal", "wisdom", "hymn", "thanksgiving"]
    
    # CORRECTED: Added the required `{}` placeholder to the template string.
    hypothesis_template = "This psalm is about {}."
    
    results = classifier(text, psalm_categories, hypothesis_template=hypothesis_template)
    
    CONFIDENCE_THRESHOLD = 0.70 
    
    confident_labels = [
        label for label, score in zip(results['labels'], results['scores']) 
        if score > CONFIDENCE_THRESHOLD
    ]
    
    if not confident_labels:
        return [results['labels'][0]]
        
    return confident_labels


# --- API Endpoints ---
# (No changes needed in the endpoints themselves)

@app.route('/api/analyze', methods=['POST'])
def analyze_psalm_text_endpoint():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    text = data['text']
    psalm_types = classify_psalm_type(text)
    return jsonify({"psalm_types": psalm_types})

@app.route('/api/random-psalm')
def get_random_psalm_endpoint():
    random_psalm = random.choice(ALL_PSALMS)
    return jsonify(random_psalm)

@app.route('/api/psalm/<int:chapter_num>')
def get_specific_psalm_endpoint(chapter_num):
    if chapter_num not in CHAPTER_TO_INDEX:
        return jsonify({"error": "Psalm chapter not found"}), 404
    psalm_data = ALL_PSALMS[CHAPTER_TO_INDEX[chapter_num]]
    return jsonify(psalm_data)

@app.route('/api/similar/<int:chapter_num>')
def get_similar_psalms_endpoint(chapter_num):
    if chapter_num not in CHAPTER_TO_INDEX:
        return jsonify({"error": "Psalm chapter not found"}), 404
    target_embedding = ALL_EMBEDDINGS[CHAPTER_TO_INDEX[chapter_num]]
    similar = find_similar_psalms(target_embedding, ALL_EMBEDDINGS, ALL_PSALMS, top_k=3)
    return jsonify(similar)

@app.route('/api/search', methods=['POST'])
def search_psalms_endpoint():
    data = request.get_json()
    if not data or 'query' not in data or not data['query'].strip():
        return jsonify({"error": "No query provided"}), 400
    query = data['query']
    query_embedding = model.encode(query, convert_to_tensor=False)
    
    from sklearn.metrics.pairwise import cosine_similarity
    target_embedding = np.array(query_embedding).reshape(1, -1)
    similarities = cosine_similarity(target_embedding, ALL_EMBEDDINGS)[0]
    top_indices = np.argsort(similarities)[::-1][:5]
    
    search_results = []
    for i in top_indices:
        search_results.append({
            "chapter": ALL_PSALMS[i]['chapter'],
            "preview": get_full_text(ALL_PSALMS[i])[:120] + "...",
            "similarity_score": round(float(similarities[i]), 3)
        })
    return jsonify(search_results)

if __name__ == '__main__':
    app.run(debug=True)