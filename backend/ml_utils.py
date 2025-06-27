import numpy as np
from sentence_transformers import SentenceTransformer
import json

print("Loading sentence transformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded.")

def get_full_text(psalm_json):
    """Combines all verses of a psalm into a single string."""
    return " ".join([verse['text'] for verse in psalm_json['verses']])

def load_and_encode_psalms(raw_psalm_file='psalms_full_data.json'):
    """
    Loads raw psalm data, processes it into the correct application format,
    creates text embeddings, and returns the processed data and embeddings.
    """
    print(f"Loading and processing raw data from {raw_psalm_file}...")
    
    # --- Start of logic moved from process_data.py ---
    try:
        with open(raw_psalm_file, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print(f"FATAL ERROR: The data file '{raw_psalm_file}' was not found.")
        print("Please make sure the complete psalm data is in your 'backend' directory.")
        # Exit the application if the data isn't there.
        exit()

    # Process the raw format into our clean, application-ready format
    processed_psalms = []
    for chapter_obj in raw_data['chapters']:
        formatted_verses = [
            {"verse": int(v['verse']), "text": v['text']} 
            for v in chapter_obj['verses']
        ]
        
        processed_psalms.append({
            "book": "Psalms",
            "chapter": int(chapter_obj['chapter']),
            "verses": formatted_verses
        })
    # --- End of logic moved from process_data.py ---

    print(f"Successfully processed {len(processed_psalms)} psalms.")
    print("Encoding psalms. This may take a moment...")
    
    psalm_texts = [get_full_text(p) for p in processed_psalms]
    embeddings = model.encode(psalm_texts, convert_to_tensor=False)
    
    print("Encoding complete.")
    
    # Return the clean data and the embeddings
    return processed_psalms, embeddings

def find_similar_psalms(target_embedding, all_embeddings, all_psalms_data, top_k=3):
    """Finds psalms similar to a given embedding."""
    from sklearn.metrics.pairwise import cosine_similarity
    
    target_embedding = np.array(target_embedding).reshape(1, -1)
    similarities = cosine_similarity(target_embedding, all_embeddings)[0]
    
    top_indices = np.argsort(similarities)[::-1][1:top_k+1]
    
    similar_psalms = []
    for i in top_indices:
        similar_psalms.append({
            "chapter": all_psalms_data[i]['chapter'],
            "similarity_score": round(float(similarities[i]), 3)
        })
    return similar_psalms