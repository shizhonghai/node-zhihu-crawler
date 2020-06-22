## node-zhihu-crawler

> 一键下载知乎小姐姐图片的的小工具

## 实现功能
- 1.根据知乎问题 id，下载所有答案下的图片
- 2.按知乎用户名称进行目录分类
- 3.图片目录存储结构 image>questionId>username

## clone && 安装依赖

```
git clone https://github.com/shizhonghai/node-zhihu-crawler.git
cd node-zhihu-crawler && npm install
```

## 配置

> 打开index.js,你会看到这段代码

``` javascript
require('./crawler')({
  dir: './image', // 图片需要存放的位置
  questionId: '34078228', // 想要下载的知乎问题id，比如https://www.zhihu.com/question/49364343/answer/157907464，输入49364343即可
})

```

## 跑起来

> npm run start, 接下来就可以从控制台看到不断地在下载图片了。

## 参考资料来源

> [https://github.com/qianlongo/node-small-crawler](https://github.com/qianlongo/node-small-crawler)
