/*global module:false*/
module.exports = function (grunt) {

	var pluginList = [
		'js/vendor/jquery-1.11.3.min.js',
		'js/vendor/jquery.waypoints.min.js',
		'js/vendor/particles.min.js',
		'js/vendor/masonry.min.js',
		'js/vendor/imagesloaded.min.js',
      	'js/vendor/bowser.min.js'
    ];
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					style: 'compressed'
				},
				files: {
					'css/main.min.css': 'sass/main.scss'
				}
			}
		},
		concat: {
			dist: {
				src: pluginList,
				dest: 'js/plugins.min.js'
			}
		},
		jshint: {
			all_files: [
        		'js/main.js'
      		],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		watch: {
			css: {
				files: [
					'sass/*.scss',
					'sass/normalize/*.scss'
				],
				tasks: ['sass']
			}
		}
	});

	grunt.registerTask('default', [
      	'jshint',
      	'sass',
		'concat'
    ]);

};