/**
 * CavaE HTML5 Canvas Event&Animation javascript Framework
 * 
 * CavaE是针对HTML5中Canvas元素开发的javascript框架。
 * 为Canvas画布上的用户自定义图形图像提供对鼠标、键盘事件的响应和处理。
 * 用户使用基础的canvas API绘制图形，通过CavaE可以给图形绑定事件监听器，
 * 可以移动、旋转、拉伸图形或将图形作为动画元素以固定帧率刷新。
 * 
 * CavaE实现的鼠标事件：
 * 鼠标按下、鼠标抬起、鼠标单击、鼠标双击、鼠标移动、鼠标进入图形、鼠标移出图形、鼠标悬停图形、
 * 鼠标拖拽开始、鼠标拖拽结束、鼠标拖拽释放目标激活、鼠标拖拽释放目标去激活
 * CavaE实现的键盘事件：
 * 键盘按下、键盘抬起、键盘按住
 * CavaE实现对图形的操作：
 * 移动锚点、以锚点为中心旋转、放大缩小、改变透明度
 *  
 */
/////////////////////////////////////////////////////////////////
// 						CavaE 名字空间
/////////////////////////////////////////////////////////////////
var CavaE = {};
/////////////////////////////////////////////////////////////////
//						全局变量
/////////////////////////////////////////////////////////////////
CavaE.GlobalObject = {
	/**
	 * 公共方法
	 */
	Func : {
		/**
		 * mantle 
		 * 使用对象字面量obj2中的值覆盖对象字面量obj1中的值
		 * @param {object} obj1 对象字面量
		 * @param {object} obj2 对象字面量
		 */
		mantle : function(obj1, obj2) {
			var key;
			for ( key in obj1) {
				if (obj2[key] !== undefined) {
					obj1[key] = obj2[key];
				}
			}
		},
		/**
		 * generateUniqueID 
		 * 生成全局唯一标识,伪UUID算法
		 * @return {string}
		 */
		generateUniqueID : function() {
			// 生成ID字符串长度
			var len = 64;
			// 生成ID为16进制表示
			var radix = 16;
			var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
					.split("");
			var chars = CHARS, uuid = [], i;
			radix = radix || chars.length;
			if (len) {
				for (i = 0; i < len; i++) {
					uuid[i] = chars[0 | Math.random() * radix];
				}
			} else {
				var r;
				uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
				uuid[14] = "4";
				for (i = 0; i < 36; i++) {
					if (!uuid[i]) {
						r = 0 | Math.random() * 16;
						uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
					}
				}
			}
			return uuid.join("");
		},
		/**
		 * Extends 
		 * 将对象obj1继承对象obj2原形中的方法，obj1可对方法进行重载
		 * @param {object} obj1
		 * @param {object} obj2
		 */
		Extends : function(obj1, obj2) {
			for ( var key in obj2.prototype) {
				if (obj2.prototype.hasOwnProperty(key)
						&& obj1.prototype[key] === undefined) {
					obj1.prototype[key] = obj2.prototype[key];
				}
			}
		},
		/**
		 * isArray 
		 * 判断对象是否是数组
		 * @param {object} obj
		 * @returns {boolean}
		 */
		isArray : function(obj) {
			return (typeof obj == 'object') && obj.constructor == Array;
		},
		/**
		 * isArray 
		 * 判断对象是否是函数
		 * @param {object} obj
		 * @returns {boolean}
		 */
		isFunction : function(obj) {
			return (typeof obj == 'function') && obj.constructor == Function;
		},
		/**
		 * isString 
		 * 判断对象是否是字符串
		 * @param {object} obj
		 * @returns {boolean}
		 */
		isString : function(obj) {
			return (typeof obj == 'string') && obj.constructor == String;
		},
		/**
		 * drawText
		 * 在画布上显示文字,自动换行
		 * @param {ctx} canvas.context
		 * @param {CavaE.TextWarp}
		 */
		drawText : function (ctx,self) {
			ctx.save();		
			self._shadow(ctx);
			ctx.font = self._font();
			var x = self.anchor.x;
			var y = self.anchor.y;
			var text = self.text;
			var line = self.wrapOptions.CHIndent?'    ':'';		
			for (var n = 0; n < text.length; n++) {
				if(text[n] == '\n' && self.wrapOptions.AutoEnter) {
					ctx.fillText(line, x, y);
					line = self.wrapOptions.CHIndent?'    ':'';
					y += Number(self.lineHight);
				} else {
			        var testLine = line + text[n];
			        var metrics = ctx.measureText(testLine);
			        var testWidth = metrics.width;
			        if (testWidth > self.maxWidth ) {
			        	ctx.fillText(line, x, y);
			            line = self.text[n];	            
			            y += Number(self.lineHight);	           
			        } else {
			            line = testLine;
			        }
				}
		    }
			ctx.fillText(line, x, y);
			ctx.restore();
		}
	},
	/**
	 * 对DOM对象操作的公共方法
	 */
	DOMTools : {
		/**
		 * addListener 
		 * 向DOM绑定事件监听器
		 * @param {dom} 目标元素
		 * @param {string} 绑定的事件类型，标准dom事件去除开头的'on'
		 * @param {function} 事件处理函数 
		 */ 
		addListener : function(element, e, fn) {
			element.addEventListener ? element.addEventListener(e, fn, false)
					: element.attachEvent("on" + e, fn);
		},
		/**
		 * removeListener 
		 * 解除dom绑定事件监听器
		 * @param {dom} 目标元素
		 * @param {string} 绑定的事件类型，标准dom事件去除开头的'on'
		 * @param {function} 事件处理函数 
		 */ 
		removeListener : function(element, e, fn) {
			element.removeEventListener ? element.removeEventListener(e, fn,
					false) : element.detachEvent("on" + e, fn);
		}
	},
	//	当前鼠标事件位置
	MousePos : undefined,
	//	鼠标上一次事件位置
	LastMousePos : undefined,
	//	当前键盘事件值
	EventKey : {
		//	键盘码
		code : undefined,
		//	键盘码转化为字符
		value : undefined
	},
	//	全部事件类型
	EventTypes : {
		MOUSEMOVE : 'mousemove',//	鼠标移动
		MOUSEMOVESPECIAL : 'mousemovespecial',// 鼠标移动衍生事件:鼠标进入 鼠标移出 鼠标悬停
		MOUSECLICK : 'click',//	鼠标单击
		MOUSEUP : 'mouseup',// 鼠标抬起
		MOUSEDOWN : 'mousedown',// 鼠标按下
		MOUSEDBCLICK : 'dblclick',// 鼠标双击
		MOUSEIN : 'mousein',//	鼠标进入
		MOUSEOVER : 'mouseover',//	鼠标悬停
		MOUSEOUT : 'mouseout',//	鼠标移出
		MOUSEDRAG : 'mousedrag',//	鼠标拖拽
		MOUSEDRAGSTART : 'mousedragstart',//	鼠标拖拽开始
		MOUSEDRAGING : 'mousedraging',//	拖拽状态下鼠标移动
		MOUSEDROP : 'mousedrop',//	鼠标拖拽释放
		MOUSEDROPTARGETACTIVE : 'mousedroptargetactive',// 激活释放目标
		MOUSEDROPTARGETNEGTIVE : 'mousedroptargetnegtive',// 去激活释放目标
		MOUSETOOLTIP : 'mousetooptip',//显示鼠标提示信息
		KEYUP : 'keyup',//	键盘抬起
		KEYDOWN : 'keydown',//	键盘按下	
		KEYPRESS : 'keypress'//	键盘按住
	},
	//	基本事件类型
	baseEventTypes : {
		MOUSEMOVE : 'mousemove',
		MOUSECLICK : 'click',
		MOUSEUP : 'mouseup',
		MOUSEDOWN : 'mousedown',
		MOUSEDBCLICK : 'dblclick',
		MOUSEMOVESPECIAL : 'mousemovespecial',
		KEYUP : 'keyup',
		KEYDOWN : 'keydown',
		KEYPRESS : 'keypress'
	},
	//	双击事件窗口
	dblClickWindow : 400,
	//	debug模式开关
	debug : false
};
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
/////////////////////////////////////////////////////////////////
//					事件响应器
/////////////////////////////////////////////////////////////////
/**
 * CavaE._Event
 * 事件响应器
 * @constructor
 * @param {CavaE.Stage} 被监听的舞台对象
 */
