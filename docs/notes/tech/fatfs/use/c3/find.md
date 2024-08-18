---
title: 在目录中查找
author: 李述铜
createTime: 2024/08/08 11:20:52
permalink: /tech/fatfs/m56erxke/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本节课时主要介绍如何在目录中查找文件或目录。在C库或Linux等系统调用中没有相应的现成接口可


## 应用场合
有时候，你可能想要在指定的目录下查找文件。如果使用前面介绍的f_opendir()/f_readdir()接口，则需要从目录的最开始依次去查找，然后进行比较，直到找到指定的文件。显然这种方式需要你编写代码，开发效率低。

FATFS提供了相应的接口能够帮助你去搜索目录中的指定文件。

## 接口介绍
### 初始化查找f_findfirst
要进行文件的查找，首先要指定在哪个目录下进行查找，以及查找什么名字的目录或者文件。这个过程由f_findfirst()来完成。其函数原型如下：

```c
FRESULT f_findfirst (
  DIR* dp,              /* [OUT] 指向目录对象的指针 */
  FILINFO* fno,         /* [OUT] 指向文件信息结构的指针 */
  const TCHAR* path,    /* [IN] 指向要打开的目录名的字符串指针 */
  const TCHAR* pattern  /* [IN] 指向匹配模式字符串的字符串指针 */
);
```

**参数**

- `dp`：指向空白目录对象的指针
- `fno`：存储找到文件或目信息的文件信息结构
- `path`：查找的目录路径
- `pattern`：查找时使用的模式匹配字符串

**返回值**

- FR_OK：成功
- FR_DISK_ERR：磁盘错误
- FR_INT_ERR：FAT文件系统内部错误
- FR_NOT_READY：物理驱动器未准备好
- FR_NO_PATH：路径无效
- FR_INVALID_NAME：文件或目录名无效
- FR_INVALID_OBJECT：目录对象无效
- FR_INVALID_DRIVE：逻辑驱动器号无效
- FR_NOT_ENABLED：FatFs 配置选项未启用
- FR_NO_FILESYSTEM：未找到文件系统
- FR_TIMEOUT：操作超时
- FR_NOT_ENOUGH_CORE：内存不足
- FR_TOO_MANY_OPEN_FILES：打开文件过多

**描述**
在可以打开由 `path` 指定的目录之后，它开始搜索由 `pattern` 指定的匹配模式的项目。如果找到第一个项目，将该项目的信息存储在文件信息结构 `fno` 中。如果未找到，则 `fno->fname[]` 为空字符串。

匹配模式字符串可以包含通配符。具体而方，可以使用？或者*。部分示例如下：

- `?`：匹配任何字符
- `???`：匹配长度为三个字符的任何文件名
- `*`：匹配长度为零或更长的任何文件名
- `????*`：匹配长度为四个字符或更长的任何文件名
- os_*.c：匹配所有以os_c开头，结尾为.c的文件名
- 
### 查找一下个f_findnext
f_findnext 函数用于搜索下一个匹配的对象，其函数原型如下：

```c
FRESULT f_findnext (
  DIR* dp,              /* [IN] 指向目录对象的指针 */
  FILINFO* fno          /* [OUT] 指向文件信息结构的指针 */
);
```
**参数**

- `dp`：指向由 f_findfirst 函数创建的有效目录对象的指针。
- `fno`：指向文件信息结构以存储找到的目录项信息。

**返回值**

- FR_OK：成功
- FR_DISK_ERR：磁盘错误
- FR_INT_ERR：FAT文件系统内部错误
- FR_NOT_READY：物理驱动器未准备好
- FR_INVALID_OBJECT：目录对象无效
- FR_TIMEOUT：操作超时
- FR_NOT_ENOUGH_CORE：内存不足

## 使用示例
```c
void find_image_file (void)
{
    FRESULT fr;     /* 返回值 */
    DIR dj;         /* 目录对象 */
    FILINFO fno;    /* 文件信息 */

    fr = f_findfirst(&dj, &fno, "", "????????.JPG"); /* 开始搜索照片文件 */

    while (fr == FR_OK && fno.fname[0]) {         /* 在找到项目时重复 */
        printf("%s\n", fno.fname);                /* 打印对象名称 */
        fr = f_findnext(&dj, &fno);               /* 搜索下一个项目 */
    }

    f_closedir(&dj);
}
```
## 注意事项
### 不能通过函数返回值判断是否找到
上述两个函数，其返回值用于表明有没出现错误。

没有找到匹配项，并不属于错误，因此函数返回值并不体现。

如果没有要读取的项目，将返回一个空字符串到 `fno->fname[]`，即fno->fname[0]的值为0。

### 查找效率并不会提升
在 f_findfirst()和f_findnext()内部，其查找仍然是采用f_readdir()来获取目录中所有的文件信息，然后进行字符串模式匹配来完成的，因此查找效率并不一定比自己写的查找函数更加高。

并且，我们可以看到，这两个函数采用的是基于文件名的匹配查找；因此，如果需要查找指定属性的文件（如只获取目录），那么仍然需要自己利用f_readdir()读取进行过滤查找。

