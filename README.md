
# Lotterior

![lottery](http://lewis-manning.co.uk/wp-content/uploads/2015/01/Lottery-Balls-014.jpg)

A lottery machine for Node.js/io.js application, build with ❤ Node.js.

**Lotterior曾用于一个微信公众账号摇奖系统的外包项目, 这个repo将其从原项目中分离, 可以为其他和抽奖具有相似模型的应用使用**

## TODO

+ 增加浏览器端支持.

## Introduction

### RewardsPool
Lotterior本质上是一个Pool("奖池"), 你可以对"奖池"进行配置.

### 初始化Lotterior

有几种方式来初始化Lotterior:

+ `lott = Lotterior.initialize([settings])`
+ `lott = Lotterior([settings])`
+ `lott = new Lotterior([settings])`

### `settings`对象

配置字段:

#### `id`
该奖池的id

#### `candidates`
手动设置获奖者, 获奖者以一个数组表示. 如: `["ran", "hr", "soufii"]`, `[{name: "ran"}, {name: "hr"}, ...]`

candidates具有最高优先级, 允许设置任何数据为获奖者, 而并不检查他们是否已经加入奖池或者数量是否超过奖池容量.

#### `levels`
设置摇奖的等级. 如: 一等奖 1人, 二等奖 2人, 三等奖 3人, ... `[1, 2, 3]`

注意, lott默认(根据内置算法)不会抽取多于max的获奖者, 也就是说就算levels设置再多的获奖者, 最多也只返回max个.

#### `max`
设置奖池的容量

#### `summary`
加入该lott对象奖池的总共次数, 即从lott初始化到现在, push()成功调用的次数

#### `pool`
手动设置当前奖池的数据. 如: `["ran", "aizen", "hr", "soufii", "foo"]`, `[{name: "ran"}, {name: "hr"}, {name: "rb"}]`

#### `round`
手动设置当前为第N轮抽奖.

#### `algorithm`
设置摇奖的算法, 默认为`"IN-ORDER"`. Lotterior内置了两个随机算法: `RANDOM`和`IN-ORDER`.

+ `RANDOM`: 所有获奖者均为随机选出.
+ `IN-ORDER`: 在奖池中随机确定一个初始索引, 并从这个索引开始截取一定数量的数据作为获奖者.

除了内置算法, 可以设置自定义的抽奖算法, 方法是设置algorithm为一个函数:

```js
var settings = {
  // custom algorithm
  algorithm: function (collection, levels) {
    // collection: 奖池对象
    // levels: 摇奖等级
  }
};
```

## 开奖模式

### 自动开奖
自动开奖, 即lott开始处于等待状态, 一旦条件满足时自动开奖.

#### `wait()`
要使用自动开奖, 首先必须调用lott的wait方法, 使奖池进入自动开奖模式. 返回lott对象.

#### `push(body)`
开奖条件即满足奖池已被填满. 填充奖池通过push方法实现:

```js
// 将一个个体放入奖池
lott.push("ran")
lott.push({id:1, name:'ran', time: "2015-5-1"})
```

调用成功时push方法返回true, 表示该个体已被放入奖池, 返回false表示奖池已满, 改个体无法加入.

### 手动抽奖
手动摇奖模式, 即随时随地抽奖. 比如通过点击按钮抽奖等.

#### `lottery()`
手动抽奖不需要调用wait, 可以在任何时候调用lottery()方法抽取获奖者不论奖池是否填满.

## 获奖者
Lotterior本身也是一个EventEmitter, 每次开奖会触发`"ERNIE"`事件, 同时携带数据result, 即获奖者.

获奖者以一个二维数组表示:

```js
  [ 
    // 一等奖
    ["ran", "ddd"],
    // 二等奖
    ["hr", "sss"],
    // 三等奖
    ["soufii", "ppp"],
    ...
  ]
```

## 下一轮开奖
一次抽奖结束后, 可以继续在该轮抽奖, 这种情况适用于手动抽奖模式.(连续调用lottery方法)

除此之外, 对于某些应用, 需要按轮次抽奖. 在一轮结束之后需要对lott对象进行flush("冲刷").

#### `flush()`
调用该方法会重置lott对象的奖池为空, 轮次+1, 其他数据不会改变. 并返回lott对象本身.

## 奖池属性
lott有几个公开属性, 可供查询奖池信息.

### `full`
奖池是否已满

### `count`
当前加入奖池的个体数量

### `round`
当前是第几轮

## 随机视图

### `looping(callback)`
looping方法会呈现随机的视图, 即大屏幕上的随机滚动抽奖效果, 但实际上的获奖者仍是按照上述两种模式来确定.

## 更新奖池配置
另一种初始化lott对象的方法就是调用`lott = Lotterior()`, 然后调用config()方法.

config方法允许对lott对象进行重新配置, 但只更新提供的字段.

### `config(settings)`
一轮抽奖结束后, 如果需要更换奖池设置, 可以通过config完成, 参数仍为settings对象.

## Usage

```js
var lott = Lotterior({ max: 10, levels: [5, 3, 1] });
lott.on("ERNIE", function (winners) { console.log(winners) }).wait();

// in other places ...
lott.push(...)
lott.push(...)
lott.push(...)
...

// => [ [a, b, c, d, e], [f, g, h], [i] ]
```

have fun~

