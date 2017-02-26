/// <binding BeforeBuild='typescript-compile, restore-modules, cloudformation-to-dist' Clean='clean' />
var gulp = require("gulp");
var del = require('del');
var ts = require('gulp-typescript');
var install = require("gulp-install");

var tsProject = ts.createProject('tsconfig.json', { rootDir: "src" });

gulp.task('clean', function () {
    return del.sync([
        './dist/**/*'
    ]);
});

gulp.task('typescript-compile', function () {
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('restore-modules', function () {
    return gulp.src(['./package.json'])
        .pipe(gulp.dest('./dist/'))
        .pipe(install({ production: true }));
});

gulp.task('cloudformation-to-dist', function () {
    return gulp.src('./../CloudFormation/app.yaml')
        .pipe(gulp.dest('./dist/'));
});