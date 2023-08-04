var loading ={
	configure:{
	   show: true,
	   contaniner: null
	},
	set: function(options){
       this.configure.show = options.show;
       this.configure.contaniner = options.contaniner;
	},
	start:function(){  
	   var container = this.configure.container || $('body');  
        if(this.configure.show){
        	if(!$('.loading').get(0)){
        		if(!$('#loadingContainer').get(0)){
        			container.append('<div class = "loadingContainer" id="loadingContainer"><div></div></div>');
        		}else{
        			$('#loadingContainer').css({display: 'block'});
        		}
        	}
        }        
	},

	done: function(){
		if(this.configure.show){
			$('#loadingContainer').css({display: 'none'});
		}		
	},
}

// $(document).ajaxStart(function(){
//     loading.start()
// })
// $(document).ajaxStop(function(){
// 	loading.done()
// })