CavaE._Event = function(stage) {
	this._stage = stage;	
	// 是否监听键盘事件
	this._KeyBoardListening = true;
	// 对keydown和keypress事件的区分
	this._keyStart = true;
	// 被监听的Widget或Container对象
	this._eventObjects = [];
	// 当前是否处于拖拽状态
	this._draging = false;
};
CavaE._Event.prototype = {
	/**
	 * registerEventObject
	 * 将页面对象添加到事件监听对象队列中
	 * @param {string} eventType 事件类型
	 * @param {CavaE.Widget or CavaE.Container} 页面对象  
	 */
	registerEventObject : function(eventType, eventObject) {
		var rightType = true;
		var eventTypes = CavaE.GlobalObject.EventTypes;		
		if (this._eventObjects[eventType] === undefined) {
			this._eventObjects[eventType] = [];
		}
		this._eventObjects[eventType].push(eventObject);		
	},
	/**
	 * registerEventObject
	 * 将页面对象從事件监听对象队列中移除
	 * @param {string} eventType 事件类型
	 * @param {CavaE.Widget or CavaE.Container} 页面对象  
	 */
	unregisterEventObject : function(eventType, eventObject) {
		var rightType = true;
		var eventTypes = CavaE.GlobalObject.EventTypes;
		var eventObjects = this._eventObjects[eventType];
		if (eventObjects === undefined) {
			return;
		}
		for ( var i = 0, len = eventObjects.length; i < len; i++) {
			if (eventObjects[i].ID == eventObject.ID) {
				eventObjects.splice(i, 1);
				if (eventObjects.length == 0) {
					eventObjects = undefined;
				}
				break;
			}
		}
		this._eventObjects[eventType] = eventObjects; 
	},
	/**
	 * 键盘事件处理函数
	 */
	_executeKeyActions : function(eventType) {
		//没有对应的事件则返回
		if (this._eventObjects[eventType] == undefined) {
			return;
		}
		if (this._KeyBoardListening) {
			//封装键盘事件
			var event = {
				keyCode : CavaE.GlobalObject.EventKey.code,
				keyValue : CavaE.GlobalObject.EventKey.value
			};
			var eventObjects = this._eventObjects[eventType].length;
			for ( var i = 0, len = eventObjects; i < len; i++) {
				if (eventObjects[i].listening == true) {
					eventObjects[i]._executeAction(eventType,event);
				}
			}
		}
	},		
	/**
	 * 对舞台顶层的eventLayer Canvas元素绑定监听器
	 */
	_listen : function() {		
		var templistenCanvasElement = document.getElementById(this._stage.eventLayer.ID);
		var that = this;
		// 监听鼠标移动事件		
		CavaE.GlobalObject.DOMTools
				.addListener(
						templistenCanvasElement,
						CavaE.GlobalObject.EventTypes.MOUSEMOVE,
						function(event) {							
							if (CavaE.GlobalObject.MousePos !== undefined) {
								CavaE.GlobalObject.LastMousePos = CavaE.GlobalObject.MousePos;
							}
							CavaE.GlobalObject.MousePos = {
								'x' : event.pageX - that._stage.attrs.x,
								'y' : event.pageY - that._stage.attrs.y,
								'z' : event.timeStamp
							};
							if (CavaE.GlobalObject.LastMousePos !== undefined) {
								var DValueX = CavaE.GlobalObject.MousePos.x
										- CavaE.GlobalObject.LastMousePos.x;
								var DValueY = CavaE.GlobalObject.MousePos.y
										- CavaE.GlobalObject.LastMousePos.y;
								if (DValueX == 0 && DValueY == 0) {
									return;
								}
							}
							that._mousemoveHandler();
						});
		// 监听鼠标按下事件
		CavaE.GlobalObject.DOMTools.addListener(templistenCanvasElement,
				CavaE.GlobalObject.EventTypes.MOUSEDOWN, function(event) {
					CavaE.GlobalObject.MousePos = {
						'x' : event.pageX - that._stage.attrs.x,
						'y' : event.pageY - that._stage.attrs.y,
						'z' : event.timeStamp
					};
					that._mousedownHandler();
				});
		// 监听鼠标抬起事件
		CavaE.GlobalObject.DOMTools.addListener(templistenCanvasElement,
				CavaE.GlobalObject.EventTypes.MOUSEUP, function(event) {
					CavaE.GlobalObject.MousePos = {
						'x' : event.pageX - that._stage.attrs.x,
						'y' : event.pageY - that._stage.attrs.y,
						'z' : event.timeStamp
					};
					that._mouseupHandler();
				});
		// 监听键盘按下事件
		CavaE.GlobalObject.DOMTools.addListener(document.body,
				CavaE.GlobalObject.EventTypes.KEYDOWN, function(event) {
					if (!that._keystart) {
						return;
					}
					that._keystart = false;
					CavaE.GlobalObject.EventKey = {
						code : event.keyCode,
						value : String.fromCharCode(event.keyCode)
					};
					that._executeKeyActions('KEYDOWN');
				});
		// 监听键盘抬起事件
		CavaE.GlobalObject.DOMTools.addListener(document.body,
				CavaE.GlobalObject.EventTypes.KEYUP, function(event) {
					that._keystart = true;
					CavaE.GlobalObject.EventKey = {
						code : event.keyCode,
						value : String.fromCharCode(event.keyCode)
					};
					that._executeKeyActions('KEYUP');
				});
		// 监听键盘按住事件
		CavaE.GlobalObject.DOMTools.addListener(document.body,
				CavaE.GlobalObject.EventTypes.KEYPRESS, function(event) {
					if (that._keystart) {
						return;
					}
					CavaE.GlobalObject.EventKey = {
						code : event.keyCode,
						value : String.fromCharCode(event.keyCode)
					};
					that._executeKeyActions('KEYPRESS');
				});
	},
	/**
	 * 鼠标按下事件处理函数
	 */
	_mousedownHandler : function() {
		//	没有鼠标按下事件及其衍生事件立即返回
		if (this._eventObjects['MOUSEDOWN'] === undefined
				&& this._eventObjects['MOUSEDBCLICK'] === undefined
				&& this._eventObjects['MOUSECLICK'] === undefined) {
			return;
		}		
		//	封装事件对象x,y为当前鼠标位置,z为事件发生时间戳
		var event = {
			x : CavaE.GlobalObject.MousePos.x,
			y : CavaE.GlobalObject.MousePos.y,
			z : CavaE.GlobalObject.MousePos.z
		};
		//	在同一layer中的对象,只响应显示最顶层的
		//	找出鼠标按下最顶层对象
		var eventObjects = this._eventObjects['MOUSEDOWN'];
		var topWidget = undefined;
		if ( eventObjects!== undefined) {
			for ( var i = 0, len = eventObjects.length; i < len; i++) {
				if (eventObjects[i].listening == true
						&& eventObjects[i].isInEventBounding(
								event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = eventObjects[i];
					} else if (this._eventObjects['MOUSEDOWN'][i].drawIndex > topWidget.drawIndex) {
						topWidget = eventObjects[i];
					}
				}
			}
		}
		//	找出单击最顶层对象
		eventObjects = this._eventObjects['MOUSECLICK'];
		if ( eventObjects !== undefined) {
			for ( var i = 0, len = eventObjects.length; i < len; i++) {
				if (eventObjects[i].listening == true
						&& eventObjects[i]
								.isInEventBounding(event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = eventObjects[i];
					} else if (eventObjects[i].drawIndex > topWidget.drawIndex) {
						topWidget = eventObjects[i];
					}
				}
			}
		}
		//	找出双击最顶层对象
		eventObjects = this._eventObjects['MOUSEDBCLICK'];
		if (eventObjects !== undefined) {
			for ( var i = 0, len = eventObjects.length; i < len; i++) {
				if (eventObjects[i].listening == true
						&& eventObjects[i]
								.isInEventBounding(event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = eventObjects[i];
					} else if (eventObjects[i].drawIndex > topWidget.drawIndex) {
						topWidget = eventObjects[i];
					}
				}
			}
		}
		if (topWidget === undefined) {
			return;
		}
		//封装事件对象
		event.target = topWidget;
		//执行鼠标按下事件
		topWidget._executeAction('MOUSEDOWN', event);
		//如果在双击事件窗口内,执行双击事件,否则执行单击事件并打开双击时间窗口
		if (this.inDoubleClickWindow) {
			topWidget._executeAction('MOUSEDBCLICK', event);
			;
		} else {
			topWidget._executeAction('MOUSECLICK');
			this.inDoubleClickWindow = true;
			var that = this;
			setTimeout(function() {
				that.inDoubleClickWindow = false;
			}, CavaE.GlobalObject.dblClickWindow);
		}
	},	
	/**
	 * 鼠标移动事件处理函数
	 */
	_mousemoveHandler : function() {
		//	当前在拖动状态下,出发活动层重绘
		if (this._draging) {
			this._stage.activeLayer.redraw();
		}
		//	如果没有鼠标移动事件及其衍生事件则返回
		if (this._eventObjects['MOUSEMOVE'] === undefined
				&& this._eventObjects['MOUSEMOVESPECIAL'] === undefined) {
			return;
		}
		var event = {
			x : CavaE.GlobalObject.MousePos.x,
			y : CavaE.GlobalObject.MousePos.y,
			z : CavaE.GlobalObject.MousePos.z
		};
		//	在同一layer中的对象,只响应显示最顶层的
		//	找出顶层鼠标移动衍生事件
		var topWidget = undefined;
		var eventObjects = this._eventObjects['MOUSEMOVESPECIAL'];
		if (eventObjects !== undefined) {
			for ( var i = 0, len = eventObjects.length; i < len; i++) {
				if (eventObjects[i].listening == true
						&& eventObjects[i]
								.isInEventBounding(event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = eventObjects[i];
					} else if (eventObjects.drawIndex > topWidget.drawIndex) {
						topWidget = eventObjects[i];
					}
				}
			}
		}
		//	执行衍生事件
		if (topWidget !== undefined) {
			event.target = topWidget;
			topWidget._executeAction('MOUSEMOVESPECIAL', event);
		}
		// 基础鼠标移动事件
		eventObjects = this._eventObjects['MOUSEMOVE'];
		if (eventObjects !== undefined) {
			for ( var i = 0, len = eventObjects.length; i < len; i++) {
				if (eventObjects[i].listening == true) {
					event.target = eventObjects[i];
					eventObjects[i]._executeAction(
							'MOUSEMOVE', event);
				}
			}
		}
	},
	/**
	 * 鼠标抬起事件处理函数
	 */
	_mouseupHandler : function() {		
		//任何鼠标抬起结束当前拖拽状态
		this._draging = false;
		if (this._eventObjects['MOUSEUP'] === undefined) {
			return;
		}
		//封装事件对象
		var event = {
			x : CavaE.GlobalObject.MousePos.x,
			y : CavaE.GlobalObject.MousePos.y,
			z : CavaE.GlobalObject.MousePos.z
		};
		//拖拽操作可能导致鼠标移出拖拽对象,当用户释放鼠标时,鼠标抬起事件不发生在拖拽对象的判定范围内.
		//因此鼠标拖拽去除范围判定也去除层次判断
		var eventObjects = this._eventObjects['MOUSEUP'];
		if ( eventObjects !== undefined) {
			for ( var i = 0, len = eventObjects.length; i < len; i++) {
				if (eventObjects[i].listening == true) {
					event.target = eventObjects[i];
					eventObjects[i]._executeAction('MOUSEUP',event);
				}
			}
		}
	}
};
/////////////////////////////////////////////////////////////////
//				页面基础控件
/////////////////////////////////////////////////////////////////
/**
 * Widget
 * @constructor
 */
