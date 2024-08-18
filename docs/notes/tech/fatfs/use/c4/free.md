---
title: 获取剩余的空间
author: 李述铜
createTime: 2024/08/08 11:35:01
permalink: /tech/fatfs/nonsl4ji/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本课时介绍如何获取存储设备上空闲的存储空间大小。

## 应用场合
文件系统中可用的数据空间总是有限的。当数据空间使用完时，再往里面写入数据将导致写失败；因此，在必要时需要适当监控整个文件中还有多少空闲的空间。

## 接口介绍
FATFS中用于查询某个驱动器上空闲空间的数量的接口为`f_getfree` ，其函数声明如下：

```c
FRESULT f_getfree (
  const TCHAR* path,  /* [IN] 逻辑驱动器号 */
  DWORD* nclst,       /* [OUT] 空闲簇数 */
  FATFS** fatfs       /* [OUT] 对应的文件系统对象的指针 */
);
```
**参数:**

- `path`: 指向指定逻辑驱动器的以空字符结尾的字符串的指针。空字符串表示默认驱动器。
- `nclst`: 用于存储空闲簇数的 DWORD 变量的指针。
- `fatfs`: 用于存储指向相应文件系统对象的指针的指针。

**返回值:**

- `FR_OK`
- `FR_DISK_ERR`
- `FR_INT_ERR`
- `FR_NOT_READY`
- `FR_INVALID_DRIVE`
- `FR_NOT_ENABLED`
- `FR_NO_FILESYSTEM`
- `FR_TIMEOUT`

从上述接口说明可以发现：该接口获取的是驱动器上未被使用的空闲簇的数量，而非多少字节。因此，要获得实际的空闲字节数，需要自行转换。

具体的转换方法为：fatfs->csize(每簇的扇区数量) * fatfs->ssize(每扇区字节数)*nclst(空闲簇数量)

示例：

```c
FATFS *fs;
DWORD fre_clust, fre_sect, tot_sect;

/* 获取驱动器 1 的卷信息和空闲簇数 */
res = f_getfree("1:", &fre_clust, &fs);
if (res) die(res);

/* 获取总扇区数和空闲扇区数 */
tot_sect = (fs->n_fatent - 2) * fs->csize;
fre_sect = fre_clust * fs->csize;

/* 打印可用空间（假定每扇区 512 字节） */
printf("%10lu KiB 总驱动空间。\n%10lu KiB 可用。\n", tot_sect / 2, fre_sect / 2);

// 注：tot_sect/2表示tot_sect*/512/1024
```
## 注意事项
在FAT32文件系统中，有一块FSINFO的区域保存了整个文件系统簇数量等相关信息。在FATFS对文件系统进行读写时，会更新这里面的信息。因此，为了简单快速起见，`f_getfree` 默认从该FSINFO中查询获得空闲可用的簇数量。

不过，由于FSINFO的值在一些情况下可能不对，所以想要获取最为准确的信息，则需要遍历扫描整个FAT表，找到未被使用的簇并统计，但是这个过程是比较耗时的。如需要使用该功能，可配置`FF_FS_NOFSINFO`项来强制扫描整个FAT表。



