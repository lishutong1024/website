---
title: 网络编程中的大小端
author: 李述铜
createTime: 2024/08/18 19:33:11
permalink: /article/or21umcy/
tags:
    - 计算机网络
    - 大小端
---
摘要：介绍计算机中大小端的概念及存储方式，如大端序高位在前，小端序低位在前，并提及 BSD socket 中相关转换函数及使用示例。

<!-- more -->
在计算机领域，大小端（Endianness）是指字节序的排列顺序。简单来说，就是存储器中多字节数据的字节序列，从高到低或从低到高的顺序不同。那么，何谓大小端呢？
# 什么是大小端
以4字节整型为例，它的二进制表示方式是32位的。当数据存储先存高字节，再存低字节，称为大端字节序（Big-Endian），即在内存中高位字节在前，低位字节在后；当数据存储从低地址向高地址排列时，称为小端字节序（Little-Endian），即低位字节在前，高位字节在后。
例如，对于一个多字节数据，比如一个32位整数0x12345678，在内存中存储时，大端序和小端序所采用的存储方式是不同的。
大端序指的是将高位字节存储在低地址处，低位字节存储在高地址处，如下图所示。其中12为最高字节，其先存储到内存中的低地址，然后再向更高的字节地址存储数据的其余字节。
```c
+----+----+----+----+
| 12 | 34 | 56 | 78 |
+----+----+----+----+

```
反之，而小端序则是将低位字节存储在低地址处，高位字节存储在高地址处，如下图所示：
```c
+----+----+----+----+
| 78 | 56 | 34 | 12 |
+----+----+----+----+

```
这种存储方式在不同的体系结构中有所不同。在x86架构的CPU中，通常采用小端序，而在MIPS架构的CPU中，通常采用大端序。在网络传输中，由于不同机器之间采用的存储方式可能不同，为了保证数据的正确传输，需要对数据进行大小端转换。
# BSD socket中的大小端转换支持
在网络编程中，大小端问题是非常重要的。因为不同的CPU架构可能有不同的字节序，而网络通信是跨平台的，因此需要进行字节序转换。BSD socket提供了一系列函数来完成这个任务，其中最常用的是htons和htonl。
htons函数的作用是将16位的主机字节序转换为网络字节序。由于网络上数据统一按大端字节序存储，所以如果当前系统是大端字节序，那么htons将不做任何处理，直接返回原值；如果当前系统是小端字节序，那么htons会将低位字节与高位字节交换位置，返回新的值。
htonl函数的作用与htons类似，但是针对的是32位的主机字节序。
```c
uint16_t htons(uint16_t hostshort);
uint32_t htonl(uint32_t hostlong);
```
除了htons和htonl之外，还有ntohs、ntohl等函数，它们的作用与htons和htonl相反，用于将网络字节序转换为主机字节序。
```c
uint16_t ntohs(uint16_t netshort);
uint32_t ntohl(uint32_t netlong);
```
# 使用演示
下面是一个使用htons()进行转换的例子，如下所示：
```c
#include <arpa/inet.h>

struct sockaddr_in serv_addr;
int sockfd = socket(AF_INET, SOCK_STREAM, 0);
if (sockfd == -1) {
    // handle error
}

memset(&serv_addr, 0, sizeof(serv_addr));
serv_addr.sin_family = AF_INET;
serv_addr.sin_port = htons(PORT); // 将主机字节序转换为网络字节序
serv_addr.sin_addr.s_addr = htonl(INADDR_ANY); // 将主机字节序转换为网络字节序

if (bind(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) == -1) {
    // handle error
}
``
```
在第11行代码中，将主机字节序的端口号（使用的是PORT常量）转换成网络字节序的端口号（使用的是htons()函数），并存储到了addr.sin_port结构体的成员变量中。这样就完成了对端口号的大小端转换。

