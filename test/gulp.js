'use strict';
//http://mochajs.org/

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

var expect = require("chai").expect;

//http://www.ituring.com.cn/article/54547
var Q = require('q');
var karmaServer = require('karma').Server;

var _red = function(title, info) {
    console.log(chalk.white.bgRed.bold(' ' + title + ' '), info);
};

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

var rmdir = require('rimraf');

//////////配置目录名称

//普通js脚本开发目录，一般放在gulpDevEnv目录下： gulpDevEnv/dev
var sourceDirName = 'dev';
//普通js脚本同步目录，一般放在gulpDevEnv目录外： ../dist/dev (dev和dist也可以同名)
var targetDirName = 'dist'; //'dist';
// check if targetDir is inside of gulpDevEnv or not
var targetDirIsInside = true;
var prefixOfTargetDir = (targetDirIsInside) ? '' : '../';
//////////配置目录名称

var syncLess = function(chgdFiles, trgDirName) {
    if (chgdFiles.path != undefined && chgdFiles.path != null && chgdFiles.path.match(/\.(less)$/i)) {
        if (chgdFiles.path.match(/^(.*)\/([^\/]+)$/i)) {
            var basePath = RegExp.$2;
            var destDir = RegExp.$1 + '/';
            var reg = new RegExp("^(.+)\/(" + sourceDirName + "\/)?(.+)\/([^\/]+)$", "i");
            //console.log('syncLess', chgdFiles.path, reg);
            if (chgdFiles.path.match(reg)) {
                //console.log('destDir', basePath, destDir);
                var go = function() {
                    var deferred = Q.defer();
                    gulp.src(chgdFiles.path)
                        .pipe(less({
                            paths: [destDir]
                        }))
                        .pipe(gulp.dest(destDir))
                        .pipe(browserSync.stream({
                            match: "**/*.css"
                        }));

                    return deferred.promise;
                };
                var allPromise = Q.all([
                    go()
                ]);
                allPromise.then(function(data) {
                    console.log('finished', data, prefixOfTargetDir + trgDirName + '/' + data[0].destDir + data[0].basePath);
                    //var deferred2 = Q.defer();
                    //return deferred2.promise;
                }, function(data) {
                    console.log('error', data);
                    //return deferred.promise;
                });

            }
            return [prefixOfTargetDir + trgDirName + '/' + destDir + basePath];
        }
    }
};

var syncCss = function(chgdFiles, isCompress, trgDirName) {
    if (chgdFiles.path != undefined && chgdFiles.path != null && chgdFiles.path.match(/\.(css)$/i) && !chgdFiles.path.match(/\.min\.(css)$/i)) {
        if (chgdFiles.path.match(/^(.*)\/([^\/]+)$/i)) {
            var basePath = RegExp.$2;
            var destDir = '';
            var reg = new RegExp("^(.+)\/(" + sourceDirName + "\/)?(.+)\/([^\/]+)$", "i");
            if (chgdFiles.path.match(reg)) {
                destDir = RegExp.$3 + '/';
                console.log('destDir', basePath, prefixOfTargetDir + trgDirName + '/' + destDir);

                var go = function() {
                    var deferred = Q.defer();
                    gulp.src(chgdFiles.path)
                        .pipe(gulpif(isCompress, minifyCss({
                            compatibility: 'ie9'
                        })))
                        .pipe(gulp.dest(prefixOfTargetDir + trgDirName + '/' + destDir))
                        .on('end', function() {
                            //console.log('end ');
                            deferred.resolve({
                                destDir: destDir,
                                basePath: basePath
                            });
                        });
                    return deferred.promise;
                };
                var allPromise = Q.all([
                    go()
                ]);
                allPromise.then(function(data) {
                    console.log('finished', data, prefixOfTargetDir + trgDirName + '/' + data[0].destDir + data[0].basePath);
                    //貌似无效，生成min.css也有点多余
                    var deferred2 = Q.defer();
                    /*
                    gulp.src(prefixOfTargetDir + trgDirName + '/' + data[0].destDir + data[0].basePath)
                        .pipe(nano())
                        .pipe(rename({
                            suffix: '.min'
                        }))
                        .on('end', function() {
                            console.log('end deferred2');
                            deferred2.resolve(true);
                        });*/
                    return deferred2.promise;
                }, function(data) {
                    console.log('error', data);
                    return deferred.promise;
                });
            }
        }
    }
};

