(function($) {"use strict";

	$.fn.ctPreloader = function(callback) {
		$(this).each(function() {
			var $el = $(this);
			if(!$el.prev('.preloader').length) {
				$('<div class="preloader">').insertBefore($el);
			}
			$el.data('ctPreloader', $('img, iframe', $el).add($el.filter('img, iframe')).length);
			if($el.data('ctPreloader') == 0) {
				$el.prev('.preloader').remove();
				callback();
				$el.trigger('ct-preloader-loaded');
				return;
			}
			$('img, iframe', $el).add($el.filter('img, iframe')).each(function() {
				var $obj = $('<img>');
				if($(this).prop('tagName').toLowerCase() == 'iframe') {
					$obj = $(this);
				}
				$obj.attr('src', $(this).attr('src'));
				$obj.on('load error', function() {
					$el.data('ctPreloader', $el.data('ctPreloader')-1);
					if($el.data('ctPreloader') == 0) {
						$el.prev('.preloader').remove();
						callback();
						$el.trigger('ct-preloader-loaded');
					}
				});
			});
		});
	}
})(jQuery);

(function($) {"use strict";

	var oWidth=$.fn.width;
	$.fn.width=function(argument) {
		if (arguments.length==0 && this.length==1 && this[0]===window) {
			if (window.ctOptions.innerWidth != -1) {
				return window.ctOptions.innerWidth;
			}
			var width = oWidth.apply(this,arguments);
			window.updateCTInnerSize(width);
			return width;
		}

		return oWidth.apply(this,arguments);
	};

	var $page = $('#page');

	$(window).load(function() {
		var $preloader = $('#page-preloader');
		if ($preloader.length && !$preloader.hasClass('preloader-loaded')) {
			$preloader.addClass('preloader-loaded');
		}
	});

	$('#site-header.animated-header').headerAnimation();

	if (!window.ctSettings.lasyDisabled) {
		$('.wpb_text_column.wpb_animate_when_almost_visible.wpb_fade').each(function() {
			$(this).wrap('<div class="lazy-loading"></div>').addClass('lazy-loading-item').data('ll-effect', 'fading');
		});

		$('.ct-list.lazy-loading').each(function() {
			$(this).data('ll-item-delay', '200');
			$('li', this).addClass('lazy-loading-item').data('ll-effect', 'slide-right');
		});

		$.lazyLoading();
	}

	$.fn.updateTabs = function() {

		jQuery('.ct-tabs', this).each(function(index) {
			var $tabs = $(this);
			$tabs.ctPreloader(function() {
				$tabs.easyResponsiveTabs({
					type: 'default',
					width: 'auto',
					fit: false,
					activate: function(currentTab, e) {
						var $tab = $(currentTab.target);
						var controls = $tab.attr('aria-controls');
						$tab.closest('.ui-tabs').find('.ct_tab[aria-labelledby="' + controls + '"]').trigger('tab-update');
					}
				});
			});
		});

		jQuery('.ct-tour', this).each(function(index) {
			var $tabs = $(this);
			$tabs.ctPreloader(function() {
				$tabs.easyResponsiveTabs({
					type: 'vertical',
					width: 'auto',
					fit: false,
					activate: function(currentTab, e) {
						var $tab = $(currentTab.target);
						var controls = $tab.attr('aria-controls');
						$tab.closest('.ui-tabs').find('.ct_tab[aria-labelledby="' + controls + '"]').trigger('tab-update');
					}
				});
			});
		});

	};

	function fullwidth_block_after_update($item) {
		$item.trigger('updateTestimonialsCarousel');
		$item.trigger('updateClientsCarousel');
		$item.trigger('fullwidthUpdate');
		$('.marker-wave svg', $item).hide();
		setTimeout(function() {
			$('.marker-wave svg', $item).show();
		}, 50);
	}

	function fullwidth_block_update($item, pageOffset, pagePaddingLeft, pageWidth,skipTrigger) {
	    var $prevElement = $item.prev(),
			extra_padding = 0;
	    if ($prevElement.length == 0 || $prevElement.hasClass('fullwidth-block')) {
	        $prevElement = $item.parent();
			extra_padding = parseInt($prevElement.css('padding-left'));
	    }

	    var offsetKey = window.ctSettings.isRTL ? 'right' : 'left';
	    var cssData = {
	        width: pageWidth
	    };
	    cssData[offsetKey] = pageOffset.left - ($prevElement.length ? $prevElement.offset().left : 0) + parseInt(pagePaddingLeft) - extra_padding;

	    $item.css(cssData);

	    if (!skipTrigger) {
	        fullwidth_block_after_update($item);
	    }
	}

	var inlineFullwidths = [],
		notInlineFullwidths = [];

	$('.fullwidth-block').each(function() {
		var $item = $(this),
			$parents = $item.parents('.vc_row'),
			fullw = {
				isInline: false
			};

		$parents.each(function() {
			if (this.hasAttribute('data-vc-full-width')) {
				fullw.isInline = true;
				return false;
				}
		});

		if (fullw.isInline) {
			inlineFullwidths.push(this);
		} else {
			notInlineFullwidths.push(this);
			}
		});

	function update_fullwidths(inline, init) {
		var $needUpdate = [];

		(inline ? inlineFullwidths : notInlineFullwidths).forEach(function(item) {
			$needUpdate.push(item);
		});

		if ($needUpdate.length > 0) {
			var pageOffset = $page.offset(),
				pagePaddingLeft = $page.css('padding-left'),
				pageWidth = $page.width();

			$needUpdate.forEach(function(item) {
				fullwidth_block_update($(item), pageOffset, pagePaddingLeft, pageWidth);
				});
		}
	}

	if (!window.disableCTSlideshowPreloaderHandle) {
		jQuery('.ct-slideshow').each(function() {
			var $slideshow = $(this);
			$slideshow.ctPreloader(function() {});
		});
	}

	$(function() {
		$('#ct-icons-loading-hide').remove();
		$('#ct-preloader-inline-css').remove();

		jQuery('iframe').not('.ct-video-background iframe').each(function() {
			$(this).ctPreloader(function() {});
		});

		jQuery('.ct-video-background').each(function() {
			var $videoBG = $(this);
			var $videoContainer = $('.ct-video-background-inner', this);
			var ratio = $videoBG.data('aspect-ratio') ? $videoBG.data('aspect-ratio') : '16:9';
			var regexp = /(\d+):(\d+)/;
			var $fullwidth = $videoBG.closest('.fullwidth-block');
			ratio = regexp.exec(ratio);
			if(!ratio || parseInt(ratio[1]) == 0 || parseInt(ratio[2]) == 0) {
				ratio = 16/9;
			} else {
				ratio = parseInt(ratio[1])/parseInt(ratio[2]);
			}

			function ctVideoUpdate()  {
				$videoContainer.removeAttr('style');
				if($videoContainer.width() / $videoContainer.height() > ratio) {
					$videoContainer.css({
						height: ($videoContainer.width() / ratio) + 'px',
						marginTop: -($videoContainer.width() / ratio - $videoBG.height()) / 2 + 'px'
					});
				} else {
					$videoContainer.css({
						width: ($videoContainer.height() * ratio) + 'px',
						marginLeft: -($videoContainer.height() * ratio - $videoBG.width()) / 2 + 'px'
					});
				}
			}

			if ($videoBG.closest('.page-title-block').length > 0) {
				ctVideoUpdate();
			}

			if ($fullwidth.length) {
				$fullwidth.on('fullwidthUpdate', ctVideoUpdate);
			} else {
				$(window).resize(ctVideoUpdate);
				}
			});

		update_fullwidths(false, true);

		if (!window.ctSettings.parallaxDisabled) {
			$('.fullwidth-block').each(function() {
				var $item = $(this),
					mobile_enabled = $item.data('mobile-parallax-enable') || '0';

				if (!window.ctSettings.isTouch || mobile_enabled == '1') {
					if ($item.hasClass('fullwidth-block-parallax-vertical')) {
						$('.fullwidth-block-background', $item).parallaxVertical('50%');
					} else if ($item.hasClass('fullwidth-block-parallax-horizontal')) {
						$('.fullwidth-block-background', $item).parallaxHorizontal();
					}
				} else {
					$('.fullwidth-block-background', $item).css({
						backgroundAttachment: 'scroll'
					});
				}
			});
		}

		$(window).resize(function() {
			update_fullwidths(false, false);
		});

		jQuery('select.ct-combobox, .ct-combobox select, .widget_archive select, .widget_product_categories select, .widget_layered_nav select, .widget_categories select').each(function(index) {
			$(this).combobox();
		});

		jQuery('input.ct-checkbox, .ct-checkbox input').checkbox();

		if (typeof($.fn.ReStable) == "function") {
			jQuery('.ct-table-responsive').each(function(index) {
				$('> table', this).ReStable({
					maxWidth: 768,
					rowHeaders : $(this).hasClass('row-headers')
				});
			});
		}

		jQuery('.fancybox').each(function() {
			$(this).fancybox();
		});

		function init_odometer(el) {
			if (jQuery('.ct-counter-odometer', el).size() == 0)
				return;
			var odometer = jQuery('.ct-counter-odometer', el).get(0);
			var format = jQuery(el).closest('.ct-counter-box').data('number-format');
			format = format ? format : '(ddd).ddd';
			var od = new Odometer({
				el: odometer,
				value: $(odometer).text(),
				format: format
			});
			od.update($(odometer).data('to'));
		}
		window['ct_init_odometer'] = init_odometer;

		jQuery('.ct-counter').each(function(index) {
			if (jQuery(this).closest('.ct-counter-box').size() > 0 && jQuery(this).closest('.ct-counter-box').hasClass('lazy-loading') && !window.ctSettings.lasyDisabled) {
				jQuery(this).addClass('lazy-loading-item').data('ll-effect', 'action').data('item-delay', '0').data('ll-action-func', 'ct_init_odometer');
				jQuery('.ct-icon', this).addClass('lazy-loading-item').data('ll-effect', 'fading').data('item-delay', '0');
				jQuery('.ct-counter-text', this).addClass('lazy-loading-item').data('ll-effect', 'fading').data('item-delay', '0');
				return;
			}
			init_odometer(this);
		});

		jQuery('.panel-sidebar-sticky > .sidebar').scSticky();

		jQuery('iframe + .map-locker').each(function() {
			var $locker = $(this);
			$locker.click(function(e) {
				e.preventDefault();
				if($locker.hasClass('disabled')) {
					$locker.prev('iframe').css({ 'pointer-events' : 'none' });
				} else {
					$locker.prev('iframe').css({ 'pointer-events' : 'auto' });
				}
				$locker.toggleClass('disabled');
			});
		});

		$('.primary-navigation a, .footer-navigation a, .scroll-top-button, .scroll-to-anchor, .scroll-to-anchor a, .top-area-menu a').each(function() {
			var $anhor = $(this);
			var link = $anhor.attr('href');
			if(!link) return ;
			link = link.split('#');
			if($('#'+link[1]).length) {
				$anhor.closest('li').removeClass('menu-item-active current-menu-item');
				$anhor.closest('li').parents('li').removeClass('menu-item-current');
				$(window).scroll(function() {
					if(!$anhor.closest('li.menu-item').length) return ;
					var correction = 0;
					if(!$('#page').hasClass('vertical-header')) {
						correction = $('#site-header').outerHeight() + $('#site-header').position().top;
					}
					var target_top = $('#'+link[1]).offset().top - correction;
					if(getScrollY() >= target_top && getScrollY() <= target_top + $('#'+link[1]).outerHeight()) {
						$anhor.closest('li').addClass('menu-item-active');
						$anhor.closest('li').parents('li').addClass('menu-item-current');
					} else {
						$anhor.closest('li').removeClass('menu-item-active');
						$anhor.closest('li').parents('li.menu-item-current').each(function() {
							if(!$('.menu-item-active', this).length) {
								$(this).removeClass('menu-item-current');
							}
						});
					}
				});
				$anhor.click(function(e) {
					e.preventDefault();
					var correction = 0;
					if($('#site-header.animated-header').length) {
						var shrink = $('#site-header').hasClass('shrink');
						$('#site-header').addClass('scroll-counting');
						$('#site-header').addClass('fixed shrink');
						correction = $('#site-header').outerHeight() + $('#site-header').position().top;
						if(!shrink && $('#top-area').length && !$('#site-header').find('#top-area').length) {
							correction = correction - $('#top-area').outerHeight();
						}
						if(!shrink) {
							$('#site-header').removeClass('fixed shrink');
						}
						setTimeout(function() {
							$('#site-header').removeClass('scroll-counting');
						}, 50);
					}
					var target_top = $('#'+link[1]).offset().top - correction + 1;
					$('html, body').stop(true, true).animate({scrollTop:target_top}, 1500, 'easeInOutQuint');
				});
			}
			$(window).load(function() {
				if(window.location.href == $anhor.attr('href')) {
					$anhor.click();
				}
			});
		});

		$('body').on('click', '.post-footer-sharing .ct-button', function(e) {
			e.preventDefault();
			$(this).closest('.post-footer-sharing').find('.sharing-popup').toggleClass('active');
		});

		$(window).scroll(function() {
			if(getScrollY() > 0) {
				$('.scroll-top-button').addClass('visible');
			} else {
				$('.scroll-top-button').removeClass('visible');
			}
		}).scroll();

		function getScrollY(elem){
			return window.pageYOffset || document.documentElement.scrollTop;
		}

		$('a.hidden-email').each(function() {
			$(this).attr('href', 'mailto:'+$(this).data('name')+'@'+$(this).data('domain'));
		});

		$('#colophon .footer-widget-area').ctPreloader(function() {
			$('#colophon .footer-widget-area').isotope({
				itemSelector: '.widget',
				layoutMode: 'masonry'
			});
		});

		$('body').updateTabs();
	});

	$(document).on('show.vc.accordion', '[data-vc-accordion]', function() {
		var $target = $(this).data('vc.accordion').getContainer();
		var correction = 0;
		if($target.find('.vc_tta-tabs').length && !$(this).is(':visible')) return ;
		if($('#site-header.animated-header').length && $('#site-header').hasClass('fixed')) {
			var shrink = $('#site-header').hasClass('shrink');
			$('#site-header').addClass('scroll-counting');
			$('#site-header').addClass('fixed shrink');
			correction = $('#site-header').outerHeight() + $('#site-header').position().top;
			if(!shrink) {
				$('#site-header').removeClass('fixed shrink');
			}
			$('#site-header').removeClass('scroll-counting');
		}
		var target_top = $target.offset().top - correction - 100 + 1;
		$('html, body').stop(true, true).animate({scrollTop:target_top}, 500, 'easeInOutQuint');
	});

	var vc_update_fullwidth_init = true;
	$(document).on('vc-full-width-row', function(e) {
		if (window.ctOptions.clientWidth - $page.width() > 25 || window.ctSettings.isRTL) {
			for (var i = 1; i < arguments.length; i++) {
				var $el = $(arguments[i]);
				$el.addClass("vc_hidden");
				var $el_full = $el.next(".vc_row-full-width");
				$el_full.length || ($el_full = $el.parent().next(".vc_row-full-width"));
				var el_margin_left = parseInt($el.css("margin-left"), 10),
					el_margin_right = parseInt($el.css("margin-right"), 10),
					offset = 0 - $el_full.offset().left - el_margin_left + $('#page').offset().left + parseInt($('#page').css('padding-left')),
					width = $('#page').width();

				var offsetKey = window.ctSettings.isRTL ? 'right' : 'left';
				var cssData = {
					position: "relative",
					left: offset,
					"box-sizing": "border-box",
					width: $("#page").width()
				};
				cssData[offsetKey] = offset;

				if ($el.css(cssData), !$el.data("vcStretchContent")) {
					var padding = -1 * offset;
					0 > padding && (padding = 0);
					var paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right;
					0 > paddingRight && (paddingRight = 0), $el.css({
						"padding-left": padding + "px",
						"padding-right": paddingRight + "px"
					})
				}
				$el.attr("data-vc-full-width-init", "true"), $el.removeClass("vc_hidden");
			}
		}
		update_fullwidths(true, vc_update_fullwidth_init);
		vc_update_fullwidth_init = false;
	});

})(jQuery);

(function($) {"use strict";
		$('.menu-item-search a').on('click', function(e){
			e.preventDefault();
			$('.menu-item-search').toggleClass('active');
		});
})(jQuery);
