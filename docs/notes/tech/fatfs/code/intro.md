---
title: 课程简介
author: 李述铜
createTime: 2024/08/08 16:52:04
permalink: /tech/fatfs/47usho1i/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的移植，该部分内容与特定硬件相关，较难。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

## 课程简介
本课程为《嵌入式文件系统FATFS详解》系列课程的第二部分，主要介绍FATFS在不同硬件环境的移植。

网上关于FATFS移植这块的文章和资料不少，但是我仔细看过，基本上都介绍得较简单、千篇一律。大体上都是介绍下需要移植的接口，然后给出相应的代码。至于为什么只需要移植这些接口、这些接口在整个FATFS中承载的作用是什么、在不同的硬件环境下如何编写代码，却鲜有涉及。

本课程虽然也是讲移植，但是会从更深层次的角度去分析其内部原理，然后以此为基础，再讲为什么这么做、具体如何做。

## 主要内容
整体内容大致分以下几部分：

- FATFS整体软件结构介绍：了解一些关于FATFS设计结构上的理论知识，帮助理解后续的移植工作
- 移植到Visual Studio环境：在PC机上采用Visual Studio模拟一个简单的环境，移植FATFS到该环境中。该环境下整体结构简单、易于理解，可以更好地帮助理解移植时要做的主要工作
- 移植到STM32：移植到具体的嵌入式设备环境中，支持SPI Flash和TF卡
- 支持嵌入式操作系统RTOS
  
## 适用对象

- 嵌入式开发者
- 在校计算机、自动化、通信等大学生
- 对FATFS感兴趣的技术爱好者
  
## 先修知识

虽然这门课程比较简单；但是建议在学习之前，必须具备以下知识：

- 熟悉掌握C语言开发
- 了解FATFS的基本使用，本系列课程的第一部分以及第二部分
- 了解基础的嵌入式系统开发知识

## 支持和答疑
在学习中如何有与本课程内容相关的问题，可与我取得联系，获得相关支持和帮助。

::: warning
但如果是其它的问题，比如你的个人项目的问题，由于时我的时间和精力有效，无法提供帮助，请自行查找问题的解决方案。
:::

## 课程要求
课程的一部分内容采用的是Windows + Visual Studio开发环境（建议使用VS2022）进行实验录制。**配套源码包中提供了Visual Studio的工程**。

