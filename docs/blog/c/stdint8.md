---
title: 写给嵌入式C程序员：我们为什么终于不用自己定义UINT8了
author: 李述铜
createTime: 2025/10/27 10:59:57
permalink: /article/qvfbdxaz/
---
大家好，我是李述铜，一名专注于嵌入式系统与底层开发的技术讲师，我的主要工作是制作课程带大家从零手写操作系统、TCP/IP协议栈、文件系统等核心系统，从实现的视角理解计算机底层原理。

今天继续整理我在阅读《C Primer Plus》时的相关心得和体会。这篇文章主要涉及编写跨平台的可移植性代码时用到的stdint.h头文件中相关的类型别名。

在介绍具体的知识点之前，先写点以前在工作中遇到的一个有趣的事情。

## 工作趣事
很多年前，我在公司搞MCU调试器相关的开发工作。由于工作内容的原因，经常接触到各个厂家不同型号的MCU。不过，大部分都是基于ARM内核的芯片。直至有一些，接触到Ateml的AVR系列单片机。

与32位ARM不同，AVR系列是16位的。我在AVR上写代码时，发现了一个有意思的现像，int类型居然是16位，而不是32位。

当然，**C语言标准本身并未要求int类型必须是一个固定的位宽，而只要求：sizeof(short) <= sizeof(int) <= sizeof(long)。其中，short类型至少要16位宽，int类型也至少要求16位宽。**只不过，由于我之前大多数工作都在32位芯片上位完成，头第一次遇到16位芯片。

由于int类型的宽度在不同平台上可能不同，这就导致我们在写跨平台的程序时，可能会踩一些坑。

:::tips
这些坑会导致代码在一块开发板上跑得好好的，一旦移植到不同类型的板子上就出各种灵异事件？数据错乱、程序卡死，甚至直接崩溃？

:::

下面给出一些例子。

### 坑一：整数溢出与回绕
**比如，我们**在一个16位的单片机上对两个数进行相加。这段代码如下：

```c
int main() {
    int a = 30000;
    int b = 10000;
    int sum = a + b; 
    printf("Sum is: %d\n", sum);
    return 0;
}
```

在32位芯片上，a + b的结果为40000 。但是，如果是在16位芯片上，由于40000超出了16位位宽，**这就导致整数溢出**，使得最终打开出来的值不是40000.

### 坑二：位运算
除整数溢出外，在进行位运算时有可能也会有类似的坑。例如，下面的代码将一个16位寄存器的最高位（第 20 位）为 1。

```c
void set_high_bit(int *register) {
    *register = (1 << 20);
}

int main() {
    int reg = 0;
    set_high_bit(&reg);
    printf("Register value: 0x%04X\n", reg); // 你期望输出 0x8000
    return 0;
}
```

在32位芯片上，上述代码没有问题，能正常工作。但是，在16位芯片上，(1 << 20)已经超出了16位的范围，**最终reg的值不会发生任何变**化。

### 坑三：循环边界与比较
在一些循环处理过程中，也有可能会因为int宽度的问题导致程序发生问题。例如，下面的代码对buffer进行清空。

```c
int buffer_size = 40000;

void process_buffer(char *buffer) {
    // 使用 int 作为循环计数器
    for (int i = 0; i < buffer_size; i++) {
        buffer[i] = 0;
    }
}
```

类似前面的问题，在16位芯片上，int的取值范围为-32768 ~ 32767.这就导致在循环计数中，i++发生溢出变成负数，最终只对**导致数组越界，访问buffer[-32768] ，结果是程序崩溃或被修改了非法内存**。

## 自定义的解决方案
相信有不少人踩到过上面的坑。可以看到，**主要的问题：在于int等整数类似在不同平台上的宽度不同**。

为了解决这个问题，工程师们往往会自行增加一个头文件，然后在里面用typedef依据整数的宽度，声明一些类型的别名。

例如，有的人可能用INT32等名称表示32位整数类型，也有的人用u32_t来表示。

下面给出一种常见的写法，这种写法常用于16位的芯片。

```c
typedef signed char        INT8;
typedef unsigned char      UINT8;
typedef signed short       INT16; 
typedef unsigned short     UINT16;
typedef signed int         INT32;
typedef unsigned int       UINT32;
```

