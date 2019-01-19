const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Tray,
    Menu,
    nativeImage
} = require('electron');

const runtime = require('child_process');
const path = require('path');

let win;
let tray = null;

function createWindow() {

    win = new BrowserWindow({
        // fullscreen: true,
        width: 400,
        height: 290,
        resizable: false,
        title: '壁纸切换',
        //FIXME: 2.0版本下主窗口icon无法正常显示
        icon: 'assets/img/logo/logo.png'
    });

    // win = new BrowserWindow({
    //     width: 800,
    //     height: 600,
    //     resizable: true,
    //     title: '壁纸切换',
    //     icon: path.join(__dirname, '../assets/img/tray.jpg')
    // })
    // win.webContents.openDevTools()


    win.loadFile("src/index.html");

    win.on('closed', function () {
        win = null;
    })
    // win.on('resize', function() {
    //     console.log("宽度=" + win.getSize()[0] + ",高度=" + win.getSize()[1]);
    // })
    win.on('close', function (event) {
        win.hide();
        win.setSkipTaskbar(true);
        event.preventDefault();
    })
}

function showWindow() {
    if (win) {
        win.show()
    } else {
        createWindow()
    }
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
})


app.on('ready', function () {


    //判断操作系统
    if (process.platform !== 'linux') {

        dialog.showMessageBox(null, {
            title: '不支持',
            message: '该程序仅支持deepin操作系统'
        })
        app.quit();
        return;
    } else {
        //判断是否是deepin
        if (!runtime.execSync('head -n 1 /etc/issue').toString().includes('Deepin')) {
            dialog.showMessageBox(null, {
                title: '不支持',
                message: '该程序仅支持deepin操作系统'
            })
            app.quit();
            return;
        }
    }
    //启动壁纸切换
    const Chan = require('./change');
    //启动
    let chan = new Chan();
    chan.start();
    //将该对象交给渲染进程
    global.sharedObject = {
        chan: chan
    }



    let img = nativeImage.createFromPath(path.join(__dirname, '../assets/img/logo/24x24.png'));
    tray = new Tray(img);
    const contextMenu = Menu.buildFromTemplate([{
            label: '主界面',
            type: 'normal',
            click: showWindow
        },
        {
            label: '退出',
            click: function () {
                if (win) {
                    win.destroy();
                }
                app.quit();
            }
        }
    ])
    //FIXME: 托盘图标不显示,右键也不可用，怀疑是deepin不兼容导致
    // tray.setImage(path.join(__dirname, '../assets/img/tray.jpeg'))
    tray.setToolTip('壁纸切换工具')
    tray.setTitle('壁纸切换工具')
    tray.setContextMenu(contextMenu);

    tray.on('double-click', showWindow)
});



// 文件夹选择事件

// ipcMain.on('open-directory-dialog', function(event, p) {
//     dialog.showOpenDialog({
//         properties: "directory"
//     }, function(files) {
//         if (files) { // 如果有选中
//             // 发送选择的对象给子进程
//             event.sender.send('selectedItem', files[0])
//         } else {
//             event.sender.send('selectedItem')
//         }
//     })
// })


//保证程序单例运行
if (app.requestSingleInstanceLock) { //新版本
    const gotTheLock = app.requestSingleInstanceLock()

    if (!gotTheLock) {
        dialog.showMessageBox({
            title: '程序已在运行',
            message: '程序已在运行，请不要重复启动'
        })
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (win) {
                if (win.isMinimized()) win.restore()
                win.focus()
            }
        })
        app.on('activate', function () {
            if (win === null) {
                createWindow();
            }
        })
    }

} else { //旧版本

    const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })

    if (isSecondInstance) {
        app.quit()
    }


}