const { SHA256 }  = require('crypto-js');
const { go, every, reduce, keys } = require('./lib/functions');
let G = typeof window == 'object' ? window : global;

G.CHAIN = {};
G.DIFF = 2;
G.HEAD = '';
G.TRX = [];

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
      G.TRX = [];
      transaction('0000', address, G.DIFF * 10);
      G.DIFF++;
    }
  }
}

function transaction(fromAddress, toAddress, amount) {
  if (get_balance(fromAddress) >= amount)
    G.TRX.push({ fromAddress, toAddress, amount });
  return G.TRX;
}

function sum_balance(trx, init, address) {
  return reduce(trx, (b, t) => {
    if (t.fromAddress === address) b -= t.amount;
    if (t.toAddress === address) b += t.amount;
    return b;
  }, init);
}

function get_balance(address) {
  if (address === '0000') return 1000;
  return sum_balance(G.TRX, balance_from_chain(address), address);
}

function balance_from_chain(address) {
  return reduce(G.CHAIN, (sum, block) => sum_balance(block.transactions, sum, address), 0);
}

function is_chain_valid(chain) {
  return every(chain, block => {
    const previous = chain[block.previousHash];
    if (block.hash !== calculate_hash(block)) return false;
    if (block.previousHash === '') return true; // Genesis Block
    if (block.previousHash !== calculate_hash(previous)) return false;
    return true;
  });
}

/* 거래 발생 및 채굴 */
const MY_ADDRESS = '0001';

transaction('0000', '0001', 100);
transaction(MY_ADDRESS, '0002', 20);
transaction(MY_ADDRESS, '0003', 30); // <-- 잔액 부족!

go(mining(G.HEAD, new Date(), G.TRX, G.DIFF),
  add_block,
  reward_to(MY_ADDRESS),
  () => console.log('Block Chain:', G.CHAIN),
  () => console.log('My Balance:', get_balance(MY_ADDRESS)));

transaction('0003', MY_ADDRESS, 10);

go(mining(G.HEAD, new Date(), G.TRX, G.DIFF),
  add_block,
  reward_to(MY_ADDRESS),
  () => console.log('Block Chain:', G.CHAIN),
  () => console.log('My Balance:', get_balance(MY_ADDRESS)));

/* 체인 유효성 검사 */
let hash_key = keys(G.CHAIN)[1];

console.log('[ Before ]\n Chain Valid: ', is_chain_valid(G.CHAIN)); // true
console.log('Transactions: ', G.CHAIN[hash_key].transactions, '\n');

G.CHAIN[hash_key].transactions[1].amount = 0; // 거래를 조작

console.log('[ After ]\n Chain Valid: ', is_chain_valid(G.CHAIN)); // false
console.log('Transactions: ', G.CHAIN[hash_key].transactions);