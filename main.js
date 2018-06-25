const { SHA256 }  = require('crypto-js');
const block_chain = {};
const go = (seed, ...fns) => fns.reduce((res, f) => f(res), seed);
const tap = fn => arg => (fn(arg), arg);

function mining(previousHash, timestamp, transactions, diff) {
  let block = { previousHash, timestamp, transactions, nonce: 0 };
  block.hash = calculate_hash(block);
  
  while (block.hash.substring(0, diff) !== Array(diff + 1).join('0')) {
    block.nonce++;
    block.hash = calculate_hash(block);
  }

  return block;
}

function calculate_hash(block) {
  let { previousHash, timestamp, transactions, nonce } = block;
  return SHA256(previousHash + timestamp + JSON.stringify(transactions) + nonce).toString();
}

var d = 2, prev_hash = '';

function add_block(block) {
  // 검증 절차를 거친 뒤 아래 활동을 해야함
  // 채굴에 성공한 노드가 보상을 받아감
  block_chain[block.hash] = block;
  prev_hash = block.hash;
  return block_chain;
}

console.log('\n\n< 체인 시작 />')
!function recur(trx) {
  console.log("\n\n=== 채굴 시작 ===");
  return go(
    mining(prev_hash, new Date(), trx, d++),
    tap(console.log),
    add_block,
    function(chain) {
      console.log(`=== 채굴 성공: 블록 길이 => ${Object.keys(chain).length} ===`)
      return d < 5 ? recur(trx) : console.log('\n\n< 체인 종료 />');
    }
  )
}([{ a: 10, b: -10 }, { a: -10, b: 20, c: -10 }])