var syncJs = function(chgdFiles, isCompress, trgDirName) {
    var all;
    if (chgdFiles.path != undefined && chgdFiles.path != null && chgdFiles.path.match(/\.(js)$/i) && !chgdFiles.path.match(/\.min\.(js)$/i)) {
        if (chgdFiles.path.match(/^(.*)\/([^\/]+)$/i)) {
            var basePath = RegExp.$2;
            var destDir = '';
            var reg = new RegExp("^(.+)\/(" + sourceDirName + "\/)?(.+)\/([^\/]+)$", "i");
            if (chgdFiles.path.match(reg)) {
                destDir = RegExp.$3 + '/';
                console.log('syncJs', prefixOfTargetDir + trgDirName + '/' + destDir + basePath);
                all = gulp.src([
                    chgdFiles.path
                ])
                    .pipe(gulpif(isCompress, ngAnnotate({
                        //dynamic: false
                    })))
                    .pipe(gulpif(isCompress, uglify({
                        output: {
                            beautify: false
                        },
                        mangle: true,
                        outSourceMap: false,
                        basePath: basePath,
                        sourceRoot: '/'
                    })))
                    .pipe(gulp.dest(prefixOfTargetDir + trgDirName + '/' + destDir));
            }
        }
    }
    //return all
    return [prefixOfTargetDir + trgDirName + '/' + destDir + basePath];
};

//////start test

/*describe("gulpfile test: syncLess", function() {
    var chgdFiles = {};
    chgdFiles.path = __dirname + '/../dev/test.less';
    var trgDirName = targetDirName;
    var targetFile = __dirname + '/../' + trgDirName + '/dev/test.less';
    var isTargetExist = null;
    var isTargetExist2 = null;
    if (fs.existsSync(targetFile)) {
        isTargetExist = true;
    } else {
        isTargetExist = false;
    }
    if (isTargetExist) {
        rmdir(__dirname + '/../' + trgDirName + '/dev', function(error) {
            //console.log('failed to clean test files', error);
        });
    }
    var data = syncLess(chgdFiles, trgDirName);
    it("syncLess", function() {
        //setTimeout(function() {
            console.log('data', data);
            expect(sourceDirName).equal('dev');
            expect(chgdFiles.path).match(/test\.less/i);
            expect(trgDirName).equal('dist');
            expect(prefixOfTargetDir).equal('');
            expect(isTargetExist).equal(false);

            //expect(isTargetExist2).equal(true);
            expect(data.length).equal(1);
            expect(data[0]).match(/test\.less/i);
        //}, 1000);
    });

});*/

describe("gulpfile test: syncJs", function() {
    var chgdFiles = {};
    chgdFiles.path = __dirname + '/../dev/test.js';
    var isCompress = true;
    var trgDirName = targetDirName;
    var targetFile = __dirname + '/../' + trgDirName + '/dev/test.js';
    var isTargetExist = null;
    var isTargetExist2 = null;
    if (fs.existsSync(targetFile)) {
        isTargetExist = true;
    } else {
        isTargetExist = false;
    }
    if (isTargetExist) {
        rmdir(__dirname + '/../' + trgDirName + '/dev', function(error) {
            //console.log('failed to clean test files', error);
        });
    }
    var data = syncJs(chgdFiles, isCompress, trgDirName);
    it("syncJs", function() {
        //setTimeout(function() {
            expect(sourceDirName).equal('dev');
            expect(chgdFiles.path).match(/test\.js/i);
            expect(trgDirName).equal('dist');
            expect(prefixOfTargetDir).equal('');
            expect(isTargetExist).equal(false);

            expect(isTargetExist2).equal(true);
            expect(data.length).equal(2);
            expect(data[1]).match(/test\.js/i);
        //}, 1000);
    });

});

