---
title: C语言中的伸缩型数组：看似简单，其实很巧妙
author: 李述铜
---
大家好，我是李述铜，一名专注于嵌入式系统与底层开发的技术讲师，我的主要工作是制作课程带大家从零手写操作系统、TCP/IP协议栈、文件系统等核心系统，从实现的视角理解计算机底层原理。

继续写我在阅读《C Primer Plus》时，看到的有意思的内容。

这篇文章主要介绍C99中新增的特性：**伸缩性数组成员**。

# 问题示例
我们在做嵌入式通信的协议解析时，往往会定义一个包结构体用来描述通信所用的数据包。通常情况下，每次传输的数据包大小并不保证完全相同；所以，我们往往会按最大包长度来定义相应的包结构体。比如：

```c
typedef struct {
    uint8_t cmd;
    uint16_t len;
    uint8_t payload[MAX_PAYLOAD_LEN];
} packet_t;
```

当然，也有些人采用这样的方式去定义：

```c
typedef struct {
    uint8_t cmd;
    uint16_t len;
    uint8_t payload[1];
} packet_t;
```

无论是上述哪种方法，实际都显得不够优雅。毕竟它实际负载的有效长度既不是MAX_PAYLOAD_LEN也不是1.甚至于在有些情况下，有些包并没有负载。

那么，真正标准、优雅、可移植的写法是什么？

这里就引出了本篇文章要介绍的特殊结构体成员：**伸缩型数组成员（Flexible Array Member）**。

## 什么是伸缩型数组成员
简单来说，伸缩型数组成员是一个数组，且位于结构体的最后位置。例如，我们可以改写上述包结构，采用伸缩型数组成员。

```c
typedef struct {
    uint8_t cmd;
    uint16_t len;
    uint8_t payload[];  // 注意，这里没有写长度！
} packet_t;
```

其中，payload就是“伸缩型数组成员”。

值得注意的是，payload[]中并没有给出长度值，而是留空。**这就意味着该成员不会在结构体里占空间，真正的长度由运行时再决定**。

上面这段话是什么意思呢？我们可以结合下面的例子来理解。

## 应用示例
比如，我们现在要创建一个命令包，负载长度为len。为了给这个包分配空间，我们可以采用如下的方法来完成：

```c
size_t total = sizeof(packet_t) + len;
packet_t *pkt = malloc(total);

pkt->cmd = CMD_PING;
pkt->len = len;
memcpy(pkt->payload, data, len);
```

首先，sizeof(packet_t)计算出来的结构，并不会把payload的大小算在内。也就是说，**虽然payload位于结构体内部，但它占用的空间相当于是0字字节**。

其次，我们如果仍然可以使用pkt->payload对负载空间进行访问。

我们可以用下面的图来更加形像的理解以上两点：

![画板](https://cdn.nlark.com/yuque/0/2025/jpeg/12764787/1761199525811-02fa7d04-26e9-46a1-96f3-a020b66403f8.jpeg)

从上面的示例可以看出，我们可很方便地实现以下两点需求：

+ 求包头的长度非常简单：只需要使用sizeof(packet_t)即可计算得出
+ 可以灵活地创建不同长度的数据包：只需要使用malloc(sizeof(packet_t) + len)即可。

# 使用注意事项
如果我们要在实际项目中使用伸缩型数组成员，必须遵循以下三点原则：

+ 必须是结构体最后一个成员：因为伸缩型数组成员不占用存储空间
+ 数组的声明方式类似于普通数组，只不过方括号中的内容为空。

下面给出了一个错误的示例，在该示例中，buf位于结构体中间，这将导致编译器编译失败。

```c
typedef struct {
    int len;
    char buf[];		// 错误：伸缩数组必须在最后
    int type;  
} data_t;
```

## ** 往期推荐**
🔹 [C结构体的初始化你还在按顺序写？试试这个C99神操作！](https://mp.weixin.qq.com/s?__biz=MzI2MjM5NzYzMA==&mid=2247483933&idx=1&sn=407e554e30a8f4e6181e9c44242eb5f7&scene=21#wechat_redirect)

🔹 [C语言居然也有布尔类型？！](https://mp.weixin.qq.com/s?__biz=MzI2MjM5NzYzMA==&mid=2247483928&idx=1&sn=7682ca05b694aa8061b1b9604ad8e46e&scene=21#wechat_redirect)

🔹 [介绍一个C语言编程技巧：处理超长字符串显示](https://mp.weixin.qq.com/s?__biz=MzI2MjM5NzYzMA==&mid=2247483885&idx=1&sn=d74443a95a7e44cb8efbd4dc878f8d2e&scene=21#wechat_redirect)

**延伸学习推荐**

如果你对这类底层知识感兴趣，我推荐你深入看看我亲自录制的两门课程👇

🎯 **《从0手写RTOS操作系统》**：从任务调度、时间片、中断管理到内存分配，全程手写实现一个能真正运行的RTOS。

👉 适合嵌入式开发、物联网工程师、底层驱动开发者。

**感兴趣请点击：**[我做了一块开发板，可以让你真正懂RTOS](https://mp.weixin.qq.com/s?__biz=MzI2MjM5NzYzMA==&mid=2247483922&idx=1&sn=09cb83df82d333b09276b9151f107dc2&scene=21#wechat_redirect)

💻 **《从零手写x86操作系统》**：从最底层的启动扇区开始，带你一步步搭建自己的x86 OS。涵盖段页机制、中断、系统调用、文件系统、任务切换等，看得懂Linux源码的起点课。




