/*global $ */
/*global bowser */
/*global particlesJS */

var gui = {

	isMobile: false,
	isSafari: false,
	viewportHeight: 0,
	viewportPosition: 0,
	viewportBottomPosition: 0,
	headerScrollOffset: 100,
	arrowScrollOffset: 200,
	introHeightExtra: 200,
	introArrowOffset: 70,
	scrollToOffset: 100,
	masonryResizeTimeout: null,

	init: function () {

		gui.isMobile = bowser.mobile;
		gui.isSafari = bowser.safari;
		gui.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		gui.viewportPosition = $(document).scrollTop();
		gui.viewportBottomPosition = gui.viewportPosition + gui.viewportHeight;

		gui.initParticles();
		gui.setIntroHeight();
		gui.setAnimationWaypoints();

		grid.masonryCallback = gui.checkHash;
		grid.init();

		$('#work .categories .button').click(gui.toggleCategory);
		$('#button-grid').click(modal.hide);
		$('a[href^="#"]').click(gui.scrollTo);
		
		gui.preloadImages([
			'images/social/36_github_white.png',
			'images/social/36_github_blue.png',
			'images/social/36_twitter_white.png',
			'images/social/36_twitter_purple.png',
			'images/logo_white.png',
			'images/logo_orange.png'
		]);
		
	},

	keyUp: function (e) {
		
		if (e.keyCode === 27) // esc
			modal.hide();
		
	},

	scroll: function () {

		if (gui.isMobile)
			return;
		
		if ($(document).scrollTop() > gui.headerScrollOffset)
			$('#header').addClass('scroll');
		else
			$('#header').removeClass('scroll');
		
		if ($(document).scrollTop() > gui.arrowScrollOffset)
			$('#intro .arrow').addClass('scroll');
		else
			$('#intro .arrow').removeClass('scroll');

	},

	resize: function () {

		if (gui.isMobile)
			return;
		
		gui.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		gui.setIntroHeight();
		
		// There's a bug in Safari where the grid isn't properly laid out after
		// a window resize. For now this workaround will suffice.
		if (gui.isSafari) {
			clearTimeout(gui.masonryResizeTimeout);
			gui.masonryResizeTimeout = setTimeout(grid.initMasonry, 500);
		}

	},

	setIntroHeight: function () {

		var containerElem = $('#intro');
		var textElem = $('#intro .text');
		var arrowElem = $('#intro .arrow');

		var textOffset = gui.viewportHeight / 2 - textElem.innerHeight() / 2;
		var textBottomOffset = gui.viewportHeight / 2 + textElem.innerHeight() / 2;
		var arrowOffset = gui.viewportHeight - arrowElem.innerHeight() - gui.introArrowOffset;

		if (arrowOffset < textBottomOffset)
			arrowOffset = textBottomOffset;

		containerElem.innerHeight(gui.viewportHeight + gui.introHeightExtra);
		textElem.css('top', textOffset + 'px');
		arrowElem.css('top', arrowOffset + 'px');

	},

	initParticles: function () {

		// No particles for mobile, since it's a real battery drainer
		if (!gui.isMobile)
			particlesJS.load('intro', 'particles.json');

	},

	setAnimationWaypoints: function () {

		if (gui.isMobile) {
			$('.animate').css('opacity', 1);
			return;
		}

		$('.animate').each(function (index) {

			if ($(this).hasClass('always') || $(this).offset().top > gui.viewportBottomPosition) {

				$(this).waypoint(function (direction) {
					var animationType = $(this.element).data('animation');
					$(this.element).addClass('animate ' + animationType);
				}, {
					offset: '80%'
				});

			} else {
				$(this).css('opacity', 1);
			}

		});

	},

	checkHash: function () {

		var hash = window.location.hash;

		if (hash.substr(0, 1) === '#') {

			var target = $(hash);

			$('html, body').animate({
				scrollTop: target.offset().top - gui.scrollToOffset
			}, 700);

		}

	},

	toggleCategory: function () {

		$(this).toggleClass('inactive');
		work.includeCategories[$(this).data('category')] = !work.includeCategories[$(this).data('category')];
		grid.init();

	},

	scrollTo: function (event) {

		var target = $($(this).attr('href'));

		if (target.length) {

			event.preventDefault();
			
			// Let's hide the project modal if it's visible
			modal.hide();

			$('html, body').animate({
				scrollTop: target.offset().top - gui.scrollToOffset
			}, 700);

		}

	},
	
	preloadImages: function (images) {
		
		$(images).each(function(){
			$('<img/>')[0].src = this;
		});
		
	}

};

