let fs = require('fs');
let pathUtil = require('path');
let less = require("less");
let scss = require("node-sass");
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');

let genDistPath = pathUtil.join(__dirname, 'src', '.tmp', 'release');
let genPath = pathUtil.join(__dirname, 'src', '.tmp');
let lessFilePool = [];
let handledLessFileCount = 0;

let tsFileTester = /\.ts$/;

let stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
let htmlRegex = /templateUrl\s*:\s*\'(\S*?)\'/g;
let imageRegex = /url\([\'\"](\S*?\.png)[\'\"]\)/g;

let stringRegex = /(['"])((?:[^\\]\\\1|.)*?)\1/g;
let lessNumRegex = /style_(\d+)_less/g;

function cssImage(css, file) {
    return new Promise((resolve, reject) => {
        css = css.toString();
        // 检查图片并转换base64
        if (imageRegex.test(css)) {
            let contentTemp = css.toString().replace(imageRegex, function (match, fileName) {
                fileName = fileName.replace("'", '');
                fileName = fileName.replace("'", '');
                fileName = fileName.replace('"', '');
                fileName = fileName.replace('"', '');
                let filePath = pathUtil.resolve(pathUtil.dirname(file), fileName);
                let content = fs.readFileSync(filePath);
                let base64 = 'url(data:image/png;base64,' + content.toString("base64") + ')';
                return base64;
            });
            css = contentTemp;
        }
        css.replace(/\\e/g, function (match, e) {
            // 对content中的类似'\e630'中的\e进行处理
            return '\\\\e';
        }).replace(/\\E/g, function (match, e) {
            // 对content中的类似'\E630'中的\E进行处理
            return '\\\\E';
        }).replace(/\\20/g, function (match, e) {
            // 对content中的类似'\20'中的\20进行处理
            return '\\\\20';
        }).replace(/`/g, function (match, e) {
            // 处理css中`符号
            return "'";
        });
        postcss([autoprefixer]).process(css).then(result => {
            resolve(result.css);
        });
    });
}

function getTsFile(path, parse) {
    try {
        if (fs.statSync(path).isFile() && tsFileTester.test(path)) {
            parse(path)
        } else if (fs.statSync(path).isDirectory() && path.indexOf(genDistPath) < 0) {
            // 单是一个文件夹且不是dist文件夹的情况下
            let paths = fs.readdirSync(path);
            paths.forEach(function (p) {
                getTsFile(pathUtil.join(path, p), parse);
            })
        }
    } catch (err) {
        throw err;
    }
}

function transformStyleUrls(path) {
    let content = fs.readFileSync(path);
    if (stylesRegex.test(content)) {
        let contentTemp = content.toString().replace(stylesRegex, function (match, urls) {
            return "styles:" + urls.replace(stringRegex, function (match, quote, url) {
                lessFilePool.push(pathUtil.resolve(pathUtil.dirname(path), url))
                let result = 'style_' + handledLessFileCount + '_less';
                handledLessFileCount += 1;
                return result;
            })
        })
        fs.writeFileSync(path, contentTemp);
    }
}

function transformHtmlUrls(path) {
    let content = fs.readFileSync(path);
    if (htmlRegex.test(content)) {
        let contentTemp = content.toString().replace(htmlRegex, function (match, url) {
            let filePath = pathUtil.resolve(pathUtil.dirname(path), url);
            let content = fs.readFileSync(filePath);
            return 'template: ' + "`" + content + "`";
        });
        fs.writeFileSync(path, contentTemp);
    }
}

function doneOne() {
    handledLessFileCount += 1;
    // 说明所有处理完成。
    if (handledLessFileCount === lessFilePool.length) {
        writeBack();
    }
}

function writeBack() {
    console.log("start to write back");
    getTsFile(genPath, writeBackCss);
    console.log('Done');
}

function writeBackCss(path) {
    let content = fs.readFileSync(path);
    if (lessNumRegex.test(content)) {
        let contentTemp = content.toString().replace(lessNumRegex, function (match, index) {
            return '`' + lessFilePool[index] + '`';
        });
        fs.writeFileSync(path, contentTemp);
    }
}

function processLess() {
    let index = 0;
    while (index < lessFilePool.length) {
        (function (index) {
            // debugger';
            if (lessFilePool[index].indexOf('.less') != -1) {
                fs.readFile(lessFilePool[index], function (e, data) {
                    if (data) {
                        less.render(data.toString(), {
                            filename: lessFilePool[index]
                        }, function (e, output) {
                            if (e) {
                                console.log(e);
                            } else {
                                // 检查图片并转换base64
                                cssImage(output.css, lessFilePool[index]).then(res => {
                                    lessFilePool[index] = res;
                                    doneOne();
                                });
                            }
                        })
                    }
                });
            }
            // 处理scss
            if (lessFilePool[index].indexOf('.scss') != -1) {
                scss.render({
                    file: lessFilePool[index]
                }, function (e, output) {
                    if (e) {
                        console.log(e);
                    } else {
                        // 检查图片并转换base64
                        cssImage(output.css, lessFilePool[index]).then(res => {
                            lessFilePool[index] = res;
                            doneOne();
                        });
                    }
                });
            }

            if (lessFilePool[index].indexOf('.css') != -1) {
                fs.readFile(lessFilePool[index], function (e, data) {
                    if (e) {
                        console.log(e)
                    } else {
                        // 检查图片并转换base64
                        cssImage(data.toString(), lessFilePool[index]).then(res => {
                            lessFilePool[index] = res;
                            doneOne();
                        });
                    }
                });
            }

        })(index);
        index += 1
    }
}

function process() {
    // 把所有ts文件，引入的less文件的完整路径放到全局list里面, 并且对源文件进行占坑
    getTsFile(genPath, transformStyleUrls);
    getTsFile(genPath, transformHtmlUrls);
    // 重置文件处理进度的计数器
    handledLessFileCount = 0;
    // 对list里面的每一个less文件进行翻译并触发css回写
    console.log("start to translate from less 2 css");
    processLess();
}

console.log('prepare...');
// 转换操作
process();