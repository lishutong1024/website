---
title: 截断文件
author: 李述铜
createTime: 2024/08/08 10:31:24
permalink: /tech/z1kpzixc/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本小节介绍文件截断的相关接口，可参考Linux的系统调用：[https://linux.die.net/man/2/truncate](https://linux.die.net/man/2/truncate)

## 应用场合
在对文件进行操作的过程，可能出于某些原因需要对文件进行截断。此时可用到`f_truncate`函数来完成该截断功能。其效果如下图所示，该函数会在当前读写位置进行截断，即将文件后面数据全部丢弃，只保留前面部分。

![alt text](../../../../../.vuepress/public/image/docs/notes/tech/fatfs/use/c2/trunc/image.png)

例如：

1.  控制文件大小，避免文件无限增长。例如，在向文件中写入数据的同时，具体写入的数量量大小不确定，但想要限制文件的大小；那么，可在写入后在指定位置截断，把文件大小控制在限定的范围内。又或者，在某些应用中，可以定期使用`f_truncate`来确保文件不会超过指定的大小。 
2.  删除多余的数据。可以将文件读/写指针设置到要截断的位置，然后进行截断。这样后面的数据就会被丢弃
3. 回收空间。在驱动器空间紧张的情况下，可以使用`f_truncate`来对大文件的体积进行缩减。 

## 接口介绍
`f_truncate`的函数原型如下：

```c
FRESULT f_truncate (
  FIL* fp     /* [输入] 要截断的文件对象 */
);
```
参数

- `fp`：指向要截断的打开文件对象的指针。

返回值

- `FR_OK`, `FR_DISK_ERR`, `FR_INT_ERR`, `FR_DENIED`, `FR_INVALID_OBJECT`, `FR_TIMEOUT`

## 截断的位置
f_truncate()使用当前文件读写指针的位置进行截断。因此，如果想让文件缩减到指定的大小，则需要先用f_lseek()定位到相应的位置，然后再调用f_truncate()。

特殊的，如果想让文件被截断为0，则可以将文件的读写位置用f_rewind()调整到开头，再使用f_truncate()；或者在f_open()时传递FA_CREATE_ALWAYS参数。