CavaE.Widget = function() {
	this.ID = CavaE.GlobalObject.Func.generateUniqueID();	
	// 所有包含的动作
	this._actions = [];
	// 是否已经存在在该类型的事件堆栈中
	this._registered = {};
	for ( var type in CavaE.GlobalObject.baseEventTypes) {
		this._registered[type] = false;
	}
	// 层属性，活跃层 active、稳定层 negtive、固定层 fixed 默认为negtive
	this.layer = 'negtive';
	// 是否显示
	this.displaying = true;	
	// 是否响应事件
	this.listening = true;
	// 是否已加入stage
	this._nodeStatus = false;
	// 父节点
	this._parent = undefined;
	this._lastParent = undefined;
	// 所属stage
	this._stage = undefined;
	// 绘制参数
	this.displayOptions = {
		position : 'relative',// 相对定位:其锚点会继承父节点的锚点偏移absolute 绝对定位，锚点偏移根据STAGE(0,0)计算
		rotate : undefined,// 角度除以π
		alpha : undefined,
		scale : undefined,
		offset : undefined, //用于旋转后再偏移等特殊情况
		clipEnable : false //是否进行切割
	};
	// 描点，绘图偏移基准点
	this.anchor = {
		x : 0,
		y : 0
	};	
	// 切割方法
	this._clipFuncs = [];
	// 绘制方法
	this._drawFuncs = [];
	// 事件包围盒
	this.eventBoundingBox = undefined;
	// 拖拽状态
	this.dragOptions = {
		_dragStart : false,
		_draging : false,
		dragBorder : undefined, // {top,left,bottom,right}
		horizontalLock : false,
		verticalLock : false,
		dropTargets : undefined, // []
		// 是否执行拖拽的默认操作
		dragDefaultAction : true,
		// 鼠标相对于锚点的位置
		dragOffset : undefined,
		// 拖拽起始位置
		startPoint : undefined,
		// 拖拽从鼠标点击位置到确定拖拽开始的位移窗口 单位 像素
		dragStartOffsetWindow : 10
	};
	this._mousein = false;
	//阴影设置
	this.shadow = {
		shadowDisplaying : false,
		shadowColor : '#707070',
		shadowOffsetX : 3,
		shadowOffsetY : 3,
		shadowBlur : 10
	};
};
CavaE.Widget.prototype = {
	/**
	 * setAnchor
	 * 设置锚点
	 * @param {int} x X坐标
	 * @param {int} y y坐标
	 */		
	setAnchor : function (x,y) {
		this.anchor.x += x;
		this.anchor.y += y;
		//改变子节点锚点
		if (this instanceof CavaE.Container) {
			for(var i=0,len=this._children.length;i<len;i++) {
				if(this._children[i].displayOptions.position == 'relative') {
					this._children[i].setAnchor(this.anchor.x,this.anchor.y);
				}
			}
		}		
	},
	/**
	 * on
	 * 可以同时将一个动作加入到多种响应事件中去
	 * 指定事件的名称 mouseover.actionname1 mouseup.actionname2,action
	 * @param {string} 事件类型[.事件名称][空格] 
	 * @param {function} 接受event对象参数的函数
	 * @exception 缺失事件响应包围盒异常
	 * @exception 事件类型错误
	 */
	on : function(typesStr, action) {
		var types = typesStr.split(' ');
		for ( var n = 0, len = types.length; n < len; n++) {
			var right = false;
			var type = types[n];
			var parts = type.split('.');
			var baseEvent = parts[0];
			for ( var eventType in CavaE.GlobalObject.EventTypes) {
				if (eventType == baseEvent) {
					var name = parts.length > 1 ? parts[1] : '';
					if (!this._actions[baseEvent]) {
						this._actions[baseEvent] = [];
					}
					if (baseEvent != 'MOUSEDRAG') {
						this._actions[baseEvent].push({
							name : name,
							handler : action
						});
					}
					right = true;
					//衍生事件绑定					
					if (baseEvent == 'MOUSEIN' || baseEvent == 'MOUSEOUT') {
						//鼠标进入 移出 同时绑定
						if (this.eventBoundingBox === undefined) {
							throw new Error('Expect eventBoundingBox!');
						}
						var that = this;
						if (!this._isActionExist('MOUSEMOVESPECIAL', '_MOUSEIN')) {
							this.on('MOUSEMOVESPECIAL._MOUSEIN',
								function(event) {
									if (that.isInEventBounding(
											event.x, event.y)) {
										if (!that._mousein && !that.dragOptions._draging) {
											that._mousein = true;
											that._executeAction('MOUSEIN',event);
										}
									}
							});
						}
						if (!this._isActionExist('MOUSEMOVE', '_MOUSEOUT')) {
							this.on('MOUSEMOVE._MOUSEOUT', function(event) {
								if (!that.isInEventBounding(event.x, event.y)) {
									if (that._mousein && !that.dragOptions._draging) {
										that._mousein = false;
										that._executeAction('MOUSEOUT', event);
									}
								}
							});
						}
					} else if (baseEvent == 'MOUSEOVER') {
						//鼠标悬停
						if (this._isActionExist('MOUSEMOVESPECIAL', '_MOUSEOVER')) {
							break;
						}
						if (this.eventBoundingBox === undefined) {
							throw new Error('Expect eventBoundingBox!');
						}
						var that = this;
						this.on('MOUSEMOVESPECIAL._MOUSEOVER', function(event) {
							if (that.isInEventBounding(event.x, event.y)) {
								that._executeAction('MOUSEOVER', event);
							}
						});
					} else if (baseEvent == 'MOUSEDRAG') {
						//鼠标拖拽
						if (this._isActionExist('MOUSEMOVE', '_MOUSEDRAG')) {
							break;
						}
						if (this.eventBoundingBox === undefined) {
							throw new Error('Expect eventBoundingBox!');
						}
						var that = this;
						this.on('MOUSEDOWN._MOUSEDRAG', function(event) {							
							that.dragOptions._dragStart = {
								x : event.x,
								y : event.y
							};
						});
						this.on('MOUSEUP._MOUSEDRAG', function(event) {
							if (that.dragOptions._draging) {
								that.backToNegtive();
								that._stage.negtiveLayer.redraw();
								that._stage.activeLayer.redraw();
								that._executeAction('MOUSEDROP', event);
							}
							that.dragOptions._draging = false;
							that.dragOptions._dragStart = false;
						});
						this.on('MOUSEMOVE._MOUSEDRAG',
								function(event) {
									//在X,Y任意方向上位移超过该窗口阀值,判定为拖拽开始
									if (that.dragOptions._dragStart) {
										var Dx = event.x - that.dragOptions._dragStart.x;
										var Dy = event.y - that.dragOptions._dragStart.y;
										var offsetWindow = that.dragOptions.dragStartOffsetWindow;
										if (-offsetWindow > Dx || Dx > offsetWindow || -10 > offsetWindow
												|| Dy > offsetWindow) {
											that.dragOptions._draging = true;
											that._stage._event._draging = true;
											that._executeAction(
													'MOUSEDRAGSTART', event);
											that.moveToActive();
											that.dragOptions._dragStart = false;
										}
									}
									if (that.dragOptions._draging) {
										that._executeAction('MOUSEDRAGING',event);
									}
								});
						// 绑定默认事件 按需求在绑定前重载该方法
						this.on('MOUSEDRAGING._DEFAULT',
								this.DragAndDropActions.draging);
						this.on('MOUSEDRAGSTART._DEFAULT',
								this.DragAndDropActions.dragStart);
						this.on('MOUSEDROP._DEFAULT',
								this.DragAndDropActions.drop);
					} else if (baseEvent == 'MOUSETOOLTIP') {
						this.tooltip = action; //TOOLTIP时用来显示文字
						var that = this;
						this.on('MOUSEIN._TOOLTIP', function (event) {
							that._stage.tooltip.text = that.tooltip;
							that._stage.tooltip.move(event.x,event.y);
							that._stage.tooltip.show();							
						});
						this.on('MOUSEOVER._TOOLTIP', function(event) {
							that._stage.tooltip.move(event.x,event.y);
							that._stage.activeLayer.redraw();
						});
						this.on('MOUSEOUT._TOOLTIP',function(){
							that._stage.tooltip.hide();
							that._stage.activeLayer.redraw();
						});
					}
					break;
				}
			}
			if (!right) {
				throw new Error('On undefined EventType!');
			}
		}
	},
	/**
	 * off
	 * 可以同时删除多种类型事件，并指定事件名称
	 * @param {string} 事件类型[.事件名称][空格]
	 */
	off : function(typesStr) {
		var types = typesStr.split(' ');
		for ( var n = 0; n < types.length; n++) {
			var type = types[n];
			var parts = type.split('.');
			var baseEvent = parts[0];
			if (baseEvent == 'MOUSETOOLTIP') {
				this.tooltip = undefined;
				this.off('MOUSEIN._TOOLTIP');
				this.off('MOUSEOVER._TOOLTIP');
				this.off('MOUSEOUT._TOOLTIP');
				continue;
			}
			if (this._actions[baseEvent] && parts.length > 1) {
				var name = parts[1];
				for ( var i = 0; i < this._actions[baseEvent].length; i++) {
					if (this._actions[baseEvent][i].name == name) {
						this._actions[baseEvent].splice(i, 1);
						if (this._actions[baseEvent].length == 0) {
							this._actions[baseEvent] = undefined;
							//删除衍生事件判定动作
							if (baseEvent == 'MOUSEIN') {
								if(this._actions['MOUSEOUT'].length == 0) {
									this.off('MOUSEMOVE._MOUSEIN');
									this.off('MOUSEMOVE._MOUSEOVER');
								}
							} else if (baseEvent == 'MOUSEOUT') {
								if(this._actions['MOUSEIN'].length == 0) {
									this.off('MOUSEMOVE._MOUSEOUT');
									this.off('MOUSEMOVE._MOUSEIN');
								}								
							} else if (baseEvent == 'MOUSEOVER') {
								this.off('MOUSEMOVE._MOUSEOVER');
							} else if (baseEvent == 'MOUSEDRAG') {
								this.off('MOUSEDOWN._MOUSEDRAG');
								this.off('MOUSEUP._MOUSEDRAG');
								this.off('MOUSEMOVE._MOUSEDRAG');
							}
							if (this._nodeStatus) {
								this._stage._event.unregisterEventObject(
										baseEvent, this);
							}
							break;
						}
					}
				}
			} else {
				//删除衍生事件判定动作
				if (baseEvent == 'MOUSEIN') {
					if(this._actions['MOUSEOUT'].length == 0) {
						this.off('MOUSEMOVE._MOUSEIN');
						this.off('MOUSEMOVE._MOUSEOVER');
					}
				} else if (baseEvent == 'MOUSEOUT') {
					if(this._actions['MOUSEIN'].length == 0) {
						this.off('MOUSEMOVE._MOUSEOUT');
						this.off('MOUSEMOVE._MOUSEIN');
					}								
				} else if (baseEvent == 'MOUSEOVER') {
					this.off('MOUSEMOVE._MOUSEOVER');
				} else if (baseEvent == 'MOUSEDRAG') {
					this.off('MOUSEDOWN._MOUSEDRAG');
					this.off('MOUSEUP._MOUSEDRAG');
					this.off('MOUSEMOVE._MOUSEDRAG');
				}
				if (this._nodeStatus) {
					this._stage._event.unregisterEventObject(
							baseEvent, this);
				}
			}
		}
	},
	/**
	 * draw
	 * @param {context} ctx Canvas绘制上下文
	 * @param {int} drawIndex 同一层面的绘制循序,数值越大zIndex越大
	 */
	draw : function(ctx, drawIndex) {		
		if (this.displaying) {			
			this._drawIndex = drawIndex.num++;
			if (ctx == undefined) {
				ctx = this._stage[this.layer + 'Layer'].context;
			}
			ctx.save();
			this._shadow(ctx);
			if(this.displayOptions.clipEnable) {
				this._clip(ctx);
			}
			//判断是否进行拉伸操作
			var x = this.anchor.x;
			var y = this.anchor.y;
			if (this.displayOptions.scale !== undefined) {
				ctx.scale(this.displayOptions.scale.x,
						this.displayOptions.scale.y);
				x /= this.displayOptions.scale.x;
				y /= this.displayOptions.scale.y;
			}
			//以锚点为中心绘制
			ctx.translate(x, y);			
			if (this.displayOptions.rotate !== undefined) {				
				ctx.rotate(Math.PI/180*this.displayOptions.rotate);
			}
			//处理旋转后特殊情况
			if(this.displayOptions.offset !== undefined){
				ctx.translate(this.displayOptions.offset.x,this.displayOptions.offset.y);
			}
			//是否需要进行透明度处理
			if (this.displayOptions.alpha !== undefined) {
				ctx.globalAlpha = this.displayOptions.alpha;
			}
			//是否Container,如果是绘制子节点
			if (this instanceof CavaE.Container) {
				for ( var i = 0, len = this._children.length; i < len; i++) {
					this._children[i].draw(ctx, drawIndex);
				}
			}
			//调用绘制函数栈
			for ( var i = 0, len = this._drawFuncs.length; i < len; i++) {
				this._drawFuncs[i].method(ctx, this);
			}			
			ctx.restore();
			ctx = null;
		}
	},
	/**
	 * _clip
	 * 切割画布
	 */
	_clip : function (ctx) {
		for ( var i=0,len = this._clipFuncs.length; i < len; i++) {
			this._clipFuncs[i].method(ctx,this);
		}
	},
	/**
	 * addClipFunc
	 * 给页面元素添加切割画布方法
	 * @param {function} clipFunc 切割函数
	 * @param {string} name 切割函数命名,默认为''
	 * @param {int} priority 切割函数优先级,默认为0
	 */
	addClipFunc : function(clipFunc, name, priority) {
		if (name === undefined) {
			name = '';
		}
		if (priority === undefined) {
			priority = 0;
		}
		var i = 0;
		for ( var len = this._clipFuncs.length; i < len; i++) {
			if (this._clipFuncs[i].priority > priority) {
				break;
			}
		}
		this._clipFuncs.splice(i, 0, {
			method : clipFunc,
			name : name,
			priority : priority
		});
	},
	/**
	 * removeClipFunc
	 * 移除指定绘制函数
	 * @param {string} 切割函数名
	 */
	removeClipFunc : function(name) {
		if (name === undefined) {
			name = '';
		}
		for ( var i = 0; i < this._clipFuncs.length;) {
			if (this._clipFuncs[i].name == name) {
				this._clipFuncs.splice(i, 1);
			} else {
				i++;
			}
		}
	},
	/**
	 * addDrawFunc
	 * 给页面元素添加绘制方法
	 * @param {function} drawFunc 绘制函数
	 * @param {string} name 绘制函数命名,默认为''
	 * @param {int} priority 绘制函数优先级,默认为0
	 */
	addDrawFunc : function(drawFunc, name, priority) {
		if (name === undefined) {
			name = '';
		}
		if (priority === undefined) {
			priority = 0;
		}
		var i = 0;
		for ( var len = this._drawFuncs.length; i < len; i++) {
			if (this._drawFuncs[i].priority > priority) {
				break;
			}
		}
		this._drawFuncs.splice(i, 0, {
			method : drawFunc,
			name : name,
			priority : priority
		});
	},
	/**
	 * removeDrawFunc
	 * 移除指定绘制函数
	 * @param {string} 绘制函数名
	 */
	removeDrawFunc : function(name) {
		if (name === undefined) {
			name = '';
		}
		for ( var i = 0; i < this._drawFuncs.length; i++) {
			if (this._drawFuncs[i].name == name) {
				this._drawFuncs.splice(i, 1);
			}
		}
	},
	/**
	 * getZIndex
	 * 获得页面元素在同一父节点下的绘制顺序
	 * @returns {int} 0为第一个依次递增
	 */
	getZIndex : function() {
		for ( var i = 0, len = this._parent._children.length; i < len; i++) {
			if (this._parent._children[i].ID == this.ID) {
				break;
			}
		}
		return this._parent._children.length - i - 1;
	},
	/**
	 * moveUp
	 * 将页面元素在其父中的绘制顺序前移一位
	 */
	moveUp : function() {
		if (this.getZIndex() == 0) {
			return;
		}
		for ( var i = 0, len = this._parent._children.length; i < len; i++) {
			if (this._parent._children[i].ID == this.ID) {
				this._parent._children.splice(i, 1);
				this._parent._children.splice(i + 1, 0, this);
				break;
			}
		}
	},
	/**
	 * moveTop
	 * 将页面元素在其父中的绘制顺序前移最先绘制
	 */
	moveTop : function() {
		if (this.getZIndex() == 0) {
			return;
		}
		for ( var i = 0, len = this._stage[this.layer+'Layer']._children.length; i < len; i++) {
			if (this._stage[this.layer+'Layer']._children[i].ID == this.ID) {
				this._stage[this.layer+'Layer']._children.splice(i, 1);
				this._stage[this.layer+'Layer']._children.push(this);
				break;
			}
		}
	},
	/**
	 * moveDown
	 * 将页面元素在其父中的绘制顺序后移一位
	 */
	moveDown : function() {
		if (this.getZIndex() == this._parent._children.length - 1) {
			return;
		}
		for ( var i = 0, len = this._parent._children.length; i < len; i++) {
			if (this._parent._children[i].ID == this.ID) {
				this._parent._children.splice(i, 1);
				this._parent._children.splice(i - 1, 0, this);
				break;
			}
		}
	},
	/**
	 * 移动Widget锚点
	 */
	move : function (x,y) {
		this.anchor.x = x;
		this.anchor.y = y;
	},
	/**
	 * moveBottom
	 * 将页面元素在其父中的绘制顺序后移最后绘制
	 */
	moveBottom : function() {
		if (this.getZIndex() == this._parent._children.length - 1) {
			return;
		}
		for ( var i = 0, len = this.parent._children.length; i < len; i++) {
			if (this._parent._children[i].ID == this.ID) {
				this._parent._children.splice(i, 1);
				this._parent._children.unshift(this);
				break;
			}
		}
	},
	/**
	 * setEventBoundingBox
	 * 设置页面元素页面响应包围盒,监听器根据包围盒判断事件是否发生在页面元素内部
	 * @param {Array or Function} pointArrayOrCallback
	 * 由{x,y}组成的数组,在判断时自动使用lineTo方法绘制出包围盒
	 * 或直接调用给定个绘制包围盒方法
	 */
	setEventBoundingBox : function(pointArrayOrCallback) {
		this.eventBoundingBox = pointArrayOrCallback;
	},
	/**
	 * isInEventBounding
	 * 判断点是否在页面元素内
	 * @param {int} x 事件X坐标
	 * @param {int} y 事件Y坐标
	 */
	isInEventBounding : function(x, y) {
		if (this.eventBoundingBox === undefined) {
			return true;
		}
		var ctx = this._stage.eventLayer.context;
		ctx.save();
		//是否有拉伸操作
		var ax = this.anchor.x;
		var ay = this.anchor.y;
		var isScale = false;
		if (this.displayOptions.scale !== undefined) {
			ctx.scale(this.displayOptions.scale.x, this.displayOptions.scale.y);
			ax /= this.displayOptions.scale.x;
			ay /= this.displayOptions.scale.y;
			isScale = true;
		}
		//以锚点为中心
		ctx.translate(ax, ay);
		if (this.displayOptions.rotate !== undefined) {
			ctx.rotate(this.displayOptions.rotate);
		}
		if (CavaE.GlobalObject.Func.isArray(this.eventBoundingBox)) {
			ctx.beginPath();
			ctx.moveTo(this.eventBoundingBox[0].x, this.eventBoundingBox[0].y);
			for ( var i = 1, len = this.eventBoundingBox.length; i < len; i++) {
				if(isScale) {
					ctx.lineTo(this.eventBoundingBox[i].x/this.displayOptions.scale.x
							,this.eventBoundingBox[i].y/this.displayOptions.scale.y);
				} else {
					ctx.lineTo(this.eventBoundingBox[i].x,this.eventBoundingBox[i].y);
				}
			}
			ctx.closePath();
		} else if (CavaE.GlobalObject.Func.isFunction(this.eventBoundingBox)) {
			this.eventBoundingBox(ctx, this);
		} else {
			ctx = null;
			throw new Error('Function CavaE.Widget.eventBounding expect Array or Function!');
		}
		var result = ctx.isPointInPath(x, y);
		//debug模式下,在event层显示事件包围盒
		if (CavaE.GlobalObject.debug) {
			ctx.clearRect(-this.anchor.x, -this.anchor.y,
					this._stage.attrs.width, this._stage.attrs.height);
			ctx.lineWidth = 10;
			ctx.strokeStyle = 'rgba(255,0,0,.8)';
			ctx.stroke();
		}
		ctx.restore();
		ctx = null;
		return result;

	},
	/**
	 * 拖拽事件默认操作
	 */
	DragAndDropActions : {
		/**
		 * dragStart
		 * @param {Object} event 事件对象
		 */
		dragStart : function(event) {
			var target = event.target;
			//记录鼠标和锚点的相对位置
			target.dragOptions.dragOffset = {
				x : event.x - target.anchor.x,
				y : event.y - target.anchor.y
			};
			//记录拖拽开始时的锚点
			target.dragOptions._startPoint = {
				x : target.anchor.x,
				y : target.anchor.y
			};
			//如果有释放页面对象,执行释放对象的激活释放对象操作
			if (target.dragOptions.dropTargets !== undefined) {
				var dropTargets = target.dragOptions.dropTargets;
				//重新封装事件对象
				var localEvent = {
					x : event.x,
					y : event.y
				};
				for ( var i = 0, len = dropTargets.length; i < len; i++) {
					localEvent.target = dropTargets[i];
					dropTargets[i]._executeAction('MOUSEDROPTARGETACTIVE',
							localEvent);
				}
			}
		},
		/**
		 * draging 
		 * 拖拽过程中
		 * @param {Object} event 事件对象
		 */
		draging : function(event) {
			var target = event.target;
			var currentX = target.anchor.x;
			var currentY = target.anchor.y;
			//是否强制水平拖拽
			if (!target.dragOptions.verticalLock) {
				currentX = event.x - target.dragOptions.dragOffset.x;
			}
			//是否强制垂直拖拽
			if (!target.dragOptions.horizontalLock) {
				currentY = event.y - target.dragOptions.dragOffset.y;
			}

			if (target.dragOptions.dragBorder === undefined) {
				target.anchor.x = currentX;
				target.anchor.y = currentY;
			} else {
				//是否有拖拽范围限制
				if (currentX >= target.dragOptions.dragBorder.left
						&& currentX <= target.dragOptions.dragBorder.right) {
					target.anchor.x = currentX;
				}
				if (currentY >= target.dragOptions.dragBorder.top
						&& currentY <= target.dragOptions.dragBorder.bottom) {
					target.anchor.y = currentY;
				}
			}
		},
		/**
		 * drop
		 * 拖拽释放操作
		 * @param {Object} event 事件对象
		 */
		drop : function(event) {
			var target = event.target;
			//是否有释放对象
			if (target.dragOptions.dropTargets !== undefined) {
				var dropTargets = target.dragOptions.dropTargets;
				var dropFailure = true;
				var localEvent = {
					x : event.x,
					y : event.y
				};
				//执行释放对象 去激活动作
				for ( var i = 0, len = dropTargets.length; i < len; i++) {
					localEvent.target = dropTargets[i];
					dropTargets[i]._executeAction('MOUSEDROPTARGETNEGTIVE',
							localEvent);
				}
				//是否释放在释放对象事件包围盒内
				for ( var i = 0, len = dropTargets.length; i < len; i++) {
					if (dropTargets[i].isInEventBounding(target.anchor.x,
							target.anchor.y)) {
						dropFailure = false;
						break;
					}
				}
				//释放失败,还原拖拽前位置
				event.dropFailure = dropFailure;				
				if (dropFailure) {
					target.anchor = target.dragOptions.startPoint;
				}
			}
		}
	},
	/**
	 * addDropTarget
	 * 添加拖拽释放对象
	 * @param {Widget} widget 页面元素
	 */
	addDropTarget : function(widget) {
		if (this.dragOptions.dropTargets === undefined) {
			this.dragOptions.dropTargets = [];
		}
		this.dragOptions.dropTargets.push(widget);
	},
	/**
	 * removeDropTarget
	 * 移出拖拽释放对象
	 * @param {Widget} widget 页面元素  
	 */
	removeDropTarget : function(widget) {
		if (this.dragOptions.dropTargets === undefined) {
			return;
		}
		for ( var i = 0, len = this.dragOptions.dropTargets.length; i < len; i++) {
			if (this.dragOptions.dropTargets[i].ID == widget.ID) {
				this.dragOptions.dropTargets.splice(i, 1);
				break;
			}
		}
	},
	/**
	 * moveToActive
	 * 将页面元素移动到活跃层
	 */
	moveToActive : function() {
		var lastLayer = this.layer;
		this._parent._remove(this);
		this._stage[this.layer+'Layer']._remove(this);
		this._stage.activeLayer._add(this);		
		this.layer = 'active';
		this._stage.activeLayer.redraw();
		this._stage[lastLayer+'Layer'].redraw();		
	},
	/**
	 * moveToAnimation
	 * 将页面元素移动到动画层
	 */
	moveToAnimation : function() {
		var lastLayer = this.layer;
		this._parent._remove(this);
		this._stage[this.layer+'Layer']._remove(this);
		this._stage.animationLayer._add(this);
		this.layer = 'animation';
		this._stage.animationLayer.redraw();
		this._stage[lastLayer+'Layer'].redraw();
		this._stage.playing = true;		
	},
	/**
	 * backToNegtive
	 * 将页面元素退回到稳定层
	 * @param {Container} newParent 指定新的父节点,如果不指定则其父为原来的父节点
	 */
	backToNegtive : function(newParent) {		
		this._stage[this.layer+'Layer']._remove(this);
		this._stage[this.layer+'Layer'].redraw();		
		this.layer = 'negtive';
		if (newParent === undefined) {
			this._parent._add(this);
		} else {
			newParent._add(this);
		}
		this._stage.negtiveLayer.redraw();		
	},
	/**
	 * 加载阴影
	 */
	_shadow :  function (ctx) {
		if(this.shadow.shadowDisplaying) {
			ctx.shadowColor = this.shadow.shadowColor;
			ctx.shadowOffsetX = this.shadow.shadowOffsetX;
			ctx.shadowOffsetY = this.shadow.shadowOffsetY;
			ctx.shadowBlur = this.shadow.shadowBlur;
		}
	},
	/**
	 * _isActionExist
	 * 判断在该对象动作栈中是否存在某动作
	 * @param {string} eventType 事件类型
	 * @param {string} actionName 动作名称
	 * @returns {Boolean}
	 */
	_isActionExist : function(eventType, actionName) {
		if (this._actions[eventType] === undefined) {
			return false;
		}
		var actions = this._actions[eventType];
		for ( var i = 0, len = actions.length; i < len; i++) {
			if (actions[i].name == actionName) {
				return true;
			}
		}
		return false;
	},
	/**
	 * _executeAction
	 * 执行某一类型的动作
	 * @param eventType
	 * @param {事件对象} event
	 */
	_executeAction : function(eventType, event) {
		if (this._actions[eventType] === undefined) {
			return;
		}
		if ((eventType == 'MOUSEIN' || eventType == 'MOUSEOVER' || eventType == 'MOUSEOUT')
				&& this.dragOptions._draging) {
			return;
		}
		var actions = this._actions[eventType];
		for ( var i = 0, len = actions.length; i < len; i++) {
			actions[i].handler(event);
		}
	},
	/**
	 * _registerEventObjec
	 * 当页面对象加入到显示列表时,向事件监听器注册
	 */
	_registerEventObject : function() {
		var eventTypes = CavaE.GlobalObject.baseEventTypes;
		for ( var eventType in eventTypes) {
			if (this._actions[eventType] === undefined) {
				continue;
			} else {
				this._stage._event.registerEventObject(eventType, this);
				this._registered[eventType] = true;
			}
		}
		//修改节点状态为已加入显示列表
		this._nodeStatus = true;
		//如果页面对象包含子对象则注册子对象
		if (this instanceof CavaE.Container) {
			for ( var i = 0, len = this._children.length; i < len; i++) {
				this._children[i]._stage = this._stage;
				this._children[i]._registerEventObject();
			}
		}
	},
	/**
	 * _unregisterEventObject
	 * 当页面对象移出显示列表时,将其从事件监听器移出
	 */
	_unregisterEventObject : function() {
		var eventTypes = this._registered;
		for ( var eventType in eventTypes) {
			if (eventTypes[eventType] == true) {
				this._stage._event.unregisterEventObject(eventType, this);
				this._registered[eventType] = false;
			}
		}
		//修改节点状态为未加入显示列表
		this._nodeStatus = false;
		//如果页面对象包含子对象从监听器中移出子对象
		if (this instanceof CavaE.Container || this instanceof CavaE.Stage) {
			for ( var i = 0, len = this._children.length; i < len; i++) {
				this._children[i]._unregisterEventObject();
				this._children[i]._stage = undefined;
			}
		}
	}	
};
/////////////////////////////////////////////////////////////////
//						页面基础控件容器
//Container 作为一组显示对象和集合，实例常用来直接代替最外围的显示对象，包
//含其内部各个相对独立的显示对象， 例如键盘地盘与按键的关系:地盘一般声明为Container，
//按键声明为Widget显示对象.Container与Container可以嵌套，例如标准键盘与
//小键盘之间的关系
/////////////////////////////////////////////////////////////////
/**
 * Container
 * @constructor
 */
