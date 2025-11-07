---
title: 一个任务写，一个任务读，RTOS里到底要不要加锁？
author: 李述铜
tags:
  - 操作系统
  - RTOS
---
> 大家好，我是李述铜，一名专注于嵌入式系统与底层开发的技术讲师，我的主要工作是制作课程带大家从零手写操作系统、TCP/IP协议栈、文件系统等核心系统，从实现的视角理解计算机底层原理。

我的《RTOS开发与实战》系列课程已经正式发布一个多月了，很多同学已经在学习本课程。其中，有同学在学到互斥锁的实现章节时，提出了这样一个问题：

> 在一个系统中，如果一个任务写变量，而另一个任务读，是否必须使用互斥锁机制等保护？”

实际上，对于该问题，我们不能简单粗暴引入保护机制。在某些情况下，我们确实需要使用保护机制；而在另外一些情况下，使用保护机制反而带来不必要的形销。下面，我将详细介绍这其中的原理。

---

## 一、背景（踩坑）

在该系列课程的实战项目部分，实现了一个物联网应用。该应用需要周期性地采集温湿度的值并处理。为了更加简单地介绍原理，以下给出示例代码。

在这个示例代码中，有两个任务：Task_Sensor负责采集到的温湿度值，Task_Comm任务将温湿度的值给打印出来。

```c
typedef struct {
    int temperature;
    int humidity;
} SensorData_t;

SensorData_t g_sensorData;

void Task_Sensor(void *param)
{
    while (1) {
        g_sensorData.temperature = read_temperature();
        g_sensorData.humidity    = read_humidity();
        os_delay(10);
    }
}

void Task_Comm(void *param)
{
    while (1) {
        printf("T=%d, H=%d\n", 
               g_sensorData.temperature,
               g_sensorData.humidity);
        os_delay(100);
    }
}
```

这段程序粗看起来没什么问题，但是在某些特殊的情况下，可能出现异常。

> 假设某个时间当前温度20度，湿度75；由于某些原因，环境发生剧烈变化，温度上升到85度，湿度35.
>
> 正常来说，Task_Comm应该打印出**T=85, H=35**.但实际上，可能出现**T=85, H=75**这种奇怪的组合。

也就是说，**当温度刚更新完T=85，湿度还没更新完时（H=35），Task_Comm就将开始读取，进而导致该问题。**

---

## 二、为什么会出现这种问题

之所以出现读取混乱的情况，主要原因在于：RTOS是**多任务并发执行**的。

当任务Task_Sensor正在写温湿度值时，可以随时被Task_Comm打断，从而让Task_Comm可以去读取温湿度值。

正因如此，使得Task_Comm的读取结果可能出现异常。

对于前面提供的例子，一种可能的原因如表所示：

| 时刻  | temperature | humidity  |
| --- | ----------- | --------- |
| 更新前 | 20          | 75        |
| 更新中 | **85**      | 75 ← 还没更新 |
| 更新后 | 85          | **35**    |

**当Task_Sensor更完temperature为85度时，此该humidity未更新仍然75。此时，如果Task_Comm打断了更新过程并立即打印这两个值，就会出现T=85, H=75这种错误的结果。**

对于这种问题，我们只需要保证Task_Sensor对上述两个值的更新变成**不可被打断的原子操作**即可解决。这样一来，Task_Comm读取到的值，必然是温湿度均更新完的值。

类似地，对于Task_Comm读取温湿度的操作，也需要变成不可被打断的原子操作；否则，也可有可能出现类似的打印混乱的现像。具体原因类似，这里我就不再赘述。

---

## 三、解决方法示例：用互斥锁保护共享数据

解决这个问题的关键，就是**在读写共享数据时加互斥保护**，让读与写均成为一个**完整不可打断的原子操作**。

在我的课程中，提供了关中断、调度锁、互斥锁等机制。这里以互斥锁为例，介绍如何进行保护。

互斥锁机制提供了如下API：

```c
os_err_t os_mutex_init (os_mutex_t *mutex);
os_err_t os_mutex_uninit (os_mutex_t *mutex);
os_mutex_t *os_mutex_create (void);
os_err_t os_mutex_free (os_mutex_t *mutex);
os_err_t os_mutex_lock (os_mutex_t *mutex, int ms);
os_err_t os_mutex_unlock (os_mutex_t *mutex);
uint16_t os_mutex_lock_cnt (os_mutex_t *mutex);
uint16_t os_mutex_task_cnt (os_mutex_t *mutex);
os_task_t *os_mutex_owner (os_mutex_t *mutex);
```

应用上述API，我们可以修改之前的代码，使得两个任务对温湿度的读写均加以保护：

```c
typedef struct {
    int temperature;
    int humidity;
} SensorData_t;

SensorData_t g_sensorData;
os_mutex_t *g_sensorMutex;

void Task_Sensor(void *param)
{
    while (1) {
        SensorData_t tmp;    // 用一个临时性变化（当然，不用也行）
        tmp.temperature = read_temperature();
        tmp.humidity    = read_humidity();

        // 加锁保护共享数据
        if (os_mutex_lock(g_sensorMutex, -1) == OS_EOK) {
            g_sensorData = tmp;
            os_mutex_unlock(g_sensorMutex);
        }

        os_delay(10);
    }
}

void Task_Comm(void *param)
{
    while (1) {
        SensorData_t localCopy;

        if (os_mutex_lock(g_sensorMutex, -1) == OS_EOK) {
            localCopy = g_sensorData;
            os_mutex_unlock(g_sensorMutex);
        }

        printf("T=%d, H=%d\n", localCopy.temperature, localCopy.humidity);
        os_delay(100);
    }
}

void main(void)
{
    g_sensorMutex = os_mutex_create();
}
```

