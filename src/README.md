- `graph/`
    - `graph.js` and `graph.html`: Generates UI to interact with graph using D3.js
    - `graph_edges.csv`: Contains edges `graph.js` uses to generate graphs
- `text_summarization.py`: Generates summary paragraphs for each sub-chapter of the textbook
- `textbook_keyword_extraction.py`: Extracts the top 10 most important keywords for each sub-chapter of the textbook
- `vector_conversion.py`: Vectorizes extracted keywords and calculates cosine similarity scores for all pairs of keywords