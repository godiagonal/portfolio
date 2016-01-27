var gui = {

	isMobile: false,
	viewportHeight: 0,
	viewportPosition: 0,
	viewportBottomPosition: 0,
	headerScrollOffset: 100,
	arrowScrollOffset: 200,
	introHeightExtra: 200,
	introArrowOffset: 70,
	scrollToOffset: 100,

	init: function () {

		gui.isMobile = bowser.mobile;
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
		
	},

	keyUp: function (e) {
		
		if (e.keyCode === 27) // esc
			modal.hide();
		
	},

	scroll: function () {

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

		gui.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		gui.setIntroHeight();

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

			var elem = $('<div/>').addClass('grid-item').addClass(project.style).data('project-id', index);
			var content = $('<div/>').addClass('grid-item-content').appendTo(elem);
			var image = $('<img/>').attr('src', project.images[0]).appendTo(content);
			var overlay = $('<div/>').addClass('overlay').addClass(work.categoryToColor(project.category)).appendTo(content);
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
		
		modal.detailColor = work.categoryToColor(project.category);
		
		$('#project-title').text(project.title);
		$('#project-introduction').text(project.introduction);
		$('#project-description').html(project.description);
		$('#project-info').empty();
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
				}
				
				var li = $('<li/>').text(infoKey + ': ');
				var span = $('<span/>').append(infoValue).addClass('info').appendTo(li);
				
				$('#project-info').append(li);
			}
			
		}
		
		if (project.images) {
			
			var nav = $('<ul/>').addClass('nav');
			
			for (var i = 0; i < project.images.length; i++) {
				
				var image = $('<div/>').attr('id', 'image-' + i).addClass('image').css('background-image', 'url(' + project.images[i] + ')');
				
				// Only create navigation if there's more than one image
				if (project.images.length > 1)
					var navLink = $('<li/>').attr('id', 'nav-' + i).data('image-index', i).click(modal.goToImage).appendTo(nav);
				
				$('#project-images').append(image);
				
			}
			
			$('#project-images').append(nav);

			modal.carouselIndex = 0;
			modal.carouselImages = project.images;
			modal.stopCarousel();
			modal.startCarousel();
		
		}
		
	},

	show: function () {
		
		$('body').removeClass(function () {

			var classes = '';

			for (var key in work.includeCategories) {
				classes += work.categoryToColor(key) + ' ';
			}

			return classes;

		}).addClass(modal.detailColor).addClass('show-modal');

		$('#project').fadeIn();
		
		if (!gui.isMobile) {
			$('#project .flex').addClass('animate fadeIn');
			$('#project-title').addClass('animate fadeInUpSmall');
			$('#project-introduction').addClass('animate fadeInUp');
		}
		
	},

	hide: function () {

		$('body').removeClass('show-modal');
		$('#project').fadeOut();
		
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
		
		$('#project-images .image:not(#image-' + index + ')').removeClass('active');
		$('#project-images #image-' + index).addClass('active');
		
		$('#project-images .nav li:not(#nav-' + index + ')').removeClass('active');
		$('#project-images #nav-' + index).addClass('active');
		
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
				
				if (work.includeCategories[project.category])
					work.data.push(project);
				
			});

			callback();

		});

	},

	categoryToColor: function (category) {

		var color;

		switch (category) {
		case '1':
			color = 'red';
			break;
		case '2':
			color = 'purple';
			break;
		case '3':
			color = 'blue';
			break;
		}

		return color;

	}

};

$(document).ready(gui.init);
$(document).keyup(gui.keyUp);
$(window).resize(gui.resize);
$(window).scroll(gui.scroll);