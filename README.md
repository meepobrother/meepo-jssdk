## imeepos angular template

```sh
git remote add origin https://github.com/meepobrother/imeepos-ng-template.git
git push -u origin master
```


### 用法

```sh
git clone https://github.com/meepobrother/imeepos-ng-template.git my-app
cd my-app
yarn 
// 或者
npm install
```

### 发布包到npm

```ts
// 删除mac自带后缀文件
find ./ -name ".DS_Store" | xargs rm -rf
// 1: 更改package.json中的name为要发布的名字
npm run build && npm publish
```

### 使用发布的包

```ts
npm install --save 包名
```


```ts
import { 模块 } from {包名}
```

```ts
"rollup": "^0.43.0",
"rollup-plugin-commonjs": "^8.0.2",
"rollup-plugin-includepaths": "0.2.2",
"rollup-plugin-node-resolve": "^3.0.0"
```

- demo演示

```
yarn demo
```

- 后台相关
```ts
// 启动后台服务
yarn server
// 重启后台服务
yarn reload
// 清除进程
yarn delete
```