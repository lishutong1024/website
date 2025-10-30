---
title: C结构体的初始化你还在按顺序写？试试这个C99神操作！
author: 李述铜
permalink: /article/c_struct/
createTime: 2025/10/27 10:55:37
---
大家好，我是李述铜，一名专注于嵌入式系统与底层开发的技术讲师，我的主要工作是制作课程带大家从零手写操作系统、TCP/IP协议栈、文件系统等核心系统，从实现的视角理解计算机底层原理。

本文继续介绍我在读《C Primmer Plus》时看到的新内容：**C结构体的指定初始化**。

实际上，这个知识点我已经熟知。最早是在阅读开源代码时，看到这种有趣的初始化方法。当时感觉这种方法真不错，写起来非常方便，而且可读性也很强。所以，在我的一些课程中也用到了这种方法。

由于有些同学不清楚这种方法，所以下面就做一些相关的介绍。

---

## 老式的初始化方法
在C89/C90标准中，当我们定义结构体或数组时，只能“按指定的顺序”来依次初始化。比如，对于下面的Point结构体，只能依次给出1, 2, 3这几个值才能完成初始化。

```c
struct Point {
    int x;
    int y;
    int z;
};

struct Point p = {1, 2, 3};
```

采用这种方法进行初始化，容易引发一些问题。

### 问题1：可读性差
当别人看到 {1, 2, 3}这个值列表时，很难一眼判断这些值对应的到底是哪个字段。对于一些字段较多的结构体则更加如此，比如：

```c
struct Config {
    int baudrate;
    int databits;
    int stopbits;
    int parity;
    int flow_control;
};

struct Config cfg = {115200, 8, 1, 0, 0};
```

如果不看结构体Config的定义，我们很难直接从这些数字看出各数字代码的意义。例如，1代表的是停止位，还是是否需要流量控制？

### 问题2：容易出错
如果某一些，结构体Point的定义被修改，例如，z被提前放到y前面。

```c
struct Point {
    int x;
    int z;
    int y;
};
```

这段代码仍然能够正确编译通过，但是结构体的值却发生了变化，导致初始化结果不符要求。而这在大型项目中很难查出来。

```plain
x = 1
z = 2
y = 3
```

### 问题3：维护困难
根据语法规则，如果只想初始化结构体中的部分字段，也必须**按顺序依次**写出前面的所有字段。

例如，我只想给z赋值，而x和y保持默认值0或者暂时不初始化，初始化代码中仍然需要给出所有的值。

```c
struct Point p = {0, 0, 3};
```

特别是，当结构体变复杂（比如有十几个字段）时，这种写法会非常冗长、难维护。

## 更好用的C99初始化方法
当我们使用C99标准时，可以**引入了一种更安全、更清晰的语法 —— 指定初始化（Designated Initializers）。**

简单来说，就是允许我们任意指定某个字段来设置初始化值。例如，我们可以使用下面的代码对结构体中各字段进行初始化。

```c
struct Config cfg = {
    .baudrate = 115200,
    .data_bits = 8,
    .parity = 0,
    .stop_bits = 1
};
```

可以看到，采用上述方法，可读性更强，我们可以直接通过 .名称 就能知道初始值化设置到了哪个字段。

除此之外，这种方法还带来了其他好处。

### 1. 可以乱序初始化
我们可以不按照定义顺序赋值，例如，可以像下面的代码那么随意指定各个字段的初始化顺序。

```c
struct Point p = {
    .z = 3,
    .x = 1,
    .y = 2
};
```

### 2. 可以只初始化部分成员
当只需要初始化某个成员时， 只需要在列表中包含该字段的初始化设置，其余没指定的字段其值自动为0.

```c
struct Point p = {.x = 10};
printf("%d %d %d\n", p.x, p.y, p.z); // 输出：10 0 0
```

此外，这种初始化也可以层层嵌套，非常灵活。例如：

```c
struct Pos {
    int x;
    int y;
};

struct Rect {
    struct Pos left_top;
    struct Pos right_bottom;
};

struct Rect r = {
    .left_top = {.x = 0, .y = 0},
    .right_bottom = {.x = 10, .y = 5}
};
```

## 数组也能用指定初始化
不仅是结构体，数组也支持类似写法。例如，我们可以直接使用“[索引]=值”来指定初始化数组中的特定元素。

```c
int arr[10] = {[0] = 1, [3] = 5, [9] = 100};
```

上述的代码等价于：

```plain
arr[0] = 1;
arr[3] = 5;
arr[9] = 100;
其余全为 0。
```

甚至是我们可以将结构体和数组的指定初始化方法结合起来使用，例如：

```c
struct Point points[3] = {
    [0] = {.x = 1, .y = 2},
    [2] = {.x = 10, .y = 20}
};
```

## 项目应用实例
在我制作的一些课程中，使用了这种方法，这里给出具体的示例：

例如，在《手写RTOS及应用实战》系列课程中的HTTP服务器实现模块，就使用了该方法初始化http_cgi_t结构。

```c
static const http_cgi_t cgi_table[] = {
    {.url = "/cfg/ip",          .func = cfg_ipaddr,     },
    {.url = "/cfg/upload",      .func = cfg_upload,     },
    {.url = "/cfg/run",         .func = cfg_run,        },
    {.url = "/info/cfg",        .func = info_cfg,       },
    {.url = "/info/system",     .func = info_system,    },
    {.url = "/info/history",    .func = info_history,   },
};
```

> 注：该课程介绍如何从0一步步手写RTOS内核，并将其应用于物联网的项目。如果对该项目感兴趣，可以访问：[https://zw8ls.xetlk.com/s/H2F1Y](https://zw8ls.xetlk.com/s/H2F1Y)
>

此外，在《从0手写x86 Linux操作系统》课程中的文件系统模块中，使用该方法初始化文件系统回调接口结构fs_op_t。

```c
fs_op_t fatfs_op = {

    .mount = fatfs_mount,
    .unmount = fatfs_unmount,
    .open = fatfs_open,
    .read = fatfs_read,
    .write = fatfs_write,
    .seek = fatfs_seek,
    .stat = fatfs_stat,
    .close = fatfs_close,


    .opendir = fatfs_opendir,
    .readdir = fatfs_readdir,
    .closedir = fatfs_closedir,
    .unlink = fatfs_unlink,
};
```

> 注：该课程介绍如何6000+行代码开发一个小型的多进程、带文件系统的操作系统。如果对该项目感兴趣，可以访问：[https://zw8ls.xetlk.com/s/onWQO](https://zw8ls.xetlk.com/s/onWQO)
>

## 总结
可以看到，使用这种方法能够极大地方便代码的编写。并且无论是可读性还是可维护性，都要比老式的初始化方法要好很多。

