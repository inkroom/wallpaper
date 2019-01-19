/**
 * 用于壁纸切换
 */
/**
 * @param {int} index 定时的序列
 * @param {function} statusListener 状态改变
 * @param {function} exchangeListener 图片切换
 */

const fs = require('fs');

let path = require('path');

let runtime = require('child_process');


const configPath = path.join(__dirname, 'config.dat'); //配置文件位置

console.log(configPath);
//获取对应的文件列表
function getImgs(dir) {
    let temp = fs.readdirSync(dir);
    let imgs = [];
    for (var i = 0; i < temp.length; i++) { //提取图片文件
        if (/\.(jpg|jpeg|png|bmp|gif)$/.test(temp[i])) {
            imgs.push(temp[i]);
        }
    }
    return imgs;
}




//构造函数
var Chan = function(index, statusListener, exchangeListener) {

        this.time = 15;
        this.dir = '';

        this.index = index || -1;
        this.statusListener = statusListener || function(status) {};
        this.exchangeListener = exchangeListener || function(img) {};

        this.imgs = [];
        //从本地读取数据

        fs.closeSync(fs.openSync(configPath, 'a')); //创建文件，防止报错


        let data = fs.readFileSync(configPath, {
            encoding: 'utf-8'
        });
        if (data !== null) {
            //切分
            let datas = data.split('&');
            if (datas !== null && datas.length == 2) {
                this.time = parseInt(datas[0]);
                this.dir = datas[1];
            }
        }

    }
    // 正常函数
    /**
     * 保存数据
     */
Chan.prototype.save = function() {

    fs.writeFileSync(configPath, this.time + "&" + this.dir);
};
Chan.prototype.setExchangeListener = function(exchangerListener) {
    this.exchangeListener = exchangerListener;
}
Chan.prototype.setStatusListener = function(statusListener) {
    this.statusListener = statusListener;
}
Chan.prototype.start = function() {
    if (this.dir !== '' && parseInt(this.time) !== 'NaN') {
        let newImgs = getImgs(this.dir);
        if (newImgs.length > 0) {
            this.imgs = newImgs;
            this.statusListener(true);

            let _this = this;

            this.index = setInterval(function() {
                let next = _this.imgs[Math.floor(Math.random() * _this.imgs.length)]
                let real = (_this.dir + path.sep + next);
                //执行
                runtime.exec('gsettings set com.deepin.wrap.gnome.desktop.background picture-uri \"' +
                    real + '\"');
                _this.exchangeListener(real);
            }, parseInt(this.time) * 1000);
            this.save();
        }
    }
}
Chan.prototype.stop = function() {
    clearInterval(this.index);
    this.index = -1;
    this.statusListener(false);
}

module.exports = Chan;

// exports.Chan = function (index, statusListener, exchangeListener) {


//     console.log(statusListener);

//     let fs = require('fs');
//     let path = require('path');

//     let runtime = require('child_process');



//     this.time = 15;
//     this.dir = '';
//     let imgs = null;

//     let _this = this;

//     this.index = index || -1;

//     statusListener = statusListener || function (status) {};
//     exchangeListener = exchangeListener || function (img) {};





//     this.running = function () {
//         return index != -1;
//     }

//     /**
//      * 切换状态
//      */
//     this.start = function () {
//         if (_this.dir !== '' && parseInt(_this.time) !== 'NaN') {
//             let newImgs = getImgs(_this.dir);
//             if (newImgs.length > 0) {
//                 console.log('开始l ');
//                 imgs = newImgs;
//                 statusListener(true);
//                 _this.index = setInterval(exchange, parseInt(_this.time) * 1000);
//                 _this.save();
//             }
//         }
//     }

//     this.stop = function () {
//         clearInterval(_this.index);
//         _this.index = -1;
//         statusListener(false);
//     }


//     //切换函数
//     function exchange() {

//         let next = imgs[Math.floor(Math.random() * imgs.length)]
//         let real = (_this.dir + path.sep + next);
//         console.log('图片地址=' + real);
//         //执行
//         runtime.exec('gsettings set com.deepin.wrap.gnome.desktop.background picture-uri \"' +
//             real + '\"');
//         exchangeListener(real);
//     }


//     this.start();
// }