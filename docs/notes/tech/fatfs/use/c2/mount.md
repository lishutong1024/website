---
title: 挂载文件系统
author: 李述铜
createTime: 2024/08/08 10:29:13
permalink: /tech/fatfs/m64lw6yl/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本课时介绍FATFS提供的文件系统挂载接口，该接口在使用文件系统时必须先进行挂载。

挂载完成之后，才能进行文件和目录相关的访问操作。
## 功能简介
**所谓文件系统挂载，就是针对想要操作的文件系统分区，对存储设备进行初始化，并且检查该分区上是否有支持的文件系统。**

如果有文件系统，则从文件系统中读取出有关该文件系统分配的一些信息值，如簇大小、FAT表的起始位置等，保存到一个FATFS结构中。最后，将该结构注册到FATFS模块内部供后续使用。另外，FATFS结构还包含了用于提交存储访问效率的缓冲区，挂载时会对该缓冲区进行初始化。

```c
typedef struct {
    BYTE    fs_type;      /* FAT type (0, FS_FAT12, FS_FAT16, FS_FAT32 or FS_EXFAT) */
    BYTE    pdrv;         /* Hosting physical drive of this volume */
    BYTE    n_fats;       /* Number of FAT copies (1,2) */
    BYTE    wflag;        /* win[] flag (b0:win[] is dirty) */
    BYTE    fsi_flag;     /* FSINFO flags (b7:Disabled, b0:Dirty) */
    WORD    id;           /* Volume mount ID */
    WORD    n_rootdir;    /* Number of root directory entries (FAT12/16) */
    WORD    csize;        /* Sectors per cluster */
#if FF_MAX_SS != FF_MIN_SS
    WORD    ssize;        /* Sector size (512,1024,2048 or 4096) */
#endif
#if FF_FS_EXFAT
    BYTE*   dirbuf;       /* Directory entry block scratchpad buffer */
#endif
#if FF_FS_REENTRANT
    FF_SYNC_t sobj;       /* Identifier of sync object */
#endif
#if !FF_FS_READONLY
    DWORD   last_clust;   /* FSINFO: Last allocated cluster (0xFFFFFFFF if invalid) */
    DWORD   free_clust;   /* FSINFO: Number of free clusters (0xFFFFFFFF if invalid) */
#endif
#if FF_FS_RPATH
    DWORD   cdir;         /* Cluster number of current directory (0:root) */
#if FF_FS_EXFAT
    DWORD   cdc_scl;      /* Containing directory start cluster (invalid when cdir is 0) */
    DWORD   cdc_size;     /* b31-b8:Size of containing directory, b7-b0: Chain status */
    DWORD   cdc_ofs;      /* Offset in the containing directory (invalid when cdir is 0) */
#endif
#endif
    DWORD   n_fatent;     /* Number of FAT entries (Number of clusters + 2) */
    DWORD   fsize;        /* Sectors per FAT */
    LBA_t   volbase;      /* Volume base LBA */
    LBA_t   fatbase;      /* FAT base LBA */
    LBA_t   dirbase;      /* Root directory base (LBA|Cluster) */
    LBA_t   database;     /* Data base LBA */
    LBA_t   winsect;      /* Sector LBA appearing in the win[] */
    BYTE    win[FF_MAX_SS]; /* Disk access window for directory, FAT (and file data at tiny cfg) */
} FATFS;
```
在挂载完成后，后续所有关于该分区上文件读写的操作，都会围绕着FATFS结构进行。

当所有工作完成后，不需要再访问该分区时，就可以使用文件系统的卸载功能，将该FATFS结构从FATFS软件中取消注册。

## 挂载接口
在使用FATFS之前，需要先挂载文件系统，使用f_mount可以实现该挂载工作。

```c
FRESULT f_mount (
  FATFS* fs,         /* [IN] 文件系统对象 */
  const TCHAR* path,  /* [IN] 逻辑驱动器号 */
  BYTE opt           /* [IN] 初始化选项 */
);
```
具体参数如下：
- fs：指向要注册和清除的文件系统对象的指针。使用空指针将卸载已注册的文件系统对象。
- path：挂载的驱动器号名称字符串，格式为：驱动器数字序号（0-9):，如果没有包含驱动器号，则表示使用默认的驱动器。
- opt：是否立即挂载，0：不立即挂载（只做基本的参数检查和内部初始化设置，不检查磁盘），1：立即挂载文件系统

返回值：
- FR_OK：操作成功
- FR_INVALID_DRIVE：逻辑驱动器无效
- FR_DISK_ERR：磁盘错误
- FR_NOT_READY：设备尚未准备好
- FR_NOT_ENABLED：未启用
- FR_NO_FILESYSTEM：无文件系统

## 取消挂载

要取消挂载，可以使用f_umount接口。`f_unmount`函数实际上是一个宏。

```c
#define f_unmount(path) f_mount(0, path, 0)
```
## 代码示例
以下是简单的示例，针对使用默认驱动器的挂载。

```c
int main (void)
{
    FATFS *fs;     /* 指向文件系统对象的指针 */

    fs = malloc(sizeof(FATFS));   /* 获取卷的工作区 */
    f_mount(fs, "", 0);            /* 挂载默认驱动器 */

    f_open(...                     /* 在这里可以使用任何文件API */

    ...

    f_mount(fs, "", 0);            /* 重新挂载默认驱动器以重新初始化文件系统 */

    ...

    f_mount(0, "", 0);             /* 取消挂载默认驱动器 */
    free(fs);                      /* 在这里可以丢弃工作区 */

    ...
}
```
## 注意事项
### 是否强制立即挂载
f_mount中可以指定是否立即挂载，即是否立即初始化存储设备、并检查文件系统分区和相关信息。

- opt=1时，在f_mount执行这些工作
- opt=0时，在后续操作文件时再执行这些工作

所以，当opt=0时，相当于把检查存储设备是否存在、文件分区状态这一项工作给延后。
一般情况下，opt的值取1即可。
