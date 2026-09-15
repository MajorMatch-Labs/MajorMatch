/**
 * MajorMatch Advisor/Core — Prototype Logic & State Engine
 * Week 4 Task 2 Deliverable
 * Author: NhatPrv <torikun2005@gmail.com>
 * 
 * Features implemented:
 * - Prerequisite DAG validation & unlocking
 * - Reversible simulation from immutable baseline (ADV-UI-AC-04)
 * - Cascade reset on prerequisite uncheck (ADV-UI-AC-03 / XD-03)
 * - Controllable SSE chat stream with Stop & Interrupted states (ADV-UI-AC-05..07)
 * - Reviewer state inspector for instant PRD scenario demonstration
 */

// Immutable Baseline Fixture
const BASELINE_DATA = {
  majorId: "CS_DATA_AI",
  majorName: "Khoa học Máy tính & Kỹ thuật Dữ liệu / AI",
  curriculumVersion: "KNTT-2024-v2.1",
  currentSemester: 5,
  baselineScore: 45, // Điểm bảo lưu gốc (45%)
  baselineRadar: {
    ml: 55,
    data: 70,
    math: 60
  }
};

// Course DAG Definition
const COURSE_DAG = {
  CS201: {
    code: "CS201",
    name: "Cấu trúc Dữ liệu & Giải thuật Nâng cao",
    weight: 15,
    prereqs: [], // Đã hoàn thành CS101 từ trước
    radarDelta: { data: +10, ml: +5 }
  },
  MATH205: {
    code: "MATH205",
    name: "Xác suất Thống kê ứng dụng AI",
    weight: 10,
    prereqs: [], // Đã hoàn thành Giải tích
    radarDelta: { math: +15, ml: +5 }
  },
  CS301: {
    code: "CS301",
    name: "Nhập môn Trí tuệ Nhân tạo & Machine Learning",
    weight: 20,
    prereqs: ["CS201", "MATH205"],
    radarDelta: { ml: +20 }
  },
  CS401: {
    code: "CS401",
    name: "Đồ án Tốt nghiệp Ứng dụng Học máy Thực chiến",
    weight: 10,
    prereqs: ["CS301"],
    radarDelta: { ml: +10, data: +5 }
  }
};

// Mutable Simulation State
let simulatedTasks = new Set();
let pendingCascadeTaskId = null;
let currentChatInterval = null;
let activeStreamingBubble = null;

