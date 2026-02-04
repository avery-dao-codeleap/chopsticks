# Research: Chopsticks MVP

**Date**: 2026-01-31 | **Plan**: [plan.md](./plan.md)

This document captures technical research and decisions for the Chopsticks MVP implementation.

> **Note**: Some sections document research for features deferred post-MVP. These are marked with ⏸️ DEFERRED.

---

## 1. Firebase Auth + Supabase JWT Integration

### Decision
Use Firebase Auth for phone OTP authentication, then exchange the Firebase ID token for a Supabase JWT via an Edge Function.

### Rationale
- Firebase phone auth is more reliable across Vietnamese carriers than Supabase's Twilio-based solution
- Firebase handles SMS delivery, retry logic, and carrier-specific quirks
- Supabase remains the single source of truth for user data and RLS enforcement
- Edge Function acts as a secure bridge, verifying Firebase tokens server-side

### Implementation Pattern
```typescript
// Client flow
1. User enters phone → FirebaseAuth.signInWithPhoneNumber()
2. User enters OTP → FirebaseAuth.confirmResult(code)
3. Get Firebase ID token → auth.currentUser.getIdToken()
4. POST to Supabase Edge Function /exchange-firebase-token
5. Edge Function verifies Firebase token via Firebase Admin SDK
6. Edge Function upserts user in Supabase, returns Supabase JWT
7. Client stores Supabase JWT in expo-secure-store
8. All subsequent API calls use Supabase JWT
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Supabase Phone Auth (Twilio) | Less reliable in Vietnam, requires Twilio account setup |
| Firebase only (no Supabase) | Would need to build RLS equivalent, lose Realtime/Storage integration |
| Custom OTP via Edge Function | More complexity, SMS delivery reliability unknown |

### References
- [Supabase Custom JWT](https://supabase.com/docs/guides/auth/jwts)
- [Firebase Phone Auth](https://firebase.google.com/docs/auth/web/phone-auth)

---

## 2. Face Detection for Profile Photos

### Decision
Use `expo-face-detector` (Google ML Kit wrapper) for on-device face detection before profile photo upload.

### Rationale
- Runs entirely on-device, no network latency
- Privacy-preserving: raw images never leave device before user consent
- Built into Expo SDK, no custom native modules required
- Sufficient accuracy for "at least one face present" validation

### Implementation Pattern
```typescript
import * as FaceDetector from 'expo-face-detector';

const detectFace = async (imageUri: string) => {
  const result = await FaceDetector.detectFacesAsync(imageUri, {
    mode: FaceDetector.FaceDetectorMode.fast,
    detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
    runClassifications: FaceDetector.FaceDetectorClassifications.none,
  });

  if (result.faces.length === 0) {
    throw new Error('No face detected. Please take a clearer photo.');
  }
  if (result.faces.length > 1) {
    throw new Error('Multiple faces detected. Please take a solo photo.');
  }
  return true;
};
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Server-side detection (AWS Rekognition) | Adds latency, cost, and privacy concerns |
| Skip face detection | Profile photos are identity-critical for safety |
| react-native-vision-camera ML | Requires custom dev client, violates Principle IV |

