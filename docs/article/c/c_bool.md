---
title: 原来c语言也有布尔类型！
author: 李述铜
createTime: 2024/08/18 20:24:52
permalink: /article/bxif21pz/
---
记得很多年前刚学C语言的时候，用的还是现在被吐槽最多的谭浩强写的C语言教材。后面转而去学嵌入式，所用的仍然是这本书中所教的C语法。
由于所学够用，因此工作后很多年没有专门去买本其他作者写的C语言相关的书。

直至最近突发其想，买了《C Primmer Plus》回来，快速地阅读了一遍，学到了不少新的东西。因此，在本文及后期的文章中，我会将这些新的东西写一下供大家参考。本文主要介绍C99标准中新增加的_Bool类型。

# 没有布尔类型的那些年

在C89和C90标准中，不存在布尔类型。但是，实际工作中往往需要进行逻辑判断。**C语言本身支持逻辑处理，即将结果为0视作fase，将非0值视作true**。但是，如果我们希望在程序中定义变量来存放逻辑值。常见的做法是选取一个整数类型（如int），然后将其值设置为1或0来表示true或false。

```c
int flag = 1;   // true
if (flag) {
    printf("真的！\n");
}
flag = 0;       // false
if (!flag) {
    printf("假的！\n");
}
```

有的同学可能会使用宏定义来创建TRUE和FALSE，从而避免在程序中直接使用1和0.
```c
#define  TRUE 1
#define  FALSE 0
```

这种做法没有问题，直到现在仍然适用。不过，从C99标准开始，**C语言终于针对这种类型的变量新增了_Bool类型**。如此一来，我们就可以在项目中直接使用这种类型，而无需花时间采用上述方法。

# C99中的_Bool类型 

和int等类型一样，_Bool类型是C编译器本身支持的类型。我们无需对工程做任何处理就可以使用。在实际项目中，为了更加方便地使用，**可以在源文件中包含<stdbool.h>头文件。该头文件对_Bool类型添加了别名bool，同时增加了true和false两个宏的实现**。

名称
作用
实际定义
bool
布尔类型
typedef _Bool bool
true
真
#define true 1
false
假
#define false 0

也就是说，该头文件其实是对_Bool的“语法糖”。如果你不想使用stdbool.h，也可以自行实现。不过，既然已经有了，那为什么不直接使用现成的呢？如何使用bool类型下面给出了一个简单的示例，演示了如何使用bool类型。

```c
#include <stdio.h>
#include <stdbool.h>
int main(void) {
    bool is_ready = true;
    bool has_error = false;
    if (is_ready && !has_error) {
        printf("系统准备就绪！🚀\n");
    } else {
        printf("系统未准备好。\n");
    }
    printf("is_ready = %d\n", is_ready);
    printf("has_error = %d\n", has_error);
    return 0;
}
```

与使用int类型来表示布尔类型相比，上述代码的可读性更好、语义更清晰，我们可以通过is_read和has_error的类型来得知其表示逻辑值。

# 总结

从上面的内容可以知，虽然C99引入了_Bool类型，并且我们可以通过包含<stdbool.h>从而能使用bool、true、false；但是，其具体的使用方法和效果与我们以前的方法没有太大区别。

即便如此，使用C99的该特性，倒是避免了我们自己重复造轮子，从而节省了工作量。

在后面的文章中，我会继续介绍《C Primmer Plus》中一些比较有意思的内容。

感谢你读到这里。在文章最后，我想为你推荐一个能显著提升你技术竞争力的课程。

![alt text](../../.vuepress/public/image/docs/article/os/newrtos/image-7.png)

⏳ 限时优惠名额有限，立即锁定你的席位！
👉 [从0手写嵌入式操作系统](https://zw8ls.xetlk.com/s/H2F1Y)
