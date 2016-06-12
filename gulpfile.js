var gulp = require('gulp')
var ts = require('gulp-typescript')
//var sass = require('gulp-sass')
//var concat = require('gulp-concat')
//var minify = require('gulp-minify-css')
//var sourcemaps = require('gulp-sourcemaps')
//var uglify = require('gulp-uglify')
//var jshint = require('gulp-jshint')
//var rsync = require('gulp-rsync')
//var clone = require('gulp-clone')
//var rename = require('gulp-rename')
//var env = require('./env.json') 

//compila los vendors js en un solo archivo
gulp.task('vendors-js', function() {
    gulp.src([
        //colocal aquí los vendors, colocando las direcciones de los archivos minificados de cada uno
        //'./node_modules/bootstrap/dist/css/bootstrap.min.css',
        './node_modules/core-js/client/shim.min.js',
        './node_modules/zone.js/dist/zone.js',
        './node_modules/reflect-metadata/Reflect.js',
        './node_modules/systemjs/dist/system.src.js',
        './node_modules/rxjs/bundles/Rx.umd.js',
    ])
    .pipe(gulp.dest('./public/javascripts/vendors'))
    
    return gulp.src([
        './node_modules/@angular/core/core.umd.js',
        './node_modules/@angular/common/common.umd.js',
        './node_modules/@angular/compiler/compiler.umd.js',
        './node_modules/@angular/platform-browser/platform-browser.umd.js',
        './node_modules/@angular/platform-browser-dynamic/platform-browser-dynamic.umd.js'

    ])
    .pipe(gulp.dest('./public/javascripts/angular'))
    

})

//compila los vendors css en un solo archivo
gulp.task('vendors-css', function() {
    return gulp.src([
        //Se colocan las direciones directas de los css minificados
        
        //'./bower_components/bootstrap/dist/css/bootstrap-theme.min.css'
    ])
    //.pipe(concat('vendor.css'))
    .pipe(gulp.dest('./public/javascripts'))
})

//compila los js en un solo archivo
gulp.task('scripts', function() {
    //var scripts = gulp.src('./assets/js/src/*.js').pipe(jshint())
    //var uglified = scripts.pipe(clone())

    //scripts.pipe(gulp.dest('./assets/js'))
    //return uglified
    //        .pipe(uglify())
    //        .pipe(rename(function (file) {
    //            file.basename = file.basename + '.min'
    //        }))
    //        .pipe(gulp.dest('./assets/js'))

    return gulp.src('src/**/*.ts')
            .pipe(ts({
                "target": "es5",
                "module": "commonjs",
                "moduleResolution": "node",
                "sourceMap": true,
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "removeComments": false,
                "noImplicitAny": false
            }))
            .pipe(gulp.dest('public/javascripts/app'))
})

//compile all sass into a single file
gulp.task('sass', function () {
    var styles =  gulp.src('./assets/css/src/<%= appNameSlug %>.scss').pipe(sass.sync().on('error', sass.logError))
    var minified = styles.pipe(clone())

    styles.pipe(gulp.dest('./assets/css'))
    return minified
            .pipe(sourcemaps.init())
            .pipe(minify())
            .pipe(sourcemaps.write())
            .pipe(rename(function (file) {
                file.basename = file.basename + '.min'
            }))
            .pipe(gulp.dest('./assets/css'))
})

//compile vendors and sync with the server
gulp.task('vendors-sync', ['vendors-css', 'vendors-js'], function(){
    gulp.src(['./assets/css/vendor.css', './assets/js/vendor.js'])
    .pipe(rsync({
        hostname: env.servers.dev.hostname,
        username: env.servers.dev.username,
        password: env.servers.dev.password,
        destination: env.servers.dev.destination,
    }))
})

//sync all sass files to the server
gulp.task('sass-sync', ['sass'], function(){
    gulp.src('./assets/css/*.css')
    .pipe(rsync({
        hostname: env.servers.dev.hostname,
        username: env.servers.dev.username,
        password: env.servers.dev.password,
        destination: env.servers.dev.destination,
        exclude: ['src', 'vendor.css']
    }))
})

//sync all the scripts to the server
gulp.task('scripts-sync', ['scripts'], function(){
    gulp.src('./assets/js/*.js')
    .pipe(rsync({
        hostname: env.servers.dev.hostname,
        username: env.servers.dev.username,
        password: env.servers.dev.password,
        destination: env.servers.dev.destination,
        exclude: ['src', 'vendor.js']
    }))
})

//function to upload files to the server
function phpSync(event){
    var src = event.path
    if(!src) src = './**/*.php';

    gulp.src(src)
    .pipe(rsync({
        hostname: env.servers.dev.hostname,
        username: env.servers.dev.username,
        password: env.servers.dev.password,
        destination: env.servers.dev.destination,
        exclude: ['*.css', '*.js', '.env', 'node_modules', 'bower_components', '.gitignore', 'package.json', '*.md']
    }))    
}

//sync all php of the project
gulp.task('php-sync', phpSync)

//compile vendors'js and sass 
gulp.task('vendors', ['vendors-css', 'vendors-js'])

//Observa y hace cambios en el archivo llamado
gulp.task('default', function () {
    //gulp.watch('./assets/css/src/*.scss', ['sass'])
    //gulp.watch('./assets/js/src/*.js', ['scripts'])
    gulp.watch('src/**/*.ts', ['scripts'])
    
})

//Observa, hace cambios y los sube al servidor
gulp.task('deploy', function () {
    gulp.watch('./assets/css/src/*.scss', ['sass-sync'])
    gulp.watch('./assets/js/src/*.js', ['scripts-sync']) 
    gulp.watch('./**/*.php', phpSync)
})