// Screen reader live announcer
function announceA11y(message) {
  const liveRegion = document.getElementById("a11y-live-region");
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

/**
 * Recomputes readiness score and radar values strictly from immutable baseline
 */
function updateSimulationCalculations() {
  let deltaScore = 0;
  let simulatedRadar = { ...BASELINE_DATA.baselineRadar };

  simulatedTasks.forEach(taskId => {
    const course = COURSE_DAG[taskId];
    if (course) {
      deltaScore += course.weight;
      if (course.radarDelta) {
        if (course.radarDelta.ml) simulatedRadar.ml += course.radarDelta.ml;
        if (course.radarDelta.data) simulatedRadar.data += course.radarDelta.data;
        if (course.radarDelta.math) simulatedRadar.math += course.radarDelta.math;
      }
    }
  });

  const totalScore = Math.min(100, BASELINE_DATA.baselineScore + deltaScore);

  // Update Score Numbers
  document.getElementById("simulated-score").textContent = totalScore + "%";
  const deltaLabel = document.getElementById("score-delta");
  if (deltaScore > 0) {
    deltaLabel.textContent = `+${deltaScore}% mô phỏng`;
    deltaLabel.classList.remove("hidden");
  } else {
    deltaLabel.textContent = "+0% mô phỏng";
  }

  // Update Progress Bars (Baseline + Simulated)
  const barSimulated = document.getElementById("bar-simulated");
  barSimulated.style.width = deltaScore + "%";

  // Update Radar Tags
  document.getElementById("tag-ml").innerHTML = `Machine Learning: <strong>${Math.min(100, simulatedRadar.ml)}%</strong>`;
  document.getElementById("tag-data").innerHTML = `Cấu trúc Dữ liệu & Giải thuật: <strong>${Math.min(100, simulatedRadar.data)}%</strong>`;
  document.getElementById("tag-math").innerHTML = `Toán & Xác suất thống kê: <strong>${Math.min(100, simulatedRadar.math)}%</strong>`;

  // Update Footer & Reset button state
  const resetBtn = document.getElementById("btn-reset-simulation");
  const countLabel = document.getElementById("simulated-count-label");
  countLabel.innerHTML = `Đã chọn mô phỏng: <strong>${simulatedTasks.size} môn</strong>`;
  
  if (simulatedTasks.size > 0) {
    resetBtn.removeAttribute("disabled");
  } else {
    resetBtn.setAttribute("disabled", "true");
  }

  announceA11y(`Tiến độ sẵn sàng học tập cập nhật: ${totalScore}%.`);
}

/**
 * Checks and updates eligibility of locked downstream courses in the DAG
 */
function evaluateDagUnlocks() {
  // Check CS301 (Requires CS201 AND MATH205)
  const cs301Card = document.getElementById("task-CS301");
  const chkCS301 = document.getElementById("chk-CS301");
  const badgeCS301 = document.getElementById("badge-CS301");
  const prereqDescCS301 = document.getElementById("prereq-desc-CS301");

  const cs301Unlocked = simulatedTasks.has("CS201") && simulatedTasks.has("MATH205");

  if (cs301Unlocked) {
    cs301Card.classList.remove("locked");
    chkCS301.removeAttribute("disabled");
    badgeCS301.className = "task-badge badge-eligible";
    badgeCS301.textContent = "Đã đủ điều kiện mở khóa";
    prereqDescCS301.className = "prereq-info clear";
    prereqDescCS301.innerHTML = `<span class="prereq-icon">&check;</span><span>Đã thỏa mãn tiên quyết: <strong>CS201</strong> và <strong>MATH205</strong>.</span>`;
  } else {
    cs301Card.classList.add("locked");
    chkCS301.setAttribute("disabled", "true");
    chkCS301.checked = false;
    simulatedTasks.delete("CS301");
    badgeCS301.className = "task-badge badge-locked";
    badgeCS301.textContent = "Bị khóa tiên quyết";
    prereqDescCS301.className = "prereq-info blocked";
    prereqDescCS301.innerHTML = `<span class="prereq-icon">&times;</span><span class="prereq-text">Chưa đủ điều kiện: Cần hoàn thành trước <strong>CS201</strong> và <strong>MATH205</strong>.</span>`;
  }

  // Check CS401 (Requires CS301)
  const cs401Card = document.getElementById("task-CS401");
  const chkCS401 = document.getElementById("chk-CS401");
  const badgeCS401 = document.getElementById("badge-CS401");
  const prereqDescCS401 = document.getElementById("prereq-desc-CS401");

  const cs401Unlocked = simulatedTasks.has("CS301");

  if (cs401Unlocked) {
    cs401Card.classList.remove("locked");
    chkCS401.removeAttribute("disabled");
    badgeCS401.className = "task-badge badge-eligible";
    badgeCS401.textContent = "Đã đủ điều kiện mở khóa";
    prereqDescCS401.className = "prereq-info clear";
    prereqDescCS401.innerHTML = `<span class="prereq-icon">&check;</span><span>Đã thỏa mãn tiên quyết: <strong>CS301</strong>.</span>`;
  } else {
    cs401Card.classList.add("locked");
    chkCS401.setAttribute("disabled", "true");
    chkCS401.checked = false;
    simulatedTasks.delete("CS401");
    badgeCS401.className = "task-badge badge-locked";
    badgeCS401.textContent = "Bị khóa tiên quyết";
    prereqDescCS401.className = "prereq-info blocked";
    prereqDescCS401.innerHTML = `<span class="prereq-icon">&times;</span><span class="prereq-text">Chưa đủ điều kiện: Cần hoàn thành trước <strong>CS301</strong>.</span>`;
  }
}

/**
 * Finds all simulated courses that depend on the given task ID
 */
function getSimulatedDependents(taskId) {
  let dependents = [];
  if (taskId === "CS201" || taskId === "MATH205") {
    if (simulatedTasks.has("CS301")) dependents.push("CS301");
    if (simulatedTasks.has("CS401")) dependents.push("CS401");
  } else if (taskId === "CS301") {
    if (simulatedTasks.has("CS401")) dependents.push("CS401");
  }
  return dependents;
}

/**
 * Toggles a course task in simulation mode
 */
function toggleTaskSimulation(taskId) {
  const checkbox = document.getElementById(`chk-${taskId}`);
  const card = document.getElementById(`task-${taskId}`);

  if (checkbox.checked) {
    // Checking a course
    simulatedTasks.add(taskId);
    card.classList.add("simulated");
    evaluateDagUnlocks();
    updateSimulationCalculations();
    announceA11y(`Đã thêm môn ${taskId} vào mô phỏng học tập.`);
  } else {
    // Unchecking a course: Check for dependent simulated tasks (ADV-UI-AC-03)
    const dependents = getSimulatedDependents(taskId);
    if (dependents.length > 0) {
      // Must prompt with cascade confirmation modal
      pendingCascadeTaskId = taskId;
      document.getElementById("cascade-target-code").textContent = taskId;
      document.getElementById("cascade-dependents-list").textContent = dependents.join(", ");
      document.getElementById("modal-cascade-reset").classList.remove("hidden");
      // Keep checkbox checked until confirmed
      checkbox.checked = true;
    } else {
      // Normal uncheck without dependents
      simulatedTasks.delete(taskId);
      card.classList.remove("simulated");
      evaluateDagUnlocks();
      updateSimulationCalculations();
      announceA11y(`Đã bỏ môn ${taskId} khỏi mô phỏng học tập.`);
    }
  }
}

/**
 * Handles confirmation or cancellation of Cascade Reset Modal
 */
function closeCascadeModal(confirm) {
  const modal = document.getElementById("modal-cascade-reset");
  modal.classList.add("hidden");

  if (!pendingCascadeTaskId) return;

  const targetId = pendingCascadeTaskId;
  const checkbox = document.getElementById(`chk-${targetId}`);

  if (confirm) {
    // Commit removal: atomically remove target and all dependent tasks
    const dependents = getSimulatedDependents(targetId);
    simulatedTasks.delete(targetId);
    checkbox.checked = false;
    document.getElementById(`task-${targetId}`).classList.remove("simulated");

    dependents.forEach(depId => {
      simulatedTasks.delete(depId);
      const depChk = document.getElementById(`chk-${depId}`);
      if (depChk) depChk.checked = false;
      const depCard = document.getElementById(`task-${depId}`);
      if (depCard) depCard.classList.remove("simulated");
    });

    evaluateDagUnlocks();
    updateSimulationCalculations();
    announceA11y(`Đã hủy môn ${targetId} và toàn bộ môn phụ thuộc: ${dependents.join(", ")}.`);
  } else {
    // Cancel: keep state unchanged
    checkbox.checked = true;
    announceA11y("Đã hủy thao tác. Giữ nguyên trạng thái mô phỏng.");
  }

  pendingCascadeTaskId = null;
  checkbox.focus();
}

/**
 * Resets all simulated tasks back to baseline 100% cleanly (Reversible Simulation)
 */
function resetAllSimulation() {
  simulatedTasks.clear();

  // Reset checkboxes and card styling
  ["CS201", "MATH205", "CS301", "CS401"].forEach(taskId => {
    const chk = document.getElementById(`chk-${taskId}`);
    if (chk) chk.checked = false;
    const card = document.getElementById(`task-${taskId}`);
    if (card) card.classList.remove("simulated");
  });

  evaluateDagUnlocks();
  updateSimulationCalculations();
  announceA11y("Đã đặt lại toàn bộ mô phỏng về điểm cơ sở ban đầu.");
}

/**
 * Advisor Chat SSE Stream Simulator
 */
function startStreamingResponse(tokens, citationText) {
  if (currentChatInterval) {
    clearInterval(currentChatInterval);
  }

  // Update UI Status to Streaming
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  statusDot.className = "status-dot streaming";
  statusText.textContent = "Đang sinh phản hồi (SSE Stream)...";

  const btnSend = document.getElementById("btn-chat-send");
  const btnStop = document.getElementById("btn-chat-stop");
  btnSend.classList.add("hidden");
  btnStop.classList.remove("hidden");

  // Create message bubble in container
  const container = document.getElementById("chat-messages-container");
  const bubble = document.createElement("div");
  bubble.className = "message-bubble assistant";
  bubble.innerHTML = `
    <div class="message-author">Cố vấn MajorMatch &bull; <em>Mô hình hỗ trợ lập kế hoạch (Stream)</em></div>
    <div class="message-content"><span class="stream-text"></span><span class="typing-caret"></span></div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  activeStreamingBubble = bubble;
  const streamTextSpan = bubble.querySelector(".stream-text");

  let tokenIdx = 0;
  currentChatInterval = setInterval(() => {
    if (tokenIdx < tokens.length) {
      streamTextSpan.textContent += tokens[tokenIdx];
      tokenIdx++;
      container.scrollTop = container.scrollHeight;
    } else {
      // Complete stream
      finishStreamSuccess(bubble, citationText);
    }
  }, 45); // 45ms per token simulate realistic local LLM inference
}

function finishStreamSuccess(bubble, citationText) {
  clearInterval(currentChatInterval);
  currentChatInterval = null;

  const caret = bubble.querySelector(".typing-caret");
  if (caret) caret.remove();

  if (citationText) {
    const citationDiv = document.createElement("div");
    citationDiv.className = "message-citation";
    citationDiv.innerHTML = `<span class="citation-pill">${citationText}</span>`;
    bubble.appendChild(citationDiv);
  }

  // Restore Chat Controls
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  statusDot.className = "status-dot idle";
  statusText.textContent = "Sẵn sàng";

  document.getElementById("btn-chat-send").classList.remove("hidden");
  document.getElementById("btn-chat-stop").classList.add("hidden");
  activeStreamingBubble = null;

  announceA11y("Cố vấn đã hoàn thành câu trả lời.");
}

/**
 * Handles User Stop Button (ADV-UI-AC-06)
 */
function handleChatStop() {
  if (currentChatInterval && activeStreamingBubble) {
    clearInterval(currentChatInterval);
    currentChatInterval = null;

    const caret = activeStreamingBubble.querySelector(".typing-caret");
    if (caret) caret.remove();

    // Mark as Stopped
    const badge = document.createElement("div");
    badge.className = "message-stopped-badge";
    badge.textContent = "[Đã dừng phản hồi bởi người dùng]";
    activeStreamingBubble.appendChild(badge);

    // Update Status
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    statusDot.className = "status-dot stopped";
    statusText.textContent = "Đã dừng";

    document.getElementById("btn-chat-send").classList.remove("hidden");
    document.getElementById("btn-chat-stop").classList.add("hidden");

    announceA11y("Đã dừng tiến trình sinh phản hồi. Phần phản hồi hiện có được bảo lưu.");
    activeStreamingBubble = null;
  }
}

/**
 * Handles Form Submission for Chat
 */
function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  // Add User Bubble
  const container = document.getElementById("chat-messages-container");
  const userBubble = document.createElement("div");
  userBubble.className = "message-bubble user";
  userBubble.textContent = text;
  container.appendChild(userBubble);
  input.value = "";
  container.scrollTop = container.scrollHeight;

  // Generate contextual mock tokens
  const sampleTokens = [
    "Dựa ", "trên ", "khung ", "chương ", "trình ", "đào ", "tạo ", "chuẩn ", "KNTT-2024, ",
    "môn ", "CS201 ", "(Cấu trúc Dữ liệu nâng cao) ", "là ", "điều ", "kiện ", "tiên ", "quyết ",
    "bắt ", "buộc ", "của ", "CS301 ", "(Học máy). ",
    "Nếu ", "bạn ", "chưa ", "vững ", "cấu trúc ", "cây ", "và ", "đồ thị, ",
    "việc ", "tiếp ", "thu ", "các ", "thuật ", "toán ", "tối ", "ưu ", "trong ", "AI ",
    "sẽ ", "gặp ", "nhiều ", "trở ", "ngại. ",
    "Do đó, ", "bạn ", "nên ", "tập ", "trung ", "hoàn ", "thành ", "CS201 ", "ngay ", "tại ", "Kỳ 5."
  ];

  startStreamingResponse(sampleTokens, "Căn cứ: Khung CTĐT KNTT-2024 Điều 4.2 & Sơ đồ tiên quyết CS");
}

function applyQuickPrompt(promptText) {
  document.getElementById("chat-input").value = promptText;
  document.getElementById("chat-form").dispatchEvent(new Event("submit"));
}

/**
 * Reviewer Inspector State Switchers
 */
function toggleInspector(show) {
  const drawer = document.getElementById("inspector-drawer");
  const btn = document.getElementById("btn-toggle-inspector");
  if (show === undefined) {
    show = drawer.classList.contains("hidden");
  }
  if (show) {
    drawer.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
  } else {
    drawer.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
  }
}

document.getElementById("btn-toggle-inspector").addEventListener("click", () => {
  toggleInspector();
});

function simulateState(stateName) {
  const ws = document.getElementById("state-active-workspace");
  const missing = document.getElementById("state-context-missing");
  const dagErr = document.getElementById("state-dag-error");

  ws.classList.add("hidden");
  missing.classList.add("hidden");
  dagErr.classList.add("hidden");

  if (stateName === "missing-context") {
    missing.classList.remove("hidden");
    announceA11y("Chuyển sang trạng thái: Thiếu ngữ cảnh phân tích (ADV-UI-AC-01).");
  } else if (stateName === "dag-error") {
    dagErr.classList.remove("hidden");
    announceA11y("Chuyển sang trạng thái: Lỗi chu trình dữ liệu DAG (ADV-UI-AC-02).");
  } else {
    ws.classList.remove("hidden");
    announceA11y("Chuyển sang trạng thái: Lộ trình tiêu chuẩn hợp lệ.");
  }
}

function triggerStreamingDemo() {
  simulateState("default");
  const tokens = [
    "Xin ", "chào! ", "Đây ", "là ", "bài ", "kiểm ", "tra ", "khả ", "năng ", "stream ",
    "token ", "tiếng ", "Việt ", "qua ", "giao ", "thức ", "SSE. ",
    "Các ", "ký ", "tự ", "có ", "dấu ", "như ", "á, ", "à, ", "ả, ", "ã, ", "ạ, ",
    "được ", "giải ", "mã ", "chính ", "xác ", "không ", "bị ", "vỡ ", "font ", "chữ."
  ];
  startStreamingResponse(tokens, "Căn cứ: Kiểm thử giao thức SSE");
}

function triggerInterruptedDemo() {
  simulateState("default");
  // Stream a few tokens then abruptly fail (EOF before done - ADV-UI-AC-07)
  const tokens = ["Hệ ", "thống ", "đang ", "phân ", "tích ", "tiến ", "độ... "];
  startStreamingResponse(tokens, null);

  setTimeout(() => {
    if (currentChatInterval) {
      clearInterval(currentChatInterval);
      currentChatInterval = null;

      const caret = activeStreamingBubble ? activeStreamingBubble.querySelector(".typing-caret") : null;
      if (caret) caret.remove();

      // Show Error Banner
      const errorBanner = document.getElementById("chat-error-alert");
      document.getElementById("chat-error-message").textContent = "Mất kết nối mạng đột ngột trước khi hoàn tất phản hồi (Lỗi: EOF before done).";
      errorBanner.classList.remove("hidden");

      // Update Status
      const statusDot = document.getElementById("status-dot");
      const statusText = document.getElementById("status-text");
      statusDot.className = "status-dot stopped";
      statusText.textContent = "Gián đoạn kết nối";

      document.getElementById("btn-chat-send").classList.remove("hidden");
      document.getElementById("btn-chat-stop").classList.add("hidden");

      announceA11y("Cảnh báo: Luồng dữ liệu bị gián đoạn đột ngột.");
    }
  }, 350);
}

function triggerRateLimitDemo() {
  simulateState("default");
  const errorBanner = document.getElementById("chat-error-alert");
  document.getElementById("chat-error-message").textContent = "Máy chủ quá tải yêu cầu (Mã lỗi HTTP 429: Too Many Requests). Vui lòng thử lại sau 15 giây.";
  errorBanner.classList.remove("hidden");
  announceA11y("Lỗi: Quá tải yêu cầu HTTP 429.");
}

function retryLastChatAttempt() {
  document.getElementById("chat-error-alert").classList.add("hidden");
  const tokens = [
    "Thử ", "lại ", "thành ", "công: ", "Hệ ", "thống ", "đã ", "tạo ", "yêu ", "cầu ",
    "mới ", "độc ", "lập ", "và ", "hoàn ", "tất ", "phản ", "hồi ", "bình ", "thường."
  ];
  startStreamingResponse(tokens, "Căn cứ: Thử lại yêu cầu thành công");
}

function toggleViewportWidth(mode) {
  if (mode === "mobile") {
    document.body.classList.add("preview-mobile");
    announceA11y("Đã chuyển chế độ xem sang màn hình di động 375px.");
  } else {
    document.body.classList.remove("preview-mobile");
    announceA11y("Đã chuyển chế độ xem sang màn hình tiêu chuẩn.");
  }
}

// Initial setup on load
document.addEventListener("DOMContentLoaded", () => {
  updateSimulationCalculations();

  const hash = window.location.hash.replace("#", "");
  if (hash === "simulation-active") {
    // Simulate CS201 and MATH205 to unlock CS301
    document.getElementById("chk-CS201").checked = true;
    document.getElementById("chk-MATH205").checked = true;
    toggleTaskSimulation("CS201");
    toggleTaskSimulation("MATH205");
  } else if (hash === "cascade-dialog") {
    // Simulate CS201, MATH205, and CS301 then trigger cascade dialog
    document.getElementById("chk-CS201").checked = true;
    document.getElementById("chk-MATH205").checked = true;
    toggleTaskSimulation("CS201");
    toggleTaskSimulation("MATH205");
    document.getElementById("chk-CS301").checked = true;
    toggleTaskSimulation("CS301");
    // Now trigger uncheck of CS201 to show modal
    document.getElementById("chk-CS201").checked = false;
    toggleTaskSimulation("CS201");
  } else if (hash === "chat-streaming") {
    triggerStreamingDemo();
  } else if (hash === "dag-error") {
    simulateState("dag-error");
  } else if (hash === "missing-context") {
    simulateState("missing-context");
  } else if (hash === "mobile") {
    toggleViewportWidth("mobile");
  }
});
