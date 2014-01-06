module.exports = function(grunt){
	grunt.initConfig({
		express: {
			epik: {
				server: 'dist/server/index.js',
				port: 8000
			}
		},

		// shared between tasks
		output: 'dist/docs',

		// Before generating any new files, remove any previously-created files.
		clean: {
			'dist/docs': ['<%= output%>']
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
					logo: 'images/epitome-logo-small.png',
					disqus: 'epitome-mvc'
				},
				files: {
					'<%= output%>/index.html': './README.md'
				},

				// via grunt-contrib-copy, move files to docs folder.
				copy: {
					doctor: {
						files: [{
							dest: '<%= output%>/js/',
							src: ['epic-min.js','dist/js/doctor.js'],
							expand: true,
							flatten: true
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

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('default', ['express:epik']);
};