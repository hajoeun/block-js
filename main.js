const { SHA256 }  = require('crypto-js');
const block_chain = {};
const merkle_tree  = {};
const go = (seed, ...fns) => fns.reduce((res, f) => f(res), seed);
const tap = fn => arg => (fn(arg), arg);
var prev_hash = '';

function make_block(time, trx, prev = '', diff = 2) {
  let { nonce, hash } = mining(prev, time, trx, diff, 0);
  return {
    previousHash: prev,
    timestamp: time,
    transactions: trx, 
    nonce,
    hash
  }
}

function mining(prev, time, trx, diff, nonce){
  let hash = SHA256(prev + time + JSON.stringify(trx) + nonce).toString();
  
  while (hash.substring(0, diff) !== Array(diff + 1).join("0"))
    hash = SHA256(prev + time + JSON.stringify(trx) + (++nonce)).toString();

  return { hash, nonce };
}

function add_block(block) {
  // 검증 절차를 거친 뒤 아래 활동을 해야함
  // 채굴에 성공한 노드가 보상을 받아감
  block_chain[block.hash] = block;
  prev_hash = block.hash;
  return block_chain;
}

var i = 2;
console.log('\n\n< 체인 시작 />')
!function recur(trx) {
  console.log("\n\n=== 채굴 시작 ===");
  return go(
    make_block(new Date(), trx, prev_hash, i++),
    tap(console.log),
    add_block,
    function(chain) {
      console.log(`=== 채굴 성공: 블록 길이 => ${Object.keys(chain).length} ===`)
      return i < 5 ? recur(trx) : console.log('\n\n< 체인 종료 />');
    }
  )
}([{ a: 10, b: -10 }, { a: -10, b: 20, c: -10 }])

