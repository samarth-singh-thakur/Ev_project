# EV Charging Full-Stack Assignment

A complete EV charging station management application built with **Node.js**, **Express**, **MongoDB**, and **Vue 3**.

## Project Structure

```text
/backend   -> Express API with JWT authentication and charging-station CRUD
/frontend  -> Vue 3 static SPA with login/signup, filters, CRUD form, and map view
```

## Features

### Backend
- JWT-based signup and login
- Protected charging-station routes
- CRUD APIs for stations
- Station filters by status, connector type, and power output range
- MongoDB persistence via Mongoose

### Frontend
- Login / signup interface
- Charger listing table
- Filter stations by status, connector type, and power range
- Create, edit, and delete chargers
- Interactive OpenStreetMap-based map view using Leaflet

## API Routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Stations (Bearer token required)
- `GET /api/stations`
- `GET /api/stations/:id`
- `POST /api/stations`
- `PUT /api/stations/:id`
- `DELETE /api/stations/:id`

## Station Payload Example

```json
{
  "name": "Downtown Fast Hub",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "address": "Connaught Place, New Delhi"
  },
  "status": "Active",
  "powerOutput": 120,
  "connectorType": "CCS"
}
```

## Local Setup

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Required backend environment variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ev_charging
JWT_SECRET=change_me
CLIENT_URL=http://localhost:4173
```

### 2) Frontend

The frontend is a lightweight Vue 3 single-page app served from static files.

Update the API base URL in `frontend/index.html` if needed:

```html
window.APP_CONFIG = {
  API_BASE_URL: 'http://localhost:5000'
};
```

Then serve the folder with any static file server, for example:

```bash
cd frontend
python3 -m http.server 4173
```

## Suggested Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway / Heroku-compatible Node host
- **Database**: MongoDB Atlas

## Notes for Submission

When deployed, include:
- Frontend live URL
- Backend API base URL
- Optional Postman collection or Swagger documentation
