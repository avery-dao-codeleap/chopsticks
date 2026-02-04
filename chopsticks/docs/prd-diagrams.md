# Chopsticks — Flow & Data Diagrams

## 1. User Flow

```mermaid
flowchart TD
    A[Launch App] --> B{Authenticated?}
    B -->|No| C[Login / Phone Verify]
    B -->|Yes| D{Onboarded?}
    C --> D
    D -->|No| E[Select City]
    E --> F[Select Persona: Local / Traveler]
    F --> G[Profile Setup: Name, Photo, Age, Gender]
    G --> H[Food Preferences & Budget]
    H --> I[Map Home Screen]
    D -->|Yes| I

    I --> J[Tap Pin on Map]
    J --> K[Preview Card]
    K --> L[Request Detail]
    L --> M{Join Type?}
    M -->|Open| N[Instant Join → Chat Created]
    M -->|Approval| O[Request to Join → Wait]
    O -->|Approved| N
    O -->|Denied| I

    I --> P[Tap + FAB]
    P --> Q[Create Request]
    Q -->|Select Restaurant| Q1[Search / Add Location]
    Q --> Q2[Set Cuisine, Time, Group Size]
    Q --> Q3[Choose Open / Approval]
    Q3 --> R[Request Live on Map]
    R --> S[System Suggests 3 People]
    S --> S1[Suggested Users Notified]

    N --> T[Plan Meal in Chat]
    T --> U[Meet & Eat]
    U --> V{Meal Happened?}
    V -->|Yes, Confirm| W[Rate Person: Show Up?]
    W --> X[Review Restaurant + Photo]
    X --> Y[Meal Count +1]
    Y --> Z[Chat Persists 24h]
    V -->|No Response| Z2[Chat Disappears in 7 Days]

    I --> BELL[Bell Icon → Notifications]
    I --> CHAT[Chat Tab → Chat List]
    CHAT --> CD[Chat Detail]
    I --> PROF[Profile Tab]
    L --> UP[View Requester Profile]
```

## 2. Request Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active : User creates request
    Active --> Joined : Someone joins (open)
    Active --> PendingApproval : Someone requests (approval)
    PendingApproval --> Joined : Creator approves
    PendingApproval --> Active : Creator denies
    Active --> Canceled : Creator cancels
    Joined --> MealInProgress : Meal time arrives
    MealInProgress --> Completed : Participants confirm meal
    MealInProgress --> Expired : No confirmation in 7 days
    Active --> Expired : 24h timeout
    Canceled --> [*]
    Completed --> [*]
    Expired --> [*]
```

## 3. Database Schema (ER Diagram)

```mermaid
erDiagram
    USER {
        uuid id PK
        string phone
        string name
        int age
        string gender
        string photo_url
        enum persona "local | traveler"
        string city
        int meal_count
        boolean verified
        string cuisine_badge
        string eating_style_badge
        boolean gender_filter_enabled
        timestamp created_at
    }

    USER_PREFERENCES {
        uuid id PK
        uuid user_id FK
        string[] cuisine_types
        string[] dietary_restrictions
        string[] allergies
        string budget_range
        float search_radius_km
    }

    RESTAURANT {
        uuid id PK
        string name
        string address
        string cuisine
        string price_range
        float latitude
        float longitude
        boolean is_hidden_spot
        boolean verified
        int visit_count
        string source "google_maps | user_added"
        timestamp created_at
    }

    MEAL_REQUEST {
        uuid id PK
        uuid requester_id FK
        uuid restaurant_id FK
        string cuisine
        timestamp time_window
        int spots_total
        int spots_taken
        enum join_type "open | approval"
        enum status "active | completed | canceled | expired"
        boolean gender_filtered
        timestamp created_at
        timestamp expires_at
    }

    REQUEST_PARTICIPANT {
        uuid id PK
        uuid request_id FK
        uuid user_id FK
        enum status "joined | pending | denied"
        timestamp joined_at
    }

    CHAT {
        uuid id PK
        uuid request_id FK "nullable for DMs"
        enum type "group | dm"
        timestamp created_at
        timestamp expires_at
    }

    CHAT_PARTICIPANT {
        uuid id PK
        uuid chat_id FK
        uuid user_id FK
    }

    MESSAGE {
        uuid id PK
        uuid chat_id FK
        uuid sender_id FK
        string content
        timestamp sent_at
    }

    REVIEW {
        uuid id PK
        uuid reviewer_id FK
        uuid restaurant_id FK
        uuid request_id FK
        int rating
        string comment
        string[] photo_urls
        timestamp created_at
    }

    PERSON_RATING {
        uuid id PK
        uuid rater_id FK
        uuid rated_id FK
        uuid request_id FK
        boolean showed_up
        string optional_comment
        timestamp created_at
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK
        enum type "join_request | approved | denied | suggestion | reminder | nearby"
        string title
        string body
        boolean read
        timestamp created_at
    }

    PAST_VISIT {
        uuid id PK
        uuid user_id FK
        uuid restaurant_id FK
        uuid request_id FK "nullable"
        timestamp visited_at
        string[] photo_urls
        int rating
        string note
    }

    USER ||--o| USER_PREFERENCES : has
    USER ||--o{ MEAL_REQUEST : creates
    USER ||--o{ REQUEST_PARTICIPANT : joins
    USER ||--o{ REVIEW : writes
    USER ||--o{ PERSON_RATING : gives
    USER ||--o{ PERSON_RATING : receives
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ PAST_VISIT : records
    USER ||--o{ CHAT_PARTICIPANT : belongs_to
    USER ||--o{ MESSAGE : sends
    RESTAURANT ||--o{ MEAL_REQUEST : hosts
    RESTAURANT ||--o{ REVIEW : has
    RESTAURANT ||--o{ PAST_VISIT : visited
    MEAL_REQUEST ||--o{ REQUEST_PARTICIPANT : has
    MEAL_REQUEST ||--o| CHAT : has
    MEAL_REQUEST ||--o{ REVIEW : generates
    MEAL_REQUEST ||--o{ PERSON_RATING : generates
    CHAT ||--o{ CHAT_PARTICIPANT : has
    CHAT ||--o{ MESSAGE : contains
```

## 4. Notes

- **PAST_VISIT** table is designed but **not built in v1**. It will track user visits to restaurants with date, photos, rating, and optional notes. Useful for building a personal food diary and powering recommendations.
- **gender_filter_enabled** on USER controls whether their requests are hidden from male-identified users.
- **gender_filtered** on MEAL_REQUEST marks requests that should only be visible to women + queer users.
- **source** on RESTAURANT tracks whether it was seeded from Google Maps or user-added.
- **is_hidden_spot** on RESTAURANT is set to true for user-added locations verified via photo.
