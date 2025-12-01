'use strict';

var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var terser = require('gulp-terser');
var concat = require('gulp-concat');
var header = require('gulp-header');
var buffer = require('vinyl-buffer');
var pkg = require('./package.json');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');

var banner = ['/**',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * Copyright <%= pkg.author %>',
    ' * @link https://github.com/ionaru/easy-markdown-editor',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');


var css_files = [
    './src/css/*.css',
];

function lint() {
    return gulp.src('./src/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function scriptsUnminified() {
    return browserify({
        entries: './src/js/easymde.js',
        standalone: 'EasyMDE',
        debug: true, // Include source maps
        transform: [
            ['babelify', {
                presets: [['@babel/preset-env', {
                    loose: false,
                }]],
                global: true,
                ignore: [/\/node_modules\/(?!(@codemirror|@lezer|@marijn|style-mod|w3c-keyname))/],
            }],
        ],
    }).bundle()
        .pipe(source('easymde.js'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

function scriptsMinified() {
    return browserify({
        entries: './src/js/easymde.js',
        standalone: 'EasyMDE',
        transform: [
            ['babelify', {
                presets: [['@babel/preset-env', {
                    loose: false,
                }]],
                global: true,
                ignore: [/\/node_modules\/(?!(@codemirror|@lezer|@marijn|style-mod|w3c-keyname))/],
            }],
        ],
    }).bundle()
        .pipe(source('easymde.min.js'))
        .pipe(buffer())
        .pipe(terser({
            compress: {
                drop_console: false,
            },
        }))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

var scripts = gulp.series(scriptsUnminified, scriptsMinified);

function styles() {
    return gulp.src(css_files)
        .pipe(concat('easymde.css'))
        .pipe(cleanCSS())
        .pipe(rename('easymde.min.css'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

// Watch for file changes
function watch() {
    gulp.watch('./src/js/**/*.js', scripts);
    gulp.watch(css_files, styles);
}

var build = gulp.parallel(gulp.series(lint, scripts), styles);

gulp.task('default', build);
gulp.task('watch', gulp.series(build, watch));
gulp.task('lint', lint);
