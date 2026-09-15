// Synthetic review fixtures only. D02–D06 remain unapproved product policy.
export const axes = [
  ['foundation', 'Kỹ thuật nền tảng'], ['specialty', 'Chuyên môn'],
  ['algorithm', 'Tư duy thuật toán'], ['architecture', 'Kiến trúc hệ thống'],
  ['tools', 'Công cụ'], ['collaboration', 'Kỹ năng phối hợp']
];
const current = [8.5, 8, 7.5, 7, 9, 6];
export const fixtures = [
  {id:'ai', name:'AI & Data Science', score:91.3, description:'Phân tích dữ liệu, xây dựng mô hình và ứng dụng trí tuệ nhân tạo.', benchmark:[9,8.5,9.5,8.5,8,8], skills:[
    {name:'Python', group:0, reason:'Bài tập xử lý dữ liệu trong hồ sơ mẫu.', source:'Minh chứng tổng hợp, không phải hồ sơ thật'},
    {name:'SQL', group:1, reason:'Bài tập truy vấn cơ bản; chưa có minh chứng tối ưu truy vấn.', source:'Minh chứng tổng hợp'},
    {name:'Machine learning', group:2, reason:'Chưa có minh chứng trong bộ dữ liệu mẫu.', source:'Thiếu minh chứng không đồng nghĩa không có năng lực'}]},
  {id:'web', name:'Fullstack Web Engineer', score:82.4, description:'Xây dựng giao diện, dịch vụ web và hệ thống dữ liệu cho ứng dụng.', benchmark:[8,8,7.5,9,9,8], skills:[
    {name:'JavaScript', group:0, reason:'Bài tập ứng dụng web trong hồ sơ mẫu.', source:'Minh chứng tổng hợp'},
    {name:'Thiết kế API', group:1, reason:'Có bài tập cơ bản; thiếu minh chứng xử lý lỗi.', source:'Minh chứng tổng hợp'},
    {name:'Kiểm thử tích hợp', group:2, reason:'Chưa có minh chứng trong bộ dữ liệu mẫu.', source:'Chưa xác minh năng lực'}]},
  {id:'security', name:'Information Security', score:82.4, description:'Tìm hiểu bảo vệ hệ thống, dữ liệu và ứng phó với rủi ro an ninh mạng.', benchmark:[9,9,8,9,8,7], skills:[
    {name:'Mạng máy tính', group:0, reason:'Bài thực hành mạng trong hồ sơ mẫu.', source:'Minh chứng tổng hợp'},
    {name:'Phân tích rủi ro', group:1, reason:'Có phân tích tình huống cơ bản.', source:'Minh chứng tổng hợp'},
    {name:'Ứng phó sự cố', group:2, reason:'Chưa có minh chứng trong bộ dữ liệu mẫu.', source:'Chưa xác minh năng lực'}]}
].map(m => ({...m, current:[...current], axisIds:axes.map(a=>a[0])}));
export function validate(items) {
  if (!Array.isArray(items) || items.length > 3) return false;
  const ids=new Set();
  return items.every(m=>{
    if (!m.id || ids.has(m.id) || !Number.isFinite(m.score) || m.score<0 || m.score>100) return false;
    ids.add(m.id);
    if (m.axisIds?.length!==6 || new Set(m.axisIds).size!==6 || m.axisIds.some((id,i)=>id!==axes[i][0])) return false;
    if (![m.current,m.benchmark].every(a=>Array.isArray(a)&&a.length===6&&a.every(v=>v===null||(Number.isFinite(v)&&v>=0&&v<=10)))) return false;
    const skills=new Set();
    return Array.isArray(m.skills)&&m.skills.every(s=>{
      if (!s.name || skills.has(s.name) || ![0,1,2].includes(s.group) || !s.reason) return false;
      skills.add(s.name); return true;
    });
  });
}
export function createState() {return {items:structuredClone(fixtures), selected:'ai', mode:'success', version:1, request:0, pending:false, handoff:null, context:true};}
export function selectMajor(s,id) {
  if (s.pending || !s.items.some(m=>m.id===id)) return false;
  s.selected=id; s.handoff=null; return true;
}
export function selected(s) {return s.items.find(m=>m.id===s.selected);}
export function canHandoff(s) {return ['success','empty-skills','roadmap-error'].includes(s.mode)&&s.context&&validate(s.items)&&Boolean(selected(s))&&!s.pending;}
export function begin(s) {
  if (!canHandoff(s)) return null;
  s.pending=true; s.handoff=null;
  return {request:++s.request, version:s.version, major:s.selected};
}
export function finish(s,token,fail=false) {
  if (!token || !s.pending || token.request!==s.request || token.version!==s.version || token.major!==s.selected) return false;
  s.pending=false;
  if(fail) {s.mode='roadmap-error'; return true;}
  s.handoff={origin:'DEMO', majorId:s.selected, snapshot:s.version, missingSkills:selected(s).skills.filter(x=>x.group===2).map(x=>x.name)};
  return true;
}
export function invalidate(s) {s.version++;s.request++;s.pending=false;s.handoff=null;s.mode='stale';}
export function scenario(s,mode) {
  const version=s.version+1,request=s.request+1;
  Object.assign(s,createState(),{mode,version,request});
  if (mode==='partial') {s.items.forEach(m=>{m.current=Array(6).fill(null);m.skills=[];});s.context=false;}
  if (mode==='missing-context') s.context=false;
  if (mode==='empty') s.items=[];
  if (mode==='unavailable') s.selected='web';
  if (mode==='invalid') s.items[0].current[0]=11;
  if (mode==='empty-skills') s.items.forEach(m=>m.skills=[]);
}