var grid = {

	masonryObject: null,
	masonryCallback: null,

	init: function () {

		work.getData(grid.addElements);

	},

	addElements: function () {

		$('#work-grid').empty();
		$('#work-grid').append($('<div/>').addClass('grid-sizer'));

		$.each(work.data, function (index, project) {

			var elem = $('<div/>').addClass('grid-item').addClass(project.style).addClass(project.color).data('project-id', index);
			var content = $('<div/>').addClass('grid-item-content').appendTo(elem);
			var image = $('<img/>').attr('src', project.preview).appendTo(content);
			var overlay = $('<div/>').addClass('overlay').appendTo(content);
			var title = $('<div/>').addClass('title').text(project.title).appendTo(overlay);
			var description = $('<div/>').addClass('description').text(project.introduction).appendTo(overlay);
			var divider = $('<div/>').addClass('divider').appendTo(overlay);
			
			$('#work-grid').append(elem);

		});

		grid.initMasonry();

	},

	initMasonry: function () {

		// Destroy previous masonry instance
		if (grid.masonryObject) {
			grid.masonryObject.masonry('destroy');
			grid.masonryObject = null;
		}
		
		grid.masonryObject = $('#work-grid').imagesLoaded(function () {

			$('#work-spinner').addClass('hidden');
			
			grid.masonryObject.masonry({
				itemSelector: '.grid-item',
				columnWidth: '.grid-sizer',
				percentPosition: true
			});

			grid.masonryObject.on('click', '.grid-item', grid.clickItem);

			grid.setAnimationWaypoints();

			if (grid.masonryCallback)
				grid.masonryCallback();

		});

	},

	clickItem: function () {

		var projectId = $(this).data('project-id');

		modal.load(work.data[projectId]);
		modal.show();

	},

	setAnimationWaypoints: function () {

		if (gui.isMobile) {
			$('.grid-item-content').css('opacity', 1);
			return;
		}

		$('.grid-item-content').waypoint(function (direction) {
			$(this.element).addClass('animate fadeInUpSmall');
		}, {
			offset: '95%'
		});

	}

};

