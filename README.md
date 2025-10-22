# Budget Tracker

## How to Run the Project Locally

### 1. Start the Backend (Flask)

1. Go to the `backend` folder:
    ```sh
    cd backend
    ```
2. Create and activate a virtual environment (optional, but recommended):
    ```sh
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Linux/Mac:
    source venv/bin/activate
    ```
3. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```
4. Start the server:
    ```sh
    python app.py
    ```
   The server will be available at [http://localhost:5000](http://localhost:5000)

### 2. Start the Frontend (React + Vite)

1. Go to the `frontend` folder:
    ```sh
    cd ../frontend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Start the frontend in development mode:
    ```sh
    npm run dev
    ```
   The frontend will be available at [http://localhost:5173](http://localhost:5173)

### 3. Done!

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Register a new user and start using the app.

---

**Notes:**
- Backend and frontend must be running at the same time.
- For correct authentication, make sure your browser allows cookies for `localhost`.
- If you change the ports, update them in the CORS settings in `backend/app.py`.

