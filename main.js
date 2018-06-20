const { SHA256 }  = require('crypto-js');
const block_chain = {};
const merkle_tree  = {};
const go = (seed, ...fns) => fns.reduce((res, f) => f(res), seed);
var prev_hash = '';

function make_block(t, tx, prv = '', d = 2) {
  let { nonce, hash } = mining(prv, t, tx, d, 0);
  return {
    previousHash: prv,
    timestamp: t,
    transactions: tx, 
    nonce,
    hash
  }
}

function mining(prv, t, tx, d, nonce){
  let hash = SHA256(prv + t + JSON.stringify(tx) + nonce).toString();
  while (hash.substring(0, d) !== Array(d + 1).join("0")) {
    nonce++;
    hash = SHA256(prv + t + JSON.stringify(tx) + nonce).toString();
  }
  return { hash, nonce };
}

function add_block(block) {
  block_chain[block.hash] = block;
  prev_hash = block.hash;
  return block_chain;
}

var i = 0;
!function recur(tx) {
  console.log("=== 채굴 시작 ===");
  return go(make_block(new Date(), tx, prev_hash, 4),
    add_block,
    console.log,
    function() {
      i++;
      console.log("=== 채굴 성공 ===")
      return i < 5 ? recur(tx) : console.log('=== 체인 종료 ===');
    }
  )
}([{ a: 10, b: -10 }, { a: -10, b: 20, c: -10 }])

