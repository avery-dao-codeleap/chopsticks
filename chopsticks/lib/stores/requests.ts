import { create } from 'zustand';
import { MOCK_RESTAURANTS, CURRENT_USER, type MealRequest } from '@/lib/mockData';

export interface PendingJoin {
  id: string;
  userId: string;
  userName: string;
  message: string;
  requestId: string;
}

interface RequestsState {
  myRequests: MealRequest[];
  pendingJoins: PendingJoin[];
  addRequest: (request: MealRequest) => void;
  approveJoin: (joinId: string) => void;
  denyJoin: (joinId: string) => void;
}

// Pre-seeded approval request by the current user (for testing the approve flow)
const myApprovalRequest: MealRequest = {
  id: 'req_my1',
  restaurant: MOCK_RESTAURANTS[5],
  requester: CURRENT_USER,
  cuisine: 'BBQ',
  cuisineId: 'hotpot_grill',
  cuisineEmoji: '🔥',
  timeWindow: 'Tonight, 8:00 PM',
  description: 'Korean BBQ night — looking for someone to share with!',
  spotsTotal: 4,
  spotsTaken: 1,
  joinType: 'approval',
};

export const useRequestsStore = create<RequestsState>((set) => ({
  myRequests: [myApprovalRequest],
  pendingJoins: [
    { id: 'pj1', userId: 'u2', userName: 'Sarah', message: 'I love Korean BBQ! Would love to join tonight!', requestId: 'req_my1' },
    { id: 'pj2', userId: 'u4', userName: 'Hana', message: 'Trying all the Korean food in HCMC. Count me in!', requestId: 'req_my1' },
  ],
  addRequest: (request) => set(state => ({ myRequests: [...state.myRequests, request] })),
  approveJoin: (joinId) => set(state => ({
    pendingJoins: state.pendingJoins.filter(j => j.id !== joinId),
  })),
  denyJoin: (joinId) => set(state => ({
    pendingJoins: state.pendingJoins.filter(j => j.id !== joinId),
  })),
}));
