from flask import Flask, jsonify, request
from flask_cors import CORS  # Allows React to access Flask

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allows all domains (for development)


@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"})

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    print("Received from frontend:", data)
    return jsonify({"status": "received"})

# Run server
if __name__ == '__main__':
    # print("🚀 Starting Flask server...")
    # print("📡 API available at: http://localhost:5000/api/hello")
    app.run(debug=True, port=5000)