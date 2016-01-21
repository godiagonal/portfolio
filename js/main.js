var gui = {

	isMobile: false,
	viewportHeight: 0,
	viewportPosition: 0,
	viewportBottomPosition: 0,
	headerScrollOffset: 100,
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
		$('a[href^="#"]').click(gui.scrollTo);
		
	},

	scroll: function () {

		if ($(document).scrollTop() > gui.headerScrollOffset)
			$('#header').addClass('scroll');
		else
			$('#header').removeClass('scroll');

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

			var elem = $('<div/>').addClass('grid-item').addClass(project.style);
			var content = $('<div/>').addClass('grid-item-content').appendTo(elem);
			var image = $('<img/>').attr('src', project.image).appendTo(content);
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

			grid.masonryObject.on('click', '.grid-item', function () {
				// open project details
			});

			grid.setAnimationWaypoints();
			
			if (grid.masonryCallback)
				grid.masonryCallback();

		});

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

document.addEventListener('DOMContentLoaded', gui.init);
$(window).resize(gui.resize);
$(window).scroll(gui.scroll);