通过上述方式，无论任务怎么切换，都可以保证Task_Comm每次打印出来的值，总是正常且完整的，不会出现类似之前的混乱。

---

## 四：简单的整型变量是否还需要加锁吗？

有人可能会提出这样的问题：

> 对于一个简单的32位整型变量，是否也需要使用互斥锁等保护机制？

这是一个非常好的问题。下面给出一个简单的示例：

```c
volatile uint32_t counter = 0;

void Task_A(void)
{
    while (1) {
        counter = get_counter();
        os_delay(10);
    }
}

void Task_B(void)
{
    while (1) {
        printf("%d\n", counter);
        os_delay(10);
    }
}
```

在这里，我们先假设上述代码运行在32位处理器上。**在这些处理器上，对于counter的读或写实际上都是原子性的。**

counter = get_counter()语句，首先调用了get_counter()获取最新值，然后再将其写入counter，其汇编代码可能如下：

```c
    ; 基于arm cortex-m
    bl      get_counter       ; 调用get_counter()
    ldr     r1, =counter      ; 取counter的地址
    str     r0, [r1]          ; 把返回值r0存入counter
```

而对于printf("%d\n", counter)语句，其中只涉及到counter的读取。读取部分的汇编代码可能如下：
```c
    ; 基于arm cortex-m
    ldr     r3, =counter    ; 将counter的地址加载到寄存器r3
    ldr     r2, [r3]        ; 从内存中读取counter当前值
```

可以看到，counter的写入由str r0, [r1]完成，读取由ldr r2, [r3]完成。**此时，无论是读取还是写入，都是原子操作，不需要加任何保护操作。**

不过，如果上述代码运行在8位或16位处理器上，由于uint32_t为32位，这就导致了无论是读取还是写入，都需要分多次才能完成。此时，**此时，无论是读取还是写入，都是非原子操作，需要加任何保护操作。**

## 五、总结

综上所述，在RTOS环境中一个任务读而另一个任务写，“是否需要加锁”取决于操作是否具备原子性。

1. **对于单纯的读或写（如counter = get_counter）**：在与CPU位宽一致的情况下（例如32位MCU上的32位变量），其访问是原子的，不需要额外保护。而如果位宽不一致，则应当加以保护。
2. **结构体等多成员变量**：由于这些结构数据由多个字段组成，需要加以保护。

当然，实际的环境中可能涉及到更为复杂的读写操作。本文上述内容，仅给出了以上两种情况的分析说明。具体在你的项目中是否需要加保护，需要仔细进行分析。

---

### 🚀 延伸阅读

如果你想深入理解 RTOS 内核是如何实现这些同步机制的（包括互斥锁、信号量、任务调度等），
欢迎了解新版 **《手写RTOS实战课程》**。

课程内容基于 **RISC-V架构**，同时支持移植到 **Cortex-M**，从零实现任务管理、动态内存分配、中断、同步机制，并配有完整项目实战，可直接用于面试展示。

* **限时优惠：9.9元抵200元；老学员额外再减100元。**；

🎯 点击下方二维码开启你的RTOS实战之旅！

![alt text](../../.vuepress/public/rtosv2.png)

也可点击链接开始学习：[【RTOS内核开发】从0手写嵌入式操作系统](https://zw8ls.xetlk.com/s/H2F1Y)

## 课程推荐
+ [全新升级的手写RTOS课程：从原理到实战，一次掌握操作系统的核心](https://mp.weixin.qq.com/s/tUMnG1R5FWwL6IpztO3Rdg)
+ [用10000+行代码手写一个TCP/IP协议栈](https://mp.weixin.qq.com/s/2hjC7um-5uxFj6VCba9Skg)
+ [硬核项目，从0手搓一个RISC-V模拟器！](https://mp.weixin.qq.com/s/6ULO5HO_CtjlawaRPMJ6Yw)

# 历史文章
+ [作为嵌入式开发者，有必要手写一个RTOS吗](https://mp.weixin.qq.com/s/mU5YLWv9KFo-mNPNsM4UwA)
+ [别再只用malloc了！嵌入式C的栈上动态数组分配：变长数组](https://mp.weixin.qq.com/s/nzsNrm8mR0VNNB8MOV3j6g)
+ [告别固定大小：利用C语言伸缩型数组，实现动态结构体](https://mp.weixin.qq.com/s/bmYTlPv5-dCidAMylz0HqQ)
+ [C结构体的初始化你还在按顺序写？试试这个C99神操作！](https://mp.weixin.qq.com/s/AbpN8CL5Fj9tLnFLKAeYew)

## 作者介绍
> **李述铜，嵌入式系统与底层架构领域讲师**，专注于操作系统、CPU 架构的教学与研究。 出版作品《从0手写x86计算机操作系统》。**主讲课程**包括：《从0手写嵌入式操作系统》《从0手写TCP/IP协议栈》等。

> 欢迎关注我的**微信公众号【李述铜的底层修炼】**，以便及时获取我的更多文章！-> lishutong1024.cn
