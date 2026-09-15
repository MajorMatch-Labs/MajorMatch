import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFile, toggleTag, scores, payload, questions, tags, MAX_BYTES } from '../prototype/model.mjs';
test('PDF maximum, empty, MIME, signature and extension boundaries', () => {
  const pdf = {name:'TRANSCRIPT.PDF',type:'application/pdf',size:MAX_BYTES};
  assert.equal(validateFile(pdf,'%PDF-'),null);
  assert.equal(validateFile({...pdf,size:MAX_BYTES+1},'%PDF-'),'FILE_TOO_LARGE');
  assert.equal(validateFile({...pdf,size:0},'%PDF-'),'EMPTY_FILE');
  assert.equal(validateFile({...pdf,type:''},'%PDF-'),'EMPTY_MIME');
  assert.equal(validateFile({...pdf,type:'text/plain'},'%PDF-'),'WRONG_MIME');
  assert.equal(validateFile({...pdf,name:'fake.exe'},'%PDF-'),'WRONG_EXTENSION');
  assert.equal(validateFile(pdf,'other'),'BAD_HEADER');
});
test('independent answers and exact group means', () => {
  const input=[1,5,2,4,5,1,3,4,3,5];
  const answers=Object.fromEntries(input.map((n,i)=>[i+1,n]));
  assert.deepEqual(scores(answers),{R:3,I:3,A:5,S:1,E:4,C:4});
  assert.equal(answers[1],1); assert.equal(answers[2],5);
  assert.equal(scores({1:3}).R,null);
  assert.equal(scores({1:0,2:5}).R,null);
});
test('tag limit, remove and unknown identifiers', () => {
  const five=tags.slice(0,5).map(t=>t.id);
  assert.equal(toggleTag(five,tags[5].id).error,'TOO_MANY_TAGS');
  const four=toggleTag(five,five[0]).selected;
  assert.equal(toggleTag(four,tags[5].id).selected.length,5);
  assert.equal(toggleTag([],'invented').error,'UNKNOWN_TAG');
});
test('survey-only handoff preserves tags and has no fabricated academic evidence', () => {
  const answers=Object.fromEntries(questions.map(q=>[q.id,3]));
  const selected=[tags[0].id,tags[1].id];
  const result=payload({path:'survey',answers,tags:selected});
  assert.equal(result.profile,null);assert.equal(result.evidence_path,'survey-only');
  assert.deepEqual(result.target_career_tags,selected);
  assert.equal('gpa' in result,false);assert.equal('user_skills' in result,false);
  answers[1]=5;selected.pop();
  assert.equal(result.answers[1],3);assert.equal(result.target_career_tags.length,2);
  assert.throws(()=>payload({path:'survey',answers:{},tags:[]}));
  assert.throws(()=>payload({path:null,answers,tags:[tags[0].id]}));
});
