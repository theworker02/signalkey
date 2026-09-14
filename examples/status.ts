import {SignalKey} from '../packages/sdk';
const key=await SignalKey.local();await key.light('unknown');console.log('Doing real local work…');
try{const result=Array.from({length:1000},(_,i)=>i).reduce((a,b)=>a+b,0);if(result!==499500)throw new Error('Incorrect sum');await key.light('success');console.log(`Computed ${result}; status lease lasts six seconds.`);}catch(e){await key.light('failure');throw e;}
