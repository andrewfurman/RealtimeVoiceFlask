import os
import requests
from flask import Flask, render_template, jsonify, request

# --- Configuration ---
# It's highly recommended to load sensitive keys from environment variables
# Ensure OPENAI_API_KEY is set in your environment
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17" # Use the model specified in the docs
OPENAI_SESSION_URL = "https://api.openai.com/v1/realtime/sessions"

# --- Flask App Initialization ---
app = Flask(__name__, static_url_path='/static')

# --- Routes ---
@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')

@app.route('/session', methods=['GET'])
def get_session_token():
    """
    Server-side endpoint to securely generate an ephemeral OpenAI API key (token).
    The client-side JavaScript will call this endpoint.
    """
    if not OPENAI_API_KEY:
        return jsonify({"error": "OpenAI API key not configured on the server."}), 500

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    # You can customize the voice and other parameters here if needed
    payload = {
        "model": OPENAI_REALTIME_MODEL,
        "voice": "verse", # Example voice, choose one appropriate for your model
    }

    try:
        response = requests.post(OPENAI_SESSION_URL, headers=headers, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        session_data = response.json()
        # The ephemeral key is within 'client_secret'
        if "client_secret" not in session_data:
             return jsonify({"error": "Failed to retrieve client_secret from OpenAI session.", "details": session_data}), 500

        # Return the entire session data object as received from OpenAI
        # The JS client expects the ephemeral key at data.client_secret.value
        print(f"Successfully created session: {session_data.get('session_id', 'N/A')}") # Log session ID for debugging
        return jsonify(session_data)

    except requests.exceptions.RequestException as e:
        # Log the error for debugging on the server
        print(f"Error requesting OpenAI session token: {e}")
        # Provide a generic error message to the client
        error_details = str(e)
        if e.response is not None:
             try:
                 error_details = e.response.json()
             except ValueError: # Handle cases where response is not JSON
                 error_details = e.response.text
        return jsonify({"error": "Failed to communicate with OpenAI API.", "details": error_details}), 502 # Bad Gateway might be appropriate
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

# --- Run the App ---
if __name__ == '__main__':
  # Note: Use host='0.0.0.0' for accessibility within Docker/Replit,
  # but be mindful of security implications in production environments.
  app.run(host='0.0.0.0', port=5000, debug=True) # Enable debug for development