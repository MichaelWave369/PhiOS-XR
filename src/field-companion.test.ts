import {describe, it, expect} from 'vitest';
import {parseFieldCompanion, createFieldCompanionReceiver} from './field-companion.mjs';
const good = {format:'phi-field-companion',version:1,
  profile:{alias:'Explorer 369',pinned:['xr','live'],last:'xr'},
  appearance:{effects:'off'}};
describe('Field Companion v1 receiver', () => {
  it('accepts manual gateway JSON and preserves only non-privileged preferences', () => {
    const receiver=createFieldCompanionReceiver();
    expect(receiver.importJSON(JSON.stringify(good)).persisted).toBe(false);
    expect(receiver.snapshot()).toEqual(good);
    expect(JSON.parse(receiver.exportJSON()!)).toEqual(good);
    receiver.clear();
    expect(receiver.snapshot()).toBeNull();
  });
  it('rejects extra grants, wrong versions, malformed routes and duplicate pins', () => {
    const cases=[
      {...good,permissions:'all'},
      {...good,version:2},
      {...good,profile:{...good.profile,pinned:['xr','xr']}},
      {...good,profile:{...good.profile,last:'https://example.net'}},
      {...good,appearance:{effects:'off',secret:true}},
    ];
    for(const entry of cases)expect(()=>parseFieldCompanion(JSON.stringify(entry))).toThrow();
    expect(()=>parseFieldCompanion(' '.repeat(16385))).toThrow();
  });
});