CavaE.Container = function() {
	// 所有包含的子元素
	this._children = [];
	CavaE.Widget.apply(this, []);
};
CavaE.Container.prototype = {
	/**
	 * add
	 * 向容器内增加子节点
	 * @param {Widget or Container} node
	 */
	add : function(node) {
		if (node._nodeStatus) {
			throw new Error('Widget already added to Stage');
		}
		//根据其显示层次添加
		var i = 0;
		for ( var len = this._children.length; i < len; i++) {
			if (this._children[i] > node.zIndex) {
				break;
			}
		}
		this._children.splice(i, 0, node);
		node._parent = this;		
		if (this._nodeStatus) {
			node._stage = this._stage;
			node._registerEventObject();
			//	如果显示方式是相对显示,则继承其父的并改变其子节点的锚位置
			if (node.position == 'relative') {
				node.setAnchor(this.anchor.x,this.anchor.y);
			}		
		}
	},
	/**
	 * remove
	 * 向容器内增加子节点
	 * @param {Widget or Container} node
	 */
	remove : function(node) {
		for ( var i = 0;i < this._children.length; i++) {
			if (this._children[i].ID == node.ID) {
				this._children.splice(i, 1);
			}
		}
		if (this._nodeStatus) {
			node._unregisterEventObject();
		}
	},
	/**
	 * _add
	 * 向容器增加子节点,仅影响显示列表的树结构
	 * @param {Widget or Container} node
	 */
	_add : function(node) {
		var children = this._children;
		var i = 0;
		for ( var len = children.length; i < len; i++) {
			if (children[i] > node.zIndex) {
				break;
			}
		}
		children.splice(i, 0, node);		
		//node._parent = this;		
	},
	/**
	 * _remove
	 * 向容器增加子节点,仅影响显示列表的树结构
	 * @param {Widget or Container} node
	 */
	_remove : function(node) {
		var children;
		var children = this._children;
		for ( var i = 0; i < children.length;) {
			if (children[i].ID == node.ID) {
				children.splice(i, 1);
			} else {
				i++;
			}
		}
		//node._parent = undefined;
	}
};
CavaE.GlobalObject.Func.Extends(CavaE.Container, CavaE.Widget);
/////////////////////////////////////////////////////////////////
//						 舞台
//舞台负责创建DOM元素,维护显示列表,事件监听,绘制层次
/////////////////////////////////////////////////////////////////
/**
 * Stage
 * @constructor
 */
