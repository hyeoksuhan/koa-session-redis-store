# koa-session-redis-store

This is a redis store module for [koa-session](https://www.npmjs.com/package/koa-session).  
It can be used like this:

```js
const session = require('koa-session');
const RedisStore = require('koa-session-redis-store');
const Koa = require('koa');
const app = new Koa();

app.keys = ['some secret hurr'];

const CONFIG = {
  store: new RedisStore(),
  // The others options for koa-session
};
```

## Install
```shell
$ npm install koa-session-redis-store
```

## API
> **Constructor**  
```js
const redisStore = new RedisStore(opts);
```
**opts**: The [options](https://github.com/NodeRedis/node_redis#options-object-properties) that will be passed to redis client([node_redis](https://www.npmjs.com/package/redis)).

> **Events**

It could catch the [events](https://www.npmjs.com/package/redis#connection-and-other-events) from where redis client.
```js
redisStore.on('ready', function() {

});

redisStore.on('connect', function() {

});

redisStore.on('reconnecting', function(reconnectParams) {

});
  
redisStore.on('error', function(err) {

});
  
redisStore.on('end', function() {

});

redisStore.on('warning', function(msg) {

});
```

> **Close connection**

Close function is executed as asynchrous by using [bluebird](http://bluebirdjs.com/).
```js
redisStore.close()
.delay(1000) // It allows to use the bluebird api
.then(function(result) {
  console.log(result);
});
```

or also can be called using async/await.

```js
const close = async () => {
  const result = await redisStore.close();
  console.log(result);
};
```

## License
MIT