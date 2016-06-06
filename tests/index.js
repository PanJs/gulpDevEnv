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

//////////配置目录名称

//普通js脚本开发目录，一般放在gulpDevEnv目录下： gulpDevEnv/dev
var sourceDirName = 'dev';
//普通js脚本同步目录，一般放在gulpDevEnv目录外： ../dist/dev (dev和dist也可以同名)
var targetDirName = 'dist'; //'dist';
// check if targetDir is inside of gulpDevEnv or not
var targetDirIsInside = false;
var prefixOfTargetDir = (targetDirIsInside) ? '' : '../';
//////////配置目录名称

describe("gulp file test",function(){

    it("sourceDirName",function(){
        //sourceDirName
        expect(sourceDirName).toBe('dev');
    });


});
