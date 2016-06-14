'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var less = require('gulp-less');
var path = require('path');
var clean = require('gulp-clean');
var nano = require('gulp-cssnano');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var exec = require('child_process').exec;
//var ngmin = require('gulp-ngmin');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var chalk = require('chalk');

//压缩css插件
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({
        advanced: true
    });

var merge = require('merge-stream');
var fs = require('fs');
var gulpif = require('gulp-if');

//http://www.ituring.com.cn/article/54547
var Q = require('q');
var karmaServer = require('karma').Server;

var _red = function(title, info) {
    console.log(chalk.white.bgRed.bold(' ' + title + ' '), info);
};

var syncModule = require('./syncModule');

//////////配置目录名称

//普通js脚本开发目录，一般放在gulpDevEnv目录下： gulpDevEnv/dev
var sourceDirName = 'dev';
//普通js脚本同步目录，一般放在gulpDevEnv目录外： ../dist/dev (dev和dist也可以同名)
var targetDirName = 'dist'; //'dist';
// check if targetDir is inside of gulpDevEnv or not
var targetDirIsInside = true;
var prefixOfTargetDir = (targetDirIsInside) ? '' : '../';
//////////配置目录名称

//sourceDirName和targetDirName只能包含0-9a-z_
sourceDirName = sourceDirName.replace(/[\r\n]/ig, "");
targetDirName = targetDirName.replace(/[\r\n]/ig, "");
if (sourceDirName === "") {
    console.log(chalk.white.bgRed.bold('[error]') + ' 缺少 sourceDirName');
    process.exit()
}
if (targetDirName === "") {
    console.log(chalk.white.bgRed.bold('[error]') + ' 缺少 targetDirName');
    process.exit()
}

//deploy前请gulp karma进行测试
gulp.task('karma', function(done) {
    new karmaServer({
        configFile: __dirname + '/karma.test.conf.js',
        singleRun: true
    }, done).start();
});

//less生成压缩版css
gulp.task('lessmin', function() {
    return gulp.src('./' + sourceDirName + '/**/*.less')
        .pipe(less({
            paths: [path.join(__dirname, sourceDirName)],
            plugins: [cleancss]
        }))
        .pipe(gulp.dest(sourceDirName))
        .pipe(browserSync.stream({
            match: "**/*.css"
        }));
});

//生成css，不压缩
gulp.task('less', function() {
    return gulp.src('./' + sourceDirName + '/**/*.less')
        .pipe(less({
            paths: [path.join(__dirname, sourceDirName)]
        }))
        .pipe(gulp.dest(sourceDirName))
        .pipe(browserSync.stream({
            match: "**/*.css"
        }));
});

gulp.task('cleanCssFiles', function() {
    return gulp.src(['./' + sourceDirName + '/**/*.css'], {
            read: false
        })
        .pipe(clean());
});

var chgdFiles = {};
var chgdCss = {};
var chgdLess = {};

//watch:Django时是否压缩css/js
var isCompress = true;

//Django文件监控(压缩)
//gulp watch:Django --src=yes/no
gulp.task('watch:Django', function() {

    if (typeof argv.src == 'string' && argv.src.match(/^(yes|no)$/i)) isCompress = (RegExp.$1.match(/^yes$/i)) ? false : true;
    if (isCompress) {
        console.log(chalk.white.bgGreen.bold('［压缩模式］'));
    } else {
        console.log(chalk.white.bgMagenta.bold('［非压缩模式］'));
    }
    console.log(chalk.white.bgBlue.bold('［请注意］：') + chalk.black.bgWhite.bold(' push／pull代码时请暂停watch:Django文件监控［Ctrl + c］'));
    browserSync.init({
        server: {
            baseDir: "./" + sourceDirName + "/",
            directory: true
        },
        //不弹窗
        open: false,
        //notify: false
        //startPath: "/index.html"
        //scrollProportionally: false // Sync viewports to TOP position
        //scrollThrottle: 100 // only send scroll events every 100 milliseconds
        //https://www.browsersync.io/docs/options/
        port: 4032
    });
    //Default: ['add', 'change', 'unlink']
    var _cbChgHtml = function(chg) {
        console.log('watch html', chg);
        gulp.start('dev', function(done) {
            browserSync.reload();
        });
    };
    gulp.watch(sourceDirName + "/**/*.html", {cwd: "./"}).on("change", _cbChgHtml);

    //如果文件有修改，编译less到目录
    gulp.watch(sourceDirName + "/**/*.less", {cwd: "./"}).on("change", function(chg) {
        console.log('watch', chg);
        gulp.start('dev', function(done) {
            browserSync.reload();
        });
    });
    //如果文件有修改，编译less到public目录(同一个目录less=>css)
    gulp.watch(sourceDirName + "/**/*.less", {cwd: "./"}).on("change", function(chg) {
        console.log('watch less', chg);
        if (chg.type.match(/^(added|changed|deleted)$/i)) {
            //有文件被修改
            chgdLess = chg;
            gulp.start('deploy_local_less', function(done) {
                browserSync.reload();
            });
        }
    });
    //如果文件有修改，发布页面css代码
    var _cbChgCss = function(chg) {
        console.log('watch css', chg);
        if (chg.type.match(/^(added|changed|deleted)$/i)) {
            //有文件被修改
            chgdCss = chg;
            gulp.start('deploy_local_css', function(done) {
                browserSync.reload();
            });
        }
    };
    gulp.watch(sourceDirName + "/**/*.css", {cwd: "./"}).on("change", _cbChgCss);
    //如果文件有修改，发布页面js代码
    gulp.watch(sourceDirName + "/**/*.js", {cwd: "./"}).on("change", function(chg) {
        //{ type: 'changed', path: '' }
        console.log('watch js', chg);
        if (chg.type.match(/^(added|changed|deleted)$/i)) {
            //有文件被修改
            chgdFiles = chg;
            gulp.start('deploy_local_js', function(done) {
                browserSync.reload();
            });
        }
    });

});

//如果文件有修改，同步最新less到目录 ./开发目录/ to ./发布目录/
gulp.task('deploy_local_less', ['dev'], function() {
    console.log('deploy_local_less');
    var all;
    var chgdFiles = chgdLess;
    syncModule.syncLess(chgdFiles, sourceDirName, targetDirName);
});

//如果文件有修改，同步最新css到目录 ./public/ to ../public/
gulp.task('deploy_local_css', function() {
    var all;
    var chgdFiles = chgdCss;
    syncModule.syncCss(chgdFiles, isCompress, sourceDirName, targetDirName, prefixOfTargetDir);
});

//发布页面js代码 ./public/ to ../public/
gulp.task('deploy_local_js', function() {
    var all = syncModule.syncJs(chgdFiles, isCompress, sourceDirName, targetDirName, prefixOfTargetDir);
    return merge(
        all
    );
});

gulp.task('reload', function() {
    browserSync.init({
        server: {
            baseDir: "./",
            directory: true
        }
    });
    browserSync.reload
});

gulp.task('gallery', function() {
    browserSync.init({
        server: {
            baseDir: "./gallery/",
            directory: true
        }
    });
    //browserSync.reload
});

////////////////////////////
//重新发布测试环境
gulp.task('dev', [
    'cleanCssFiles', 'less', 'deploy_local_css'
]);
//启动默认开发环境： gulp
gulp.task('default', [

]);