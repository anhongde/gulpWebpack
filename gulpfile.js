var gulp = require('gulp'),
    os = require('os'),
    gutil = require('gulp-util'),
    gulpOpen = require('gulp-open'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    fileinclude = require('gulp-file-include'),
    webpackConfig = require('./webpack.config.js'),
    webpack = require('webpack'),
    md5 = require('gulp-md5-plus'),
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    gulpSequence = require('gulp-sequence'),
    opt = require('minimist'),//获取命令行参数
    connect = require('gulp-connect');

let args = process.argv,
    argsOpt = opt(args);

var host = {
    path: 'dist/',
    port: 3000,
    html: 'index.html'
};

//mac chrome: "Google chrome", 
var browser = os.platform() === 'linux' ? 'Google chrome' : (
  os.platform() === 'darwin' ? 'Google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));
var pkg = require('./package.json');

//将图片拷贝到目标目录
gulp.task('copy:images', function (done) {
    gulp.src(['src/images/**/*']).pipe(gulp.dest('dist/images')).on('end', done);
});

//压缩合并css, css中既有自己写的.less, 也有引入第三方库的.css
gulp.task('lessmin', function (done) {
    gulp.src(['src/css/*.css'])
        //.pipe(less())
        //这里可以加css sprite 让每一个css合并为一个雪碧图
        //.pipe(spriter({}))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('dist/css/'))
        .on('end', done);
});

//用于在html文件中直接include文件
gulp.task('fileinclude', function (done) {
    gulp.src(['src/html/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist/html'))
        .on('end', done);
    // .pipe(connect.reload())
});

//引用webpack对js进行操作
webpackConfig.devtool = args[2] == 'pro'? '': '#source-map';
gulp.task("build-js", ['fileinclude'], function(callback) {
    var myDevConfig = Object.create(webpackConfig);
    var devCompiler = webpack(myDevConfig);
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-js", err);
        gutil.log("[webpack:build-js]", stats.toString({
            colors: true
        }));
        callback();
    });
});

//自动刷新任务
gulp.task('livereload', ['copy:images', 'fileinclude', 'lessmin', 'build-js'] , function () {
    return gulp.src('src/')
    //'changed' 任务需要提前知道目标目录位置
    // 才能找出哪些文件是被修改过的
    .pipe(changed('dist/'))
    .pipe(plumber())
    .pipe(connect.reload());
});

//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('md5:js', ['build-js'], function (done) {
    gulp.src('dist/js/*.js')
        .pipe(md5(10, 'dist/html/*.html'))
        .pipe(gulp.dest('dist/js'))
        .on('end', done);
});

//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', ['copy:images', 'lessmin'] , function (done) {
    gulp.src('dist/css/*.css')
        .pipe(md5(10, 'dist/html/*.html'))
        .pipe(gulp.dest('dist/css'))
        .on('end', done);
});

gulp.task('clean', function (done) {
    return gulp.src(['dist'])
        .pipe(clean());
        //.on('end', done);
});

gulp.task('watch', function (done) {
    //'connect', 'copy:images', 'fileinclude', 'lessmin', 'build-js', 'watch', 'open'
    //var watcher = gulp.watch('src/**/*', ['lessmin', 'livereload', 'fileinclude']);
    var watcher = gulp.watch('src/**/*', [ 'livereload']);
    //var watcher = gulp.watch('src/**/*', [ 'copy:images', 'fileinclude', 'lessmin', 'build-js']);
    //var watcher = gulp.watch('src/**/*', [ 'build-js']);
    //watcher.on('change', event => {
    //    console.log(gutil.colors.yellow(`File ${event.path} was ${event.type}, running tasks...`));
    //});
    watcher.on('end', done);
});

gulp.task('connect', function () {
    console.log('connect------------');
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true
    });
});

gulp.task('open', function (done) {
    gulp.src('')
        .pipe(gulpOpen({
            app: browser,
            uri: 'http://localhost:3000/html'
        }))
        .on('end', done);
});

//发布
//gulp.task('default', ['connect', 'fileinclude', 'md5:css', 'md5:js', 'open']);
gulp.task('pro', gulpSequence(['connect', 'fileinclude', 'md5:css', 'md5:js'],'help'));

//开发
gulp.task('dev', gulpSequence('connect', 'copy:images', 'fileinclude', 'lessmin', 'build-js','help',['open', 'watch']));

//默认（发布）
gulp.task('default', gulpSequence('clean','pro','open'));

//单纯起服务
gulp.task('ser', gulpSequence(['connect', 'open','help']));

gulp.task('help', function(callback){
    console.log('\x1B[32m ||*******************************||');
    console.log('\x1B[36m gulp dev   开发打包：开启本地静态服务器和自动刷新功能以及打包到dist目录并自动打开网页（js、css不打MD5随机码，不清空dist目录），默认路径http://localhost:3000/html');
    console.log('\x1B[36m gulp pro   发布打包：开启本地静态服务器以及打包到dist目录（不自动打开网页，不清空dist目录，js、css打MD5随机码）');
    console.log('\x1B[36m gulp       发布打包缺省命令：清空dist目录、执行pro包含操作并自动打开网页');
    console.log('\x1B[36m gulp ser   仅开启本地静态服务器并自动打开网页');
    console.log('\x1B[36m gulp clean 仅清空dist目录');
    console.log('\x1B[32m ||*******************************||');
    //console.log(args[2],argsOpt._[2]);
    callback();
});