// ==UserScript==
// @name            Fluid Twitter
// @namespace       http://brionesandco.com/ryabriones
// @description     Streamline the Twitter interface to be nicer in a Fluid Instance
// @include         http://twitter.tld/*
// @version         0.1
// @author          Ryan Carmelo Briones
// @homepage        http://brionesandco.com/ryabriones
// ==/UserScript==

Element.addMethods({
	markRead: function(element) {
		element.setStyle({
			opacity: '.75',
			background: '#eee'
		})
	}
});

var FluidTwitter = Class.create({
	update_interval: 120000,
	initialize: function() {
		this.trimUI();
		this.allRead();
		this.dockMenuItems();
		
		setTimeout(this.refreshTwitter.bind(this), this.update_interval);
	},
	
	trimUI: function() {
	  // hide some unneccessary parts of the UI
	  $('side', 'footer', 'navigation').invoke('hide');

    // hide some more by overlaying the content
    $('content').setStyle({ position: 'absolute', top: '-20px', left: '0' });
	  
	  // alter divs to stretch with the viewport
	  $('container', 'content').invoke('setStyle', {width: '100%'});
	  $('status').setStyle({width: '90%'});

    // alter "What are you doing?" h3 to allow thin viewport
		$$('.bar').first().down('h3').down('label').setStyle({padding: 0});
	  
	  // remove user photos
    $$('td.thumb').invoke('remove');
	  
		$('header').down('img').setStyle({paddingLeft: '10px'});
	},

	allRead: function() {
		var history = $$('#timeline tr[id^=status]');

		var last_read = $('status_'+window.location.href.split('#l').last());
		if (!last_read) last_read = history.last();

		var newest = history.first().id.sub(/status_/,'');
		var unread = last_read.previousSiblings();
	
		last_read.nextSiblings().concat(last_read).invoke('markRead');
		
		if (unread.size() > 0) {
			var link = new Element('a', { href: '#l'+newest, accesskey: 'a' }).update('mark <u>a</u>ll read');
			link.observe('click', function() {
				history.invoke('markRead')
				fluid.setDockBadge("");
				this.hide();
			});
			link.setStyle({
					border: '1px solid #ccc', display: 'block', float: 'right',
					'font-size': '10px', 'margin-top': '-21px', padding: '2px 6px'
			});
			$('timeline').insert({ before: link } );
	
			fluid.setDockBadge((unread.size() || "").toString());

			var from = unread.last().down('strong').down('a').getAttribute('title');
			var tweet = unread.last().down('span').innerHTML.strip().stripTags();

			if (unread.size() > 1) {
				tweet += "\n("+ (unread.size()-1) +" more tweets)"
			}
			
			fluid.showGrowlNotification({
				title: from,
				description: tweet,
				priority: 3,
				sticky: false,
				onclick: window.fluid.activate
			});

		}
	},	
	
	dockMenuItems: function() {
		window.fluid.addDockMenuItem("Settings", function() { window.location.href = '/account/settings' })
	},
	
	refreshTwitter: function() {
	  // don't refresh if i'm scrolling
		if($$('.wrapper').first().cumulativeScrollOffset()[1] > 90) 
		  return setTimeout(this.refreshTwitter.bind(this), this.update_interval);
		
		// don't refresh if i'm typing either
		if($F('status') != '')
		  return setTimeout(this.refreshTwitter.bind(this), this.update_interval);
    
		window.location.reload();
	}
});

(function() {
  document.fluid_twitter = new FluidTwitter();
})();