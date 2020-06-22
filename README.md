## node-zhihu-crawler

> 一个可以从知乎上下载美女图片的小工具

## 实现功能
- 1.根据知乎问题 id，下载所有答案下的图片
- 2.按知乎用户名称进行目录分类
- 3.图片目录存储结构 image>questionId>username

## 前置条件 

> 请确认你已经安装了nodejs,并且版本在比较高的版本比如8.9.3


## clone && 安装依赖

```
git clone https://github.com/shizhonghai/node-zhihu-crawler.git
cd node-small-crawler && npm install

```

## 配置

> 打开index.js,你会看到这段代码

``` javascript
require('./crawler')({
  dir: './imgs', // 图片需要存放的位置
  questionId: '34078228', // 想要下载的知乎问题id，比如https://www.zhihu.com/question/49364343/answer/157907464，输入49364343即可
  proxyUrl: 'https://www.zhihu.com' // 当请求知乎的数量达到一定的阈值的时候，会被知乎认为是爬虫（好像是封ip），这时如果你如果有一个代理服务器来转发请求数据，便又可以继续下载了。
})

```

## 跑起来

> npm run start, 接下来就可以从控制台看到不断地在下载图片了。
