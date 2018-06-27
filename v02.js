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

const MY_ADDRESS = '0001';

go(mining(G.HEAD, new Date(), [{ A: -10, B: 10 }], G.DIFF),
  add_block,
  reward_to(MY_ADDRESS),
  () => console.log('Block Chain:', G.CHAIN),
  () => console.log(`${MY_ADDRESS}'s Balance:`, G.USERS[MY_ADDRESS].balance));