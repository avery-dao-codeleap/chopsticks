import { useLanguageStore } from '@/lib/stores/language';
import { CUISINE_CATEGORIES } from './constants';

export type Lang = 'en' | 'vi';

interface Translations {
  filterArea: string; filterTime: string; filterBudget: string; filterCuisine: string; filterGroupSize: string;
  noMatchingRequests: string; tryAdjustingFilters: string; openJoin: string; approvalNeeded: string; by: string;
  noConversationsYet: string; joinMealToChat: string; browseRequests: string;
  typeAMessage: string;
  participants: string; done: string; youLabel: string; mealDetails: string; tapForDetails: string; noMealDetails: string; markMealCompleted: string;
  time: string; budget: string; cuisine: string; groupSize: string; name: string; bio: string; cancel: string; save: string; send: string; change: string;
  settings: string; language: string; privacySafety: string; supportFeedback: string; signOut: string; signOutConfirm: string; meals: string; editProfile: string; myRequests: string;
  supportSubtitle: string; supportEmailLabel: string; supportMessageLabel: string; supportPlaceholderName: string; supportPlaceholderEmail: string; supportPlaceholderMessage: string;
  missingInfo: string; fillAllFields: string; thanks: string; feedbackReceived: string;
  tapToChange: string; tellOthers: string; nameRequired: string; saved: string; profileUpdated: string; favoriteCuisines: string;
  about: string; noBioYet: string;
  spots: string; joinType: string; available: string; openInstantJoin: string; approvalRequired: string;
  joinMeal: string; requestToJoin: string; requestToJoinTitle: string; sendRequest: string; markMealCompleteDev: string;
  tellThemAboutYou: string; joinMessagePlaceholder: string;
  joinedTitle: string; joinedBody: string; openChat: string;
  requestSent: string; requestSentBody: string; sayAnything: string; tellSomethingInteresting: string;
  pendingRequests: string; approve: string; deny: string;
  restaurant: string; searchRestaurants: string; cuisineType: string; description: string; descriptionPlaceholder: string;
  asap: string; openJoinLabel: string; approvalLabel: string; anyoneCanJoin: string; youApproveEach: string;
  createRequest: string; whoCanJoin: string;
  locationShared: string; locationApproval: string; someoneShowUp: string;
  onePlusConnection: string; upToPeople: string;
  missingRestaurantCuisine: string; missingTime: string; requestCreated: string; mealIsLive: string;
  noMyRequests: string; createYourFirstRequest: string;
  chats: string; pastVisits: string; noPastVisits: string;
  preferences: string; deleteAccount: string; noMessagesYet: string; startConversation: string;
  welcomeTagline: string; welcomeVision: string; welcomeFeature1: string; welcomeFeature2: string; welcomeFeature3: string; getStarted: string; welcomeFooter: string;
  leaveChat: string; notifications: string; markAllRead: string; noNotifications: string; notificationsWillAppearHere: string;
  noPendingRequests: string; noPendingRequestsDescription: string;
}

