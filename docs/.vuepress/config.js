import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { plumeTheme } from 'vuepress-theme-plume'
import { baiduAnalyticsPlugin } from '@vuepress/plugin-baidu-analytics'
import { alertPlugin } from "vuepress-plugin-alert"

export default defineUserConfig({
    lang: 'zh-CN',
    title: '李述铜的知识课堂',
    description: '李述铜的知识课堂（lishutong1024.cn），专注于技术文档分享与知识传播。涵盖嵌入式领域的 FATFS 使用详解等专业内容，还有优秀书籍推荐及丰富的学习资源。深入浅出介绍底层原理和细节，助你提升技术认知，开启硬核学习之旅',
    head: [['meta', { name: 'baidu-site-verification', content: 'codeva-y4YVaKcM8p' }]],

    plugins: [

/*
      ['@vuepress-reco/vuepress-plugin-bulletin-popover', {
        width: '800px', // 默认 260px
        title: '消息提示',
        body: [
          {
            type: 'title',
            content: '添加冴羽好友入前端交流群',
            style: 'text-aligin: center;'
          },
          {
            type: 'image',
            src: 'https://cdn.jsdelivr.net/gh/mqyqingfeng/picture/IMG_3516.JPG'
          }
        ],
        footer: [
          {
            type: 'button',
            text: '打赏',
            link: '/donate'
          } 
        ]
      }],*/

      baiduAnalyticsPlugin({
        id: "0ec0df4a6adf20a6a93079b1a41f0816", 
      }),
    ],

    theme: plumeTheme({
      profile: {
        name: '李述铜',
        description: '知识笔记',
        avatar: '/avatar.png',
        circle: true, // 是否为圆形头像
      },

      logo: '/logo.png',      // logo
      footer: { copyright: 'Copyright © 2023-present lishutong' },
      hostname: 'https://www.lishutong1024.cn/',
      plugins: {
        // 启用pdf阅读
        markdownPower: {
          pdf: true,
          bilibili: true,
        },
      },

      // 左侧导航
      notes: {
        dir: '/notes/', // 声明所有笔记的目录
        link: '/', // 声明所有笔记默认的链接前缀， 默认为 '/'
        notes: [
          {
            dir: 'courses',
            link: '/courses/',
            sidebar: [
              {
                text: '计算机核心基础',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'core/diylinux', 
                  'core/diytcpip',
                  'core/diyfat32', 
                  'core/tcp_web', 
                ]
              },
              { 
                text: '嵌入式', 
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'emebed/riscv',
                  'emebed/arm', 
                  'emebed/fatfs', 
                  'emebed/rtos', 
                  'emebed/rtos_old',
                  'emebed/8051'
                ]
              },
              {
                text: '网络协议',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'network/http', 
                  'network/tftp',
                ]
              }

            ]
          },     
          {
            dir: 'tech/rtthread/',
            link: '/tech/rtthread/',
            sidebar: [
              {
                text: '使用指南',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  {
                    text: '第1章 课程准备',
                    collapsed: true,
                    items: [
                      'use/c1/intro.md', 
                      'use/c1/download.md',
                      'use/c1/develop.md'
                    ]         
                  },
                  {
                    text: '第2章 为什么要用RTOS',
                    collapsed: true,
                    items: [
                      'use/c2/bare.md', 
                      'use/c2/tiaozhan.md',
                      'use/c2/whatrtos.md',
                      'use/c2/rtthread.md',
                      'use/c2/usertos.md',
                    ]                       
                  },
                  {
                    text: '第3章 RTOS是如何工作的',
                    collapsed: true,
                    items: [
                      'use/c3/什么是任务.md', 
                      'use/c3/RTOS是怎么管理任务的.md',
                      'use/c3/任务切换是怎么实现的.md',
                    ]                       
                  },                  
                  {
                    text: '第4章 怎么创建和启动任务？',
                    collapsed: true,
                    items: [
                      'use/c4/创建自己的第一个任务.md', 
                      'use/c4/临时性任务的创建.md',
                      'use/c4/静态创建任务.md',
                      'use/c4/怎样终止任务.md', 
                      'use/c4/怎样暂停任务的运行.md',
                      'use/c4/两个特殊的任务.md',
                    ]                       
                  },   
                  {
                    text: '第5章 任务哪个先执行？',
                    collapsed: true,
                    items: [
                      'use/c5/时间片调度.md', 
                      'use/c5/优先级调度.md',
                      'use/c5/主动让出CPU.md',
                      'use/c5/延时接口.md', 
                    ]                       
                  },   
                  {
                    text: '第6章 我能定时做一件事吗？',
                    collapsed: true,
                    items: [
                      'use/c6/为什么需要定时器.md', 
                      'use/c6/创建简单的定时器.md',
                      'use/c6/定时器底层机制揭秘.md',
                      'use/c6/定时器使用注意事项.md', 
                    ]                       
                  },   
                  {
                    text: '第7章 两个任务怎么配合工作？',
                    collapsed: true,
                    items: [
                      'use/c7/信号量——打个招呼再行动.md', 
                      'use/c7/互斥锁-禁止任务同时访问共享资源.md',
                      'use/c7/事件 - 同时等待多个标志位.md',
                    ]                       
                  },   
                  {
                    text: '第8章 如何在任务之间传递数据消息',
                    collapsed: true,
                    items: [
                      'use/c8/邮箱-向任务发送消息.md', 
                      'use/c8/消息队列-传递不定长的消息.md',
                    ]                       
                  },   
                  {
                    text: '第9章 怎样满足任务的内存需求',
                    collapsed: true,
                    items: [
                      'use/c9/给任务分配固定大小的内存块.md', 
                      'use/c9/按需分配内存块.md',
                    ]                       
                  },   
                ]
              },
              {
                text: '移植详解',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'port/intro.md', 
                ]
              }
            ]
          }, 
          {
            dir: 'tech/fatfs/',
            link: '/tech/fatfs/',
            sidebar: [
              {
                text: '资料下载',
                link: 'download.md', 
              },
              {
                text: 'FATFS入门指南',
                collapsed: true,
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'use/intro.md', 
                  {
                    text: '基本概念与原理',
                    collapsed: true,
                    items: [
                      'use/c1/fs.md',
                      'use/c1/fat.md',
                      'use/c1/fatfs.md',
                    ]         
                  },
                  {
                    text: '使用文件访问接口',
                    collapsed: true,
                    items: [
                      'use/c2/mount.md',
                      'use/c2/open.md',
                      'use/c2/read.md',
                      'use/c2/sync.md',
                      'use/c2/fgets.md',
                      'use/c2/fputs.md',
                      'use/c2/seek.md',
                      'use/c2/stat.md',
                      'use/c2/trunc.md',
                      'use/c2/alloc.md',
                      'use/c2/foword.md',
                    ]         
                  },                 
                  {
                    text: '目录与文件管理',
                    collapsed: true,
                    items: [
                      'use/c3/query.md',
                      'use/c3/list.md',
                      'use/c3/find.md',
                      'use/c3/chdir.md',
                      'use/c3/del.md',
                      'use/c3/create.md',
                      'use/c3/updateattr.md',
                      'use/c3/chvol.md',
                      
                    ]         
                  },  
                  {
                    text: '卷管理与系统配置',
                    collapsed: true,
                    items: [
                      'use/c4/free.md',
                      'use/c4/getlabel.md',
                    ]         
                  },  
                ]
              },
              { 
                text: 'FATFS移植详解', 
                icon: 'mdi:language-typescript', // 侧边栏图标
                collapsed: true,
                items: [
                  'port/intro.md', 
                  {
                    text: '基本概念与原理',
                    collapsed: true,
                    items: [
                      'port/c1/whatsport.md',
                      'port/c1/files.md',
                    ]         
                  },
                  {
                    text: '移植详解',
                    collapsed: true,
                    items: [
                      'port/c2/visualstudio.md',
                      'port/c2/gdb32_w25q64.md',
                      'port/c2/gdb32_sdcard.md',
                      'port/c2/gdb32_rtos.md',
                    ]         
                  },
                ] 
              },
              { 
                text: 'FATFS源码分析', 
                icon: 'mdi:language-typescript', // 侧边栏图标
                collapsed: true,
                items: [
                  'code/intro.md', 
                  'code/mount.md', 

                ] 
              },

            ]
          },  
        ]
      },
  
      // 导航条
      navbar: [
        { text: '首页', link: '/', icon: 'material-symbols:home-outline' },
        { 
          text: '课程介绍', 
          icon: 'material-symbols:home-outline',
          prefix: "/notes/courses/",
          link: '/notes/courses/list',
        },
        {
          text: '课程资料',
          icon: 'material-symbols:home-outline',
          prefix: '/notes/',
          link: '/notes/note/doc.md',
      
        },  
        { 
          text: '更多', 
          icon: 'material-symbols:home-outline',
          prefix: "/notes/others/",
          items: [
            {
              text: '推荐', 
              items: [   
                {
                  text: '优秀书籍',
                  link: 'books',
                  icon: 'mdi:paper-airplane'    
                },
            ]        
            },     
            { 
              text: '技术笔记', 
              link: '/article/', 
              icon: 'material-symbols:article-outline' 
            },       
          ]
        }, 
        { 
          text: '学习入口', 
          link: 'https://app7ulykyut1996.pc.xiaoe-tech.com/', 
          icon: 'material-symbols:article-outline' }, 
      ]
  }),
  bundler: viteBundler(),
})