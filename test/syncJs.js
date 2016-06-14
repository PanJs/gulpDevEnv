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

var syncModule = require('../syncModule');

var chai = require("chai");
//var chaiAsPromised = require("chai-as-promised");
//chai.use(chaiAsPromised);
chai.should();
var expect = chai.expect;
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


//////start test

function checkDone(done, f) {
    try {
        f();
        done();
    } catch (e) {
        done(e);
    }
}

var dir = ''; //a/';
var filename = 'test'; //'testa';
var filetype = 'js'; //'js';
var data;

var chgdFiles = {};
chgdFiles.path = __dirname + '/../dev/' + dir + '' + filename + '.' + filetype;
var isCompress = true;
var trgDirName = targetDirName;
var targetFile = __dirname + '/../' + trgDirName + '/dev/' + dir + '' + filename + '.' + filetype;
var isSourceExist = null;
var isTargetExist = null;
var isTargetExist2 = null;
if (fs.existsSync(chgdFiles.path)) {
    isSourceExist = true;
} else {
    isSourceExist = false;
}
if (fs.existsSync(targetFile)) {
    isTargetExist = true;
} else {
    isTargetExist = false;
}

/*if (isTargetExist) {
    rmdir(__dirname + '/../' + trgDirName + '/dev', function(error) {
        console.log('[error] failed to clean test files', error, trgDirName + '/dev');
    });
}
if (fs.existsSync(targetFile)) {
    isTargetExist = true;
} else {
    isTargetExist = false;
}*/

rmdir(__dirname + '/../' + trgDirName + '/dev', function(error) {
    console.log('[error] failed to clean test files', error, trgDirName + '/dev');
});

describe("gulpfile test syncJs:", function() {
    it('clean dir', function(done) {
        setTimeout(function() {
            checkDone(done, function() {
                if (fs.existsSync(targetFile)) {
                    isTargetExist = true;
                } else {
                    isTargetExist = false;
                }
            });
            expect(isTargetExist).equal(false);
            if(filetype === 'js'){
                data = syncModule.syncJs(chgdFiles, isCompress, sourceDirName, trgDirName, prefixOfTargetDir);
            }else if(filetype === 'less'){
                data = syncModule.syncLess(chgdFiles, sourceDirName, trgDirName);
            }else if(filetype === 'css'){
                data = syncModule.syncCss(chgdFiles, isCompress, sourceDirName, trgDirName, prefixOfTargetDir);
            }
        }, 1000);
        done();
    });
});

describe("gulpfile test syncJs:", function() {
    if (fs.existsSync(targetFile)) {
        isTargetExist2 = true;
    } else {
        isTargetExist2 = false;
    }
    var re = new RegExp(filename + "\." + filetype, "i");
    it('ok', function(done) {
        setTimeout(function() {
            checkDone(done, function() {
                expect(isSourceExist).equal(true);
                expect(sourceDirName).equal('dev');
                expect(chgdFiles.path).match(re);
                expect(trgDirName).equal('dist');
                expect(prefixOfTargetDir).equal('');
                expect(isTargetExist).equal(false);
                expect(isTargetExist2).equal(true);

                rmdir(__dirname + '/../' + trgDirName + '/dev', function(error) {
                    console.log('[error] failed to clean test files', error, trgDirName + '/dev');
                });
            });
        }, 2000);
        done();
    });

});

describe("gulpfile test syncJs:", function() {
    it('clean dir again', function(done) {
        setTimeout(function() {
            checkDone(done, function() {
                if (fs.existsSync(targetFile)) {
                    isTargetExist = true;
                } else {
                    isTargetExist = false;
                }
            });
            expect(isTargetExist).equal(false);
        }, 4000);
        done();
    });
});