const en: Translations = {
  filterArea: 'AREA', filterTime: 'TIME', filterBudget: 'BUDGET', filterCuisine: 'CUISINE', filterGroupSize: 'GROUP SIZE',
  noMatchingRequests: 'No matching requests', tryAdjustingFilters: 'Try adjusting your filters or create one!',
  openJoin: 'Open join', approvalNeeded: 'Approval needed', by: 'by',
  noConversationsYet: 'No conversations yet', joinMealToChat: 'Join a meal request to start chatting with your dining companions', browseRequests: 'Browse Requests',
  typeAMessage: 'Type a message...',
  participants: 'Participants', done: 'Done', youLabel: '(You)', mealDetails: 'Meal Details', tapForDetails: 'Tap for details', noMealDetails: 'No meal details available', markMealCompleted: 'Mark Meal as Completed',
  time: 'Time', budget: 'Budget', cuisine: 'Cuisine', groupSize: 'Group Size', name: 'Name', bio: 'Bio', cancel: 'Cancel', save: 'Save', send: 'Send', change: 'Change',
  settings: 'Settings', language: 'Language', privacySafety: 'Privacy & Safety', supportFeedback: 'Support & Feedback',
  signOut: 'Sign Out', signOutConfirm: 'Are you sure?', meals: 'Meals', editProfile: 'Edit Profile', myRequests: 'My Requests',
  supportSubtitle: "We'd love to hear from you", supportEmailLabel: 'Email', supportMessageLabel: 'Message',
  supportPlaceholderName: 'Your name', supportPlaceholderEmail: 'you@example.com', supportPlaceholderMessage: "Tell us what's on your mind...",
  missingInfo: 'Missing info', fillAllFields: 'Please fill in all fields.', thanks: 'Thanks!', feedbackReceived: 'We received your feedback and will get back to you soon.',
  tapToChange: 'Tap to change', tellOthers: 'Tell others something about yourself...', nameRequired: 'Name is required.', saved: 'Saved!', profileUpdated: 'Your profile has been updated.', favoriteCuisines: 'Favorite Cuisines',
  about: 'About', noBioYet: 'No bio yet',
  spots: 'Spots', joinType: 'Join type', available: 'available', openInstantJoin: 'Open (instant join)', approvalRequired: 'Approval required',
  joinMeal: 'Join Meal', requestToJoin: 'Request to Join', requestToJoinTitle: 'Request to join', sendRequest: 'Send Request', markMealCompleteDev: 'Mark Meal Complete (Dev)',
  tellThemAboutYou: 'Tell {{name}} something interesting about yourself — maybe your love for {{cuisine}}?',
  joinMessagePlaceholder: "e.g. I'm a huge hotpot fan and always looking for new spots...",
  joinedTitle: 'Joined!', joinedBody: "You've joined the meal at {{name}}. Chat is now open.", openChat: 'Open Chat',
  requestSent: 'Request Sent', requestSentBody: "Your request to join has been sent to {{name}}. You'll be notified when they respond.",
  sayAnything: 'Say something!', tellSomethingInteresting: 'Tell them something interesting about yourself first.',
  pendingRequests: 'Pending Requests', approve: 'Approve', deny: 'Deny',
  restaurant: 'Restaurant', searchRestaurants: 'Search restaurants...', cuisineType: 'Cuisine Type', description: 'Description',
  descriptionPlaceholder: "What's the vibe? Looking for foodies to try the famous bún chả...",
  asap: 'ASAP', openJoinLabel: 'Open Join', approvalLabel: 'Approval', anyoneCanJoin: 'Anyone can join instantly', youApproveEach: 'You approve each person',
  createRequest: 'Create Request', whoCanJoin: 'Who can join?',
  locationShared: '📍 Restaurant location will be shared with joiners', locationApproval: '📍 Only the district is shown until you approve someone',
  someoneShowUp: '👀 Someone might show up — location will be shared immediately',
  onePlusConnection: '1:1 connection — great for introverts', upToPeople: 'Up to {{count}} people — family-style dining',
  missingRestaurantCuisine: 'Please select a restaurant and cuisine type.', missingTime: 'Please select a time or choose ASAP.',
  requestCreated: 'Request Created!', mealIsLive: 'Your meal at {{name}} is now live.',
  noMyRequests: 'No requests yet', createYourFirstRequest: 'Create your first meal request to get started',
  chats: 'Chats', pastVisits: 'Past Visits', noPastVisits: 'No past visits yet',
  preferences: 'Food Preferences', deleteAccount: 'Delete Account', noMessagesYet: 'No messages yet', startConversation: 'Start the conversation!',
  welcomeTagline: 'Meet strangers over great food', welcomeVision: 'Chopsticks connects you with new people for meals at restaurants in Ho Chi Minh City.',
  welcomeFeature1: 'Find meals near you', welcomeFeature2: 'Meet interesting people', welcomeFeature3: 'Discover new restaurants',
  getStarted: 'Get Started', welcomeFooter: 'By continuing, you agree to our Terms of Service',
  leaveChat: 'Leave Chat', notifications: 'Notifications', markAllRead: 'Mark all read', noNotifications: 'No notifications yet', notificationsWillAppearHere: "You'll see updates about your meals here",
  noPendingRequests: 'No pending requests', noPendingRequestsDescription: "When someone requests to join your meal, they'll appear here",
};

