import { create } from "zustand";
import { useProfileStore } from "./useProfileStore";
import { ApiService } from "../services/api";

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  studentId: string; // MSSV
  role?: "student" | "admin";
  university?: string;
  major?: string;
  cohort?: string; // Khóa học ví dụ K21, K22, K23
  avatarUrl?: string;
  isVerified?: boolean;
}

interface AuthState {
  user: StudentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isModalOpen: boolean;
  activeTab: "login" | "register";
  error: string | null;

  // Actions
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (studentIdOrEmail: string, password?: string) => Promise<boolean>;
  register: (payload: {
    student_id: string;
    email: string;
    full_name: string;
    password?: string;
    university?: string;
    major?: string;
    cohort?: string;
  }) => Promise<boolean>;
  loginDemoStudent: () => void;
  logout: () => void;
  checkAuthSession: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isModalOpen: false,
  activeTab: "login",
  error: null,

  openAuthModal: (tab = "login") => set({ isModalOpen: true, activeTab: tab, error: null }),
  closeAuthModal: () => set({ isModalOpen: false, error: null }),
  clearError: () => set({ error: null }),

  login: async (studentIdOrEmail: string, password?: string) => {
    try {
      set({ error: null });
      const cleanInput = studentIdOrEmail.trim();
      const res = await ApiService.login(cleanInput, password || "");

      if (!res || !res.user) {
        set({ error: "Tài khoản hoặc mật khẩu không chính xác" });
        return false;
      }

      // 1. Dọn sạch hồ sơ và cache của tài khoản trước đó
      useProfileStore.getState().resetAll();

      const userRole = (res.user.role as "student" | "admin") || (res.user.student_id?.toLowerCase() === "admin" ? "admin" : "student");

      const user: StudentUser = {
        id: `std-${res.user.student_id}`,
        name: res.user.full_name,
        email: res.user.email,
        studentId: res.user.student_id,
        role: userRole,
        university: res.user.university || "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)",
        major: res.user.major || "Công nghệ Thông tin",
        cohort: res.user.cohort || "K23",
        isVerified: true,
      };

      const token = res.token || `jwt_token_${Date.now()}`;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("majormatch_auth_token", token);
          localStorage.setItem("majormatch_auth_user", JSON.stringify(user));
        } catch (_) {}
      }

      // 2. Khởi tạo định danh cơ bản trong useProfileStore
      useProfileStore.setState({
        profile: {
          student_id: user.studentId,
          full_name: user.name,
          cumulative_gpa: 0,
          total_credits: 0,
          courses: [],
          detected_skills: [],
        },
      });

      // 3. Tải và đồng bộ toàn bộ dữ liệu CSDL Cloud (Hồ sơ, RIASEC, Roadmap, Chat) của sinh viên
      await useProfileStore.getState().loadAndSyncAllDataAction(user.studentId);

      set({ user, token, isAuthenticated: true, isModalOpen: false, error: null });
      return true;
    } catch (err: any) {
      const errMsg = err?.message || "Không thể kết nối đến máy chủ xác thực";
      set({ error: errMsg });
      return false;
    }
  },

  register: async (payload) => {
    try {
      set({ error: null });
      const res = await ApiService.register({
        student_id: payload.student_id.trim().toUpperCase(),
        email: payload.email.trim(),
        full_name: payload.full_name.trim(),
        password: payload.password || "",
        university: payload.university?.trim() || "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)",
        major: payload.major?.trim() || "Công nghệ Thông tin",
        cohort: payload.cohort?.trim() || "K23",
      });

      if (!res || !res.user) {
        set({ error: "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin." });
        return false;
      }

      // Tự động đăng nhập vào tài khoản vừa tạo
      useProfileStore.getState().resetAll();

      const user: StudentUser = {
        id: `std-${res.user.student_id}`,
        name: res.user.full_name,
        email: res.user.email,
        studentId: res.user.student_id,
        university: res.user.university,
        major: res.user.major,
        cohort: res.user.cohort,
        isVerified: true,
      };

      const token = res.token || `jwt_token_${Date.now()}`;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("majormatch_auth_token", token);
          localStorage.setItem("majormatch_auth_user", JSON.stringify(user));
        } catch (_) {}
      }

      useProfileStore.setState({
        profile: {
          student_id: user.studentId,
          full_name: user.name,
          cumulative_gpa: 0,
          total_credits: 0,
          courses: [],
          detected_skills: [],
        },
      });

      await useProfileStore.getState().loadAndSyncAllDataAction(user.studentId);

      set({ user, token, isAuthenticated: true, isModalOpen: false, error: null });
      return true;
    } catch (err: any) {
      const errMsg = err?.message || "Đã xảy ra lỗi khi tạo tài khoản";
      set({ error: errMsg });
      return false;
    }
  },

  loginDemoStudent: () => {
    // Chuyển hướng sang form đăng nhập/đăng ký thật thay vì mock
    set({ isModalOpen: true, activeTab: "login" });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("majormatch_auth_token");
        localStorage.removeItem("majormatch_auth_user");
        localStorage.removeItem("majormatch-profile-storage");
      } catch (_) {}
    }

    useProfileStore.getState().resetAll();
    set({ user: null, token: null, isAuthenticated: false, error: null });

    // 3. Tự động đưa trang hiện tại đang đứng quay về Trang chủ
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = "/";
    }
  },

  checkAuthSession: () => {
    if (typeof window === "undefined") return;
    try {
      const savedToken = localStorage.getItem("majormatch_auth_token");
      const savedUserStr = localStorage.getItem("majormatch_auth_user");
      if (savedToken && savedUserStr) {
        const user: StudentUser = JSON.parse(savedUserStr);
        set({ user, token: savedToken, isAuthenticated: true });

        const currentProfile = useProfileStore.getState().profile;
        if (!currentProfile || currentProfile.student_id !== user.studentId) {
          useProfileStore.setState({
            profile: {
              student_id: user.studentId,
              full_name: user.name,
              cumulative_gpa: 0,
              total_credits: 0,
              courses: [],
              detected_skills: [],
            },
          });
          useProfileStore.getState().loadAndSyncAllDataAction(user.studentId);
        }
      }
    } catch (_) {}
  },
}));
