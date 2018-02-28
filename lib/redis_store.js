const Promise = require('bluebird');
const EventEmitter = require('events');
const redis = require('redis');
const util = require('util');
const debug = require('debug')('koa-session-redis-store');

Promise.promisifyAll(redis.RedisClient.prototype);

function RedisStore(opts) {
  if (!(this instanceof RedisStore)) {
    return new RedisStore(opts);
  }

  EventEmitter.call(this);

  const client = redis.createClient(opts);

  client.on('ready', (function() {
    debug('event:: redis ready');
    this.emit('ready');
  }).bind(this));

  client.on('connect', (function() {
    debug('event:: redis connect');
    this.emit('connect');
  }).bind(this));

  client.on('reconnecting', (function(reconnectParams) {
    debug('event:: redis reconnecting: %o', reconnectParams);
    this.emit('reconnecting', reconnectParams);
  }).bind(this));

  client.on('error', (function(err) {
    debug('event:: redis error: %s', err.message || 'no message');
    this.emit('error', err);
  }).bind(this));

  client.on('end', (function() {
    debug('event:: redis end');
    this.emit('end');
  }).bind(this));

  client.on('warning', (function(msg) {
    debug('event:: redis warning: %s', msg);
    this.emit('warning', msg);
  }).bind(this));

  this.client = client;
}

util.inherits(RedisStore, EventEmitter);

RedisStore.prototype.get = function(key, maxAge, opts) {
  return this.client.getAsync(key)
    .then (function(json) {
      const value = JSON.parse(json);
      debug('get:: key: %s, value: %o, rolling: %s', key, value, opts.rolling);
      return value;
    });
};

RedisStore.prototype.set = function(key, json, maxAge, opts) {
  const rolling = opts.rolling;
  const changed = opts.changed;

  if (rolling || changed) {
    const value = JSON.stringify(json);
    debug('set:: key: %s, value: %s, rolling: %s, changed: %s', key, value, opts.rolling, opts.changed);
    return this.client.setAsync(key, JSON.stringify(json), 'PX', maxAge);
  } else {
    return Promise.resolve();
  }
};

RedisStore.prototype.destroy = function(key) {
  debug('del:: ' + key);
  return this.client.delAsync(key);
};

RedisStore.prototype.close = function() {
  debug('close');
  return this.client.quitAsync();
};

module.exports = RedisStore;