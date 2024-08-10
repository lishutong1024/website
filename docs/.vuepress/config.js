import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { plumeTheme } from 'vuepress-theme-plume'
import { baiduAnalyticsPlugin } from '@vuepress/plugin-baidu-analytics'

export default defineUserConfig({
    lang: 'zh-CN',
    title: '李述铜的知识课堂',
    description: '李述铜的知识课堂（lishutong1024.cn），专注于技术文档分享与知识传播。涵盖嵌入式领域的 FATFS 使用详解等专业内容，还有优秀书籍推荐及丰富的学习资源。深入浅出介绍底层原理和细节，助你提升技术认知，开启硬核学习之旅',
    head: [['meta', { name: 'baidu-site-verification', content: 'codeva-y4YVaKcM8p' }]],

    plugins: [
      baiduAnalyticsPlugin({
        id: "0ec0df4a6adf20a6a93079b1a41f0816",
      }),
    ],

    theme: plumeTheme({
      logo: '/logo.png',      // logo
      footer: { copyright: 'Copyright © 2023-present lishutong' },
      hostname: 'https://www.lishutong1024.cn/',
      plugins: {
        // 启用pdf阅读
        markdownPower: {
          pdf: true,
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
                  'core/diyfat32', 
                  'core/diytcpip'
                ]
              },
              { 
                text: '嵌入式', 
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'emebed/arm', 
                  'emebed/fatfs', 
                  'emebed/rtos', 
                  'emebed/riscv'
                ] 
              },

            ]
          },     
          {
            dir: 'tech',
            link: '/tech/',
            sidebar: [
              {
                text: 'FATFS入门指南',
                collapsed: true,
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'fatfs/use/intro.md', 
                  'fatfs/download.md', 
                  {
                    text: '基本概念与原理',
                    collapsed: true,
                    items: [
                      'fatfs/use/c1/fs.md',
                      'fatfs/use/c1/fat.md',
                      'fatfs/use/c1/fatfs.md',
                    ]         
                  },
                  {
                    text: '使用文件访问接口',
                    collapsed: true,
                    items: [
                      'fatfs/use/c2/mount.md',
                      'fatfs/use/c2/open.md',
                      'fatfs/use/c2/read.md',
                      'fatfs/use/c2/sync.md',
                      'fatfs/use/c2/fgets.md',
                      'fatfs/use/c2/fputs.md',
                      'fatfs/use/c2/seek.md',
                      'fatfs/use/c2/stat.md',
                      'fatfs/use/c2/trunc.md',
                      'fatfs/use/c2/alloc.md',
                      'fatfs/use/c2/foword.md',
                    ]         
                  },                 
                  {
                    text: '目录与文件管理',
                    collapsed: true,
                    items: [
                      'fatfs/use/c3/query.md',
                      'fatfs/use/c3/list.md',
                      'fatfs/use/c3/find.md',
                      'fatfs/use/c3/chdir.md',
                      'fatfs/use/c3/del.md',
                      'fatfs/use/c3/create.md',
                      'fatfs/use/c3/updateattr.md',
                      'fatfs/use/c3/chvol.md',
                      
                    ]         
                  },  
                  {
                    text: '卷管理与系统配置',
                    collapsed: true,
                    items: [
                      'fatfs/use/c4/free.md',
                      'fatfs/use/c4/getlabel.md',
                    ]         
                  },  
                ]
              },
              { 
                text: 'FATFS移植详解', 
                icon: 'mdi:language-typescript', // 侧边栏图标
                collapsed: true,
                items: [
                  'fatfs/port/intro.md', 
                  'fatfs/download.md', 
                  {
                    text: '基本概念与原理',
                    collapsed: true,
                    items: [
                      'fatfs/port/c1/whatsport.md',
                      'fatfs/port/c1/files.md',
                    ]         
                  },
                  {
                    text: '移植详解',
                    collapsed: true,
                    items: [
                      'fatfs/port/c2/visualstudio.md',
                      'fatfs/port/c2/gdb32_w25q64.md',
                      'fatfs/port/c2/gdb32_sdcard.md',
                      'fatfs/port/c2/gdb32_rtos.md',
                    ]         
                  },
                ] 
              },
              { 
                text: 'FATFS源码分析', 
                icon: 'mdi:language-typescript', // 侧边栏图标
                collapsed: true,
                items: [
                  'fatfs/code/intro.md', 
                  'fatfs/download.md', 
                  'fatfs/code/mount.md', 

                ] 
              },

            ]
          },  
        ]
      },
  
      // 导航条
      navbar: [
        { text: '首页', link: '/', icon: 'material-symbols:home-outline' },
        /*
        { 
          text: '课程介绍', 
          icon: 'material-symbols:home-outline',
          prefix: "/notes/courses/",
          items: [
            {
              text: '计算机核心', 
              prefix: "core/",
              items: [
                {
                text: '从0手写Linux操作系统',
                link: 'diylinux',
                icon: 'mdi:paper-airplane'    
                },    
                {
                  text: '从0手写TCP/IP协议栈',
                  link: 'diytcpip',
                  icon: 'mdi:paper-airplane'    
                },    
                {
                  text: '从0手写FAT32文件系统',
                  link: 'diyfat32',
                  icon: 'mdi:paper-airplane'    
                },
                {
                  text: 'socket应用编程实战',
                  link: 'socketprog',
                  icon: 'mdi:paper-airplane'    
                },
            ]        
            },
            {
              text: '嵌入式', 
              prefix: 'emebed/',
              items: [
                {
                text: 'FATFS应用指南',
                link: 'fatfs',
                icon: 'mdi:paper-airplane'    
                },    
                {
                  text: '嵌入式操作系统',
                  link: 'rtos',
                  icon: 'mdi:paper-airplane'    
                },    
                {
                  text: 'ARM体系结构',
                  link: 'arm',
                  icon: 'mdi:paper-airplane'    
                },
                {
                  text: 'RISC-V开发',
                  link: 'riscv',
                  icon: 'mdi:paper-airplane'    
                },
            ]        
            },
            {
              text: '查看全部',
              link: '/courses',
              icon: 'mdi:paper-airplane'    
            },               
          ]
        },
        {
          text: '资料 & 答疑',
          icon: 'material-symbols:home-outline',
          prefix: "/notes/note/",
          items: [
            {
              text: '学习方法', 
              items: [   
                {
                  text: '正确的提问方式',
                  link: 'question',
                  icon: 'mdi:paper-airplane'    
                },
            ]        
            },            
          ]          
        },
                */

        { 
          text: '技术文档', 
          icon: 'material-symbols:home-outline',
          prefix: "/notes/tech/",
          items: [
            {
              text: '嵌入式', 
              items: [   
                {
                  text: 'FATFS使用详解',
                  link: 'fatfs/use/intro',
                  icon: 'mdi:paper-airplane'    
                },
            ]        
            },            
          ]
        },    
        //{ text: '博客', link: '/blog/', icon: 'material-symbols:article-outline' },
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
          ]
        }, 
        { text: '学习入口', link: 'https://app7ulykyut1996.pc.xiaoe-tech.com/', icon: 'material-symbols:article-outline' }, 
      ]
  }),
  bundler: viteBundler(),
})