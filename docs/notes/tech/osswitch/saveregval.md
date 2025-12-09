---
title: 保存内存寄存器的当前值
author: 李述铜
createTime: 2025/12/09 09:46:31
permalink: /tech/osswitch/xnxazy8r/
---
> 为了更好地使用RTOS，我们需要深入理解RTOS工作原理，最好的方法是动手写一个RTOS。
>
> 如果你希望写一个类似RT-Thread/FreeRTOS的系统，欢迎关注这门课程：[【RTOS内核开发】从0手写嵌入式操作系统](https://zw8ls.xetlk.com/s/H2F1Y)

前一节课时只实现了CPU内核寄存器值的恢复，这一节课时实现寄存器值的保存。通过本课时的学习，可以实现最终版本的task_switch函数。这样两个任务就可以通过task_switch实现完整的任务切换过程。

# 具体实现
在之前实现的task_switch中，我们已经保存了LR和R13值。但前面我们也了解到，还需要将CPU的内核寄存器值全部保存起来，这样才能够实现完整地保存任务的当前运行状态。同时，还需要添加取下一个需要运行任务状态，从中取出内核寄存器的值并恢复到CPU内核寄存器中。

修改后完整的代码如下所示：

```basic
    .text
    .global task_switch
    .global task_run_first
task_switch:
    // save r0-r12
    stmia r0, {r0-r12}

    // save to lr
    str lr, [r0, 4*13]
    
    // save sp
    str sp, [r0, 4*14]

    // save apsr
    mrs r2, apsr
    str r2, [r0, 4*15]
    
    // load sp
    ldr sp, [r1, 4*14]
    
    // load apsr
    ldr r2, [r1, 4*15]
    msr apsr, r2

    // load r0-r12
    ldmia r1, {r0-r12, pc}
```

以下代码包含两部分：前半部分时保存r0-r12, lr, sp, apsr；后半部分是恢复aspr, sp, apsr、r0-r2和pc。

考虑到系统刚跑起来时，task_0_entry开始运行，并且在其中会调用task_switch函数切换到task1，而task_switch会从task1中取出相应的寄存器进行恢复。

```basic
void task_0_entry (void) {
    int count = -1;
    
    for (;;) {
        count++;
        task_switch(&task0, &task1);
    }
}
```

因此，为了task1在第一次就正常运行，需要预先对task1进行初始化。

```c
task1.r0 = 0x10;
task1.r1 = 0x11;
task1.r2 = 0x12;
task1.r3 = 0x13;
task1.r4 = 0x14;
task1.r5 = 0x15;
task1.r6 = 0x16;
task1.r7 = 0x17;
task1.r8 = 0x18;
task1.r9 = 0x19;
task1.r10 = 0x20;
task1.r11 = 0x21;
task1.r12 = 0x22;
task1.apsr = 1 << 30;
task1.return_addr = (unsigned int)task_1_entry;
task1.stack_addr = (unsigned int)&task1_stack[80];
```

# 内容总结
通过这两节内容可以看到，所谓的任务切换，其实质就是将任务的运行状态给保存起来，再将下一任务的运行状态进行恢复。

首先是给每个任务分配私有的栈，用于存储该任务自己的局部变量等数据，其次是找一块空间来放当前CPU内核寄存器的值，这些内容寄存器包含了任务最后执行到哪个位置、当前所用栈指针的位置、计算的数据等信息。

通过不断地保存和恢复，CPU就可以被RTOS灵活地分配到不同的任务运行，每个任务似乎都是在独占CPU运行。