而对于32位芯片，则使用另一份头文件，然后在其中对INT32等类型采用不同的类型声明。

```c
typedef signed char        INT8;
typedef unsigned char      UINT8;
typedef signed int         INT16; 
typedef unsigned int       UINT16;
typedef signed long        INT32; 
typedef unsigned long      UINT32;
```

然后，在编写跨平台的代码时，就使用上述类型别名，例如：

```c
UINT32 size = 40000;
for(UINT32 i = 0; i < size; i++) {
    buffer[i] = 0;
}
```

不过，这种方法的弊端也比较明显：

1. 重复造轮子：每个项目都需要手动定义一遍。
2. 命名不统一：有人用UINT8，有人用U8，代码风格混乱。
3. 维护困难：切换平台时需要手动修改这个头文件，极易出错。

## C99的stdint.h带来的解决方案
C99标准的推出，引入了stdint.h头文件，彻底终结了这种混乱的局面。它为我们提供了一套标准化的、明确位宽的整数类型定义，我们就不用再自行声明上述类型别名了。

它提供了最常用的类型声明：

+ int8_t, int16_t, int32_t, int64_t （有符号）
+ uint8_t, uint16_t, uint32_t, uint64_t （无符号）

只要我们在程序中引入stdint.h头文件，就可以顺利地使用上述类型。例如，下面的代码给出一个简单的包结构定义：

```c
#include <stdint.h>

uint8_t status_register = 0;     // 明确是1字节的无符号数
int32_t sensor_value = -1024;    // 明确是4字节的有符号数

// 用于结构体，确保跨平台内存布局一致
#pragram pack(1)
typedef struct {
    uint16_t packet_header;
    uint32_t data;
    uint8_t  checksum;
} network_packet_t;
#pragram pack()
```

与使有和int等相比，当我们要在16位和32位的芯片之间通信时，上述结构体定义能保证在不同的芯片间，其内存布局是完全相同的。

可以看到，使用stdint.h后，带了很多好处：

1. **实现跨平台一致性**：可以确保在任何平台、任何编译器上都是精确的整数位宽。这就消除了因平台差异导致的潜在风险，使得代码更容易在不同架构间迁移，也便于团队协作和后续维护。
2. **代码意图清晰，增强可读性：**我们可直接通过类型名就能知道其所占用的宽度，而不需要思考或记住它在这个特定平台上的实际大小。
3. **无需自行简单，拿来即用**：不需要再自己重新定义别名和增加头文件，简单方便。

## 作者介绍

**李述铜** ，嵌入式系统与底层架构领域讲师，专注于操作系统、CPU 架构、RTOS 内核与系统软件实现原理的教学与研究。 出版作品《从0手写x86计算机操作系统》，在嵌入式教育领域拥有多年实战教学经验。

**主讲课程**包括：《从0手写嵌入式操作系统》《从0手写TCP/IP协议栈》《从0手写FAT32文件系统等》。课程以底层原理为核心、以可操作性为导向，帮助工程师系统理解软件与硬件之间的联系，从“能用”迈向“能造”。

## 往期文章

* [告别固定大小：利用C语言伸缩型数组，实现动态结构体](https://mp.weixin.qq.com/s/bmYTlPv5-dCidAMylz0HqQ)
* [C结构体的初始化你还在按顺序写？试试这个C99神操作！](https://mp.weixin.qq.com/s/AbpN8CL5Fj9tLnFLKAeYew)
* [C语言居然也有布尔类型？！](https://mp.weixin.qq.com/s/FGPJdMlZ0FkPWQGS-vhpaA)
* [介绍一个C语言编程技巧：处理超长字符串显示](https://mp.weixin.qq.com/s/vgSzgucviEDN7sB0VM66Ew)

## 课程推荐

* [全新升级的手写RTOS课程：从原理到实战，一次掌握操作系统的核心](https://mp.weixin.qq.com/s/tUMnG1R5FWwL6IpztO3Rdg)
* [用10000+行代码手写一个TCP/IP协议栈](https://mp.weixin.qq.com/s/2hjC7um-5uxFj6VCba9Skg)
* [硬核项目，从0手搓一个RISC-V模拟器！](https://mp.weixin.qq.com/s/6ULO5HO_CtjlawaRPMJ6Yw)

