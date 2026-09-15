// Labels and IDs copied from src/types/survey.ts; score defaults are not used as answers.
export const questions = [
  { id: 1, group: "R", group_name: "Thực tế (Realistic)", text: "Tôi thích sửa chữa, lắp ráp phần cứng máy tính hoặc các thiết bị công nghệ.", score: 3 },
  { id: 2, group: "R", group_name: "Thực tế (Realistic)", text: "Tôi có xu hướng làm việc với các hệ thống máy chủ vật lý, thiết bị mạng hoặc mạch IoT.", score: 3 },
  { id: 3, group: "I", group_name: "Nghiên cứu (Investigative)", text: "Tôi thích tìm hiểu nguyên lý thuật toán, giải toán tư duy và nghiên cứu mô hình toán học.", score: 4 },
  { id: 4, group: "I", group_name: "Nghiên cứu (Investigative)", text: "Tôi đam mê việc bóc tách số liệu, phân tích dữ liệu lớn và tìm ra quy luật ẩn sau dữ liệu.", score: 5 },
  { id: 5, group: "A", group_name: "Nghệ thuật (Artistic)", text: "Tôi thích thiết kế giao diện sáng tạo, phối màu UI/UX và tạo chuyển động hình ảnh thu hút.", score: 3 },
  { id: 6, group: "S", group_name: "Xã hội (Social)", text: "Tôi sẵn sàng hướng dẫn, giảng dạy công nghệ cho người mới và tham gia các hội thảo cộng đồng.", score: 3 },
  { id: 7, group: "E", group_name: "Quản lý (Enterprising)", text: "Tôi tự tin thuyết trình giải pháp công nghệ, dẫn dắt nhóm dự án hoặc mơ ước khởi nghiệp công nghệ.", score: 4 },
  { id: 8, group: "C", group_name: "Quy củ (Conventional)", text: "Tôi là người tỉ mỉ, thích quản trị cơ sở dữ liệu có cấu trúc và tuân thủ quy trình kiểm thử nghiêm ngặt.", score: 4 },
  { id: 9, group: "I", group_name: "Nghiên cứu (Investigative)", text: "Tôi bị cuốn hút bởi Trí tuệ nhân tạo (AI), học máy (Machine Learning) và mô hình ngôn ngữ lớn (LLM).", score: 5 },
  { id: 10, group: "E", group_name: "Quản lý (Enterprising)", text: "Tôi thích đóng vai trò Product Owner hoặc Scrum Master điều phối tiến độ sản phẩm phần mềm.", score: 3 }
];
export const tags = [
  { id: "ai_engineer", label: "AI & Data Science Specialist", category: "Data / AI" },
  { id: "fullstack_dev", label: "Fullstack Web Engineer", category: "Software" },
  { id: "devops_cloud", label: "Cloud & DevOps Solutions Architect", category: "Infrastructure" },
  { id: "cyber_sec", label: "Information Security Analyst", category: "Security" },
  { id: "mobile_dev", label: "Mobile Application Developer", category: "Software" },
  { id: "embedded_iot", label: "IoT & Embedded Systems Engineer", category: "Hardware / IoT" }
];
export const MAX_BYTES = 10485760;
export function validateFile(meta, header) {
  if (!/\.pdf$/i.test(meta.name)) return 'WRONG_EXTENSION';
  if (meta.size === 0) return 'EMPTY_FILE';
  if (meta.size > MAX_BYTES) return 'FILE_TOO_LARGE';
  if (meta.type !== 'application/pdf') return meta.type ? 'WRONG_MIME' : 'EMPTY_MIME';
  if (header !== '%PDF-') return 'BAD_HEADER';
  return null;
}
export function toggleTag(selected, id) {
  if (!tags.some(t => t.id === id)) return {selected, error:'UNKNOWN_TAG'};
  if (selected.includes(id)) return {selected:selected.filter(t => t !== id),error:null};
  if (selected.length >= 5) return {selected,error:'TOO_MANY_TAGS'};
  return {selected:[...selected,id],error:null};
}
export function scores(answers) {
  const result = {};
  for (const group of ['R','I','A','S','E','C']) {
    const entries = questions.filter(q => q.group === group).map(q => answers[q.id]);
    result[group] = entries.every(n => Number.isInteger(n) && n >= 1 && n <= 5)
      ? entries.reduce((a,b) => a+b,0) / entries.length : null;
  }
  return result;
}
export function complete(answers) {
  return questions.every(q => Number.isInteger(answers[q.id]) && answers[q.id] >= 1 && answers[q.id] <= 5);
}
export function payload(state) {
  if (!complete(state.answers) || !state.tags.length || state.tags.length > 5) throw Error('Incomplete inputs');
  if (new Set(state.tags).size !== state.tags.length || state.tags.some(id => !tags.some(t => t.id === id))) throw Error('Invalid tags');
  if (!['survey','record'].includes(state.path)) throw Error('Choose evidence path');
  return {
    prototype: true, origin: 'DEMO', evidence_path: state.path === 'survey' ? 'survey-only' : 'record-backed',
    profile: null,
    academic_evidence: 'unavailable-in-prototype',
    answers: {...state.answers}, riasec_scores: scores(state.answers),
    target_career_tags: [...state.tags],
    note: 'Review view model only; not an approved network DTO'
  };
}
