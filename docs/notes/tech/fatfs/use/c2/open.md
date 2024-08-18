---
title: 打开与关闭文件
author: 李述铜
createTime: 2024/08/08 10:29:38
permalink: /tech/fatfs/rnnq15g2/
---
:::tip
同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。

如果你对文件系统的实现比较感兴趣，也可以关注我的《[从0到1写FAT32文件系统](https://wuptg.xetlk.com/s/VeHie)》课程。

欢迎转载本文章，转载请注明链接来源，谢谢！
:::

本课时介绍FATFS提供的文件打开接口以及与关闭接口。

在学习时，可以对照C标准库的fopen()接口进行比较：

* [https://cplusplus.com/reference/cstdio/fopen/](https://cplusplus.com/reference/cstdio/fopen/)
* [https://www.runoob.com/cprogramming/c-function-fopen.html](https://www.runoob.com/cprogramming/c-function-fopen.html)

# 主要内容
在FATFS中要对文件系统上的文件进行读写之前，必须先进行打开操作。读写完毕之后，还需要执行关闭操作，从而释放资源。

## 打开文件
f_open用于执行文件的打开操作，其函数声明如下所示。

```c
FRESULT f_open (
  FIL* fp,           /* [OUT] 指向文件对象结构的指针 */
  const TCHAR* path, /* [IN] 文件名 */
  BYTE mode          /* [IN] 模式标志 */
);
```
函数参数：

- `fp`：指向打开的文件对象结构的指针。
- `path`：待打开的名称名称路径
- `mode`：模式标志，指定文件的访问类型和打开方法。它由以下标志的组合指定。 
   - `FA_READ`：指定对文件的读取访问权限。可以从文件中读取数据。
   - `FA_WRITE`：指定对文件的写入访问权限。可以向文件写入数据。与`FA_READ`结合可实现读写访问。
   - `FA_OPEN_EXISTING`：打开已经存在的文件。如果文件不存在，函数将失败。（默认）
   - `FA_OPEN_ALWAYS`：如果文件存在，则打开文件。如果不存在，将创建一个新文件。
   - `FA_CREATE_NEW`：创建新文件。如果文件已存在，函数将以`FR_EXIST`错误失败。
   - `FA_CREATE_ALWAYS`：创建新文件。如果文件已存在，将截断并覆盖它。
   - `FA_OPEN_APPEND`：与`FA_OPEN_ALWAYS`相同，只是读/写指针设置到文件的末尾。

返回值：

- `FR_OK`：成功
- `FR_DISK_ERR`：磁盘错误
- `FR_INT_ERR`：内部错误
- `FR_NOT_READY`：设备尚未准备好
- `FR_NO_FILE`：文件不存在
- `FR_NO_PATH`：路径不存在
- `FR_INVALID_NAME`：无效文件名
- `FR_DENIED`：操作被拒绝
- `FR_EXIST`：文件已存在
- `FR_INVALID_OBJECT`：无效的对象
- `FR_WRITE_PROTECTED`：只读文件系统，写操作被拒绝
- `FR_INVALID_DRIVE`：无效的驱动器
- `FR_NOT_ENABLED`：文件系统未启用
- `FR_NO_FILESYSTEM`：没有文件系统
- `FR_TIMEOUT`：操作超时
- `FR_LOCKED`：文件被锁定
- `FR_NOT_ENOUGH_CORE`：内存不足
- `FR_TOO_MANY_OPEN_FILES`：打开的文件太多

在文件成功打开之后，后续所有的文件操作都通过fp来处理。
## 文件关闭
在完成对文件的读写访问之后，最后需要关闭文件。关闭操作由以f_close()完成，其函数声明如下：
```c
FRESULT f_close (
  FIL* fp     /* [IN] 指向要关闭的文件对象结构的指针 */
);
```
参数：

- `fp`：指向要关闭的打开文件对象的指针。可见，该指针与f_open()中传递的指针相同。

返回值：

- `FR_OK`：操作成功。
- `FR_DISK_ERR`：磁盘错误。
- `FR_INT_ERR`：内部错误。
- `FR_INVALID_OBJECT`：无效的对象。
- `FR_TIMEOUT`：操作超时。

在关闭文件时，如果之前有对文件进行写入操作，那么有可能部分写入的数据被缓存在FIL结构中。因此，执行f_close时，这些缓存信息将被写回到存储介质。
## 代码示例
下面的代码简单演示了文件打开与关闭，以只读方式打开缺省驱动器上的a.txt为例。该方式打开时，如果文件不存在，则退出。
```c
	FIL file;
	res = f_open(&file, "a.txt", FA_READ);
	if (res != FR_OK) {
		printf("open file error.\n");
		return -1;
	}
	f_close(&file);
```
以下是一些常用的打开方式：

1. FA_READ：以只读模式打开，不允许写入。如果文件不存在，则操作失败。
2. FA_READ | FA_WRITE：打开文件进行读取和写入，如果文件不存在，则操作失败
3. FA_CREATE_NEW | FA_WRITE：创建新文件以便进行写入操作，但是如果文件已经存在，则操作失败
4. FA_CREATE_ALWAYS|FA_WRITE：创建新文件以便进行写入操作，如果文件已经存在，则截断它，即将文件清空，然后再进行写入。这样每次打开时，都会有一些新文件产生
5.  FA_WRITE | FA_OPEN_APPEND：打开文件，定位到文件尾部，然后进行数据追加写入。如果文件不存在，则会创建一个新的
6. FA_OPEN_ALWAYS | FA_READ | FA_WRITE：打开文件以进行读取写，如果不存在则创建新文件
7. FA_CREATE_ALWAYS | FA_READ | FA_WRITE：创建新文件或覆盖现有文件并进行读写操作：如果文件存在，则截断该文件后，以进行读取和写入；如果文件不存在，则创建新文件。
# 注意事项
## f_open中mode值的分析
通过传入不同的mode组合值，可以以不同的方式进行打开。将mode分为以下四类可帮助我们进行分析：

- 控制读或写的标志：`FA_READ`、`FA_WRITE`
- 控制读写的位置：`FA_OPEN_APPEND`（定位读写位置到文件尾部读写）
- 控制是否创建新文件：`FA_CREATE_NEW（仅在文件不存在时创建）、FA_CREATE_ALWAYS（总是创建）`
- 控制打开时发现文件不存在，是否要创建新文件：`FA_OPEN_EXISTING`（不创建）、`FA_OPEN_ALWAYS`（创建）

可以看到FA_CREATE_ALWAYS和`FA_OPEN_ALWAYS`都允许创建文件，但是二者不能相互替代。`FA_OPEN_ALWAYS`是仅在文件不存在时才创建；而FA_CREATE_ALWAYS则总是创建新文件，后者会造成原文件内容的丢失。

因此，如果我们想打开一个文件并且当文件不存在时创建，那么应当使用`FA_OPEN_ALWAYS`；而如果我们不关心这个文件是否存在，有哪些内容，总是想从头开始创建这个文件并写入，那么就应当使用FA_CREATE_ALWAYS。
## f_open中的路径值
注意到，f_open()需要传入待打开的文件路径。这个路径形式与我们在Windows上访问磁盘文件路径类似，在Windows上，我们会采用类似如下的路径来引用文件或目录。

![alt 打开路径](../../../../../.vuepress/public/image/docs/notes/tech/fatfs/use/c2/open/image.png)

在FATFS也是类似的，只不过它不采用字母的盘符，而是采用数字盘符，具体形式如下：
```c
[drive#:][/]directory/file
```
这个路径中各项含义如下：

- drive#（驱动器号，可选项）：为数字0-9，即给每个盘命名为0号盘，1号盘....类似于Windows系统中的C盘、D盘。如果整个系统只有一个驱动器，则可以不加driver#:
- [/]（斜杠，可选项）：斜杠符号（/）用于分隔驱动器号和目录路径。最开始的/表示从驱动器中的顶层根目录开始
- directory（目录路径）：这是文件所在的目录的路径，在路径中可以使用斜杠来分隔目录名称
- file（文件名）：要打开的文件的名称

虽然上面看起来略有些复杂，但是如果联系windows上的路径进行对比会发现其实并不难理解。
例如，在Windows中有这样一个路径：
```c
D:\tongban\course\develop\learn_fatfs\c02.02\app.c
```
而在FATFS中，如果该文件位于驱动器0中，并且同样位于其路径同样是tongban\course\develop\learn_fatfs\c02.02\app.c。那么其完整路径例为：
```c
0:/tongban/course/develop/learn_fatfs/c02.02/app.c
```

