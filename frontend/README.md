# Frontend

Static HTML, CSS, and JS around the original canvas game.

```bash
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && python3 -m http.server 8080
```

Open http://localhost:8080. Local API calls go to http://127.0.0.1:8000.

Production API URL lives in `config.js` (`apiUrl`). Set it to the Terraform `api_url` before (or in) the first Amplify deploy.
