---
title: 创建目录
author: 李述铜
createTime: 2024/08/08 11:27:51
permalink: /tech/hlqab0kq/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本课时介绍目录创建的接口，Linux创建目录的接口有：
[https://linux.die.net/man/2/mkdir](https://linux.die.net/man/2/mkdir)

## 应用场合
在某些情况下，我们需要创建目录，此时可以使用f_mkdir()函数完成这荐工作。

注：mkdir简记为make directory。

### 接口介绍
`f_mkdir` 函数用于创建新的目录。

```c
FRESULT f_mkdir(
  const TCHAR* path /* [IN] 目录名称 */
);
```
函数原型

- `path`：指向以 null 结尾的字符串，指定要创建的目录名称。

返回值：

- `FR_OK`：操作成功。
- `FR_DISK_ERR`：磁盘操作错误。
- `FR_INT_ERR`：FatFs 内部错误。
- `FR_NOT_READY`：物理驱动器未准备好。
- `FR_NO_PATH`：无法找到路径。
- `FR_INVALID_NAME`：无效的路径或文件名。
- `FR_DENIED`：操作被拒绝。
- `FR_EXIST`：目录或文件已经存在。
- `FR_WRITE_PROTECTED`：磁盘为只读。
- `FR_INVALID_DRIVE`：无效的逻辑驱动器。
- `FR_NOT_ENABLED`：文件系统未启用。
- `FR_NO_FILESYSTEM`：没有文件系统。
- `FR_TIMEOUT`：操作超时。
- `FR_NOT_ENOUGH_CORE`：内存不足。

描述：如果目录创建成功，它会返回 FR_OK。如果目录已经存在，它会返回 FR_EXIST。

## 示例
```c
FRESULT res;
res = f_mkdir("sub1");
if (res != FR_OK) {
    // 处理错误
}

res = f_mkdir("sub1/sub2");
if (res != FR_OK) {
    // 处理错误
}

res = f_mkdir("sub1/sub2/sub3");
if (res != FR_OK) {
    // 处理错误
}
```
## 注意事项
f_mkdir()不允许创建多层目录。例如，如果dir0或dir1不存在，那么dir2的目录创建将失败。
```c
f_mkdir(_T("0:/dir0/dir1/dir2"));
```
由些可知，给出一个多级路径后，f_mkdir()并不会逐级解析路径中各个子目录并创建。我们需要自己手动将这些目录创建出来。


