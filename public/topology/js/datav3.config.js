var datav_config = {
	server_url: '/topology/',
	init: function(){
		this.ajax_images_url = this.getUrl('images/');
		this.ajax_data_url = this.getUrl('data/');
	},
	getUrl: function(url) {
		return this.server_url+url;
	},
	t1_ajax_url:'/',//探路
	t1_ajax_url:'/tanlu/',//探路
	t1_socket_url:'/',//探路
	bt_ajax_url: '/bt/control/',//bt	
	// twitter_bg_ajax_url:'//103.242.109.55:5000/',//twitter后台
	twitter_bg_ajax_url:'/',//twitter后台
	images_url:'images/',
	twitter_photo:'images/twitterhead',	
	twitter_pics:'images/twitterhead/media/',
	// mapboxUrl_url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' // 在线地图 
	mapboxUrl_url: '/map_tile/{z}/{x}/{y}.png'
};

datav_config.init();