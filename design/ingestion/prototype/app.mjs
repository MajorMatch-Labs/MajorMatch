import {questions,tags,validateFile,toggleTag,scores,complete,payload} from './model.mjs';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = {stage:0,page:0,path:null,answers:{},tags:[],file:null,filePhase:'empty',fileError:null,fileVersion:0,analysisVersion:0,analysis:'idle',output:null,scenario:'default',rateUntil:0};
const stages = ['Minh chứng học tập','Sở thích của bạn','Hướng muốn tìm hiểu','Kiểm tra & tiếp tục'];
let rateTimer;
function announce(message){$('#status').textContent=message;}
function invalidate(){state.output=null;state.analysis='idle';state.analysisVersion++;}
function count(){return Object.keys(state.answers).length;}
function canNext(){
 if(state.stage===0)return state.path==='survey'||(state.path==='record'&&['validated','success'].includes(state.filePhase));
 if(state.stage===1)return questions.slice(state.page*5,state.page*5+5).every(q=>state.answers[q.id]);
 if(state.stage===2)return state.tags.length>=1&&state.tags.length<=5;
 return state.stage===3&&complete(state.answers)&&state.tags.length>0&&state.analysis!=='pending'&&Date.now()>=state.rateUntil;
}
function controls(){
 $('#stage-label').textContent=state.stage===4?'Bàn giao sang Analytics':stages[state.stage];
 $('#stage-count').textContent=state.stage===4?'Hoàn tất bản xem thử':(state.stage+1)+' / 4';
 document.querySelectorAll('.steps li').forEach((li,i)=>i===Math.min(state.stage,3)?li.setAttribute('aria-current','step'):li.removeAttribute('aria-current'));
 $('#back').hidden=state.stage===0;$('#next').hidden=state.stage===4;
 $('#next').disabled=!canNext();
 $('#next').textContent=state.stage===3?(state.analysis==='pending'?'Đang mô phỏng…':'Xem bàn giao mẫu'):'Tiếp tục';
 const hints=['Chọn cách bắt đầu để tiếp tục.','Trả lời đủ 5 câu trên trang này.','Chọn từ 1 đến 5 hướng bạn quan tâm.','Kiểm tra dữ liệu trước khi xem bàn giao.'];
 $('#next-hint').textContent=state.stage===4?'':canNext()?'Bạn có thể quay lại để chỉnh sửa.':hints[Math.min(state.stage,3)];
}
function fileFeedback(){
 const messages={
  WRONG_EXTENSION:'Chọn tệp có phần mở rộng .pdf.',EMPTY_FILE:'Tệp đang rỗng. Hãy chọn một tệp khác.',
  FILE_TOO_LARGE:'Tệp vượt quá 10 MiB (10.485.760 byte). Hãy chọn tệp nhỏ hơn.',
  WRONG_MIME:'Loại nội dung không phải application/pdf.',EMPTY_MIME:'Không xác định được loại nội dung PDF. Hãy xuất lại tệp.',
  BAD_HEADER:'Không tìm thấy chữ ký PDF hợp lệ. Hãy xuất lại tệp.',MULTIPLE_FILES:'Chỉ chọn một tệp PDF mỗi lần.',READ_ERROR:'Không đọc được tệp. Hãy chọn lại.'
 };
 const blocks={
  validating:['Đang kiểm tra tệp','Đọc tối đa 5 byte đầu ngay trong trình duyệt.',''],
  processing:['Đang xử lý hồ sơ minh họa','Đây là trạng thái mô phỏng. Bạn có thể hủy hoặc thay tệp.',''],
  validated:['Tệp hợp lệ để xem thử','Đã kiểm tra loại, kích thước và chữ ký. Bản thiết kế không bóc tách hoặc tải nội dung lên máy chủ.','success'],
  success:['Bóc tách mẫu hoàn tất','Fixture minh họa có danh sách môn học. Không có GPA hoặc dữ liệu cá nhân thật trong bản xem thử.','success'],
  partial:['Chưa đủ dữ liệu học tập','Bản mẫu chưa xác định được môn học. Thử tệp khác hoặc tiếp tục chỉ với sở thích.','warning'],
  error:['Chưa thể xử lý tệp',messages[state.fileError]||'Dịch vụ minh họa trả về 415. Hãy thay tệp; không tạo kết quả cá nhân từ dữ liệu mẫu.','error'],
  timeout:['Chưa nhận được phản hồi','Hãy thử lại hoặc tiếp tục chỉ với sở thích. Không tự chuyển sang thành công mẫu.','error'],
  rate:['Vui lòng chờ trước khi thử lại','429 minh họa: Retry-After là 5 giây. Bản thiết kế không gửi lại yêu cầu tự động.','warning'],
  schema:['Dữ liệu phản hồi chưa hợp lệ','Không lưu một phần hồ sơ. Hãy thử lại; các câu trả lời của bạn vẫn được giữ.','error'],
  cancelled:['Đã hủy lần xử lý trước','Phản hồi cũ không thể thay thế lựa chọn mới của bạn.','warning']
 };
 const entry=blocks[state.filePhase];if(!entry)return '';
 return '<div class="feedback '+entry[2]+'" '+(entry[2]==='error'?'role="alert"':'role="status"')+'><strong>'+entry[0]+'</strong><p>'+entry[1]+'</p>'+(state.file?'<p>Tệp: '+esc(state.file.name)+'</p>':'')+'<div class="file-actions">'+(['processing','validating'].includes(state.filePhase)?'<button class="text-button" id="cancel-file">Hủy xử lý</button>':'')+(['error','timeout','rate','schema','partial','cancelled'].includes(state.filePhase)?'<button class="text-button" id="retry-file" '+(Date.now()<state.rateUntil?'disabled':'')+'>Thử lại mẫu</button>':'')+(state.file?'<button class="text-button" id="remove-file">Bỏ tệp</button>':'')+'</div></div>';
}
function evidence(){
 return '<h2 id="stage-title" tabindex="-1">Bạn muốn bắt đầu từ đâu?</h2><p class="intro">Dùng bảng điểm hoặc CV nếu bạn có. Bạn cũng có thể chỉ chia sẻ sở thích của mình.</p>'+
 '<fieldset class="choice-group"><legend>Thông tin bạn có thể cung cấp</legend>'+
 '<label class="path-choice"><input type="radio" name="path" value="record" '+(state.path==='record'?'checked':'')+'><span><strong>Tôi có bảng điểm hoặc CV</strong><small>Chọn một tệp PDF và kiểm tra trước khi tiếp tục.</small></span></label>'+
 '<label class="path-choice"><input type="radio" name="path" value="survey" '+(state.path==='survey'?'checked':'')+'><span><strong>Tôi muốn bắt đầu từ sở thích</strong><small>Không cần bảng điểm. Không tự bổ sung điểm hay kỹ năng.</small></span></label></fieldset>'+
 (state.path==='record'?'<div class="dropzone" id="dropzone"><strong>Chọn hoặc kéo PDF vào đây</strong><label class="muted" for="file">Một tệp PDF, tối đa 10 MiB</label><input class="file-control" id="file" type="file" accept=".pdf,application/pdf" aria-describedby="file-hint file-state"><p id="file-hint">Chỉ kiểm tra trên thiết bị. Nội dung tệp không được gửi đi.</p><button class="text-button" id="sample-file">Dùng tệp minh họa</button></div><div id="file-state">'+fileFeedback()+'</div>':'')+
 (state.path==='survey'?'<div class="no-evidence"><strong>Chỉ dùng câu trả lời của bạn</strong><br>Phần học tập sẽ được ghi là chưa có dữ liệu. Bạn có thể bổ sung hồ sơ sau.</div>':'');
}
function survey(){
 const labels=['Rất ít phù hợp','Ít phù hợp','Trung lập','Phù hợp','Rất phù hợp'];
 return '<h2 id="stage-title" tabindex="-1">Điều gì khiến bạn hứng thú?</h2><p class="intro">Chọn mức phù hợp với bạn, không phải mức giỏi của bạn. Mỗi câu có một câu trả lời riêng.</p>'+
 '<p class="muted">Câu '+(state.page*5+1)+'–'+(state.page*5+5)+' / 10 · Khảo sát khám phá, không phải chẩn đoán tâm lý.</p>'+
 questions.slice(state.page*5,state.page*5+5).map(q=>'<fieldset class="question"><legend><span>'+q.id+'.</span>'+esc(q.text)+'</legend><div class="scale">'+[1,2,3,4,5].map(n=>'<label><input type="radio" name="q'+q.id+'" value="'+n+'" '+(state.answers[q.id]===n?'checked':'')+' aria-label="'+n+' - '+labels[n-1]+'"><span aria-hidden="true">'+n+'</span></label>').join('')+'</div><div class="scale-ends" aria-hidden="true"><span>Rất ít phù hợp</span><span>Rất phù hợp</span></div></fieldset>').join('');
}
function interests(){
 return '<h2 id="stage-title" tabindex="-1">Bạn muốn tìm hiểu hướng nào?</h2><p class="intro">Chọn từ 1 đến 5 hướng. Đây là sở thích để khám phá, không phải đăng ký chuyên ngành.</p><p class="muted" id="tag-count">'+state.tags.length+'/5 hướng đã chọn</p><div class="tag-list">'+tags.map(t=>'<label class="tag"><input type="checkbox" value="'+t.id+'" '+(state.tags.includes(t.id)?'checked':'')+'><span>'+esc(t.label)+'<small>'+esc(t.category)+'</small></span></label>').join('')+'</div><p class="muted" id="tag-error" role="alert"></p>';
}
function review(){
 const derived=scores(state.answers);
 const rows='<div><dt>Minh chứng</dt><dd>'+(state.path==='survey'?'Chỉ sở thích; chưa có hồ sơ học tập':esc(state.file?.name||'Tệp minh họa')+'<br><small>Không bóc tách hồ sơ thật trong prototype</small>')+'</dd></div>'+
 '<div><dt>Khảo sát</dt><dd>'+count()+'/10 câu đã trả lời</dd></div><div><dt>Hướng quan tâm</dt><dd><ul>'+tags.filter(t=>state.tags.includes(t.id)).map(t=>'<li>'+esc(t.label)+'</li>').join('')+'</ul></dd></div>';
 return '<h2 id="stage-title" tabindex="-1">Kiểm tra lại trước khi tiếp tục</h2><p class="intro">Bạn có thể quay lại chỉnh sửa. Bản xem thử chỉ chuẩn bị dữ liệu bàn giao, không phân tích chuyên ngành thật.</p><span class="source">DEMO · Dữ liệu xem thử</span><dl class="summary">'+rows+'</dl>'+
 '<details><summary>Xem sáu nhóm sở thích đã tính</summary><p>'+Object.entries(derived).map(([g,n])=>g+': '+(n===null?'Chưa đủ':Number(n.toFixed(2)))).join(' · ')+'</p><p>DERIVED: trung bình các câu cùng nhóm; không phải điểm năng lực.</p></details>'+
 (state.analysis==='error'?'<div class="feedback error" role="alert"><strong>Chưa thể tiếp tục phân tích</strong><p>Lỗi dịch vụ minh họa. Câu trả lời vẫn được giữ. Thử lại hoặc chủ động mở bàn giao demo.</p><button id="explicit-demo" class="secondary">Mở bàn giao demo</button></div>':'')+
 (state.analysis==='pending'?'<div class="feedback" role="status"><strong>Đang chuẩn bị bàn giao mẫu…</strong><p>Không gửi dữ liệu lên máy chủ.</p><button class="text-button" id="cancel-analysis">Hủy</button></div>':'');
}
function handoff(){
 return '<span class="source">DEMO · Chưa kết nối Analytics</span><h2 id="stage-title" tabindex="-1">Thông tin đã sẵn sàng để bàn giao.</h2><p class="intro">Bạn đã hoàn thành phần hồ sơ và sở thích trong bản thiết kế. Kết quả gợi ý ngành thuộc module Analytics.</p><div class="feedback success"><strong>Giữ đúng thông tin bạn đã chọn</strong><p>'+state.tags.length+' hướng quan tâm, 10 câu trả lời độc lập. Không thêm GPA, môn học hay kỹ năng mẫu.</p></div><details><summary>Xem dữ liệu bàn giao mẫu</summary><pre>'+esc(JSON.stringify(state.output,null,2))+'</pre></details><p class="muted">Với hồ sơ chỉ có sở thích, lộ trình cần thêm ngữ cảnh học tập theo quyết định XD-01. Bản thiết kế không tự chọn học kỳ.</p><button class="secondary" id="edit-input">Chỉnh sửa thông tin</button>';
}
function render(focus=false){
 $('#stage').innerHTML=[evidence,survey,interests,review,handoff][state.stage]();
 controls();bind();
 if(focus)$('#stage-title').focus();
}
function bind(){
 document.querySelectorAll('input[name="path"]').forEach(el=>el.onchange=()=>{
  state.fileVersion++;state.path=el.value;state.file=null;state.filePhase='empty';invalidate();render();
  $('input[name="path"]:checked').focus();announce('Đã đổi cách nhập liệu. Hồ sơ cũ được bỏ; câu trả lời sở thích vẫn được giữ.');
 });
 document.querySelectorAll('.scale input').forEach(el=>el.onchange=()=>{state.answers[Number(el.name.slice(1))]=Number(el.value);invalidate();controls();announce(count()+'/10 câu đã trả lời.');});
 document.querySelectorAll('.tag input').forEach(el=>el.onchange=()=>{
  const r=toggleTag(state.tags,el.value);state.tags=r.selected;el.checked=state.tags.includes(el.value);invalidate();controls();
  $('#tag-count').textContent=state.tags.length+'/5 hướng đã chọn';$('#tag-error').textContent=r.error?'Bạn đã chọn 5 hướng. Bỏ một hướng trước khi chọn thêm.':'';
  announce(state.tags.length+'/5 hướng đã chọn.');
 });
 if($('#file'))$('#file').onchange=e=>acceptFiles(e.target.files);
 const drop=$('#dropzone');if(drop){drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag');};drop.ondragleave=()=>drop.classList.remove('drag');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag');acceptFiles(e.dataTransfer.files);};}
 if($('#sample-file'))$('#sample-file').onclick=()=>sampleFile();
 if($('#remove-file'))$('#remove-file').onclick=()=>{state.fileVersion++;state.file=null;state.filePhase='empty';invalidate();render();$('#file')?.focus();announce('Đã bỏ tệp. Phản hồi cũ sẽ bị bỏ qua.');};
 if($('#cancel-file'))$('#cancel-file').onclick=()=>{state.fileVersion++;state.filePhase='cancelled';invalidate();render();$('#file')?.focus();announce('Đã hủy xử lý.');};
 if($('#retry-file'))$('#retry-file').onclick=()=>sampleFile();
 if($('#explicit-demo'))$('#explicit-demo').onclick=()=>finishDemo();
 if($('#cancel-analysis'))$('#cancel-analysis').onclick=()=>{invalidate();render();$('#next').focus();announce('Đã hủy bàn giao mẫu.');};
 if($('#edit-input'))$('#edit-input').onclick=()=>{invalidate();state.stage=0;render(true);};
}
async function acceptFiles(files){
 const v=++state.fileVersion;invalidate();state.file=null;state.filePhase='validating';state.fileError=null;
 if(files.length!==1){state.filePhase='error';state.fileError='MULTIPLE_FILES';render();return;}
 const f=files[0];state.file={name:f.name,size:f.size,type:f.type};render();
 try{
  const header=new TextDecoder().decode(await f.slice(0,5).arrayBuffer());
  if(v!==state.fileVersion)return;
  state.fileError=validateFile(f,header);state.filePhase=state.fileError?'error':'validated';render();announce(state.fileError?'Tệp chưa hợp lệ. Xem hướng dẫn sửa.':'Đã kiểm tra tệp trên thiết bị; không có nội dung được tải lên.');
 }catch{if(v!==state.fileVersion)return;state.filePhase='error';state.fileError='READ_ERROR';render();}
}
async function sampleFile(){
 if(Date.now()<state.rateUntil)return;
 const v=++state.fileVersion;state.path='record';state.file={name:'bang-diem-minh-hoa.pdf'};state.filePhase='processing';state.fileError=null;invalidate();render();announce('Đang mô phỏng xử lý tệp mẫu.');
 await new Promise(r=>setTimeout(r,800));
 if(v!==state.fileVersion)return;state.filePhase='success';render();announce('Tệp minh họa đã sẵn sàng. Không phải hồ sơ thật.');
}
function finishDemo(){state.output=payload(state);state.analysis='complete';state.stage=4;render(true);announce('Đã tạo bàn giao demo cục bộ.');}
$('#next').onclick=async()=>{
 if(!canNext())return;
 if(state.stage===3){
  const v=++state.analysisVersion;state.analysis='pending';render();await new Promise(r=>setTimeout(r,650));
  if(v!==state.analysisVersion)return;
  if(state.scenario==='analysis-error'){state.analysis='error';render();announce('Lỗi phân tích mẫu. Câu trả lời được giữ.');return;}
  finishDemo();return;
 }
 if(state.stage===1&&state.page===0)state.page=1;else state.stage++;
 render(true);announce('');
};
$('#back').onclick=()=>{invalidate();if(state.stage===1&&state.page===1)state.page=0;else{state.stage--;if(state.stage===1)state.page=1;}render(true);announce('');};
$('#inspector-toggle').onclick=()=>{const open=$('#inspector').hidden;$('#inspector').hidden=!open;$('#inspector-toggle').setAttribute('aria-expanded',String(open));};
$('#apply-scenario').onclick=()=>{
 clearTimeout(rateTimer);state.fileVersion++;invalidate();state.scenario=$('#scenario').value;state.rateUntil=0;
 if(state.scenario==='default'){Object.assign(state,{stage:0,page:0,path:null,answers:{},tags:[],file:null,filePhase:'empty',fileError:null});}
 else if(state.scenario==='analysis-error'){
  Object.assign(state,{stage:3,path:'survey',tags:[tags[0].id],answers:Object.fromEntries(questions.map(q=>[q.id,3])),analysis:'error'});
 }else{
  state.stage=0;state.path='record';state.file={name:'bang-diem-minh-hoa.pdf'};state.filePhase=state.scenario;state.fileError=null;
  if(state.scenario==='rate'){state.rateUntil=Date.now()+5000;rateTimer=setTimeout(()=>{controls();if($('#retry-file'))$('#retry-file').disabled=false;announce('Đã hết thời gian chờ minh họa. Có thể thử lại.');},5000);}
 }
 render(true);announce('Đang xem kịch bản minh họa: '+$('#scenario').selectedOptions[0].textContent);
};
render();
