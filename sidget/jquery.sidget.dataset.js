
;
if(!console) { console = { debug: function () {} }; }
if(!console.debug) { console.log("debug message1"); console.debug = console.log; }
if(!console.dir) { console.log("debug message2"); console.dir = console.debug; }

(function ($) { 
	  // SIDGET
	$.sidget = $.sidget || {};
	$.sidget.DS = $.sidget.DS || {};
	
	if(!$.isFunction($.fn.slink))
	{
		$.fn.slink = function (DS ,colattr) {
			var $t = $(this);
			console.log($t,$t.length);
			$t.each(function () {
				_$obj = $(this);
				var colID = _$obj.attr(colattr);
				if(!colID) {
					return ;
				}
				_$obj.data("_SG_DS",DS);
				if(DS.addlink(_$obj,colID)) {
					_$obj.on( {
						keydown: function(e) { 
							if(DS.rowcount() <= 0) 
							{ 
								return false;
							} 
						},
						change: function (e) {
							var orgVal = DS.celldata(DS.rowpos(),colID);
							if(!_$obj.val) {
								console.log(orgVal ,_$obj.text() );
								DS.celldata(DS.rowpos(),colID,_$obj.text());	
							}
							else {
							console.log(orgVal ,_$obj.val() );
							DS.celldata(DS.rowpos(),colID,_$obj.val());
							}
						}
					});
				}	
			});
			
		};
	}
	
	if(!$.isFunction($.sidget.DS)) {
		/**
		 * 
		 * @param param {
		 * 					name	: "DS_NAME",
		 * 					columns : [{id:"col1",type:"string"},{id:"col2",type:"number"}],
		 * 					data	: data,	[{col1:"AAA",col2:"BBB"},{col1:"AAAA",col2:"BBBB"},{col1:"AAAAA",col2:"BBBBB"}]	
		 * 					dataType: "json","xml","object",
		 * 				}	
		 * @returns {$.sidget.DS}
		 */
		$.sidget.DS = function(option) {
			DEF_COLUMN_INFO = {
				id 		: "",
				type	: "string",
			};
			var t = this; 
			t.param = option || {};
			t._curRow  = NaN;	// 잘 쓰는데.. 계속 안쓴다고함..
			t._singleLinkMap = {};
			t._gridLinkMap = {};
			t._orgColumns = $.sidget.arrayManager(t.param.columns || []);	// LIST	
			t._orgData = [];
			t._columnsArr = {};
			
			/***********************************
			*	생성시의 처리로직
			***********************************/
			t._init();
			console.log("Craete DataSet Arugments" , t.param);
			t.setdata($.sidget.arrayManager(t.param.data || []));
			/***********************************
			*	DEBUG METHOD LIST START
			***********************************/
			showLinkInfo = function () { 
				console.log("this._singleLinkMap" , t._singleLinkMap);
			};
			
			/***********************************
			*	DEBUG METHOD LIST END
			***********************************/
		};
		/**
		 * @param val
		 * @returns {Boolean}
		 */
		$.sidget.DS.prototype._isnull = function (val) {
			if(typeof val == "undefined") {
				return true;
			}
			return false;
		};
		
		/**
		 * @param columns
		 */
		$.sidget.DS.prototype._init = function (columns) {
			var t = this; 
			var idx = 0;
			for(x in t._orgColumns) {
				t._columnsArr[t._orgColumns[x].id] = idx;
				idx++;
			}
		};
		
		/**
		 * @param col String(ID) or Number(INDEX)가능.
		 * @returns undefined(NOT FOUND) or model name
		 */
		$.sidget.DS.prototype._getid = function (col) {
			var t = this; 
			if(this._isnull(col)) {
				prcsError("DATASET[" + t.param.name + "] getColumn Param is NULL[" + col +"]");
				return ;
			}
			
			if(typeof(col) == "number") {
				if(t._orgColumns.length <= col || col < 0) {
					prcsError("DATASET[" + t.param.name + "] OutOf Range[" + arguments[0] +"]");
					return ;
				}
				return this._orgColumns[col].id;
			}else if(typeof(col) == "string") {
				if(t._isnull(t._columnsArr[col])) {
					prcsError("DATASET[" + t.param.name + "] Unknown Column [" + col +"]");
					return ;
				}
				
				return col;
			}
			else {
				prcsError("DATASET[" + t.param.name + "] getColumn Param is NULL[" + col +"]");
				return ;
			}
			
		};
		
		/***
		 * Link 되어있는 Element에 Data를 반영
		 * @param row 적용할 Data Row
		 * @param colId 컬럼 ID 미지정시 RowData 전체 반영.
		 */
		$.sidget.DS.prototype._notify = function (row,colId) {
			var t = this; 
			switch(arguments.length) {
			case 1:
				for(var id in t._columnsArr) 
				{
					if(this._singleLinkMap[id] && t._singleLinkMap[id].length > 0) {
						for(var el in t._singleLinkMap[id]) {
							console.log("NOTI",this._singleLinkMap[id][el]);
							t._singleLinkMap[id][el].val(t._orgData[row][id]);
						}
					}
				}
				break;
			case 2:
				for(var grdid in t._gridLinkMap) {
					console.log("CHECK NOTI : " , grdid, colId, t._gridLinkMap[grdid] , t._gridLinkMap[grdid][colId]);
					var grdObj = t._gridLinkMap[grdid][colId];
					if(grdObj) {
						grdObj.refresh(row,colId);
					}
				}
				if(t._singleLinkMap[colId] && this._singleLinkMap[colId].length > 0) {
					for(var el in this._singleLinkMap[colId]) {
						var tagName = this._singleLinkMap[colId][el].context.tagName;
						if($.sidget.valTypeMap[tagName]) {
							console.log("SINGLE LINK NOTIFY VAL TARGET",tagName,$.sidget.valTypeMap[tagName]);
							this._singleLinkMap[colId][el].val(this._orgData[row][colId]);
						}
						else {
							console.log("SINGLE LINK NOTIFY TEXT TARGET",tagName,$.sidget.valTypeMap[tagName]);
							this._singleLinkMap[colId][el].text(this._orgData[row][colId]);
						}
					}
				}
				break;
			default:
					throw new Error("UnKnown Arguments",arguments);
				break;
			}
		};
		
		$.sidget.DS.prototype.getdata = function () { 
			var t = this; 
			return t._orgData; 
		};
		/***
		 * 
		 */
		$.sidget.DS.prototype.setdata = function (data,type) {
			var t = this; 
			console.log("SET DATA " ,type);
			if(type == "json" || !type ) {
				t._orgData = data;
				if(t._orgData.length > 0) {
					t.rowpos(0);
				}
			}
		};
		
		/***
		 * 
		 * @param row 값을 설정할 Row
		 * @param col 값을 설정할 Column ID or Column Index
		 * @param value	값
		 * @param notidiv "none","notify","force"
		 * @returns
		 */
		$.sidget.DS.prototype.celldata = function (row,col,value,notidiv) {
			var t = this; 
			
			console.log("CELLDATA",arguments);
			
			notidiv = notidiv || "notify";
			
			
			if(row < 0) {
				return ;
			}
			var id = t._getid(col);
			if(t._isnull(id)) {
				return ;
			}
			
			if(arguments.length == 2) { 
				return t._orgData[row][id];
			}
			else {
				// Setter
				// 값이 안바뀐건 CellChagne가 발생할 필요자체가 없다늠..
				if(t._orgData[row][id] === value && !(notidiv === "force")) {
					return ;
				}
				
				var eventRslt = $(t).triggerHandler("precellchange",{oldVal:t._orgData[row][id],newVal:value});
				
				if(eventRslt == false) {
					console.log("PreCellChange ROLLBACK");
					t._notify(row,col);	
					return ;
				}
				
				t._orgData[row][id] = value;
				
				$(t).triggerHandler("postcellchange");
				
				if(!(notidiv === "none")){ 
					t._notify(row,col);	
				}								
			}
		};
		
		$.sidget.DS.prototype.getrowdata = function (row) {
			var t = this; 
			
			if(row < 0) {
				return ;
			}
			
			if(arguments.length == 1) { 
				return t._orgData[row];
			}
		};
		
		$.sidget.DS.prototype.addrow = function () {
			var t = this; 
			var newObj = {};
			var addedRow = t._orgData.length; 
			
			for(var id in t._columnsArr)
			{
				newObj[id] = "";
			}
			var eventRslt = $(t).triggerHandler("prerowchange",{oldRow:t._curRow,newRow:addedRow,oldData:t._orgData[t._curRow],newData:newObj});
			if(eventRslt == false) {
				console.log("PreRowChange ROLLBACK");
				return false;
			}
			t._orgData.push(newObj);
			t._curRow = addedRow;
			$(t).triggerHandler("postrowchange");
			t._notify(t._curRow);
			
			return t._curRow;
		};
		
		/**
		 * @param rowNo Target Row Position
		 * @returns Changed Row or false : change Fail
		 */
		$.sidget.DS.prototype.rowpos = function (rowNo) {
			var t = this; 
			if(arguments.length == 0) {
				return t._curRow;
			}
			else if(typeof(arguments[0]) === "number") {
				if(t._orgData.length < arguments[0] || arguments[0] < 0)
				{
					throw new Error("DATASET[" + param.name + "] OutOf Range[" + arguments[0] +']');
				}
				
				var eventRslt = $(t).triggerHandler("prerowchange",{oldRow:t._curRow,newRow:arguments[0],newData:t._orgData[t._curRow],oldData:t._orgData[arguments[0]]});
				if(eventRslt == false) {
					
					return false;
				}
				t._curRow = arguments[0];
				$(t).triggerHandler("postrowchanged");
				t._notify(t._curRow);
				return t._curRow;
			}
			else {
				throw new Error("DATASET[" + param.name + "] UNKOWN PARAM TYPE[" + typeof(arguments[0]) + "]");
			}
		};
		
		/**
		 * @returns Total Row Count
		 */
		$.sidget.DS.prototype.rowcount = function() {
			var t = this; 
			return t._orgData.length;
		};
		
		/**
		 * @param selector  Element Selector
		 * @param colId		Link Target Col Id
		 * @returns {Boolean} false : link Fail
		 */
		$.sidget.DS.prototype.addlink = function (selector,colId) {
			console.log("Add Link Param",selector,colId);
			var t = this; 
			
			if(1==2) {//selector instanceof $.sidget.grid) {
				t._gridLinkMap[selector] = {};
				console.log("GRID COL ARR : " ,selector.getcolumns(),t._columnsArr);
				var gCols = selector.getcolumns();
				for(var gCol in gCols) {
					var gLink_id = gCols[gCol].link_id;
					console.log("GRID COL LINK " , gCols[gCol].link_id ,t._columnsArr[gLink_id]);
					//0~INTINITE
					if(typeof(t._columnsArr[gLink_id]) === "number") {
						t._gridLinkMap[selector.id][gLink_id] = selector;
					}
				}
				
				console.log("ADD LINK MAP : " ,t._gridLinkMap[selector]);
			}
			else {
				var id = t._getid(colId);
				if(t._isnull(id)) {
					prcsError("Unknown Column AddLinkElement");
					return ;
				}
				
				if(!t._singleLinkMap[id])
				{
					t._singleLinkMap[id] = [];
				}
				
				if($.inArray(selector,t._singleLinkMap[id]) < 0) {
					t._singleLinkMap[id].push(selector);
					if(t._curRow >= 0) {
						console.log(selector.context.tagName,typeof(selector.context))
						
						if($.sidget.valTypeMap[selector.context.tagName]) {
							selector.val(t._orgData[t._curRow][id]);
						}
						else {
							selector.text(t._orgData[t._curRow][id]);
						}
					}
					return true;
				}
				else { // 중복되는건이 있으면 return false
					return false;
				}
			}
		};

		$.sidget.DS.prototype.removelink = function (selector,colId) {
			var t = this; 
			// 일단 그리드일때랑 일반 Component일때랑 분리
			{
				var id = t._getid(colId);
				if(t._isnull(id)) {
					prcsError("Unknown Column AddLinkElement");
					return ;
				}
				
				if(!t._singleLinkMap[id])
				{
					t._singleLinkMap[id] = [];
				}
				
				if($.inArray(selector,t._singleLinkMap[id]) < 0) {
					t._singleLinkMap[id].push(selector);
					if(t._curRow >= 0) {
						selector.val(t._orgData[t._curRow][id]);
					}
					return true;
				}
				else { 
					// 중복되는건이 있으면 return false;
					return false;
				}
			}
		};

	}
	
})(jQuery);