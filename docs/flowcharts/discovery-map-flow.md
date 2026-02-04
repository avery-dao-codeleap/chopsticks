# Discovery Map Flow

## Main Discovery Flow

```mermaid
flowchart TD
    subgraph Entry["Discovery Entry"]
        A[Open Discover Tab] --> B{Location Permission?}
        B -->|Denied| C[Show Permission Request]
        C --> D{User Grants?}
        D -->|Yes| E[Get Current Location]
        D -->|No| F[Use Default City Center]
        B -->|Granted| E
        E --> G[Load Map View]
        F --> G
    end

    subgraph MapView["Map Interface"]
        G --> H[Display Map with Dark Theme]
        H --> I[Fetch Nearby Restaurants]
        I --> J[Render Restaurant Pins]
        J --> K[Cluster Dense Areas]

        K --> L{User Interaction}
        L -->|Pan/Zoom| M[Update Visible Area]
        M --> I

        L -->|Tap Pin| N[Show Restaurant Preview]
        N --> O[Bottom Sheet: Quick Info]
        O --> P{User Action}
        P -->|Expand| Q[Full Restaurant Detail]
        P -->|Dismiss| K
        P -->|Navigate| R[Open in Maps App]

        L -->|Tap Cluster| S[Zoom to Cluster]
        S --> K
    end

    subgraph Search["Search Flow"]
        K --> T[Search Bar at Top]
        T --> U[User Types Query]
        U --> V[Debounced Search 300ms]
        V --> W[Search API Call]
        W --> X[Display Results List]
        X --> Y{Select Result}
        Y -->|Restaurant| Z[Center Map on Result]
        Z --> N
        Y -->|Cancel| K
    end

    subgraph Filters["Filter System"]
        K --> AA[Filter Button]
        AA --> AB[Filter Modal]

        AB --> AC[Cuisine Types]
        AC --> AD[Multi-select Chips]

        AB --> AE[Budget Range]
        AE --> AF[Slider Min-Max]

        AB --> AG[Distance]
        AG --> AH[Radius Slider]

        AB --> AI[Rating]
        AI --> AJ[Minimum Stars]

        AB --> AK[Hidden Gems Only]
        AK --> AL[Toggle Switch]

        AD & AF & AH & AJ & AL --> AM[Apply Filters]
        AM --> AN[Update Pin Visibility]
        AN --> K

        AB --> AO[Reset Filters]
        AO --> K
    end
```

## Restaurant Detail Flow

```mermaid
flowchart TD
    subgraph Detail["Restaurant Detail Sheet"]
        A[Open Restaurant Detail] --> B[Load Full Data]
        B --> C[Display Hero Image]
        C --> D[Restaurant Info]

        D --> E[Name & Cuisine Type]
        E --> F[Rating & Review Count]
        F --> G[Price Range]
        G --> H[Distance from User]
        H --> I[Address]
        I --> J[Hours of Operation]

        J --> K[Photo Gallery]
        K --> L[Description]
        L --> M[Reviews Section]
    end

    subgraph Actions["Detail Actions"]
        D --> N{User Actions}
        N -->|Save| O[Add to Favorites]
        N -->|Share| P[Share Sheet]
        N -->|Directions| Q[Open Maps App]
        N -->|Suggest to Match| R[Select Active Match]
        R --> S[Send in Chat]
    end

    subgraph Reviews["Reviews"]
        M --> T[List User Reviews]
        T --> U[Sort: Recent / Rating]
        T --> V[See All Reviews]
        V --> W[Full Reviews Screen]
    end
```

## Submit Hidden Gem Flow

```mermaid
flowchart TD
    subgraph Submit["Submit Hidden Gem"]
        A[Tap + Button on Map] --> B[Submit Hidden Gem Screen]

        B --> C[Restaurant Name *]
        C --> D[Cuisine Type *]
        D --> E[Price Range *]
        E --> F[Location]

        F --> G{How to Set Location}
        G -->|Current Location| H[Use GPS]
        G -->|Search Address| I[Address Autocomplete]
        G -->|Drop Pin| J[Manual Pin Placement]
        H & I & J --> K[Location Set]

        K --> L[Add Photos]
        L --> M[Camera / Gallery]
        M --> N[Upload Images]

        N --> O[Description Optional]
        O --> P[Why is it a gem? Optional]

        P --> Q{Validate Form}
        Q -->|Invalid| R[Show Errors]
        R --> C
        Q -->|Valid| S[Submit]

        S --> T[Create Restaurant: Pending Review]
        T --> U[Show Success Message]
        U --> V[Return to Map]
    end

    subgraph Moderation["Admin Moderation"]
        T --> W[Admin Queue]
        W --> X{Review Submission}
        X -->|Approve| Y[Restaurant: Active]
        Y --> Z[Notify Submitter]
        X -->|Reject| AA[Restaurant: Rejected]
        AA --> AB[Notify with Reason]
    end
```

## Map Component States

```mermaid
stateDiagram-v2
    [*] --> Loading: Open discover tab
    Loading --> LocationPrompt: No permission
    Loading --> MapReady: Has permission

    LocationPrompt --> MapReady: Permission granted
    LocationPrompt --> MapReady: Use default location

    MapReady --> Browsing: Idle state
    Browsing --> Searching: User types
    Browsing --> Filtering: Open filters
    Browsing --> ViewingPin: Tap pin

    Searching --> Browsing: Cancel
    Searching --> ViewingPin: Select result

    Filtering --> Browsing: Apply/Cancel

    ViewingPin --> ViewingDetail: Expand
    ViewingPin --> Browsing: Dismiss

    ViewingDetail --> Browsing: Close
    ViewingDetail --> Navigating: Get directions
```

## Restaurant Pin Types

```mermaid
flowchart LR
    subgraph PinTypes["Pin Visual Types"]
        A[Standard Pin] --> B[Orange - Matches preferences]
        C[Faded Pin] --> D[Gray - Outside budget/cuisine]
        E[Star Pin] --> F[Gold - Hidden Gem]
        G[Cluster] --> H[Number badge - Multiple restaurants]
    end
```

## Data Loading Strategy

```mermaid
sequenceDiagram
    participant User
    participant Map
    participant API
    participant Cache

    User->>Map: Open Discover Tab
    Map->>Cache: Check cached restaurants
    Cache-->>Map: Return cached if fresh
    Map->>Map: Render cached pins

    Map->>API: Fetch restaurants (viewport bounds)
    API-->>Map: Restaurant list
    Map->>Cache: Update cache
    Map->>Map: Update pins

    User->>Map: Pan/Zoom
    Map->>Map: Debounce 500ms
    Map->>API: Fetch new viewport
    API-->>Map: New restaurants
    Map->>Map: Merge & render
```

## Filter Persistence

| Filter | Default | Persisted |
|--------|---------|-----------|
| Cuisine Types | User preferences | Yes (local) |
| Budget Range | User preferences | Yes (local) |
| Distance | 5km | Yes (local) |
| Min Rating | None | No |
| Hidden Gems Only | Off | No |
