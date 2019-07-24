const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  console.log('worker calculating values...');
  redisClient.hset('values', message, fib(parseInt(message)));
  console.log('worker calculating done...');
});

sub.subscribe('insert', (error, count) => {
  if (error) {
    throw new Error(error);
  }
  console.log('Worker subscribed to insert channel, waiting for message...');
});
