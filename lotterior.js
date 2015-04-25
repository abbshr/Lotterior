// RewardsPool

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Lotterior = module.exports = function (options) {
  if (this.constructor !== Lotterior)
    return new Lotterior(options);
  this._id = options.id;
  this._summary = util.isNumber(options.summary) && options.summary > 0 ? options.summary : 0;
  this._round = util.isNumber(options.round) && options.round > 0 ? options.round : 1;
  this._max = util.isNumber(options.max) && options.max > 0 ? options.max : 1;
  this._levels = util.isArray(options.levels) ? options.levels : [1];
  this._rewards = util.isArray(options.rewards) ? options.rewards : [];
  this._candidates = util.isArray(options.candidates) ? options.candidates : [];
  this._algorithm = util.isFunction(options._algorithm) ? options._algorithm : this._default;
};

util.inherits(Lotterior, EventEmitter);

Lotterior.initialize = function (options) {
  return new Lotterior(options);
};

// property: @full
Object.defineProperty(Lotterior.prototype, 'full', {
  get: function () { 
    return this._rewards.length >= this._max 
  },
  writeable: false,
  configurable: false
});

Object.defineProperty(Lotterior.prototype, 'count', {
  get: function () {
    return this._rewards.length;
  },
  writeable: false,
  configurable: false
});

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
  if (util.isArray(options.rewards))
    this._rewards = options.rewards;
  if (util.isArray(options.candidates))
    this._candidates = options.candidates;
  if (util.isFunction(options._algorithm))
    this._algorithm = options._algorithm;
};

Lotterior.prototype.push = function (reward) {
  if (this.full)
    return false;
  this._rewards.push(reward);
  this._summary++;
  this.full && this._lottery();
  return true;
};

Lotterior.prototype.flush = function () {
  this._round++;
  this._rewards = [];
};

Lotterior.prototype.wait = function () {
  this.full && this._lottery();
  return this;
};

Lotterior.prototype.lottery = function () {
  this._lottery();
};

Lotterior.prototype._lottery = function () {  
  if (this._candidates.length)
    this.emit('ERNIE', this._candidates);
  else
    this.emit('ERNIE', this._algorithm(this._rewards, this._levels, this._max));
};

Lotterior.prototype._default = function (collection, levels, max) {
  /*var winner;
  // get a random head-index
  var index = hat.rack(5, 10)() % max;
  var offset = index + levels - max;
  if (offset > 0)
    winner = collection.slice(index).concat(collection.slice(0, offset));
  else
    winner = collection.slice(index, index + levels);

  return winner;*/
};