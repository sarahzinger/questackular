'use strict';

// All used modules.
var gulp = require('gulp');
var runSeq = require('run-sequence');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var minifyCSS = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var karma = require('karma').server;

// Development tasks
// --------------------------------------------------------------

// Live reload business.
gulp.task('buildJS', function () {
    return gulp.src(['./js/popup.js', './js/application/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./js'));
});

gulp.task('buildCSS', function () {
    return gulp.src('./browser/scss/main.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(rename('style.css'))
        .pipe(gulp.dest('./public'))
});

// --------------------------------------------------------------

// Production tasks
// --------------------------------------------------------------

// gulp.task('buildCSSProduction', function () {
//     return gulp.src('./browser/scss/main.scss')
//         .pipe(sass())
//         .pipe(rename('style.css'))
//         .pipe(minifyCSS())
//         .pipe(gulp.dest('./public'))
// });

gulp.task('buildJSProduction', function () {
    return gulp.src(['./js/application/**/*.js'])
        .pipe(concat('main.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('./js'));
});

gulp.task('buildProduction', ['buildJSProduction']);

// --------------------------------------------------------------

// Composed tasks
// --------------------------------------------------------------

gulp.task('build', function () {
    runSeq(['buildJS']);
});

gulp.task('default', function () {

    gulp.start('build');

    gulp.watch('js/**', function () {
        runSeq('buildJS');
    });

    // gulp.watch('browser/scss/**', function () {
    //     runSeq('buildCSS');
    // });
});