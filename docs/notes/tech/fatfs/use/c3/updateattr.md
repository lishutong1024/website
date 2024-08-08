---
title: 更新文件属性
author: 李述铜
createTime: 2024/08/08 11:28:55
permalink: /tech/uul7w6km/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本小节介绍文件属性更改的接口，Linux及标准库下相关的接口有：
* [https://linux.die.net/man/3/chmod](https://linux.die.net/man/3/chmod)
* [https://linux.die.net/man/3/rename](https://linux.die.net/man/3/rename)

## 应用场合
在少数情况下，需要修改文件或目录的属性，例如文件名、只读、隐藏、时间戳等。FATFS提供了相应的接口来修改这些属性。

## 接口介绍
### 修改名称
f_rename函数可以用于对文件或目录的名称修改，也可以用于将文件或目录移动到其它某个目录下

```c
FRESULT f_rename(
  const TCHAR* old_name, /* [IN] 旧对象名称 */
  const TCHAR* new_name  /* [IN] 新对象名称 */
);
```
函数参数：

- `old_name`：文件或目录所在的路径，可使用绝对或相对路径
- `new_name`：文件或目录新的名称或路径

返回值：

- `FR_OK`：操作成功。
- `FR_DISK_ERR`：磁盘操作错误。
- `FR_INT_ERR`：FatFs 内部错误。
- `FR_NOT_READY`：物理驱动器未准备好。
- `FR_NO_FILE`：未找到文件。
- `FR_NO_PATH`：无法找到路径。
- `FR_INVALID_NAME`：无效的路径或文件名。
- `FR_EXIST`：新对象名称已存在。
- `FR_WRITE_PROTECTED`：磁盘为只读。
- `FR_INVALID_DRIVE`：无效的逻辑驱动器。
- `FR_NOT_ENABLED`：文件系统未启用。
- `FR_NO_FILESYSTEM`：没有文件系统。
- `FR_TIMEOUT`：操作超时。
- `FR_LOCKED`：文件已被锁定。
- `FR_NOT_ENOUGH_CORE`：内存不足。

示例：
```c
/* 在默认驱动器中重命名对象 */
f_rename("oldname.txt", "newname.txt");

/* 在第二个驱动器中重命名对象 */
f_rename("2:oldname.txt", "newname.txt");

/* 重命名对象并将其移动到驱动器中的另一个目录 */
f_rename("log.txt", "old/log0001.txt");
```
### 修改属性标志
在FAT文件系统中，文件或目录可具备一定的属性，如只读、存档、系统、隐藏等。一般情况下，我们不需要修改这些属性，直接使用创建文件时自带的默认属性即可。但在某些情况下，我们可能需要修改属性，此时可以使用f_chmode(change mode)接口来实现这个需求。

```c
FRESULT f_chmod (
  const TCHAR* path, /* [IN] 对象名称 */
  BYTE attr,         /* [IN] 属性标志 */
  BYTE mask          /* [IN] 属性掩码 */
);
```
参数：

- `path`：目录或者文件的路径。
- `attr`：要设置的属性标志，可以是以下一个或多个组合：AM_RDO（只读）、AM_ARC（存档）、AM_SYS（系统）、AM_HID（隐藏）。
- `mask`：属性掩码，指定要更改的属性。指定的属性将被设置或清除，而其他属性将保持不变。

返回值：

- `FR_OK`：操作成功。
- `FR_DISK_ERR`：磁盘操作错误。
- `FR_INT_ERR`：FatFs 内部错误。
- `FR_NOT_READY`：物理驱动器未准备好。
- `FR_NO_FILE`：未找到文件。
- `FR_NO_PATH`：无法找到路径。
- `FR_INVALID_NAME`：无效的路径或文件名。
- `FR_WRITE_PROTECTED`：磁盘为只读。
- `FR_INVALID_DRIVE`：无效的逻辑驱动器。
- `FR_NOT_ENABLED`：文件系统未启用。
- `FR_NO_FILESYSTEM`：没有文件系统。
- `FR_TIMEOUT`：操作超时。
- `FR_NOT_ENOUGH_CORE`：内存不足。

示例：
```c
/* 设置为只读，清除存档属性，其他属性保持不变 */
f_chmod("file.txt", AM_RDO, AM_RDO | AM_ARC);
```
上述代码中，指定了要修改AM_RDO | AM_ARC和两个属性位，由于attr参数=AM_RDO，即表明要将ReadOnly位置1；而另一个位AM_ARC位由于没有在该参数中，所以表示其要清除AM_ARC位。

通过attr和mode的组合，即可使用指定要修改哪些属性标志，并且这些属性标志中哪些清0哪些置1。

### 修改文件时间戳
一般情况下，文件或目录的修改时间会随着文件的写入自动更新，无需处理。如果必须要自己修改文件的时间，可以使用f_utime（）函数。

```c
FRESULT f_utime (
  const TCHAR* path,  /* [IN] 对象名称 */
  const FILINFO* fno  /* [IN] 要设置的时间和日期 */
);
```
参数：

- `path`：指向以 null 结尾的字符串，指定要更改时间戳的对象。
- `fno`：指向文件信息结构的指针，其中包含要在 `fdate` 和 `ftime` 成员中设置的时间戳。不需要关心其他成员。

返回值：

- `FR_OK`：操作成功。
- `FR_DISK_ERR`：磁盘操作错误。
- `FR_INT_ERR`：FatFs 内部错误。
- `FR_NOT_READY`：物理驱动器未准备好。
- `FR_NO_FILE`：未找到文件。
- `FR_NO_PATH`：无法找到路径。
- `FR_INVALID_NAME`：无效的路径或文件名。
- `FR_WRITE_PROTECTED`：磁盘为只读。
- `FR_INVALID_DRIVE`：无效的逻辑驱动器。
- `FR_NOT_ENABLED`：文件系统未启用。
- `FR_NO_FILESYSTEM`：没有文件系统。
- `FR_TIMEOUT`：操作超时。
- `FR_NOT_ENOUGH_CORE`：内存不足。

示例：
下面是一个示例函数，用于设置文件或子目录的时间戳：

```c
FRESULT set_timestamp (
    char *obj,     /* 文件名的指针 */
    int year,
    int month,
    int mday,
    int hour,
    int min,
    int sec
)
{
    FILINFO fno;

    fno.fdate = (WORD)(((year - 1980) * 512U) | month * 32U | mday);
    fno.ftime = (WORD)(hour * 2048U | min * 32U | sec / 2U);

    return f_utime(obj, &fno);
}
```
从上面的代码可以看到，虽然f_tuime传入了整个FILINFO结构，但实际上这个结构中使用的只是fdate和ftime两个字段，其它内容并不会影响。所以不需要对其它字段进行任何初始化设置。

