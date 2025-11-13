---
title: C编程必知：为什么每个头文件都需要#ifndef/#define
author: 李述铜
---
> 大家好，我是李述铜，一名专注于嵌入式系统与底层开发的工程师，我的主要工作是制作课程带大家从零手写操作系统、TCP/IP协议栈、文件系统等核心系统，从实现的视角理解计算机底层原理。

最近，我已经读完了《C Primer Plus》，也写了一些文章总结我自己比较感兴趣的内容。应一些同学的要求，接下来会写一些文章介绍同学们在使用C语言过程中，比较有意思的知识点或编程技巧。

这篇文章主要涉及C语言中的#ifndef和#define。

---
在C语言开发中，我们能在几乎每个头文件看到类似的代码，比如：

```c
#ifndef __FOO_H__
#define __FOO_H__

// 头文件内容

#endif
```

相信不少同学都会有这样的困惑，例如：

> “为什么要写#ifndef/#define？
> 
> 如果不写，会有什么问题？

今天，这篇文章将会帮你彻底搞明白上述问题。

---

## 一、问题场景：如果不使用#ifndef/#define会怎样？

我们知道，C语言编译器在处理#include时，由其预处理器对该指令进行处理。预处理器的工作很简单：**把文件内容直接插入到当前文件中的该位置**。

**也就是说：#include = 文本替换,即将#include所在的行，用文件内容做替换。**

这样做可以方便代码的编写，并实现代码的重用。但是，如果一个头文件被多次#include，就会出现**重复定义等编译或链接错误**。

### 示例一：简单问题示例

这里举一个简单的例子：

```c
#include "foo.h"
#include "foo.h"   // 重复

int main() {}
```

如果foo.h中定义了结构体类型：

```c
struct Point{int x, y;};
```

重复include就会导致生成两个struct Point的定义，此时编译是会出错的(有的编译器可能视为警告)：

```c
struct Point{int x, y;};
struct Point{int x, y;};

int main() {}
```

## 示例二：复杂问题示例

现实中，极少有人像上面那样在同一个文件中连续#include同一文件，而更多的是直接或间接#include。例如：

假设有两个头文件foo.h和bar.h：

```c
// foo.h
struct Point{int x, y;};
```

```c
// bar.h
#include "foo.h"
```

然后在main.c中使用#include：

```c
#include "foo.h"
#include "bar.h"   // 间接又包含了 foo.h

int main() {
    struct Point p;
    p.x = 1;
    p.y = 2;
    return 0;
}
```
在对main.c进行编译时，编程器会进行如下操作：

1. #include "foo.h" → 复制foo.h内容

   ```c
   struct Point{int x, y;};
   ```
2. #include "bar.h"→ 复制bar.h内容

   ```c
   #include "foo.h"
   ```

   由于有#include "foo.h“，于是再复制foo.h内容 → **又生成一次struct Point;**

最终展开后的代码类似：

```c
struct Point{int x, y;};
struct Point{int x, y;};

int main() {
    struct Point p;
    p.x = 1;
    p.y = 2;
    return 0;
}
```
所以，这同样导致了类似前一种问题那样，出现重定义的问题。

## 解决方法：使用#ifndef/#define避免重定义

那么，如何解决这个问题呢？我们可以在每个头文件中，加上类似如下的宏语句。

比如，对于foo.h，可以添加：

```c
#ifndef __FOO_H__
#define __FOO_H__

struct Point{int x, y;};

#endif
```
那么，#ifndef/#define是如何工作的呢？

> #ifndef __FOO_H__  .... #endif表示：如果未定义__FOO_H__,则将其后的代码纳入编译中；否则，就跳过
>
> #define __FOO_H__表示：预定义宏__FOO_H__

这里以示例二给出的问题为例，介绍如其是如何发挥作用的：


1. 当C编译器第一次包含foo.h头文件时

```c
#include "foo.h"        // 第一次包含foo.h
#include "bar.h"   

int main() {
    struct Point p;
    p.x = 1;
    p.y = 2;
    return 0;
}
```

