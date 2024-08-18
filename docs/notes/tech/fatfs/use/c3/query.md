---
title: 查询目录及文件信息
author: 李述铜
createTime: 2024/08/08 11:16:31
permalink: /tech/fatfs/nwdn929i/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本小节介绍文件或目录信息属性的获取，C标准库中并不提供这些接口，而是操作系统的系统调用接口中提供，例如，Linux上的获取文件系统的接口fstat：[https://linux.die.net/man/2/fstat](https://linux.die.net/man/2/fstat)

## 应用场合
在某些情况下，需要检查特定文件或目录的是存在，以及相应的信息，如大小、文件还是目录、只读等属性属性、修改时间等。在这种情况下，可以使用f_stat来获取这些信息。

## 接口介绍
`f_stat`函数用于检查文件或子目录是否存在，以及获取文件信息。

```c
FRESULT f_stat (
  const TCHAR* path,  /* [IN] 对象名称 */
  FILINFO* fno        /* [OUT] FILINFO结构 */
);
```
函数参数：

- `path`：文件或目录的路径
- `fno`：指向空白的FILINFO结构的指针，用于存储对象的信息。如果不需要这些信息，则将其设置为空指针（比如只想查看文件或目录是否存在）

**返回值**：

- `FR_OK`
- `FR_DISK_ERR`
- `FR_INT_ERR`
- `FR_NOT_READY`
- `FR_NO_FILE`
- `FR_NO_PATH`
- `FR_INVALID_NAME`
- `FR_INVALID_DRIVE`
- `FR_NOT_ENABLED`
- `FR_NO_FILESYSTEM`
- `FR_TIMEOUT`
- `FR_NOT_ENOUGH_CORE`

如果该文件或子目录不存在，函数将返回`FR_NO_FILE`。如果存在，函数将返回`FR_OK`，并将有关该对象的信息（大小、时间戳和属性）存储到文件信息结构中。

## 文件信息结构FILINFO
`FILINFO` 结构体存储了指定的文件和目录的相关信息。

```c
typedef struct {
    FSIZE_t fsize;               /* 文件大小（以字节为单位） */
    WORD    fdate;               /* 最后修改日期 */
    WORD    ftime;               /* 最后修改时间 */
    BYTE    fattrib;             /* 属性标志 */
#if FF_USE_LFN
    TCHAR   altname[FF_SFN_BUF + 1]; /* 替代对象名称 */
    TCHAR   fname[FF_LFN_BUF + 1];   /* 主要对象名称 */
#else
    TCHAR   fname[12 + 1];       /* 对象名称 */
#endif
} FILINFO;
```

该结构体各成员详细信息：

- `fsize`：以字节为单位的文件大小
- `fdate`：文件上次修改日期或目录创建日期
   - bit15:9：年份，以1980年为基准（0..127）
   - bit8:5：月份（1..12）
   - bit4:0：日期（1..31）
- `ftime`：文件上次修改时间或目录创建时间。 
   - bit15:11：小时（0..23）
   - bit10:5：分钟（0..59）
   - bit4:0：秒 / 2（0..29），即实际的秒数需要*2
- `fattrib`：属性标志的组合： 
   - `AM_RDO`：文件只读，不允许写
   - `AM_HID`：文件隐藏
   - `AM_SYS`：系统文件
   - `AM_ARC`：存档文件
   - `AM_DIR`：是否是目录，如果不是目录则为文件
- `fname[]`：以空字符结尾的对象名称。当没有项目可读取时，存储空字符串，并表示此结构无效。`fname[]` 和 `altname[]` 的大小分别可以在 LFN 配置中进行配置。
- `altname[]`：如果可用，将存储替代对象名称。在非 LFN 配置中，此成员不可用。

## 具体示例
```c
FRESULT fr;
FILINFO fno;
const char *fname = "file.txt";

printf("测试\"%s\"...\n", fname);

fr = f_stat(fname, &fno);
switch (fr) {
    case FR_OK:
        printf("大小：%lu\n", fno.fsize);
        printf("时间戳：%u-%02u-%02u, %02u:%02u\n",
               (fno.fdate >> 9) + 1980, fno.fdate >> 5 & 15, fno.fdate & 31,
               fno.ftime >> 11, fno.ftime >> 5 & 63);
        printf("属性：%c%c%c%c%c\n",
               (fno.fattrib & AM_DIR) ? 'D' : '-',
               (fno.fattrib & AM_RDO) ? 'R' : '-',
               (fno.fattrib & AM_HID) ? 'H' : '-',
               (fno.fattrib & AM_SYS) ? 'S' : '-',
               (fno.fattrib & AM_ARC) ? 'A' : '-');
        break;

    case FR_NO_FILE:
    case FR_NO_PATH:
        printf("\"%s\" 不存在。\n", fname);
        break;

    default:
        printf("发生错误。(%d)\n", fr);
}
```
## 注意事项

FILINFO结构中包含的字段信息实际上是由具体的文件系统来决定的。

在FAT文件系统中，文件或目录的信息保存在设备上，且其中包含了文件名、大小、属性、时间等信息。这些信息直接反映到FILINFO结构中。因此，你可能发现，FILINFO结构中并没有包含可执行、拥有者等在Linux上有拥有的信息字段，这是由文件系统本身的特点所决定的，FAT文件系统中并不包含这些信息。

从这里可以看出，对文件系统的理解有助于你使用FATFS的相关接口。
