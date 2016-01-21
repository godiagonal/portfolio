/*global module:false*/
module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'css/main.css': 'sass/main.scss'
				}
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
      	'sass'
    ]);

};