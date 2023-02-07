// Определяем переменную "preprocessor"
let preprocessor = 'scss';

// Определяем константы Gulp
const { src, dest, parallel, series, watch } = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключение Pug
const pug = require('gulp-pug');

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// Подключаем модули gulp-sass и gulp-less
const sass = require('gulp-sass')(require('sass'));
const less = require('gulp-less');

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем compress-images для работы с изображениями
const imagecomp = require('compress-images');

// Подключаем модуль gulp-clean (вместо del)
const clean = require('gulp-clean');

// Определяем логику работы Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

function views() {
	return src('app/pug/views/*.pug')
		.pipe(
			pug({
				// Your options in here.
				pretty: true,
			})
		)
		.pipe(dest('app'))
		.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function scripts() {
	return src([ // Берём файлы из источников
		// 'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
		'node_modules/axios/dist/axios.min.js', // Пример подключения библиотеки
		'node_modules/gsap/dist/gsap.min.js', // Пример подключения библиотеки
		'node_modules/gsap/dist/CustomEase.min.js', // Пример подключения библиотеки
		// 'node_modules/swiper/swiper-bundle.min.js', // Пример подключения библиотеки
		'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
	])
		.pipe(concat('app.min.js')) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		.pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
	return src('app/' + preprocessor + '/main.' + preprocessor + '') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
		.pipe(eval(sass)()) // Преобразуем значение переменной "preprocessor" в функцию
		.pipe(concat('main.min.css')) // Конкатенируем в файл app.min.js
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
		.pipe(cleancss({ level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ })) // Минифицируем стили
		.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
		.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function fonts() {
	return src('app/assets/fonts/**/*')
		.pipe(dest('dist/assets/fonts/'))
		
}

async function images() {
	imagecomp(
		"app/assets/images/src/**/*", // Берём все изображения из папки источника
		"app/assets/images/dest/", // Выгружаем оптимизированные изображения в папку назначения
		{ compress_force: false, statistic: true, autoupdate: true }, false, // Настраиваем основные параметры
		{ jpg: { engine: "mozjpeg", command: ["-quality", "90"] } }, // Сжимаем и оптимизируем изображеня
		{ png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } }, 
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) { // Обновляем страницу по завершению
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}

function cleanimg() {
	return src('app/assets/images/dest/', { allowEmpty: true }).pipe(clean()) // Удаляем всё содержимое папки "app/images/dest/"
}

function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/assets/images/dest/**/*',
		'app/**/*.html',
	], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
		.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
	return src('dist', { allowEmpty: true }).pipe(clean()) // Удаляем всё содержимое папки "dist/"
}

function startwatch() {

	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);

	// Мониторим файлы препроцессора на изменения
	watch('app/**/' + preprocessor + '/**/*', styles);

	// Мониторим файлы PUG на изменения
	watch('app/**/*.pug').on('change', views);

	// Мониторим файлы HTML на изменения
	watch('app/**/*.html').on('change', browserSync.reload);

	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('app/assets/images/src/**/*', images);

	// Мониторим папку-источник шрифтов и выполняем fonts(), если есть изменения
	watch('app/assets/fonts/**/*', fonts)

}


// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспорт функции views()  в таск views
exports.views = views;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспорт функции images() в таск images
exports.images = images;

// Экспорт функции fonts() в таск fonts
exports.fonts = fonts;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, styles, scripts, images, buildcopy, views, fonts);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, browsersync, startwatch, views, fonts);
