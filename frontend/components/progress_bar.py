# ai_learning_platform/frontend/components/progress_bar.py

import streamlit as st

def show_progress_bar(progress_percent: int, title: str = "Overall Progress"):
    """
    Displays a title and a progress bar.
    
    :param progress_percent: An integer between 0 and 100.
    :param title: The title to display above the progress bar.
    """
    st.write(f"**{title}**")
    if 0 <= progress_percent <= 100:
        st.progress(progress_percent / 100.0)
    else:
        st.warning("Invalid progress percentage provided.")
