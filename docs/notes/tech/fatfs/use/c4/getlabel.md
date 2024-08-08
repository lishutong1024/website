---
title: 设置和获取卷标
author: 李述铜
createTime: 2024/08/08 11:35:09
permalink: /tech/j8dwrlov/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本课时介绍如何设置和获取设备的卷标。

## 主要内容
当我们在Windows加载磁盘时，会看到除了盘符以外，每个磁盘还有个名称，如Windows、Data、Disk A、Disk B。这些具体的名称值，就是所谓的卷标。

![alt text](../../../../../.vuepress/public/image/docs/notes/tech/fatfs/use/c4/getlabel/image.png)

FATFS允许对这些卷标名称进行修改，也支持获取名称。不过，这些功能似乎用得很少，所以简单了解即可。

## 设置卷标接口
f_setlabel 函数用于设置/删除卷的卷标

```c
FRESULT f_setlabel (
const TCHAR * label  / [输入] 要设置的卷标签 */
);
```
参数：

- `label`：用于指定要设置的卷标签名称，具体使用看下面的示例。

返回值：

- FR_OK：成功
- FR_DISK_ERR：磁盘错误
- FR_INT_ERR：FATFS 内部错误
- FR_NOT_READY：设备未准备好
- FR_INVALID_NAME：无效的名称
- FR_WRITE_PROTECTED：磁盘写保护
- FR_INVALID_DRIVE：无效的驱动器
- FR_NOT_ENABLED：FATFS 未启用
- FR_NO_FILESYSTEM：没有文件系统
- FR_TIMEOUT：操作超时

描述：

当字符串具有驱动器前缀时，卷标签将设置为由驱动器前缀指定的卷。如果未指定驱动器号，卷标签将设置为默认驱动器。如果给定卷标签的长度为零，则卷上的卷标签将被删除。

示例：
```c
/* 将卷标签设置为默认驱动器 */
f_setlabel("DATA DISK");

/* 将卷标签设置为驱动器 2 */
f_setlabel("2:DISK 3 OF 4");

/* 移除驱动器 2 的卷标签 */
f_setlabel("2:");

/* 设置 Unix 风格的卷标签 */
f_setlabel("/tfcard/LOG DISK");
```
## 获取卷标接口
f_getlabel 函数用于获取卷的卷标签和卷序列号。

```c
FRESULT f_getlabel (
    const TCHAR * path,  / [输入] 逻辑驱动器号 */
    TCHAR * label,       / [输出] 卷标签 */
    DWORD * vsn          / [输出] 卷序列号 */
);
```
参数：

- `path`：指向以 null 结尾的字符串，用于指定逻辑驱动器。Null 字符串表示默认驱动器。
- `label`：指向缓冲区以存储卷标签。如果卷没有标签，将返回一个空字符串。如果不需要此信息，可以设置为空指针。为避免缓冲区溢出，缓冲区大小应至少大于等于以下显示的大小。
  
| Configuration | FF_FS_EXFAT == 0 | FF_FS_EXFAT == 1 |
| --- | --- | --- |
| FF_USE_LFN == 0 | 12 items | - |
| FF_LFN_UNICODE == 0 | 12 items | 23 items |
| FF_LFN_UNICODE == 1,3 | 12 items | 12 items |
| FF_LFN_UNICODE == 2 | 34 items | 34 items |

注：之所有有这些不同的大小，取决于采用的字符编码和文件系统类型。

- `vsn`：指向 DWORD 变量，用于存储卷序列号。如果不需要此信息，可以设置为空指针。

返回值：

- FR_OK：成功
- FR_DISK_ERR：磁盘错误
- FR_INT_ERR：FATFS 内部错误
- FR_NOT_READY：设备未准备好
- FR_INVALID_DRIVE：无效的驱动器
- FR_NOT_ENABLED：FATFS 未启用
- FR_NO_FILESYSTEM：没有文件系统
- FR_TIMEOUT：操作超时

示例：
```c
char str[12];

/* 获取默认驱动器的卷标签 */
f_getlabel("", str, 0);

/* 获取驱动器 2 的卷标签 */
f_getlabel("2:", str, 0);
```
## 注意事项
卷序列号一般没什么用，其存储在FAT文件系统中的BPB结构的Volume ID字段中。
