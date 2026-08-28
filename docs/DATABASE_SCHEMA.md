# Eventra Database Schema

This document outlines the raw SQL database schema utilized by the Eventra backend. The architecture is strictly relational and designed for high performance using `mysql2`.

## Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ EVENTS : "hosts"
    USERS ||--o{ RSVPS : "makes"
    USERS ||--o{ INVITATIONS : "sends"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ REFRESH_TOKENS : "owns"
    EVENTS ||--o{ RSVPS : "has"
    EVENTS ||--o{ INVITATIONS : "has"

    USERS {
        VARCHAR(36) id PK
        VARCHAR(255) name
        VARCHAR(255) email "UNIQUE"
        VARCHAR(255) password
        VARCHAR(255) avatar
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    EVENTS {
        VARCHAR(36) id PK
        VARCHAR(255) title
        TEXT description
        DATETIME date
        DATETIME end_date
        VARCHAR(255) location
        BOOLEAN is_public
        LONGTEXT cover_image
        VARCHAR(36) host_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    RSVPS {
        VARCHAR(36) id PK
        ENUM status "ATTENDING, MAYBE, DECLINED"
        TEXT note
        VARCHAR(36) user_id FK
        VARCHAR(36) event_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    INVITATIONS {
        VARCHAR(36) id PK
        VARCHAR(255) email
        VARCHAR(100) token "UNIQUE"
        BOOLEAN accepted
        BOOLEAN declined
        TEXT note
        VARCHAR(36) event_id FK
        VARCHAR(36) inviter_id FK
        TIMESTAMP created_at
    }

    NOTIFICATIONS {
        VARCHAR(36) id PK
        ENUM type
        VARCHAR(255) message
        BOOLEAN is_read
        VARCHAR(255) link
        VARCHAR(36) user_id FK
        TIMESTAMP created_at
    }

    REFRESH_TOKENS {
        VARCHAR(36) id PK
        VARCHAR(255) token "UNIQUE"
        DATETIME expires_at
        VARCHAR(36) user_id FK
        TIMESTAMP created_at
    }
```

## Schema Details
- **Primary Keys**: All IDs are generated using `UUID v4` (VARCHAR 36).
- **Referential Integrity**: All foreign keys utilize `ON DELETE CASCADE` to prevent orphaned records when users or events are deleted.
- **Constraints**: 
  - `RSVPS` has a `UNIQUE KEY (user_id, event_id)` to ensure a user can only RSVP to a specific event once.
  - Emails in `USERS` and tokens in `INVITATIONS` / `REFRESH_TOKENS` are constrained to be strictly `UNIQUE`.
