/**
 * Store xác thực và định danh tài khoản Sinh viên MajorMatch
 * Hỗ trợ lưu phiên làm việc vào localStorage và đồng bộ trạng thái đăng nhập
 */

import { create } from "zustand";

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  studentId: string; // MSSV
  university: string;
  major: string;
  cohort: string; // Khóa học ví dụ K22
  avatarUrl?: string;
  isVerified: boolean;
}

interface AuthState {
  user: StudentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isModalOpen: boolean;
  activeTab: "login" | "register";

  // Actions
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginDemoStudent: () => void;
  logout: () => void;
  checkAuthSession: () => void;
}

const DEMO_STUDENT: StudentUser = {
  id: "std-2026-9988",
  name: "Nguyễn Văn An",
  email: "an.nguyen22@student.majormatch.vn",
  studentId: "22022026",
  university: "Đại học Công nghệ - ĐHQG",
  major: "Kỹ thuật Phần mềm & Trí tuệ Nhân tạo",
  cohort: "K22 (2022 - 2026)",
  isVerified: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isModalOpen: false,
  activeTab: "login",

  openAuthModal: (tab = "login") => set({ isModalOpen: true, activeTab: tab }),
  closeAuthModal: () => set({ isModalOpen: false }),

  login: async (email: string) => {
    // Giả lập xác thực người dùng thành công
    const user: StudentUser = {
      ...DEMO_STUDENT,
      email: email,
      name: email.split("@")[0].toUpperCase() || "Sinh viên MajorMatch",
    };
    const token = "jwt_token_" + Date.now();
    
    if (typeof window !== "undefined") {
      localStorage.setItem("majormatch_auth_token", token);
      localStorage.setItem("majormatch_auth_user", JSON.stringify(user));
    }

    set({ user, token, isAuthenticated: true, isModalOpen: false });
    return true;
  },

  loginDemoStudent: () => {
    const token = "jwt_demo_token_" + Date.now();
    if (typeof window !== "undefined") {
      localStorage.setItem("majormatch_auth_token", token);
      localStorage.setItem("majormatch_auth_user", JSON.stringify(DEMO_STUDENT));
    }
    set({ user: DEMO_STUDENT, token, isAuthenticated: true, isModalOpen: false });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("majormatch_auth_token");
      localStorage.removeItem("majormatch_auth_user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuthSession: () => {
    if (typeof window === "undefined") return;
    try {
      const savedToken = localStorage.getItem("majormatch_auth_token");
      const savedUserStr = localStorage.getItem("majormatch_auth_user");
      if (savedToken && savedUserStr) {
        const user = JSON.parse(savedUserStr);
        set({ user, token: savedToken, isAuthenticated: true });
      }
    } catch (_) {}
  },
}));
