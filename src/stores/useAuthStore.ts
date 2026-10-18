import { create } from "zustand";
import { useProfileStore } from "./useProfileStore";

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  studentId: string; // MSSV
  university: string;
  major: string;
  cohort: string; // Khóa học ví dụ K21, K22
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
  id: "std-21020000",
  name: "Nguyễn Văn An",
  email: "annv.21it@vku.udn.vn",
  studentId: "21020000",
  university: "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
  major: "Kỹ sư Trí tuệ Nhân tạo & Khoa học Dữ liệu",
  cohort: "K21 (2021 - 2025)",
  isVerified: true,
};

const SAMPLE_STUDENTS_LIST: StudentUser[] = [
  DEMO_STUDENT,
  {
    id: "std-sv-2025001",
    name: "Đặng Long Nhật",
    email: "nhatdl.22it@vku.udn.vn",
    studentId: "SV-2025001",
    university: "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
    major: "Kỹ thuật Đám mây & Vận hành Hệ thống",
    cohort: "K22 (2022 - 2026)",
    isVerified: true,
  },
  {
    id: "std-22it045",
    name: "Trần Thị Mai Chi",
    email: "chittm.22it@vku.udn.vn",
    studentId: "22IT045",
    university: "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
    major: "Kỹ sư Phát triển Web Toàn diện (Fullstack Web)",
    cohort: "K22 (2022 - 2026)",
    isVerified: true,
  },
  {
    id: "std-sv-2025002",
    name: "Nguyễn Văn Hoàng",
    email: "hoangnv.22it@vku.udn.vn",
    studentId: "SV-2025002",
    university: "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
    major: "Kỹ thuật Đám mây & Vận hành Hệ thống",
    cohort: "K22 (2022 - 2026)",
    isVerified: true,
  },
  {
    id: "std-sv-2025003",
    name: "Võ Thanh Phong",
    email: "phongvt.22it@vku.udn.vn",
    studentId: "SV-2025003",
    university: "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
    major: "Kỹ sư Phát triển Web Toàn diện (Fullstack Web)",
    cohort: "K22 (2022 - 2026)",
    isVerified: true,
  }
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isModalOpen: false,
  activeTab: "login",

  openAuthModal: (tab = "login") => set({ isModalOpen: true, activeTab: tab }),
  closeAuthModal: () => set({ isModalOpen: false }),

  login: async (email: string) => {
    // 1. Dọn sạch hoàn toàn hồ sơ và cache của tài khoản trước đó
    useProfileStore.getState().resetAll();

    const emailPrefix = email.split("@")[0].toLowerCase();
    const matched = SAMPLE_STUDENTS_LIST.find((s) => s.email.includes(emailPrefix) || s.studentId.toLowerCase() === emailPrefix);

    const user: StudentUser = matched || {
      ...DEMO_STUDENT,
      id: `std-${Date.now()}`,
      email: email,
      name: email.split("@")[0].toUpperCase() || "Sinh viên MajorMatch",
      studentId: emailPrefix.includes("2") ? emailPrefix.toUpperCase() : "21020000"
    };

    const token = "jwt_token_" + Date.now();

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("majormatch_auth_token", token);
        localStorage.setItem("majormatch_auth_user", JSON.stringify(user));
      } catch (_) {}
    }

    // 2. Cập nhật hồ sơ sinh viên định danh tương ứng trong useProfileStore
    useProfileStore.setState({
      profile: {
        student_id: user.studentId,
        full_name: user.name,
        cumulative_gpa: user.studentId === "SV-2025001" ? 2.89 : 3.42,
        total_credits: 80,
        courses: [],
        detected_skills: []
      }
    });

    // 3. Nạp ngay dữ liệu cá nhân hóa (RIASEC, Roadmap, Chat) từ Cloud CSDL
    useProfileStore.getState().loadAndSyncAllDataAction(user.studentId);

    set({ user, token, isAuthenticated: true, isModalOpen: false });
    return true;
  },

  loginDemoStudent: () => {
    // 1. Dọn sạch hoàn toàn hồ sơ và cache của tài khoản trước đó
    useProfileStore.getState().resetAll();

    const token = "jwt_demo_token_" + Date.now();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("majormatch_auth_token", token);
        localStorage.setItem("majormatch_auth_user", JSON.stringify(DEMO_STUDENT));
      } catch (_) {}
    }

    // 2. Cập nhật định danh Nguyễn Văn An (21020000) vào ProfileStore
    useProfileStore.setState({
      profile: {
        student_id: DEMO_STUDENT.studentId,
        full_name: DEMO_STUDENT.name,
        cumulative_gpa: 3.42,
        total_credits: 92,
        courses: [],
        detected_skills: ["Python", "Machine Learning", "SQL", "Data Science", "Pandas", "Scikit-Learn"]
      }
    });

    // 3. Tự động đồng bộ toàn bộ dữ liệu Cloud của Nguyễn Văn An
    useProfileStore.getState().loadAndSyncAllDataAction(DEMO_STUDENT.studentId);

    set({ user: DEMO_STUDENT, token, isAuthenticated: true, isModalOpen: false });
  },

  logout: () => {
    // 1. Xóa sạch token, phiên làm việc và cache trình duyệt
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("majormatch_auth_token");
        localStorage.removeItem("majormatch_auth_user");
        localStorage.removeItem("majormatch-profile-storage");
      } catch (_) {}
    }

    // 2. Reset toàn bộ ProfileStore về trạng thái ban đầu sạch sẽ
    useProfileStore.getState().resetAll();

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

        // Nếu chưa có profile trong store, nạp dữ liệu của user đã lưu
        const currentProfile = useProfileStore.getState().profile;
        if (!currentProfile || currentProfile.student_id !== user.studentId) {
          useProfileStore.setState({
            profile: {
              student_id: user.studentId,
              full_name: user.name,
              cumulative_gpa: user.studentId === "SV-2025001" ? 2.89 : 3.42,
              total_credits: 80,
              courses: [],
              detected_skills: []
            }
          });
          useProfileStore.getState().loadAndSyncAllDataAction(user.studentId);
        }
      }
    } catch (_) {}
  },
}));
