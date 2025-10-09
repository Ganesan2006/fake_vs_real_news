# ai_learning_platform/frontend/components/auth.py
import streamlit as st
from frontend.utils import api_client, session, validators

def login_form():
    st.subheader("Login")
    with st.form("login_form"):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Login")
        if submitted:
            if not validators.validate_email(email):
                st.error("Invalid email format.")
            else:
                response = api_client.login(email, password)
                if response.status_code == 200:
                    session.set_token(response.json()["access_token"])
                    st.success("Login successful!")
                    st.experimental_rerun()
                else:
                    st.error("Invalid credentials.")

def register_form():
    st.subheader("Register")
    with st.form("register_form"):
        name = st.text_input("Full Name")
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Register")
        if submitted:
            # TODO: Call backend register API
            st.success("Registration successful! Please log in.")
