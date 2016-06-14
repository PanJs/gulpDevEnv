
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

var syncLess = function(chgdFiles, sourceDirName, trgDirName) {
    if (chgdFiles.path != undefined && chgdFiles.path != null && chgdFiles.path.match(/\.(less)$/i)) {
        if (chgdFiles.path.match(/^(.*)\/([^\/]+)$/i)) {
            var basePath = RegExp.$2;
            var destDir = RegExp.$1 + '/';
            var reg = new RegExp("^(.+)\/" + sourceDirName + "\/(.+)\/([^\/]+)$", "i");
            if (chgdFiles.path.match(reg)) {
                //console.log('syncLess', basePath, chgdFiles.path, destDir);
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
                    console.log('finished', data, '../' + trgDirName + '/' + data[0].destDir + data[0].basePath);
                    var deferred2 = Q.defer();
                    return deferred2.promise;
                }, function(data) {
                    console.log('error', data);
                    return deferred.promise;
                });

            }
        }
    }
};

var syncCss = function(chgdFiles, isCompress, sourceDirName, trgDirName, prefixOfTargetDir) {
    if (chgdFiles.path != undefined && chgdFiles.path != null && chgdFiles.path.match(/\.(css)$/i) && !chgdFiles.path.match(/\.min\.(css)$/i)) {
        if (chgdFiles.path.match(/^(.*)\/([^\/]+)$/i)) {
            var basePath = RegExp.$2;
            var destDir = '';
            var reg = new RegExp("^(.+)\/(" + sourceDirName + "\/)?(.+)\/([^\/]+)$", "i");
            if (chgdFiles.path.match(reg)) {
                destDir = RegExp.$3 + '/';
                if (destDir.indexOf(sourceDirName) === -1) {
                    destDir = sourceDirName + '/' + destDir;
                }
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

var syncJs = function(chgdFiles, isCompress, sourceDirName, trgDirName, prefixOfTargetDir) {
    var all;
    if (chgdFiles.path != undefined && chgdFiles.path != null && chgdFiles.path.match(/\.(js)$/i) && !chgdFiles.path.match(/\.min\.(js)$/i)) {
        if (chgdFiles.path.match(/^(.*)\/([^\/]+)$/i)) {
            var basePath = RegExp.$2;
            var destDir = '';
            var reg = new RegExp("^(.+)\/(" + sourceDirName + "\/)?(.+)\/([^\/]+)$", "i");
            if (chgdFiles.path.match(reg)) {
                destDir = RegExp.$3 + '/';
                if (destDir.indexOf(sourceDirName) === -1) {
                    destDir = sourceDirName + '/' + destDir;
                }
                console.log('destDir', prefixOfTargetDir + trgDirName + '/' + destDir + basePath);
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
    return all;
};

module.exports.syncLess = syncLess;
module.exports.syncCss = syncCss;
module.exports.syncJs = syncJs;