### References
- [expo-face-detector docs](https://docs.expo.dev/versions/latest/sdk/facedetector/)

---

## 3. ⏸️ DEFERRED: Map Clustering for Meal Requests

> **Deferred post-MVP**: Map view is cut from MVP. Using list view with district filter instead.

### Decision
Use `react-native-map-clustering` with `react-native-maps` for performant display of multiple meal request markers.

### Rationale
- Native clustering performance (60fps maintained)
- Automatic cluster/uncluster on zoom
- Customizable cluster rendering
- Works with Google Maps provider on both iOS and Android

### Implementation Pattern
```typescript
import MapView from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';

<ClusteredMapView
  clusterColor="#FF6B6B"
  radius={50}
  extent={512}
  minZoom={1}
  maxZoom={20}
  onClusterPress={(cluster) => {
    // Zoom in to show individual markers
  }}
>
  {requests.map(request => (
    <Marker
      key={request.id}
      coordinate={request.location}
      onPress={() => showRequestBottomSheet(request)}
    />
  ))}
</ClusteredMapView>
```

### Configuration
- **Cluster radius**: 50px (balances density vs readability)
- **Min zoom for clustering**: Level 1 (always cluster when zoomed out)
- **Max markers before clustering**: 10+ (per Constitution Principle III)

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| No clustering | Performance degrades with 50+ markers |
| Supercluster (JS-only) | Less performant than native implementation |
| Google Maps built-in clustering | Requires ejecting to access native SDK |

### References
- [react-native-map-clustering](https://github.com/venits/react-native-map-clustering)

---

## 4. Supabase Realtime Chat Architecture

### Decision
Use Supabase Realtime with Postgres Changes for message synchronization.

> **Note**: Typing indicators (Broadcast) deferred post-MVP.

### Rationale
- Single subscription per chat room (scoped, per Principle III)
- Messages persisted in Postgres with RLS enforcement
- Automatic reconnection handling built into Supabase client

### Implementation Pattern
```typescript
// Message subscription (Postgres Changes)
const channel = supabase
  .channel(`chat:${chatId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`,
    },
    (payload) => addMessage(payload.new)
  )
  .subscribe();
```

### ⏸️ DEFERRED: Typing Indicators
Typing indicators via Broadcast are cut from MVP:
```typescript
// Deferred post-MVP
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { user_id: currentUser.id },
});
```

### Fallback Strategy
Per spec clarifications: if Realtime disconnects, fallback to polling (30s interval) with banner "Live updates paused."

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Firebase Realtime Database | Would split backend, violates Principle V |
| WebSocket server (custom) | Additional infrastructure, Supabase already provides |
| Long polling only | Higher latency, worse UX for chat |

### References
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## 5. ⏸️ DEFERRED: Rate Limiting Implementation

> **Deferred post-MVP**: Not needed at 100-user scale. Will implement when scaling.

### Decision
Implement rate limiting via Postgres functions with `pg_cron` for cleanup, enforced at database level.

### Rationale
- Database-level enforcement prevents bypassing via direct API calls
- RLS policies can reference rate limit checks
- No additional infrastructure (Redis, etc.) needed for MVP scale
- pg_cron handles TTL cleanup automatically

### Implementation Pattern
```sql
-- Rate limit table
CREATE TABLE rate_limits (
  user_id UUID REFERENCES users(id),
  action_type TEXT, -- 'meal_request' | 'chat_message'
  window_start TIMESTAMPTZ,
  count INTEGER DEFAULT 1,
  PRIMARY KEY (user_id, action_type, window_start)
);

-- Check function (called before insert)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_count INTEGER,
  p_window_interval INTERVAL
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action
    AND window_start > NOW() - p_window_interval;

  RETURN current_count < p_max_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup (via pg_cron, daily)
SELECT cron.schedule('cleanup-rate-limits', '0 0 * * *',
  $$DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 days'$$
);
```

### Limits (for future implementation)
- Meal requests: 5 per user per 24 hours
- Chat messages: 50 per user per hour per chat

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Redis rate limiting | Additional infrastructure for MVP scale |
| Edge Function middleware | Can be bypassed, less reliable |
| Client-side only | Easily circumvented |

---

## 6. Image Compression & Upload

### Decision
Use `expo-image-manipulator` for client-side compression before uploading to Supabase Storage.

### Rationale
- Reduces upload time (target: <5s per photo)
- Reduces storage costs
- Consistent image dimensions across devices
- Built into Expo SDK

### Implementation Pattern
```typescript
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (uri: string) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }], // Max dimension 1080px
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Verify size < 1MB
  const response = await fetch(result.uri);
  const blob = await response.blob();
  if (blob.size > 1024 * 1024) {
    // Re-compress with lower quality
    return ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
  }

  return result;
};
```

### Storage Structure (MVP)
```
supabase-storage/
├── avatars/
│   └── {user_id}.jpg          # Profile photos
└── chat-images/
    └── {chat_id}/
        └── {message_id}.jpg   # Chat image attachments
```

**Deferred post-MVP:**
- Restaurant review photos
- Restaurant verification photos

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Server-side compression | Adds latency, Edge Function compute limits |
| No compression | Slow uploads, storage costs, quota issues |
| WebP format | Less universal browser/viewer support |

---

## 7. Internationalization (i18n) Setup

### Decision
Use `react-i18next` with `expo-localization` for language detection and JSON translation files.

### Rationale
- Industry standard for React/React Native
- Lazy loading of locale files possible
- Pluralization and interpolation support
- Device language detection via expo-localization

### Implementation Pattern
```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: Localization.locale.split('-')[0], // 'vi' or 'en'
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### Translation File Structure
```json
// locales/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry"
  },
  "auth": {
    "enterPhone": "Enter your phone number",
    "sendCode": "Send verification code"
  },
  "map": {
    "spotsLeft": "{{count}} spot left",
    "spotsLeft_plural": "{{count}} spots left"
  }
}
```

---

## 8. Push Notification Architecture

### Decision
Use Expo Push Notifications with server-side sending via Supabase Edge Functions.

### Rationale
- No native configuration required (Expo handles APNs/FCM)
- Simple token management (stored in user table)
- Edge Functions can send notifications as part of database triggers
- Built-in retry and delivery tracking

### Implementation Pattern
```typescript
// Client: Register token on app launch
import * as Notifications from 'expo-notifications';

const registerPushToken = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await supabase
    .from('users')
    .update({ expo_push_token: token })
    .eq('id', currentUser.id);
};

// Server: Edge Function sends notification
const sendPush = async (token: string, title: string, body: string) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: token,
      title,
      body,
      sound: 'default',
    }),
  });
};
```

---

## Summary of Key Decisions

| Area | Decision | Primary Rationale | MVP Status |
|------|----------|-------------------|------------|
| Auth | Firebase + Supabase JWT | Carrier reliability in Vietnam | ✅ MVP |
| Face Detection | expo-face-detector | On-device, privacy-preserving | ✅ MVP |
| Map Clustering | react-native-map-clustering | Native performance | ⏸️ Deferred |
| Chat Realtime | Supabase Postgres Changes | Scoped subscriptions, RLS | ✅ MVP |
| Typing Indicators | Supabase Broadcast | Ephemeral events | ⏸️ Deferred |
| Rate Limiting | Postgres functions + pg_cron | Database-level enforcement | ⏸️ Deferred |
| Image Handling | expo-image-manipulator | Client-side compression | ✅ MVP |
| i18n | react-i18next + expo-localization | Industry standard, device detection | ✅ MVP |
| Push | Expo Push Notifications | No native config required | ✅ MVP |

All decisions align with Constitution principles (verified in plan.md Constitution Check).
