import { UserProfile, Meeting, AppNotification, CalendarIntegration } from '../types';

const TOKEN_KEY = 'calist_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'A network error occurred. Please try again.');
    }

    return data as T;
  },

  // Auth
  async register(body: { name: string; email: string; password: string; confirmPassword: string; profilePicture?: string }) {
    const res = await this.request<{ user: UserProfile; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(res.token);
    return res;
  },

  async login(body: { email: string; password: string }) {
    const res = await this.request<{ user: UserProfile; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(res.token);
    return res;
  },

  async oauthLogin(provider: string, email?: string, name?: string, avatar?: string) {
    const res = await this.request<{ user: UserProfile; token: string; message: string }>('/api/auth/oauth', {
      method: 'POST',
      body: JSON.stringify({ provider, email, name, avatar }),
    });
    this.setToken(res.token);
    return res;
  },

  async getCurrentUser() {
    return this.request<{ user: UserProfile }>('/api/auth/me');
  },

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  },

  // Profile
  async updateProfile(updates: Partial<UserProfile>) {
    return this.request<{ profile: UserProfile; message: string }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Meetings
  async getMeetings() {
    return this.request<{ meetings: Meeting[] }>('/api/meetings');
  },

  async getMeeting(id: string) {
    return this.request<{ meeting: Meeting }>(`/api/meetings/${id}`);
  },

  async createMeeting(meetingData: Partial<Meeting>) {
    return this.request<{ meeting: Meeting; message: string }>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  async updateMeeting(id: string, meetingData: Partial<Meeting>) {
    return this.request<{ meeting: Meeting; message: string }>(`/api/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meetingData),
    });
  },

  async cancelMeeting(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/meetings/${id}/cancel`, {
      method: 'POST',
    });
  },

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: AppNotification[] }>('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  async clearNotifications() {
    return this.request<{ success: boolean }>('/api/notifications', {
      method: 'DELETE',
    });
  },

  // Calendar Integrations
  async getCalendarIntegrations() {
    return this.request<{ integrations: CalendarIntegration[] }>('/api/calendar/integrations');
  },

  async connectCalendar(provider: 'google' | 'microsoft') {
    return this.request<{ success: boolean; message: string }>('/api/calendar/connect', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  },

  async disconnectCalendar(provider: 'google' | 'microsoft') {
    return this.request<{ success: boolean; message: string }>('/api/calendar/disconnect', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  },

  async syncCalendarNow() {
    return this.request<{ success: boolean; message: string }>('/api/calendar/sync-now', {
      method: 'POST',
    });
  },

  // Chat
  async chat(query: string) {
    return this.request<{ answer: string | null }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
};