预处理器的执行顺序如下：
1. 遇到#ifndef __FOO_H__，检查宏__FOO_H__是否存在：由于此时，__FOO_H__未定义，因此条件成立。
2. 执行#define __FOO_H__，宏FOO_H被定义: 之后的代码 struct Point { int x, y; }; 被纳入编译。
3. 遇到#endif，结束条件编译块。

结果就是，预处理器将struct Point放入 main.c 中，供后续编译阶段处理，相当于如下效果：

```c
struct Point{int x, y;};
#include "bar.h"   

int main() {
    struct Point p;
    p.x = 1;
    p.y = 2;
    return 0;
}
```

接下来，C编译器处理#include "bar.h"，由于bar.h中使用了#include "foo.h"语句，因此处理后的效果为：

```c
struct Point{int x, y;};
#include "foo.h"
int main() {
    struct Point p;
    p.x = 1;
    p.y = 2;
    return 0;
}
```

最后，C编译器继续处理#include "foo.h"，此时：
1. 遇到#ifndef __FOO_H__，检查宏__FOO_H__是否存在：由于**此时__FOO_H__已经定义**，因此条件不成立。
2. 条件不成立，预处理器跳过#define和整个头文件内容，包括struct Point。
3. 遇到#endif，结束条件编译块。

因此处理后的效果为：

```c
struct Point{int x, y;};

int main() {
    struct Point p;
    p.x = 1;
    p.y = 2;
    return 0;
}
```

**这样一来，虽然foo.h被直接直接或间接包含两次；但最终struct Point只被展开一次，这样就避免了重复定义。**

> 综上所述，使用#ifndef/#define/#endif，可使得第一次包含头文件时，条件成立，相关的宏被定义且头文件内容被展开。
> 
> 而第二次及之后包含时，由于宏已经定义过了，使得条件不成立，头文件内容被跳过。
> 
> 也就说，**头文件保护通过宏定义状态让编译器记住已经处理过这个头文件，从而安全地多次包含头文件，避免重复定义变量、结构体或函数声明。**

# 历史文章
+ [作为嵌入式开发者，有必要手写一个RTOS吗](https://mp.weixin.qq.com/s/mU5YLWv9KFo-mNPNsM4UwA)
+ [别再只用malloc了！嵌入式C的栈上动态数组分配：变长数组](https://mp.weixin.qq.com/s/nzsNrm8mR0VNNB8MOV3j6g)
+ [告别固定大小：利用C语言伸缩型数组，实现动态结构体](https://mp.weixin.qq.com/s/bmYTlPv5-dCidAMylz0HqQ)
+ [写给嵌入式C程序员：我们为什么终于不用自己定义UINT8了](https://mp.weixin.qq.com/s/RoRd3HeWGRq8tQo4FhPsuw)
+ [C结构体的初始化你还在按顺序写？试试这个C99神操作！](https://mp.weixin.qq.com/s/AbpN8CL5Fj9tLnFLKAeYew)
+ [C语言居然也有布尔类型？！](https://mp.weixin.qq.com/s/FGPJdMlZ0FkPWQGS-vhpaA)
+ [介绍一个C语言编程技巧：处理超长字符串显示](https://mp.weixin.qq.com/s/vgSzgucviEDN7sB0VM66Ew)

## 课程推荐
+ [全新升级的手写RTOS课程：从原理到实战，一次掌握操作系统的核心](https://mp.weixin.qq.com/s/tUMnG1R5FWwL6IpztO3Rdg)
+ [用10000+行代码手写一个TCP/IP协议栈](https://mp.weixin.qq.com/s/2hjC7um-5uxFj6VCba9Skg)
+ [硬核项目，从0手搓一个RISC-V模拟器！](https://mp.weixin.qq.com/s/6ULO5HO_CtjlawaRPMJ6Yw)

## 作者介绍
> **李述铜，嵌入式系统与底层架构领域讲师**，专注于操作系统、CPU 架构的教学与研究。 出版作品《从0手写x86计算机操作系统》。**主讲课程**包括：《从0手写嵌入式操作系统》《从0手写TCP/IP协议栈》等。
>
> 欢迎关注我的**微信公众号【李述铜的嵌入式内功修炼】**，以便及时获取我的更多文章！-> lishutong1024.cn
