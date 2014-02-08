'use strict';

var path = require('path');

module.exports = function(grunt){
	grunt.initConfig({
		express: {
			epik: {
				options: {
					server: path.resolve('dist/server/index'),
					port: 8000,
					bases: [path.resolve('dist'), path.resolve('lib')],
					serverreload: true,
					//livereload: true,
					//background: !true
				}
			}
		},

		// shared between tasks
		output: 'dist/docs',

		// Before generating any new files, remove any previously-created files.
		clean: {
			'dist/docs': ['<%= output%>']
		},

		requirejs: {
			bare: {
				options: {
					optimize: 'uglify2',
					out: './lib/epik-min.js',
					// name: 'epik',
					// build all cept for components
					include: [
						'lib/index',
						'lib/agent',
						'lib/model',
						'lib/model-sync',
						'lib/storage',
						'lib/collection',
						'lib/collection-sync',
						'lib/view',
						'lib/plugins/rivets-adapter',
						'lib/router',
						'slicker'
					],
					exclude: [
						'lodash',
						'jquery',
						'rivets',
						'primish/primish',
						'primish/options',
						'primish/emitter'
					],
					paths: {
						primish: 'lib/components/primish',
						lodash: 'lib/components/lodash/dist/lodash',
						slicker: 'lib/components/slicker/index',
						jquery: 'lib/components/jquery/jquery',
						rivets: 'lib/components/rivets/dist/rivets'
					}
				}
			},
			all: {
				options: {
					optimize: 'uglify2',
					out: './dist/build/epik-full-min.js',
					// name: 'epik',
					// build all including components
					include: [
						'lib/index',
						'lib/agent',
						'lib/model',
						'lib/model-sync',
						'lib/storage',
						'lib/collection',
						'lib/collection-sync',
						'lib/view',
						'lib/plugins/rivets-adapter',
						'lib/router'
					],
					paths: {
						primish: 'lib/components/primish',
						lodash: 'lib/components/lodash/dist/lodash',
						slicker: 'lib/components/slicker/index',
						jquery: 'lib/components/jquery/jquery',
						rivets: 'lib/components/rivets/dist/rivets'
					}
				}
			}
		},

		// builds the docs via grunt-doctor-md task.
		doctor: {
			default_options: {
				options: {
					source: 'README.md',
					output: '<%= output%>',
					title: 'Epik - Lightweight MVC/MVP Framework for modern web development',
					twitter: 'D_mitar',
					analytics: 'UA-1199722-3',
					pageTemplate: 'dist/tpl/page.hbs',
					github: 'https://github.com/DimitarChristoff/epik',
					travis: 'http://travis-ci.org/DimitarChristoff/epik',
					images: 'dist/images',
					logo: 'images/epik-logo-small.png',
					//disqus: 'epitome-mvc'
				},
				files: {
					'<%= output%>/index.html': './README.md'
				},

				// via grunt-contrib-copy, move files to docs folder.
				copy: {
					doctor: {
						files: [{
							dest: '<%= output%>/js/',
							src: [
								'lib/epik-min.js',
								'dist/js/doctor.js'
							],
							expand: true,
							flatten: true
						}, {
							dest: '<%= output%>',
							src: ['lib/components/**'],
							expand: true
						}]
					}
				},

				// helps move some files through a template engine to docs folder. passes options as context
				assemble: {
					options: {
						engine: 'handlebars',
						flatten: false,
						name: 'epik example',
						// files to embed in the example before running code, from /js
						jsIncludes: [],
						cssIncludes: []
					},
					doctor: {
						files: [{
							dest: '<%= output%>/js/blank.html',
							src: 'dist/tpl/blank.hbs'
						}]
					}
				}
			}
		}
	});

	//require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-doctor-md');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('docs', ['clean', 'build', 'doctor']);
	grunt.registerTask('default', ['express', 'express-keepalive']);
	grunt.registerTask('build', ['requirejs:bare']);
	grunt.registerTask('build:all', ['requirejs:all']);

};
