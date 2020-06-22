let path = require('path')
let fs = require('fs')
let rp = require('request-promise')
let originUrl = 'https://www.zhihu.com'

class Crawler {
    constructor(options) {
        // 构造函数中主要是一些属性的初始化
        const {dir = './image', proxyUrl = originUrl, questionId = '49364343', limit = 10, offset = 0, timeout = 10000} = options;
        // 代理模式下请求的实际路径, 这里默认也是https://www.zhihu.com
        // 当你的电脑ip被封了之后，可以通过代理服务器，请求知乎，而我们是向代理服务器获取数据
        this.proxyUrl = proxyUrl;
        // 请求的最终url query请求部分总共有三个参数
        /*{
            include: 'xxxx', // 这个参数可能是知乎后台要做的各种验证吧
            offset: 0, // 页码，根据知乎规则，每次只能请求10条数据，所以页码需要每次都加10，这个不需要我们关心，因为接口每次都返回了需要请求的接口和参数 paging:{next: ''}
            limit: 10, // 每页内容数量，默认10条
            sort_by: 'default' // 排序方式
        }*/
        this.uri = `${proxyUrl}/api/v4/questions/${questionId}/answers?limit=${limit}&offset=${offset}&include=data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp;data[*].mark_infos[*].url;data[*].author.follower_count,badge[*].topics&sort_by=default`;
        // 是否已经是最后的数据
        this.isEnd = false;
        // 知乎的帖子id
        this.questionId = questionId;
        // 设置请求的超时时间（获取帖子答案和下载图片的超时时间目前相同）
        this.timeout = timeout;
        // 图片下载路径的根目录
        this.dir = dir;
        // 已下载的图片的数量
        this.downloaded = 0;
        // 解析答案后获取的图片链接
        this.imageList = [];
        // 初始化方法
        this.init();
    }

    async init() {
        if (this.isEnd) {
            console.log('已经全部下载完成, 请欣赏');
            return
        }
        let {isEnd, uri, resultList} = await this.getAnswers();
        this.isEnd = isEnd;
        this.uri = uri;
        this.downloaded = 0;
        this.imageList = resultList;
        this.createFolder();
        this.downLoadImage(() => {
            if (this.downloaded >= this.imageList.reduce((num, b) => num + b.imgSrcList.length, 0)) {
                console.log('【休息6秒钟继续下一波】');
                setTimeout(() => {
                    this.init()
                }, 6000)
            }
        })
    }

    // 获取答案相关内容
    async getAnswers() {
        let {uri, timeout, dir, questionId} = this;
        let response = {};
        try {
            const {paging, data} = await rp({uri, json: true, timeout});
            const {is_end: isEnd, next} = paging;
            let resultList = [];
            data.forEach(item => {
                resultList.push({
                    // 用户名称目录
                    folderName: `/${item.author.name}`,
                    // 图片文件全路径
                    fullPath: `${dir}/${questionId}/${item.author.name}`,
                    // 图片链接
                    imgSrcList: this.matchImg(item.content),
                    // 用户名称
                    folderId: item.author.name
                })
            });
            response = {isEnd, uri: next.replace(originUrl, this.proxyUrl), resultList}
        } catch (error) {
            console.log('调用知乎api出错,请重试');
            console.log(error);
        }
        return response
    }

    // 根据文本内容，匹配 Img url
    matchImg(content) {
        let imageList = [];
        let matchImgOriginRe = /<img.*?data-original="(.*?)"/g;
        content.replace(matchImgOriginRe, ($0, $1) => imageList.push($1));
        return [...new Set(imageList)];
    }

    // 创建目录
    createFolder() {
        let {dir, questionId, imageList} = this;
        // 给有图片的知乎回答用户根据知乎名称创建目录
        let imageFolder = [];
        let folderPath = `${dir}/${questionId}`;
        imageList.forEach(item => item.imgSrcList.length > 0 && imageFolder.push(folderPath + item.folderName));
        let dirs = [dir, folderPath].concat(imageFolder);
        // 判断文件路径是否存在
        // if (fs.existsSync('文件')) {
        //   console.log('该路径已存在');
        // }
        dirs.forEach((dir) => !fs.existsSync(dir) && fs.mkdirSync(dir));
    }

    downLoadImage(cb) {
        let {imageList, timeout} = this;
        imageList.forEach(item => {
            item.imgSrcList.length > 0 &&
            item.imgSrcList.forEach(imgUrl => {
                // 返回路径的最后一个部分，即文件名
                let fileName = path.basename(imgUrl);
                let filePath = `${item.fullPath}/${fileName}`;
                rp({uri: imgUrl, timeout}).on('error', () => {
                    console.log(`${imgUrl} 下载出错`);
                    this.downloaded += 1;
                    cb()
                }).pipe(fs.createWriteStream(filePath)).on('close', () => {
                    this.downloaded += 1;
                    // console.log(`${imgUrl} 下载完成`)
                    cb()
                })
            })
        })
    }

}

module.exports = (payload = {}) => {
    return new Crawler(payload)
}
