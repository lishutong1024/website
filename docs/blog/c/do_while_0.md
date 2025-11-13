---
title: C编程技巧：将do{ ... } while(0)用于宏定义
author: 李述铜
---
> 大家好，我是李述铜，一名专注于嵌入式系统与底层开发的工程师，我的主要工作是制作课程带大家从零手写操作系统、TCP/IP协议栈、文件系统等核心系统，从实现的视角理解计算机底层原理。

记得很多年前初次阅读嵌入式TCP/IP协议栈LWIP时，看到其中有些宏定义使用了do {} while (0)，大体来说是这样写的：

```c
#define MEMP_FREE(type, ptr) do { \
    SYS_ARCH_DECL_PROTECT(old_level); \
    SYS_ARCH_PROTECT(old_level); \
    memp_free(MEMP_##type, ptr); \
    SYS_ARCH_UNPROTECT(old_level); \
} while(0)
```

当时感觉这种写法有点莫名奇妙。为会要用do-while循环？为什么要使用while(0)？

直到后面我有了一些编程经验后，才慢慢明白这种写法的用处。

下面，我将通过一个例子，来简要说明为什么要使用这种写法。

---

## 问题示例

让我们先一个简单的代码示例，具体如下：

```c
#define SIMPLE_SWAP(a, b) \
    temp = a; \
    a = b; \
    b = temp;

int x = 10, y = 20, temp;
if (x < y)
    SIMPLE_SWAP(x, y); // 如果x<y，就交换它们
```

在这段代码中，定义了一个SIMPLE_SWAP()宏，用于实现a和b的交换。

我们知道：**在编译时，C的预处理器对宏的处理方式非常简单，仅仅是进行简单的文本替换**。当宏包含多条语句时，这种写法可能会带来意想不到的行为。

例如，在经过预处理器处理之后，上述代码实际会变成这样：

```c
int x = 10, y = 20, temp;
if (x < y)
    temp = x;      
    a = b;        
    b = temp;
```

显然，这些代码的功能完全不是我们想要的。它实际上等价于下面这段代码：

```c
if (x < y) {
    temp = x;
}
a = b;
b = temp;
```

也就是说，只有当x < y时，才执行temp = x。否则，该语句不被执行，此时a和b的值交换工作无法完成。

## 初步解决方案：用大括号{}包裹

你可能会想：能不能用大括号把宏体给包起来，从而创建一个复合语句？

按照这种想法，我们可以对代码修改如下：

```c
#define SIMPLE_SWAP(a, b) { \
    temp = a; \
    a = b; \
    b = temp; \
}
```

这样做似乎能解决上述问题。但是，如果代码再稍微复杂点，比如我们这样写：

```c
if (x < y)
    SIMPLE_SWAP(x, y);
else
    do_something_else();
```

经过C预处理器处理后，上述代码展开为：

```c
if (x < y) {
    temp = x;
    a = b;
    b = temp;
}; // 注意这里多了一个分号！
else 
    do_something_else();
```

此时，新的问题出现了：宏后面那个分号；在展开后，变成了一个空语句跟在代码块后面。

这样一来，后面的else就变成了一个独立的语句，破坏了**if-else**的语法结构，编译器会报错。

那你可能又会想：既然多了分号，那我在使用宏的时候，不写后面的分号不就行了？也就是说，这样写代码：

```c
if (x < y)
    SIMPLE_SWAP(x, y)     // 这里不要写分号
else
    do_something_else();
```

很显然，这种做法实在不怎么样。每次在使用这个宏时，都要记得不要加分号。如果你将这个宏的实现共享给其他同事使用，我想你肯定能想像得到他们脸会有何种表情。

所以，这个分号不能去掉！那该怎么办？

#### 终极解决方案：do { ... } while(0)

既然分号不能去掉，同时我们又需要将宏体的内容整体展开；那么，我们就应该想办法将分号和展开的内容变成一个完整的复合语句块。

这种情况下，就可以使用do { ... } while(0)结构完美地解决上述问题。

采用这种结构，SIMPLE_SWAP()的定义如下：

