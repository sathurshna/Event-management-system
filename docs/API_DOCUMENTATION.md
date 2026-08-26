# API Documentation

The Eventra backend provides a RESTful API built with Express.js. All responses (success and error) follow a standardized JSON structure.

## Base URL
Local Development: `http://localhost:4000/api`

## Testing via Postman
All API endpoints have been rigorously tested using **Postman**. 
You can find the exported Postman collections and environment variables in the `/postman` folder at the root of the repository. To test the API yourself:
1. Import the collection file into your Postman workspace.
2. Log in via the `/auth/login` endpoint to receive a JWT.
3. Set the JWT token in your Postman environment variables or Authorization headers to access protected routes.

## Authentication
Most endpoints require authentication. Pass the JWT access token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication (`/api/auth`)

### `POST /auth/register`
Creates a new user account.
- **Body:** `{ "name": "John", "email": "john@example.com", "password": "password123" }`
- **Returns:** User object and JWT access token.

### `POST /auth/login`
Authenticates a user.
- **Body:** `{ "email": "john@example.com", "password": "password123" }`
- **Returns:** User object, access token, and sets a refresh token as an HttpOnly cookie.

---

## 2. Events (`/api/events`)

### `GET /events`
Retrieves a list of events. Supports query parameters for filtering.
- **Query `?category=all`**: Returns all public events (used for the Dashboard).
- **Query `?category=calendar`**: Returns only events the authenticated user is hosting or attending (used for the Calendar view).
- **Returns:** Array of Event objects.

### `POST /events`
Creates a new event. Requires Auth.
- **Body:** `{ "title": "Birthday", "date": "2026-10-12T18:00:00Z", "is_public": true, ... }`
- **Returns:** Created Event object.

### `GET /events/:id`
Retrieves detailed information for a specific event, including host details.

---

## 3. RSVPs (`/api/rsvps`)

### `POST /rsvps`
RSVPs to an event. Requires Auth.
- **Body:** `{ "eventId": "uuid-here", "status": "ATTENDING", "note": "Can't wait!" }`
- **Returns:** Created or updated RSVP record.

---

## 4. Notifications (`/api/notifications`)

### `GET /notifications`
Retrieves the authenticated user's notifications, sorted by most recent first.
- **Returns:** Array of Notification objects.

### `PUT /notifications/read-all`
Marks all of the user's unread notifications as read.

### `PUT /notifications/:id/read`
Marks a specific single notification as read.

---

## Standardized Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description here"
}
```
