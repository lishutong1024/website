---
title: 保存返回地址实现任务切换
author: 李述铜
createTime: 2025/12/09 09:44:14
permalink: /tech/osswitch/ni83q6p2/
---
> 为了更好地使用RTOS，我们需要深入理解RTOS工作原理，最好的方法是动手写一个RTOS。
>
> 如果你希望写一个类似RT-Thread/FreeRTOS的系统，欢迎关注这门课程：[【RTOS内核开发】从0手写嵌入式操作系统](https://zw8ls.xetlk.com/s/H2F1Y)
>
前一节课时已经用汇编代码实现了一个任务切换函数task_switch()，接下来，就可以在这个汇编函数继续做修改，逐步解决前面提到的两个问题：避免每次从任务函数开始处执行、栈溢出。

本小节主要解决第一个问题，即避免每次都从任务函数的开始处执行。

# 实现原理
在前面介绍函数调用与返回的机制内容时，我们已经了解到：在Cortex-M3上当调用一个函数时，函数的返回地址保存在LR寄存器里。

因此，如果我们希望task_0_entry()任务执行task_switch()切换到task_1_entry()，再由task_1_entry()调用task_switch()切换回来时，能够从task_0_entry()中调用task_switch()语句的下方继续执行；我们可以考虑将LR寄存器的值预先保存起来。

> 也就是说，我们需要为task_0_entry和task_1_entry分别分配一个专门保存task_switch()返回地址的变量，如task0_return_addr和task1_return_addr。
>
> 在一个任务调用task_switch()时，将LR寄存器的值保存到该任务自己的task?_return_addr中。
>
> 当从另一个任务调用task_switch()切换回来时，就从task?_return_addr中取出该地址并跳转到该地址执行。
>

通过上述流程，就解决了本小节关注的问题：避免每次调用task_switch()时都从任务函数的开始处执行。

# 具体实现
因此，针对task_0和task2分别定义了两个变量，用于保存这两个任务最后执行到了哪个位置。

```c
unsigned int task0_return_addr;
unsigned int task1_return_addr;
```

当某个任务调用task_switch()函数时，可以将这个任务的return_addr传进去，将LR寄存器的值保存到该变量中。以task0为例，其调用如下：

```c
void task_0_entry (void) {
    int count = -1;
    
    for (;;) {
        count++;
        task_switch(&task0_return_addr, task1_return_addr);
    }
}
```

注意，task_switch的参数已经变为两个。第一个参数传入的参数当前任务的return_addr地址，在执行task_switch()时，会将LR的值保存到该地址中。第二个参数为需要运行的任务的运行地址，此时不再是task_1_entry，因为我们并不希望每次都从task_1_entry开始处执行，而是从它最后执行的位置继续往下执行。

根据arm的参数传递规则，&task0_return_addr参数将会通过R0寄存器传递，task1_return_addr将会传递给R1寄存器。task_switch的具体实现如下：

```c
task_switch:
    // save to from_addr
    str lr, [r0]
    
    // jmp to addr
    bx r1
```

# 这告诉了我们什么
从以上实现可以看出，在RTOS中，每个任务都有相应的“运行状态”。在本节课程中，我们会发现，每个任务需要将自己最后执行的位置记录下来。这样当OS进行任务的切换时，如果某个任务得到了运行的机会，那么就可以可以取出这个位置，然后任务就能够继续往下执行。