```c
#define SIMPLE_SWAP(a, b) do { \
    temp = a; \
    a = b; \
    b = temp; \
} while(0)
```

此时，展开后的代码就变成了：

```c
if (x < y)
    do {
        temp = a;
        a = b;
        b = temp;
    } while(0);          
else
    do_something_else();
```

此时，我们可以看到编译已经没有问题了，而且实际功能也是我们想要的。

具体来说，这种写法是这样发挥作用的：

* **解决作用域问题**：使用{ ... }将多条语句组合成一个单一的、逻辑上的语句。
* **解决分号问题**：分号在这里不再表示空语句，而是do-while语句的结束符。
* **循环次数的问题**：由于我们只希望宏内的语句只执行一次，因此通过使用while(0)，可以保证循环体**只会被执行一次**。

## 更好的替代方案

其实，c99标准已经引入了另一种更完美的替代方案：内联函数。这样就不必使用上述编程技巧。

回想起来，**我们之所以使用宏，主要原因在于能够直接将宏的实现代码插入到使用宏的地方，从而减少函数调用的开销。**而如果用内联函数，我们可以这样写：

```c
static inline void swap_int(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
```

**使用这种方法，将具备更好的可读性、支持编译时类型检查、调试也更加方便。同时，编译器在处理内联函数时，会将内联函数插入到需要调用的地方，从而同样达到减少函数调用开销的目的。**

不过，有些场合只有使用c89标准，此时内联函数不可用，只能使用do {} while(0)。

## 使用do { ... } while(0)的其他优势

除了解决上述问题外，在有些情况下，do {} while(0)还能带来意想不到的方便之处。

比如，我们可以在宏的内部使用break来跳出整个宏块，这在错误处理时很有用。

```c
#define COMPLEX_OPERATION(x) do { \
    if ((x) == NULL) break; 
    setup_something(); \
    if (operation_failed) break; 
    finalize_something(); \
} while(0)
```

## 总结

可以看到，do {} while(0)是C语言编程中的一个小技巧，它可帮助我们：

1.  将多条语句组合成一条复合语句：确保它们在条件语句或循环中作为一个整体出现。
2.  吸收宏末尾的分号：使其能无缝嵌入到任何复杂的语法结构中。
3.  支持使用break跳出语句块：使其能够进行一些错误处理。

当然了，如果能够使用c99等以上标准，那么使用内联函数是一种更好的选择。

# 历史文章
+ [别再只用malloc了！嵌入式C的栈上动态数组分配：变长数组](https://mp.weixin.qq.com/s/nzsNrm8mR0VNNB8MOV3j6g)
+ [告别固定大小：利用C语言伸缩型数组，实现动态结构体](https://mp.weixin.qq.com/s/bmYTlPv5-dCidAMylz0HqQ)
+ [写给嵌入式C程序员：我们为什么终于不用自己定义UINT8了](https://mp.weixin.qq.com/s/RoRd3HeWGRq8tQo4FhPsuw)

## 课程推荐
+ [全新升级的手写RTOS课程：从原理到实战，一次掌握操作系统的核心](https://mp.weixin.qq.com/s/tUMnG1R5FWwL6IpztO3Rdg)
+ [一个大学生，想像Linus一样写操作系统，需要具备什么能力？](https://mp.weixin.qq.com/s/V_U7bc5-LT3CtNGVuDKOrw)
+ [用10000+行代码手写一个TCP/IP协议栈](https://mp.weixin.qq.com/s/2hjC7um-5uxFj6VCba9Skg)
+ [硬核项目，从0手搓一个RISC-V模拟器！](https://mp.weixin.qq.com/s/6ULO5HO_CtjlawaRPMJ6Yw)

## 作者介绍
> **李述铜，嵌入式系统与底层架构领域讲师**，专注于操作系统、CPU 架构的教学与研究。 出版作品《从0手写x86计算机操作系统》。**主讲课程**包括：《从0手写嵌入式操作系统》《从0手写TCP/IP协议栈》等。
>
> 欢迎关注我的**微信公众号【李述铜的嵌入式内功修炼】**，以便及时获取我的更多文章！-> lishutong1024.cn
