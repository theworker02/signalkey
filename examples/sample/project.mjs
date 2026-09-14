import assert from 'node:assert/strict';
console.log('SignalKey sample · checking a small calculation');
await new Promise(resolve=>setTimeout(resolve,1200));
const add=(a,b)=>a+b;
assert.equal(add(2,3),process.argv.includes('--fail')?6:5,'2 + 3 should equal the expected value');
console.log('PASS · addition returns 5');
