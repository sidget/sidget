;
if(!console) { console = { debug: function () {} }; }
if(!console.debug) { console.log("debug message1"); console.debug = console.log; }
if(!console.dir) { console.log("debug message2"); console.dir = console.debug; }

(function ($) { 
	  
	$.sidget = $.sidget || {};
	$.sidgetmap = $.sidgetmap || {}; 
	$.extend($.sidget , { 
		
		useDebug : true,
		debug : function () {
			if(this.useDebug) {
				for(var argu in arguments) { 
					if($.isPlainObject(arguments[argu])) {
						console.dir(arguments[argu]);
					}
					else {
						console.log(arguments[argu]);
					}
				}
			}
		} ,
		_isnull : function (val) {
			if(typeof val == "undefined") {
				return true;
			}
			return false;
		},
		IdGen : function (id) {
			if(!$.sidgetmap[id])
			{
				$.sidgetmap[id] = 0;
			}
			$.sidgetmap[id] += 1;
			return $.sidgetmap[id];
		},	 
		arrayManager: function (data,type) {
			type = type || "object";
			
			if(!data) { return [];}
			
			if($.isArray(data)) {
				return data;
			}else if($.isPlainObject(data)) { 
				if(type == "text") {
					this.debug("Un Support Type : " + data + "[" + typeof(data) +"]" +  arguments.callee.caller.name);
					return [];
				}
				else {
					return [data];	
				}
			}
			else {
				if(type == "text") {
					if(!data) {
						return [data];
					}
					else {
						return [];
					}
				}
				else {
					this.debug("Un Support Type : " + data + "[" + typeof(data) +"] " + arguments.callee.caller.name);
					return [];	
				}
			}
		},
		addChildDiv 	: 	function (el) {
			var newDiv = document.createElement("DIV");
			el.append(newDiv);
			return $(newDiv);
		} ,
		valTypeMap : {
			"INPUT":1,
			"SELECT":1,
			"OPTION":1
		}
	});

})(jQuery);