CavaE.Stage = function(attrs) {
	
	CavaE.Container.apply(this, []);
	if (this.attrs === undefined) {
		this.attrs = {};
	}
	// DOM STAGE 外层DIV的容器，默认在BODY中创建
	this.attrs.container = document.body;
	// STAGE动画层刷新的帧率
	this.attrs.framing = 1000 / 60;
	// 外层DIV的坐标
	this.attrs.x = 0;
	this.attrs.y = 0;
	this.attrs.z = 0;
	// 默认为全屏大小
	if(document.body != null ) {
		this.attrs.width = document.body.clientWidth;
		this.attrs.height = document.body.clientHeight;
	}
	
	if (attrs !== undefined) {
		CavaE.GlobalObject.Func.mantle(this.attrs, attrs);
	}
	if(this.attrs.container == null) {
		throw new Error('Cannot get document.body ,Call Stage Constructor in body onload Event!');
	}
	// 创建外层DIV
	var shell = document.createElement('div');
	this.attrs.container.appendChild(shell);
	shell.id = this.ID;
	with (shell.style) {
		position = 'absolute';
		top = this.attrs.y;
		left = this.attrs.x;
		zIndex = this.attrs.z;
		width = this.attrs.width + 'px';
		height = this.attrs.height + 'px';
	};	
	//用于递归调用
	this._stage = this;
	//创建4个Canvas层,事件响应层,显示层：活跃层，稳定层，固定层
	this._layerIndex = 1000;
	this.eventLayer = new CavaE.Layer(this);
	this.activeLayer = new CavaE.Layer(this);
	this.animationLayer = new CavaE.Layer(this);
	this.negtiveLayer = new CavaE.Layer(this);
	this.fixedLayer = new CavaE.Layer(this);

	// 创建事件堆栈
	this._event = new CavaE._Event(this);
	shell = null;
	// 动画层是否继续播放
	this.playing = false;
	// TOOLTIP
	this.tooltip = new CavaE.ToolTip(this);
};
CavaE.Stage.prototype = {
	/**
	 * add
	 * 重载Container的方法,将节点加入到其所属的显示层次中
	 * @param {Widget or Container} node
	 * @exception 节点不能直接添加到活跃层和动画层
	 * @exception 未定义层类型
	 */
	add : function(node) {
		if (node._nodeStatus) {
			throw new Error('Widget already added to Stage');
		}
		if (node.layer == 'fixed') {
			node._parent = this.fixedLayer;
			this.fixedLayer._add(node);
		} else if (node.layer == 'negtive') {
			node._parent = this.negtiveLayer;
			this.negtiveLayer._add(node);
		} else if (node.layer == 'active' || node.layer == 'animation') {
			throw new Error(
					'Cannot add active Widget directly, active Widget must be actived from negtive layer.');
		} else {
			throw new Error('undefined layer!');
		}
		node._stage = this._stage;
		node._registerEventObject();
	},
	/**
	 * remove
	 * 重载Container方法,从stage中的显示层次中删除节点
	 * @param {Widget or Container} node
	 */
	remove : function(node) {
		if (node.layer == 'fixed') {
			this.fixedLayer._remove(node);
		} else if (node.layer == 'negtive') {
			this.negtiveLayer._remove(node);
		}
		node.stage = undefined;
		node._unregisterEventObject();
	},
	/**
	 * redrawFixedLayer
	 * 重绘固定层
	 */
	redrawFixedLayer : function() {
		this.fixedLayer.redraw();
	},
	/**
	 * redrawNegtiveLayer
	 * 重围稳定层
	 */
	redrawNegtiveLayer : function() {
		this.negtiveLayer.redraw();
	},
	/**
	 * _initialize
	 * 舞台初始化
	 */
	_initialize : function() {
		this.redrawFixedLayer();
		this.redrawNegtiveLayer();
	},	
	/**
	 * 动画层按帧率刷新
	 */
	_animate : function() {		
		var update = function(obj) {
			var obj = obj;
			return function() {
				if (obj.playing) {
					var children = obj.animationLayer._children;
					obj.animationLayer.context.clearRect(0, 0, obj.attrs.width,
							obj.attrs.height);
					for ( var i = 0, len = children.length; i < len; i++) {
						children[i].draw(obj.animationLayer.context,obj);
					}
					window.requestAnimFrame(update, obj.attrs.framing);
				}
			};
		}(this);
		window.requestAnimFrame(update, this.attrs.framing);
	},
	/**
	 * 忽略键盘事件
	 */
	ignoreKeyboardEvent : function() {
		this._event.KeyBoardListening = false;
	},
	/**
	 * 响应键盘事件
	 */
	ListenKeyboardEvent : function() {
		this._event.KeyBoardListening = true;
	},
	/**
	 * 舞台初始化
	 */
	init : function() {
		this._initialize();
		this._event._listen();
	},
	/**
	 * 动画开始播放
	 */
	play : function() {
		this.playing = true;
		this._animate();
	},
	/**
	 * 动画停止播放
	 */
	stop : function() {
		this.playing = false;
	}

};
CavaE.GlobalObject.Func.Extends(CavaE.Stage, CavaE.Container);
CavaE.GlobalObject.Func.Extends(CavaE.Stage, CavaE.Widget);
/////////////////////////////////////////////////////////////////
//					层
//仅用于物理显示，提高运行速度与显示的层次没有关系
/////////////////////////////////////////////////////////////////
/**
 * Layer 
 * @constructor
 */
