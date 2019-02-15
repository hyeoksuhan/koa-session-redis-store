const EventEmitter = require('events');
const redis = require('redis');
const util = require('util');
const debug = require('debug')('koa-session-redis-store');

class RedisStore extends EventEmitter {
  constructor(opts) {
    super();
    const client = redis.createClient(opts);

    client.on('ready', () => {
      debug('event:: redis ready');
      this.emit('ready');
    });

    client.on('connect', () => {
      debug('event:: redis connect');
      this.emit('connect');
    });

    client.on('reconnecting', (reconnectParams) => {
      debug('event:: redis reconnecting: %o', reconnectParams);
      this.emit('reconnecting', reconnectParams);
    });

    client.on('error', (err) => {
      debug('event:: redis error: %s', err.message || 'no message');
      this.emit('error', err);
    });

    client.on('end', () => {
      debug('event:: redis end');
      this.emit('end');
    });

    client.on('warning', (msg) => {
      debug('event:: redis warning: %s', msg);
      this.emit('warning', msg);
    });

    this.getAsync = util.promisify(client.get).bind(client);
    this.setAsync = util.promisify(client.set).bind(client);
    this.delAsync = util.promisify(client.del).bind(client);
    this.quitAsync = util.promisify(client.quit).bind(client);
  }

  async get(key, maxAge, opts) {
    const json = await this.getAsync(key);
    const value = JSON.parse(json);
    debug('get:: key: %s, value: %o, rolling: %s', key, value, opts.rolling);
    return value;
  }

  set(key, json, maxAge, opts) {
    const rolling = opts.rolling;
    const changed = opts.changed;

    if (rolling || changed) {
      const value = JSON.stringify(json);
      debug('set:: key: %s, value: %s, rolling: %s, changed: %s', key, value, opts.rolling, opts.changed);
      return this.setAsync(key, JSON.stringify(json), 'PX', maxAge);
    }
  }

  destroy(key) {
    debug('del:: ' + key);
    return this.delAsync(key);
  }

  close() {
    debug('close');
    return this.quitAsync();
  }
}

module.exports = RedisStore;