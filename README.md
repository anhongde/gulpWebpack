# gulpWebpack
gulpWebpack demo

gulp + webpack 构建多页面前端项目

安装依赖包：
`npm i --save-dev`

gulp dev   开发打包：开启本地静态服务器和自动刷新功能以及打包到dist目录并自动打开网页（js、css不打MD5随机码，不清空dist目录），默认路径http://localhost:3000/html
gulp pro   发布打包：开启本地静态服务器以及打包到dist目录（不自动打开网页，不清空dist目录，js、css打MD5随机码）
gulp       发布打包缺省命令：清空dist目录、执行pro包含操作并自动打开网页
gulp ser   仅开启本地静态服务器并自动打开网页
gulp clean 仅清空dist目录