CavaE.Layer = function(stage) {
	CavaE.Container.apply(this, []);
	this._stage = stage;
	// 是否显示
	this.displaying = true;
	// 是否响应事件
	this.listening = true;
	// 是否已加入stage
	this._nodeStatus = true;
	// 创建LAYER的CANVAS元素
	var canvas = document.createElement('canvas');
	canvas.id = this.ID;
	this.context = canvas.getContext('2d');
	with (canvas.style) {
		position = 'absolute';
		top = 0;
		left = 0;
		zIndex = this._stage._layerIndex--;
	}
	canvas.width = stage.attrs.width;
	canvas.height = stage.attrs.height;
	var shell = document.getElementById(stage.ID);
	shell.appendChild(canvas);
	canvas = null;
	shell = null;
};
CavaE.Layer.prototype = {
	/**
	 * redraw
	 * 重绘该层所有元素
	 */
	redraw : function() {
		var ctx = this.context;
		var children = this._children;
		var drawIndex = {
			num : 0
		};
		ctx.clearRect(0, 0, this._stage.attrs.width, this._stage.attrs.height);
		for ( var i = 0, len = children.length; i < len; i++) {
			if (children[i].displaying) {
				children[i].draw(ctx, drawIndex);
			}
		}
	}
};
CavaE.GlobalObject.Func.Extends(CavaE.Layer, CavaE.Container);
/////////////////////////////////////////////////////////////////
//				核心功能扩展
/////////////////////////////////////////////////////////////////
/**
 *	ToolTip
 *	@constructor
 *	提示工具,当鼠标悬停时显示提示信息,当鼠标移出时隐藏提示信息	
 */
