---
title: 删除文件或目录
author: 李述铜
createTime: 2024/08/08 11:26:29
permalink: /tech/omix2whk/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本节课时介绍目录或文件删除，标准C库和Linux上相关接口有：
* [https://cplusplus.com/reference/cstdio/remove/](https://cplusplus.com/reference/cstdio/remove/)
* [https://linux.die.net/man/2/unlink](https://linux.die.net/man/2/unlink)

## 应用场合
在某些情况下，需要删除指定的或者目录，此时需要利用删除接口。FATFS提供了这样的接口。

## 接口介绍
`f_unlink` 函数用于从存储卷中删除文件或子目录。以下是该函数的详细说明：

```c
FRESULT f_unlink(
  const TCHAR* path  /* [IN] 文件或子目录的名称 */
);
```

- `path`：要删除的文件或子目录的路径

返回值：

- `FR_OK`：操作成功。
- `FR_DISK_ERR`：磁盘错误。
- `FR_INT_ERR`：发生了内部错误。
- `FR_NOT_READY`：文件系统不可用。
- `FR_NO_FILE`：文件或目录不存在。
- `FR_NO_PATH`：指定路径无效。
- `FR_INVALID_NAME`：无效的文件或目录名称。
- `FR_DENIED`：操作被拒绝。
- `FR_WRITE_PROTECTED`：存储卷处于写保护状态。
- `FR_INVALID_DRIVE`：无效的驱动器号。
- `FR_NOT_ENABLED`：FatFs模块未启用。
- `FR_NO_FILESYSTEM`：没有可用的文件系统。
- `FR_TIMEOUT`：操作超时。
- `FR_LOCKED`：文件或目录被锁定。
- `FR_NOT_ENOUGH_CORE`：内存不足

## 注意事项
在使用该函数时，需要注意以下几点：

- 无法删除具有只读属性（AM_RDO）的目录或者文件，只读意味着不能修改（包含删除）。如果仍然调用，则函数返回FR_DENIED，删除失败
- 无法删除非空目录。非空目录下可能有子文件或者子目录，如果需要删除目录，则需要采用先从最深层 的目录开始，依次往上把所有的文件及父目录删除，最后才能删除最顶层的目录
- 无法删除当前目录


