# Match Feed & Lifecycle Flow

## Match Feed Flow

```mermaid
flowchart TD
    subgraph MatchFeed["Match Feed Screen"]
        A[Open Match Feed] --> B{Has Matches?}
        B -->|No| C[Show Empty State]
        C --> D[Adjust Preferences CTA]
        D --> E[Go to Preferences]

        B -->|Yes| F[Display Match Cards]
        F --> G[View Current Card]

        G --> H{User Action}
        H -->|Swipe Left / Pass| I[Skip User]
        I --> J{More Cards?}
        J -->|Yes| G
        J -->|No| K[Show "No More Matches"]
        K --> L[Check Back Later / Expand Radius]

        H -->|Swipe Right / Like| M[Send Match Request]
        M --> N{Mutual Match?}
        N -->|Yes - Other Already Liked| O[Show Match Animation]
        O --> P[Open Chat]
        N -->|No - Pending| Q[Show "Request Sent"]
        Q --> J

        H -->|Tap Card| R[View Full Profile]
        R --> S[Profile Details Modal]
        S --> T{Action from Profile}
        T -->|Like| M
        T -->|Pass| I
        T -->|Close| G
    end

    subgraph Filters["Feed Filters"]
        F --> U[Filter Options]
        U --> V[Cuisine Filter]
        U --> W[Budget Filter]
        U --> X[Distance Filter]
        U --> Y[Available Time Filter]
        V & W & X & Y --> Z[Apply Filters]
        Z --> F
    end
```

## Match Lifecycle Flow

```mermaid
flowchart TD
    subgraph Creation["Match Creation"]
        A[User A Likes User B] --> B{User B Already Liked A?}
        B -->|Yes| C[Create Match: ACCEPTED]
        B -->|No| D[Create Match Request: PENDING]
    end

    subgraph Pending["Pending State"]
        D --> E[Notify User B]
        E --> F[User B Views Request]
        F --> G{User B Decision}
        G -->|Accept| H[Update: ACCEPTED]
        G -->|Decline| I[Update: DECLINED]
        G -->|No Action| J{24hr Elapsed?}
        J -->|Yes| K[Update: EXPIRED]
        J -->|No| F
    end

    subgraph Active["Active Match"]
        C --> L[Both Users Notified]
        H --> L
        L --> M[Chat Enabled]
        M --> N[Users Communicate]
        N --> O[Plan Meal Details]
        O --> P[Set Restaurant]
        O --> Q[Set Time]
        P & Q --> R[Meal Scheduled]
    end

    subgraph Completion["Meal Completion"]
        R --> S[Meal Time Arrives]
        S --> T[Send Reminder Notification]
        T --> U{Did They Meet?}
        U -->|Yes| V[Either User Marks Complete]
        V --> W[Rate Connection 1-5]
        W --> X[Rate Restaurant Optional]
        X --> Y[Write Review Optional]
        Y --> Z{Save Connection?}
        Z -->|Yes| AA[Add to Saved Connections]
        Z -->|No| AB[Archive Match]
        AA --> AB
        AB --> AC[Update: COMPLETED]
        AC --> AD[Update Meal Counts]

        U -->|No Show| AE[Report No Show]
        AE --> AF[Update: CANCELLED]
    end

    subgraph Terminal["Terminal States"]
        I --> AG[Match Removed from Feed]
        K --> AG
        AF --> AG
        AC --> AH[Move to History]
    end
```

## Match States

```mermaid
stateDiagram-v2
    [*] --> Pending: User A likes User B

    Pending --> Accepted: User B accepts
    Pending --> Declined: User B declines
    Pending --> Expired: 24hr timeout

    Accepted --> Completed: Meal completed
    Accepted --> Cancelled: No show / cancelled

    Declined --> [*]
    Expired --> [*]
    Completed --> [*]
    Cancelled --> [*]
```

## Match Card Component

```mermaid
flowchart LR
    subgraph Card["Match Card UI"]
        A[Profile Photo] --> B[Name, Age]
        B --> C[Bio Preview]
        C --> D[Cuisine Tags]
        D --> E[Budget Range]
        E --> F[Distance Away]
        F --> G[Meal Count Badge]
    end

    subgraph Actions["Card Actions"]
        H[Pass Button X] --> I[Swipe Left Gesture]
        J[Like Button Heart] --> K[Swipe Right Gesture]
        L[Info Button] --> M[Expand Profile]
    end
```

## Notifications

| Event | Notification | Deep Link |
|-------|--------------|-----------|
| New match request | "Sarah wants to grab food with you!" | Match detail |
| Match accepted | "It's a match! Start chatting with Sarah" | Chat screen |
| Match expiring | "Your match with Sarah expires in 2 hours" | Match detail |
| Meal reminder | "Your meal with Sarah is in 1 hour" | Chat screen |
| Match expired | "Your match with Sarah has expired" | Match feed |