CavaE.ToolTip = function (stage){
	CavaE.Widget.apply(this, []);
	this._parent = stage;
	this._stage = stage;
};
CavaE.ToolTip.prototype = {
	show : function (x,y) {
		this.move(x,y);
		this._lastParent = this._parent;
		this._parent._remove(this);
		this._stage.activeLayer._add(this);
		this.layer = 'active';
		this.displaying = true;
		this._stage.activeLayer.redraw();
		this._stage.negtiveLayer.redraw();
	},
	hide : function (newParent) {
		this.displaying = false;
		this._parent._remove(this);
		if (newParent === undefined) {
			this._lastParent._add(this);
		} else {
			newParent._add(this);
		}
		this.layer = 'negtive';
		this._stage.activeLayer.redraw();		
	}	
};
CavaE.GlobalObject.Func.Extends(CavaE.ToolTip, CavaE.Widget);
/**
 *  TextWrap
 *  @constructor
 */
CavaE.TextWrap = function () {
	CavaE.Widget.apply(this, []);
	this.text;
	this.anchor = {x:0,y:0};
	this.maxWidth;
	this.lineHight;
	this.clipEnable = false;
	this._clipFunc = [];
	this.shadow = {
		shadowDisplaying : false,
		shadowColor : '#707070',
		shadowOffsetX : 3,
		shadowOffsetY : 3,
		shadowBlur : 10
	};
	this.font = {
		style : 'normal', //normal | italic | oblique
		weight : '400', //normal | bold | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
		size : '14px',
		family : '宋体'
	};
	this.wrapOptions = {
		CHIndent : true,
		AutoEnter : true		
	};
	this.addDrawFunc(CavaE.GlobalObject.Func.drawText);
};
CavaE.TextWrap.prototype = {	
	_font : function () {
		var font = this.font;
		var result = "";
		for(var fontSetting in font) {
			if(font[fontSetting] !== undefined) {
				result += ' '+font[fontSetting];
			}
		}
		return result;
	},
	_shadow : function (ctx) {
		if(this.shadow.shadowDisplaying) {
			ctx.shadowColor = this.shadow.shadowColor;
			ctx.shadowOffsetX = this.shadow.shadowOffsetX;
			ctx.shadowOffsetY = this.shadow.shadowOffsetY;
			ctx.shadowBlur = this.shadow.shadowBlur;
		}
	}
};
CavaE.GlobalObject.Func.Extends(CavaE.TextWrap, CavaE.Widget);