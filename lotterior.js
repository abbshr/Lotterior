
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/* lotterior settings */
/* 
 * @id: pool's id
 * @summary: historical statistics. the numbers of `push()` called
 * @round: the nth round
 * @max: the capacity of the pool
 * @levels: levels of the rewards with people numbers, e.g. [ 1, 2, 3 ]
 * @pool: rewards pool, e.g. [{body}, {body}, ...]
 * @candidates: set the winner by hands, e.g. ["ran", "hr"]
 * @algorithm: winners-select-algorithm, use builtin or custom algorithm, default to "IN-ORDER"
 *
 */
var Lotterior = module.exports = function (options) {
  if (this.constructor !== Lotterior)
    return new Lotterior(options);

  this._id = options.id;
  this._summary = util.isNumber(options.summary) && options.summary > 0 ? options.summary : 0;
  this._round = util.isNumber(options.round) && options.round > 0 ? options.round : 1;
  this._max = util.isNumber(options.max) && options.max > 0 ? options.max : 1;
  this._levels = util.isArray(options.levels) ? options.levels : [1];
  this._pool = util.isArray(options.pool) ? options.pool : [];
  this._candidates = util.isArray(options.candidates) ? options.candidates : [];

  if (util.isString(options.algorithm))
    this._algorithm = this._builtInAlgorithm[options.algorithm] || this._builtInAlgorithm['IN-ORDER'];
  else if (util.isFunction(options.algorithm))
    this._algorithm = options.algorithm;
  else
    this._algorithm = this._builtInAlgorithm['IN-ORDER'];
};

util.inherits(Lotterior, EventEmitter);

Lotterior.initialize = function (options) {
  return new Lotterior(options);
};

// property: @full
Object.defineProperty(Lotterior.prototype, 'full', {
  get: function () { 
    return this._pool.length >= this._max 
  },
  writeable: false,
  configurable: false
});

// property: @count
Object.defineProperty(Lotterior.prototype, 'count', {
  get: function () {
    return this._pool.length;
  },
  writeable: false,
  configurable: false
});

// property: @round
Object.defineProperty(Lotterior.prototype, 'round', {
  get: function () {
    return this._round;
  },
  writeable: false,
  configurable: false
});

Lotterior.prototype.config = function (options) {
  if (util.isNumber(options.max) && options.max > 0)
    this._max = options.max;
  if (util.isArray(options.levels))
    this._levels = options.levels;
  if (util.isArray(options.pool))
    this._pool = options.pool;
  if (util.isArray(options.candidates))
    this._candidates = options.candidates;
  if (util.isString(options.algorithm))
    this._algorithm = this._builtInAlgorithm[options.algorithm] || this._builtInAlgorithm['IN-ORDER'];
  else if (util.isFunction(options.algorithm))
    this._algorithm = options.algorithm;
  return this;
};

// push a object to rewards pool
Lotterior.prototype.push = function (reward) {
  if (this.full)
    return false;
  this._pool.push(reward);
  this._summary++;
  this.full && this.emit('lottery');
  return true;
};

// init to the next round
Lotterior.prototype.flush = function () {
  this._round++;
  this._pool = [];
  return this;
};

// wait on full
Lotterior.prototype.wait = function () {
  if (this.full)
    this._lottery();
  else if (!this.listeners('lottery').length)
    this.once('lottery', this._lottery);
  return this;
};

// run directly
Lotterior.prototype.lottery = function () {
  // stop the looping
  clearInterval(this._loop);
  delete this._loop;
  this._lottery();
};

Lotterior.prototype._lottery = function () {
  if (this._candidates.length)
    this.emit('ERNIE', this._candidates);
  else
    this.emit('ERNIE', this._algorithm(this._pool, this._levels));
};

Lotterior.prototype._builtInAlgorithm = {
  "RANDOM": function (collection, levels) {
    var max = collection.length;
    var ret = [];
    var random_num;

    return levels.map(function (count) {
      var num_ref = [];
      for (var i = 0; i < count; i++) {
        while (max > ret.filter(function (sign) { return sign; }).length) {
          random_num = parseInt(Math.random() * max);
          if (ret[random_num]) continue;
          ret[random_num] = true;
          num_ref.push(random_num);
          break;
        }
      }
      return num_ref.map(function (index) {
        return collection[index];
      });
    });
  },

  "IN-ORDER": function (collection, levels) {
    var max = collection.length;
    var fst = parseInt(Math.random() * max);
    var index = fst;

    return levels.map(function (count) {
      if (fst != index && fst == (index %= max))
        return [];
      
      var offset = index + count - max;
      if (offset > 0) {
        if (offset >= fst + 1) offset = fst;
        tmp_index = index;
        index += count;
        return collection.slice(tmp_index).concat(collection.slice(0, offset));
      } else {
        if (count > fst + 1) count = fst;
        return collection.slice(index, index += count);
      }
    });

  }
   // "FIXED-OFFSET", "FROM-POSITION", "REVERSE"
};

// view of random numbers
Lotterior.prototype.looping = function (interval, callback) {
  var max = this._pool.length;
  this._loop = setInterval(function () {
    callback(parseInt(Math.random() * max));
  }, interval);
};