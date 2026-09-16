import test from 'node:test';
import assert from 'node:assert/strict';
import {axes,fixtures,validate,createState,scenario,selectMajor,begin,finish,invalidate,canHandoff} from '../prototype/model.mjs';
test('fixture validity, bounds, distinct IDs and skill groups',()=>{
 assert.equal(validate(fixtures),true);
 for(const mutate of [a=>a[0].score=101,a=>a[1].id=a[0].id,a=>a[0].current[0]=NaN,a=>a[0].axisIds.pop(),a=>a[0].skills.push(a[0].skills[0])]){const a=structuredClone(fixtures);mutate(a);assert.equal(validate(a),false);}
 assert.equal(axes.length,6);assert.equal(validate([]),true);
});
test('selection keeps baseline immutable and handoff scoped to selected major',()=>{
 const s=createState(),original=JSON.stringify(s.items);selectMajor(s,'web');const t=begin(s);assert.equal(selectMajor(s,'security'),false);assert.equal(begin(s),null);assert.equal(finish(s,t),true);assert.equal(s.handoff.majorId,'web');assert.deepEqual(s.handoff.missingSkills,['Kiểm thử tích hợp']);selectMajor(s,'ai');assert.equal(s.handoff,null);assert.equal(JSON.stringify(s.items),original);
});
test('invalidation rejects late responses',()=>{const s=createState(),t=begin(s);invalidate(s);assert.equal(finish(s,t),false);assert.equal(canHandoff(s),false);assert.equal(s.handoff,null);});
test('partial, unavailable and missing context block handoff without zero filling',()=>{
 for(const mode of ['partial','unavailable','missing-context','stale']){const s=createState();scenario(s,mode);assert.equal(canHandoff(s),false);if(mode==='partial')assert.deepEqual(s.items[0].current,Array(6).fill(null));}
});
test('errors preserve selection; explicit retry works',()=>{const s=createState();selectMajor(s,'security');finish(s,begin(s),true);assert.equal(s.mode,'roadmap-error');assert.equal(s.selected,'security');assert.equal(canHandoff(s),true);finish(s,begin(s));assert.equal(s.handoff.majorId,'security');});
