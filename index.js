const RedisStore = require('./lib/redis_store.js');
const redisStore = new RedisStore();
redisStore.on('ready', function() {
  console.log('redis ready');

  this.set("a", {a:10}, 100000, {rolling: true, changed: true})
  .then(function(res) {
    console.log(res);
  })
});