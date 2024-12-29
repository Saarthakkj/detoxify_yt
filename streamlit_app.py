import streamlit as st
import requests
import pandas as pd

# Configure the page
st.set_page_config(
    page_title="YouTube Content Classifier",
    page_icon="🎥",
    layout="wide"
)

# API endpoint
API_URL = "https://detoxify2-gjz32iy9f-saarthaks-projects-f6b38fdf.vercel.app/predict"

def classify_content(texts):
    """Call the API to classify the text"""
    try:
        # Format the input for the API
        data = [{"text": text} for text in texts]
        
        # Make API request
        response = requests.post(API_URL, json=data)
        response.raise_for_status()  # Raise exception for bad status codes
        
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"API Error: {str(e)}")
        return None

def main():
    st.title("YouTube Content Classifier 🎥")
    st.write("Classify YouTube content into categories: Chess, Math, Coding, or Other")
    
    # Input methods
    input_method = st.radio(
        "Choose input method:",
        ["Single Text", "Batch Upload"]
    )
    
    if input_method == "Single Text":
        # Single text input
        text_input = st.text_area("Enter YouTube video title or description:", height=100)
        if st.button("Classify") and text_input:
            with st.spinner("Classifying..."):
                results = classify_content([text_input])
                if results:
                    result = results[0]
                    st.success(f"Classification: {result['predicted_label']}")
                    st.info(f"Confidence: {result['confidence']:.2%}")
    
    else:
        # File upload for batch processing
        uploaded_file = st.file_uploader("Upload CSV file with 'text' column", type=['csv'])
        if uploaded_file:
            df = pd.read_csv(uploaded_file)
            if 'text' not in df.columns:
                st.error("CSV must contain a 'text' column")
                return
                
            if st.button("Classify All"):
                with st.spinner("Processing batch..."):
                    results = classify_content(df['text'].tolist())
                    if results:
                        # Create results DataFrame
                        results_df = pd.DataFrame(results)
                        st.write("Classification Results:")
                        st.dataframe(results_df)
                        
                        # Download button for results
                        csv = results_df.to_csv(index=False)
                        st.download_button(
                            "Download Results",
                            csv,
                            "classification_results.csv",
                            "text/csv",
                            key='download-csv'
                        )

    # Add information about the model
    with st.expander("About"):
        st.write("""
        This app uses a BERT-based model to classify YouTube content into different categories:
        - Chess: Content related to chess
        - Math: Mathematical content
        - Coding: Programming and development content
        - Other: General content
        """)

if __name__ == "__main__":
    main()