var modal = {

	carouselTimeout: null,
	carouselImages: [],
	carouselIndex: 0,
	carouselDelay: 7500,
	detailColor: '',
	
	load: function (project) {
		
		modal.detailColor = project.color;
		
		$('#project-title').text(project.title);
		$('#project-introduction').text(project.introduction);
		$('#project-description').html(project.description);
		$('#project-info').empty();
		$('#project-cover').empty();
		$('#project-images').empty();
		
		if (project.info) {
		
			for (var key in project.info) {
				
				var infoKey = key;
				var infoValue = project.info[key];
				
				switch (key) {
					case 'for':
						infoKey = 'For';
						break;
					case 'at':
						infoKey = 'At';
						break;
					case 'role':
						infoKey = 'Role';
						break;
					case 'with':
						infoKey = 'With';
						break;
					case 'link':
						infoKey = 'Live link';
						infoValue = $('<a/>').text(project.info[key]).attr('href', project.info[key]).attr('target', '_blank');
						break;
					case 'download':
						infoKey = 'Download';
						infoValue = $('<a/>').text(project.info[key].name).attr('href', project.info[key].path).attr('target', '_blank');
						break;
				}
				
				var li = $('<li/>').text(infoKey + ': ');
				var span = $('<span/>').append(infoValue).addClass('info').appendTo(li);
				
				$('#project-info').append(li);
			}
			
		}
		
		if (project.cover) {
			
			var nav = $('<ul/>').addClass('nav');
			
			for (var i = 0; i < project.cover.length; i++) {
				
				var image = $('<div/>').attr('id', 'image-' + i).addClass('image').css('background-image', 'url(' + project.cover[i] + ')');
				
				// Only create navigation if there's more than one image
				if (project.cover.length > 1)
					var navLink = $('<li/>').attr('id', 'nav-' + i).data('image-index', i).click(modal.goToImage).appendTo(nav);
				
				$('#project-cover').append(image);
				
			}
			
			$('#project-cover').append(nav);

			modal.carouselIndex = 0;
			modal.carouselImages = project.cover;
			modal.stopCarousel();
			modal.startCarousel();
		
		}
		
		if (project.images) {
			
			for (var i = 0; i < project.images.length; i++) {
				
				var image = $('<img/>').attr('src', project.images[i]);
				
				$('#project-images').append(image);
				
			}
			
			modal.setAnimationWaypoints();
		
		}
		
	},

	show: function () {

		$('body').removeClass('red purple blue').addClass(modal.detailColor).addClass('show-modal');
		$('#project .content').css('opacity', 1);
		$('#project').fadeIn();
		
		if (!gui.isMobile) {
			$('#project .flex').addClass('animate fadeInUpSmall');
		}
		
	},

	hide: function () {
		
		$('body').removeClass('show-modal');
		$('#project .content').css('opacity', 0);
		$('#project').scrollTop(0).fadeOut();
		
		modal.stopCarousel();

	},
	
	startCarousel: function (stop) {
		
		modal.showImage(modal.carouselIndex);
		
		modal.carouselIndex++;
		
		if (stop) return;
		
		// Trigger stop after one loop
		if (modal.carouselIndex >= modal.carouselImages.length) {
			
			modal.carouselIndex = 0;
			
			modal.carouselTimeout = setTimeout(function() {
				modal.startCarousel(true);
			}, modal.carouselDelay);
			
		}
		else {
			
			modal.carouselTimeout = setTimeout(function() {
				modal.startCarousel(false);
			}, modal.carouselDelay);
			
		}

	},
	
	stopCarousel: function () {
		
		clearTimeout(modal.carouselTimeout);
		
	},
	
	goToImage: function () {
		
		modal.stopCarousel();
		modal.showImage($(this).data('image-index'));
		
	},
	
	showImage: function (index) {
		
		$('#project-cover .image:not(#image-' + index + ')').removeClass('active');
		$('#project-cover #image-' + index).addClass('active');
		
		$('#project-cover .nav li:not(#nav-' + index + ')').removeClass('active');
		$('#project-cover #nav-' + index).addClass('active');
		
	},

	setAnimationWaypoints: function () {
		
		if (gui.isMobile) {
			$('#project-images img').css('opacity', 1);
			return;
		}

		$('#project-images').imagesLoaded(function () {
		
			$('#project-images img').waypoint(function (direction) {
				$(this.element).addClass('animate fadeInUpSmall');
			}, {
				offset: '95%',
				context: '#project'
			});
			
		});

	}

};

var work = {

	data: [],
	includeCategories: {
		'1': true,
		'2': true,
		'3': true
	},

	getData: function (callback) {

		$.getJSON('work.json', function (data) {

			work.data = [];

			// Filter on category
			$.each(data, function (index, project) {
				
				for (var i = 0; i < project.category.length; i++) {
					
					if (work.includeCategories[project.category[i]]) {
						work.data.push(project);
						break;
					}
					
				}
				
			});

			callback();

		});

	}

};

$(document).ready(gui.init);
$(document).keyup(gui.keyUp);
$(window).resize(gui.resize);
$(window).scroll(gui.scroll);