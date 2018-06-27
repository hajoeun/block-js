const { SHA256 }  = require('crypto-js');
const go = (seed, ...fns) => fns.reduce((res, f) => f(res), seed);
const tap = fn => arg => (fn(arg), arg);

let G = typeof window == 'object' ? window : global;

G.CHAIN = {};
G.DIFF = 2;
G.HEAD = '';
G.USERS = {
  '0001': { name: 'A', balance: 70 },
  '0002': { name: 'B', balance: 50 },
  '0003': { name: 'C', balance: 110 }
};

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

function add_block(block) {
  if (!is_block_valid(block)) return false;
  G.CHAIN[block.hash] = block;
  G.HEAD = block.hash;
  return true;
}

function is_block_valid(block) {
  if (block.hash.substring(0, G.DIFF) !== Array(G.DIFF + 1).join('0')) return false;
  return calculate_hash(block) === block.hash;
}

function reward_to(address) {
  return function(is_success) {
    if (is_success) {
     G.USERS[address].balance += G.DIFF * 10;
     G.DIFF++;
    }
  }
}

function is_chain_valid(chain) {
  return Object.keys(chain).every(hash => {
    const current = chain[hash];
    const previous = chain[current.previousHash];
    if (!previous) return true; // Genesis Block
    if (hash !== calculate_hash(current)) return false;
    if (current.previousHash !== calculate_hash(previous)) return false;
    return true;
  });
}

const MY_ADDRESS = '0001';

console.log('\n\n< 체인 시작 />');
!function recur(trx) {
  console.log("\n\n=== 채굴 시작 ===");
  return go(
    mining(G.HEAD, new Date(), trx, G.DIFF),
    tap(console.log),
    add_block,
    tap(reward_to(MY_ADDRESS)),
    function(is_success) {
      let chain = G.CHAIN;
      console.log(`=== 채굴 ${is_success ? '성공' : '실패'}: 블록 길이 => ${Object.keys(chain).length} ===`);
      return G.DIFF < 5 ? recur(trx) : console.log(`\n== 현재 잔액 ${G.USERS[MY_ADDRESS].balance} | 체인 유효성 ${is_chain_valid(chain)} ==\n< 체인 종료 />`);
    }
  )
}([{ A: -10, B: 10 }]);