const vi: Translations = {
  filterArea: 'KHU VỰC', filterTime: 'THỜI GIAN', filterBudget: 'NGÂN SÁCH', filterCuisine: 'ẨM THỰC', filterGroupSize: 'SỐ NGƯỜI',
  noMatchingRequests: 'Không có yêu cầu nào phù hợp', tryAdjustingFilters: 'Thử điều chỉnh bộ lọc hoặc tạo một yêu cầu mới!',
  openJoin: 'Tham gia mở', approvalNeeded: 'Cần phê duyệt', by: 'của',
  noConversationsYet: 'Chưa có cuộc trò chuyện nào', joinMealToChat: 'Tham gia một yêu cầu ăn uống để bắt đầu nói chuyện với bạn cùng ăn', browseRequests: 'Xem các yêu cầu',
  typeAMessage: 'Nhập tin nhắn...',
  participants: 'Người tham gia', done: 'Xong', youLabel: '(Bạn)', mealDetails: 'Chi tiết bữa ăn', tapForDetails: 'Chạm để xem chi tiết', noMealDetails: 'Không có thông tin bữa ăn', markMealCompleted: 'Đánh dấu bữa ăn hoàn thành',
  time: 'Thời gian', budget: 'Ngân sách', cuisine: 'Ẩm thực', groupSize: 'Số người', name: 'Tên', bio: 'Giới thiệu', cancel: 'Hủy', save: 'Lưu', send: 'Gửi', change: 'Thay đổi',
  settings: 'Cài đặt', language: 'Ngôn ngữ', privacySafety: 'Quyền riêng tư & An toàn', supportFeedback: 'Hỗ trợ & Phản hồi',
  signOut: 'Đăng xuất', signOutConfirm: 'Bạn có chắc không?', meals: 'Bữa ăn', editProfile: 'Chỉnh sửa hồ sơ', myRequests: 'Yêu cầu của tôi',
  supportSubtitle: 'Chúng tôi muốn nghe ý kiến của bạn', supportEmailLabel: 'Email', supportMessageLabel: 'Tin nhắn',
  supportPlaceholderName: 'Tên của bạn', supportPlaceholderEmail: 'email@của.bạn', supportPlaceholderMessage: 'Nói với chúng tôi điều gì đó...',
  missingInfo: 'Thiếu thông tin', fillAllFields: 'Vui lòng điền vào tất cả các trường.', thanks: 'Cảm ơn!', feedbackReceived: 'Chúng tôi đã nhận ý kiến của bạn và sẽ phản hồi sớm.',
  tapToChange: 'Chạm để thay đổi', tellOthers: 'Kể cho người khác biết về bạn...', nameRequired: 'Tên là bắt buộc.', saved: 'Đã lưu!', profileUpdated: 'Hồ sơ của bạn đã được cập nhật.', favoriteCuisines: 'Ẩm thực yêu thích',
  about: 'Giới thiệu', noBioYet: 'Chưa có giới thiệu',
  spots: 'Chỗ trống', joinType: 'Loại tham gia', available: 'còn trống', openInstantJoin: 'Mở (tham gia ngay)', approvalRequired: 'Cần phê duyệt',
  joinMeal: 'Tham gia bữa ăn', requestToJoin: 'Yêu cầu tham gia', requestToJoinTitle: 'Yêu cầu tham gia', sendRequest: 'Gửi yêu cầu', markMealCompleteDev: 'Đánh dấu bữa ăn hoàn thành (Dev)',
  tellThemAboutYou: 'Kể cho {{name}} biết điều gì đó thú vị về bạn — có lẽ sức niềm đam mê ẩm thực của bạn?',
  joinMessagePlaceholder: 'VD: Mình là fan lẩu lớn và luôn tìm kiếm các nơi mới...',
  joinedTitle: 'Đã tham gia!', joinedBody: 'Bạn đã tham gia bữa ăn tại {{name}}. Chat đã mở.', openChat: 'Mở chat',
  requestSent: 'Yêu cầu đã gửi', requestSentBody: 'Yêu cầu tham gia của bạn đã được gửi cho {{name}}. Bạn sẽ được thông báo khi họ phản hồi.',
  sayAnything: 'Hãy nói điều gì đó!', tellSomethingInteresting: 'Hãy nói điều gì đó thú vị về bản thân trước.',
  pendingRequests: 'Yêu cầu chờ', approve: 'Phê duyệt', deny: 'Từ chối',
  restaurant: 'Nhà hàng', searchRestaurants: 'Tìm kiếm nhà hàng...', cuisineType: 'Loại ẩm thực', description: 'Mô tả',
  descriptionPlaceholder: 'Thế nào? Đang tìm kiếm các tín đồ ẩm thực...',
  asap: 'Ngay bây giờ', openJoinLabel: 'Tham gia mở', approvalLabel: 'Phê duyệt', anyoneCanJoin: 'Bất kỳ ai có thể tham gia ngay', youApproveEach: 'Bạn phê duyệt từng người',
  createRequest: 'Tạo yêu cầu', whoCanJoin: 'Ai có thể tham gia?',
  locationShared: '📍 Địa chỉ nhà hàng sẽ được chia sẻ với người tham gia', locationApproval: '📍 Chỉ hiện quận cho đến khi bạn phê duyệt',
  someoneShowUp: '👀 Ai đó có thể xuất hiện — địa chỉ sẽ được chia sẻ ngay',
  onePlusConnection: '1:1 — tốt cho người hướng nội', upToPeople: 'Đến {{count}} người — ăn theo kiểu gia đình',
  missingRestaurantCuisine: 'Vui lòng chọn nhà hàng và loại ẩm thực.', missingTime: 'Vui lòng chọn thời gian hoặc chọn Ngay bây giờ.',
  requestCreated: 'Yêu cầu đã được tạo!', mealIsLive: 'Bữa ăn của bạn tại {{name}} đã được tạo.',
  noMyRequests: 'Chưa có yêu cầu nào', createYourFirstRequest: 'Tạo yêu cầu ăn uống đầu tiên của bạn',
  chats: 'Chat', pastVisits: 'Các nơi đã thăm', noPastVisits: 'Chưa có nơi nào đã thăm',
  preferences: 'Sở thích ẩm thực', deleteAccount: 'Xóa tài khoản', noMessagesYet: 'Chưa có tin nhắn nào', startConversation: 'Bắt đầu cuộc trò chuyện!',
  welcomeTagline: 'Gặp gỡ bạn mới qua bữa ăn ngon', welcomeVision: 'Chopsticks kết nối bạn với những người mới cho bữa ăn tại các nhà hàng ở Thành phố Hồ Chí Minh.',
  welcomeFeature1: 'Tìm bữa ăn gần bạn', welcomeFeature2: 'Gặp gỡ người thú vị', welcomeFeature3: 'Khám phá nhà hàng mới',
  getStarted: 'Bắt đầu', welcomeFooter: 'Tiếp tục có nghĩa là bạn đồng ý với Điều khoản dịch vụ',
  leaveChat: 'Rời chat', notifications: 'Thông báo', markAllRead: 'Đánh dấu tất cả đã đọc', noNotifications: 'Chưa có thông báo', notificationsWillAppearHere: 'Bạn sẽ thấy cập nhật về bữa ăn ở đây',
  noPendingRequests: 'Không có yêu cầu chờ', noPendingRequestsDescription: 'Khi ai đó yêu cầu tham gia bữa ăn của bạn, họ sẽ xuất hiện ở đây',
};

