util = require 'util'
{ EventEmitter } = require 'events'

###
## Lotterior settings #
##
## @id: pool's id
## @summary: historical statistics. the numbers of `push()` called
## @round: the nth round
## @max: the capacity of the pool
## @levels: levels of the rewards with people numbers, e.g. [ 1, 2, 3 ]
## @pool: rewards pool, e.g. [{body}, {body}, ...]
## @candidates: set the winner by hands, e.g. ["ran", "hr"]
## @algorithm: winners-select-algorithm, use builtin or custom algorithm, default to "IN-ORDER"
##
###

module.exports = class Lotterior extends EventEmitter
  constructor: (options) ->
    return new Lotterior options if @constructor isnt Lotterior
    @_id = options?.id
    @_summary = if util.isNumber(options?.summary) and options.summary > 0 then options.summary else 0
    @_round = if util.isNumber(options?.round) and options.round > 0 then options.round else 1
    @_max = if util.isNumber(options?.max) and options.max > 0 then options.max else 1
    @_levels = if util.isArray options?.levels then options.levels else [1]
    @_pool = if util.isArray options?.pool then options.pool else []
    @_candidates = if util.isArray options?.candidates then options.candidates else []
    @_algorithm = if util.isString options?.algorithm
      @_builtIn[options.algorithm] ? @_builtIn["IN-ORDER"]
    else if util.isFunction options?.algorithm
      options.algorithm
    else
      @_builtIn["IN-ORDER"]

  config: (options) =>
    @_max = options.max if util.isNumber options?.max and options.max > 0
    @_levels = options.levels if util.isArray options?.levels
    @_pool = options.pool if util.isArray options?.pool
    @_candidates = options.candidates if util.isArray options?.candidates
    console.log @_builtIn[options.algorithm]?
    if util.isString(options?.algorithm) and @_builtIn[options.algorithm]?
      @_algorithm = @_builtIn[options.algorithm]
      console.log @_algorithm.toString()
    else if util.isFunction options?.algorithm
      @_algorithm = options.algorithm
    @

  push: (reward) =>
    return false if @full is yes
    @_pool.push reward
    @_summary++
    @full and @emit 'lottery'
    true

  flush: () =>
    @_round++
    @_pool = []
    @

  wait: () =>
    if @full is yes
      @_lottery()
    else if @listeners('lottery').length is 0
      @once 'lottery', @_lottery
    @

  lottery: () =>
    clearInterval @_loop
    delete @_loop
    @_lottery()

  _lottery: () =>
    if @_candidates.length
      @emit 'ERNIE', @_candidates
    else
      @emit 'ERNIE', @_algorithm(@_pool, @_levels)

  looping: (interval, callback) =>
    max = @_pool.length
    @_loop = setInterval (-> callback parseInt(Math.random() * max)), interval

  _builtIn:
    "RANDOM": (collection, levels) ->
      max = collection.length
      ret = []
      for count in levels
        collection[randNum] for i in [0...count] when (randNum = random ret, max)?

    "IN-ORDER": (collection, levels) ->
      max = collection.length
      fst = parseInt(Math.random() * max)
      index = fst
      counter = 0

      for count, level in levels
        counter += (count = max - counter if count > max - counter)
        if 0 < offset = index + count - max
          collection[index..].concat collection[0...index = offset]
        else
          collection[index...index += count]

Object.defineProperties Lotterior::, {
  full:
    get: -> @_pool.length >= @_max
    configurable: no
  round:
    get: -> @_round
    configurable: no
  count:
    get: -> @_pool.length
    configurable: no
}

Lotterior.initialize = (options) => new @ options

random = (collection, max) ->
  while max > (sign for sign in collection when sign?).length
    rand = parseInt(Math.random() * max)
    continue if collection[rand]?
    collection[rand] = yes
    break
  rand
