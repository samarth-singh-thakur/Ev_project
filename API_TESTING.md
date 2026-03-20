# API Testing Guide - EV Charging Station API

This guide provides curl commands to test all API endpoints. Commands are provided for both **Unix/Linux/macOS** and **Windows PowerShell**.

## Base URL
```
http://localhost:5000
```

## Table of Contents
1. [Health Check](#health-check)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Station Endpoints](#station-endpoints)

---

## Health Check

### Check API Status

**Unix/Linux/macOS:**
```bash
curl http://localhost:5000/
```

**Windows PowerShell:**
```powershell
curl http://localhost:5000/
```

---

## Authentication Endpoints

### 1. Sign Up (Create New User)

**Unix/Linux/macOS:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:5000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"name\": \"John Doe\", \"email\": \"john@example.com\", \"password\": \"password123\"}'
```

**Alternative Windows PowerShell (using Invoke-RestMethod):**
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 2. Login

**Unix/Linux/macOS:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"john@example.com\", \"password\": \"password123\"}'
```

**Alternative Windows PowerShell:**
```powershell
$body = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**💡 Save the token from the response - you'll need it for all station endpoints!**

---

### 3. Get Current User Profile

**Unix/Linux/macOS:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Alternative Windows PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

**Expected Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-03-20T18:00:00.000Z",
  "updatedAt": "2026-03-20T18:00:00.000Z"
}
```

---

## Station Endpoints

**⚠️ All station endpoints require authentication. Include the Authorization header with your token.**

### 1. Create a New Station

**Unix/Linux/macOS:**
```bash
curl -X POST http://localhost:5000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Downtown Charging Hub",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, New York, NY 10001"
    },
    "status": "Active",
    "powerOutput": 150,
    "connectorType": "CCS"
  }'
```

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:5000/api/stations `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{\"name\": \"Downtown Charging Hub\", \"location\": {\"latitude\": 40.7128, \"longitude\": -74.0060, \"address\": \"123 Main St, New York, NY 10001\"}, \"status\": \"Active\", \"powerOutput\": 150, \"connectorType\": \"CCS\"}'
```

**Alternative Windows PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$body = @{
    name = "Downtown Charging Hub"
    location = @{
        latitude = 40.7128
        longitude = -74.0060
        address = "123 Main St, New York, NY 10001"
    }
    status = "Active"
    powerOutput = 150
    connectorType = "CCS"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/stations" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body
```

**Expected Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Downtown Charging Hub",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "address": "123 Main St, New York, NY 10001"
  },
  "status": "Active",
  "powerOutput": 150,
  "connectorType": "CCS",
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2026-03-20T18:00:00.000Z",
  "updatedAt": "2026-03-20T18:00:00.000Z"
}
```

---

### 2. Get All Stations

**Unix/Linux/macOS:**
```bash
curl http://localhost:5000/api/stations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl http://localhost:5000/api/stations `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Alternative Windows PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
Invoke-RestMethod -Uri "http://localhost:5000/api/stations" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

---

### 3. Get All Stations with Filters

#### Filter by Status

**Unix/Linux/macOS:**
```bash
curl "http://localhost:5000/api/stations?status=Active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl "http://localhost:5000/api/stations?status=Active" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Connector Type

**Unix/Linux/macOS:**
```bash
curl "http://localhost:5000/api/stations?connectorType=CCS" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl "http://localhost:5000/api/stations?connectorType=CCS" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Power Output Range

**Unix/Linux/macOS:**
```bash
curl "http://localhost:5000/api/stations?minPower=50&maxPower=200" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl "http://localhost:5000/api/stations?minPower=50&maxPower=200" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Combined Filters

**Unix/Linux/macOS:**
```bash
curl "http://localhost:5000/api/stations?status=Active&connectorType=CCS&minPower=100" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl "http://localhost:5000/api/stations?status=Active&connectorType=CCS&minPower=100" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. Get Station by ID

**Unix/Linux/macOS:**
```bash
curl http://localhost:5000/api/stations/STATION_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl http://localhost:5000/api/stations/STATION_ID_HERE `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Alternative Windows PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$stationId = "STATION_ID_HERE"
Invoke-RestMethod -Uri "http://localhost:5000/api/stations/$stationId" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

---

### 5. Update Station

**Unix/Linux/macOS:**
```bash
curl -X PUT http://localhost:5000/api/stations/STATION_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Updated Station Name",
    "status": "Inactive",
    "powerOutput": 200
  }'
```

**Windows PowerShell:**
```powershell
curl -X PUT http://localhost:5000/api/stations/STATION_ID_HERE `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{\"name\": \"Updated Station Name\", \"status\": \"Inactive\", \"powerOutput\": 200}'
```

**Alternative Windows PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$stationId = "STATION_ID_HERE"
$body = @{
    name = "Updated Station Name"
    status = "Inactive"
    powerOutput = 200
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/stations/$stationId" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body
```

---

### 6. Delete Station

**Unix/Linux/macOS:**
```bash
curl -X DELETE http://localhost:5000/api/stations/STATION_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Windows PowerShell:**
```powershell
curl -X DELETE http://localhost:5000/api/stations/STATION_ID_HERE `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Alternative Windows PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$stationId = "STATION_ID_HERE"
Invoke-RestMethod -Uri "http://localhost:5000/api/stations/$stationId" `
  -Method DELETE `
  -Headers @{ Authorization = "Bearer $token" }
```

**Expected Response:**
```json
{
  "message": "Station deleted"
}
```

---

## Complete Testing Workflow

### Step-by-Step Testing Guide

1. **Start the server:**
   ```bash
   cd backend
   npm start
   ```

2. **Sign up a new user** and save the token from the response

3. **Create a station** using the token

4. **Get all stations** to verify creation

5. **Get station by ID** using the ID from step 3

6. **Update the station** with new data

7. **Test filters** (status, connectorType, power range)

8. **Delete the station**

9. **Verify deletion** by trying to get the station again (should return 404)

---

## Common Connector Types

- `CCS` - Combined Charging System
- `CHAdeMO` - Japanese fast charging standard
- `Type2` - European standard (Mennekes)
- `Tesla` - Tesla Supercharger
- `Type1` - SAE J1772 (North America)

---

## Status Values

- `Active` - Station is operational
- `Inactive` - Station is not operational

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Name, email, and password are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "message": "Station not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message details"
}
```

---

## Tips for Windows Users

1. **Using curl in PowerShell:** Windows 10+ includes curl.exe by default
2. **Using Invoke-RestMethod:** Native PowerShell cmdlet with better JSON handling
3. **Escaping quotes:** Use `\"` to escape quotes in curl commands
4. **Line continuation:** Use backtick `` ` `` instead of backslash `\`
5. **Setting variables:** Store tokens and IDs in variables for easier testing:
   ```powershell
   $token = "your_token_here"
   $stationId = "your_station_id_here"
   ```

---

## Tips for Unix/Linux/macOS Users

1. **Pretty print JSON:** Pipe output to `jq` for formatted JSON:
   ```bash
   curl http://localhost:5000/api/stations | jq
   ```

2. **Save token to variable:**
   ```bash
   TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"password123"}' \
     | jq -r '.token')
   
   # Use the token
   curl http://localhost:5000/api/stations \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Save response to file:**
   ```bash
   curl http://localhost:5000/api/stations \
     -H "Authorization: Bearer $TOKEN" \
     -o stations.json
   ```

---

## Troubleshooting

### "Authorization header missing"
- Ensure you include the `Authorization: Bearer YOUR_TOKEN` header
- Check that the token is valid and not expired (tokens expire after 7 days)

### "Invalid station id"
- Verify the station ID is a valid MongoDB ObjectId (24 hex characters)
- Check that you're using the correct ID from a previous response

### Connection refused
- Ensure the server is running on port 5000
- Check that MongoDB is connected
- Verify the `.env` file is configured correctly

### CORS errors (when testing from browser)
- This shouldn't affect curl commands
- If testing from a web app, ensure `CLIENT_URL` is set correctly in `.env`

---

## Additional Resources

- [curl Documentation](https://curl.se/docs/)
- [PowerShell Invoke-RestMethod](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-restmethod)
- [jq JSON Processor](https://stedolan.github.io/jq/)

---

**Happy Testing! ⚡**