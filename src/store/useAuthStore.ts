import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserInfo {
  name: string;
  email: string;
  profileImage: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  crtChldrnNo: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;

  // 토큰 관련 액션
  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  clearTokens: () => void;

  // 사용자 정보 관련 액션
  setCrtChldrnNo: (childNo: string) => void;
  setUserInfo: (info: UserInfo) => void;
  clearUserInfo: () => void;

  // 모든 인증 정보 초기화
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      crtChldrnNo: null,
      userInfo: null,
      isAuthenticated: false,

      // 토큰 관련 액션
      setToken: (token: string) =>
        set((state) => ({
          token,
          isAuthenticated: !!token,
        })),

      setRefreshToken: (refreshToken: string) => set({ refreshToken }),

      clearTokens: () =>
        set({
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      // 사용자 정보 관련 액션
      setCrtChldrnNo: (crtChldrnNo: string) => set({ crtChldrnNo }),

      setUserInfo: (userInfo: UserInfo) => set({ userInfo }),

      clearUserInfo: () =>
        set({
          userInfo: null,
          crtChldrnNo: null,
        }),

      // 모든 인증 정보 초기화
      clearAll: () =>
        set({
          token: null,
          refreshToken: null,
          crtChldrnNo: null,
          userInfo: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // 로컬 스토리지에 저장될 키 이름
      storage: createJSONStorage(() => localStorage),
    }
  )
);