const translations: Record<Lang, Translations> = { en, vi };

export type TranslationKey = keyof Translations;

export function useI18n() {
  const language = useLanguageStore(state => state.language);
  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let str = translations[language][key];
    if (vars) {
      str = str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
    }
    return str;
  };
  return { t, language };
}

export function getFilterLabelMap(language: Lang): Record<string, Record<string, string>> {
  if (language === 'en') return {};
  return {
    time: { 'Any Time': 'Bất kỳ', 'ASAP': 'Ngay bây giờ', 'Morning': 'Buổi sáng', 'Midday': 'Buổi trưa', 'Afternoon': 'Buổi chiều', 'Evening': 'Buổi tối', 'Late Night': 'Đêm muộn' },
    district: { 'All Areas': 'Tất cả các khu', 'District 1': 'Quận 1', 'District 2': 'Quận 2', 'District 3': 'Quận 3', 'District 4': 'Quận 4', 'District 5': 'Quận 5', 'District 7': 'Quận 7', 'Bình Thạnh': 'Bình Thạnh', 'Phú Nhuận': 'Phú Nhuận', 'Thủ Đức': 'Thủ Đức' },
    budget: { 'Any': 'Tất cả', 'Under 50k': 'Dưới 50k', '50k-150k': '50k–150k', '150k-500k': '150k–500k', '500k+': '500k+' },
    cuisine: { 'All': 'Tất cả', ...Object.fromEntries(CUISINE_CATEGORIES.map(c => [c.label, c.labelVi])) },
    groupSize: { 'Any Size': 'Bất kỳ' },
  };
}
