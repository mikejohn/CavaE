/**
 * CavaE HTML5 CAVAE 交互式框架
 * @author MikeZhang
 */

/**
 * CavaE 名字空间
 */
var CavaE = {};
/**
 * 全局变量
 */
CavaE.GlobalObjet = {
	Func : {
		/**
		 * 使用obj2中的值覆盖obj1中的值
		 */
		mantle : function(obj1, obj2) {
			for ( var key in obj1) {
				if (obj2[key] !== undefined) {
					obj1[key] = obj2[key];
				}
			}
		},
		/**
		 * 生成全DOM唯一标识
		 */
		generateUniqueID : function() {
			var len = 64;
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
		Extends : function(obj1, obj2) {
			for ( var key in obj2.prototype) {
				if (obj2.prototype.hasOwnProperty(key)
						&& obj1.prototype[key] === undefined) {
					obj1.prototype[key] = obj2.prototype[key];
				}
			}
		},
		isArray : function(obj) {
			return (typeof obj == 'object') && obj.constructor == Array;
		},
		isFunction : function(obj) {
			return (typeof obj == 'function') && obj.constructor == Function;
		}		
	},
	DOMTools : {
		/**
		 * addListener
		 */
		addListener : function(element, e, fn) {
			element.addEventListener ? element.addEventListener(e, fn, false)
					: element.attachEvent("on" + e, fn);
		},
		/**
		 * removeListener
		 */
		removeListener : function(element, e, fn) {
			element.removeEventListener ? element.removeEventListener(e, fn,
					false) : element.detachEvent("on" + e, fn);
		}
	},
	// 当前鼠标位置
	MousePos : undefined,
	LastMousePos : undefined,
	// 当前键盘值
	EventKey : {
		code : undefined,
		value : undefined
	},
	EventTypes : {
		MOUSEMOVE : 'mousemove',
		MOUSEMOVESPECIAL : 'mousemovespecial',
		MOUSECLICK : 'click',
		MOUSEUP : 'mouseup',
		MOUSEDOWN : 'mousedown',
		MOUSEDBCLICK : 'dblclick',
		MOUSEIN : 'mousein',
		MOUSEOVER : 'mouseover',
		MOUSEOUT : 'mouseout',
		MOUSEDRAG : 'mousedrag',
		MOUSEDRAGSTART : 'mousedragstart',
		MOUSEDRAGING : 'mousedraging',
		MOUSEDROP : 'mousedrop',
		MOUSEDROPTARGETACTIVE : 'mousedroptargetactive',// 激活DROP目标事件
		MOUSEDROPTARGETNEGTIVE : 'mousedroptargetnegtive',// 去激活DROP目标事件
		KEYUP : 'keyup',
		KEYDOWN : 'keydown',
		KEYPRESS : 'keypress'
	},
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
	// 当前是否有物体处于拖拽状态
	dblClickWindow : 400,
	mousemoveFrameFlag : true,
	mousemoveFraming : 1000 / 60,
	debug : true
};
/**
 * 事件响应
 * 
 * @param string
 *            当前监听的canvas元素ID
 */
CavaE._Event = function(stage) {
	this.stage = stage;
	// debug mode
	var debug = false;	
	// 是否监听键盘事件
	this.KeyBoardListening = true;
	// 对keydown和keypress事件的区分
	this.keyStart = true;
	// 所有对事件响应的对象
	this.eventObjects = [];
	this.draging = false;//全局拖拽变量
};
CavaE._Event.prototype = {
	// 监听
	_listen : function() {
		// event监听stage中pathLayer对应的canvas元素的鼠标和键盘事件
		var templistenCanvasElement = document
				.getElementById(this.stage.eventLayer.ID);
		var that = this;
		// 监听鼠标移动事件
//		setInterval(function() {
//			that.mousemoveFrameFlag = true;
//		}, CavaE.GlobalObjet.mousemoveFraming);
		CavaE.GlobalObjet.DOMTools
				.addListener(
						templistenCanvasElement,
						CavaE.GlobalObjet.EventTypes.MOUSEMOVE,
						function(event) {							
//							if (!that.mousemoveFrameFlag) {
//								return;
//							}
							that.mousemoveFrameFlag = false;
							if (CavaE.GlobalObjet.MousePos !== undefined) {
								CavaE.GlobalObjet.LastMousePos = CavaE.GlobalObjet.MousePos;
							}
							CavaE.GlobalObjet.MousePos = {
								'x' : event.pageX,
								'y' : event.pageY,
								'z' : event.timeStamp
							};
							if (CavaE.GlobalObjet.LastMousePos !== undefined) {
								var DValueX = CavaE.GlobalObjet.MousePos.x
										- CavaE.GlobalObjet.LastMousePos.x;
								var DValueY = CavaE.GlobalObjet.MousePos.y
										- CavaE.GlobalObjet.LastMousePos.y;
								if (DValueX == 0 && DValueY == 0) {
									return;
								}
							}
							that._mousemoveHandler();
						});
		// 监听鼠标按下事件
		CavaE.GlobalObjet.DOMTools.addListener(templistenCanvasElement,
				CavaE.GlobalObjet.EventTypes.MOUSEDOWN, function(event) {
					CavaE.GlobalObjet.MousePos = {
						'x' : event.pageX,
						'y' : event.pageY,
						'z' : event.timeStamp
					};
					that._mousedownHandler();
				});
		// 监听鼠标抬起事件
		CavaE.GlobalObjet.DOMTools.addListener(templistenCanvasElement,
				CavaE.GlobalObjet.EventTypes.MOUSEUP, function(event) {
					CavaE.GlobalObjet.MousePos = {
						'x' : event.pageX,
						'y' : event.pageY,
						'z' : event.timeStamp
					};
					that._mouseupHandler();
				});
		// 监听键盘按下事件
		CavaE.GlobalObjet.DOMTools.addListener(document.body,
				CavaE.GlobalObjet.EventTypes.KEYDOWN, function(event) {
					if (!that.keystart) {
						return;
					}
					that.keystart = false;
					CavaE.GlobalObjet.EventKey = {
						code : event.keyCode,
						value : String.fromCharCode(event.keyCode)
					};
					that.executeKeyActions('KEYDOWN');
				});
		// 监听键盘抬起事件
		CavaE.GlobalObjet.DOMTools.addListener(document.body,
				CavaE.GlobalObjet.EventTypes.KEYUP, function(event) {
					that.keystart = true;
					CavaE.GlobalObjet.EventKey = {
						code : event.keyCode,
						value : String.fromCharCode(event.keyCode)
					};
					that.executeKeyActions('KEYUP');
				});
		// 监听键盘按住事件
		CavaE.GlobalObjet.DOMTools.addListener(document.body,
				CavaE.GlobalObjet.EventTypes.KEYPRESS, function(event) {
					if (that.keystart) {
						return;
					}
					CavaE.GlobalObjet.EventKey = {
						code : event.keyCode,
						value : String.fromCharCode(event.keyCode)
					};
					that.executeKeyActions('KEYPRESS');
				});
	},
	_mousedownHandler : function() {
		if (this.eventObjects['MOUSEDOWN'] === undefined
				&& this.eventObjects['MOUSEDBCLICK'] === undefined
				&& this.eventObjects['MOUSECLICK'] === undefined) {
			return;
		}
		var event = {
			x : CavaE.GlobalObjet.MousePos.x,
			y : CavaE.GlobalObjet.MousePos.y,
			z : CavaE.GlobalObjet.MousePos.z
		};
		var topWidget = undefined;
		if (this.eventObjects['MOUSEDOWN'] !== undefined) {
			for ( var i = 0, len = this.eventObjects['MOUSEDOWN'].length; i < len; i++) {
				if (this.eventObjects['MOUSEDOWN'][i].listening == true
						&& this.eventObjects['MOUSEDOWN'][i].isInEventBounding(
								event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = this.eventObjects['MOUSEDOWN'][i];
					} else if (this.eventObjects['MOUSEDOWN'][i].drawIndex > topWidget.drawIndex) {
						topWidget = this.eventObjects['MOUSEDOWN'][i];
					}
				}
			}
		}
		if (this.eventObjects['MOUSECLICK'] !== undefined) {
			for ( var i = 0, len = this.eventObjects['MOUSECLICK'].length; i < len; i++) {
				if (this.eventObjects['MOUSECLICK'][i].listening == true
						&& this.eventObjects['MOUSECLICK'][i]
								.isInEventBounding(event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = this.eventObjects['MOUSECLICK'][i];
					} else if (this.eventObjects['MOUSECLICK'][i].drawIndex > topWidget.drawIndex) {
						topWidget = this.eventObjects['MOUSECLICK'][i];
					}
				}
			}
		}
		if (this.eventObjects['MOUSEDBCLICK'] !== undefined) {
			for ( var i = 0, len = this.eventObjects['MOUSEDBCLICK'].length; i < len; i++) {
				if (this.eventObjects['MOUSEDBCLICK'][i].listening == true
						&& this.eventObjects['MOUSEDBCLICK'][i]
								.isInEventBounding(event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = this.eventObjects['MOUSEDBCLICK'][i];
					} else if (this.eventObjects['MOUSEDBCLICK'][i].drawIndex > topWidget.drawIndex) {
						topWidget = this.eventObjects['MOUSEDBCLICK'][i];
					}
				}
			}
		}
		if (topWidget === undefined) {
			return;
		}
		event.target = topWidget;
		topWidget.executeAction('MOUSEDOWN', event);
		if (this.inDoubleClickWindow) {
			topWidget.executeAction('MOUSEDBCLICK', event);
			;
		} else {
			topWidget.executeAction('MOUSECLICK');
			this.inDoubleClickWindow = true;
			var that = this;
			setTimeout(function() {
				that.inDoubleClickWindow = false;
			}, CavaE.GlobalObjet.dblClickWindow);
		}
	},
	_mouseupHandler : function() {
		var event = {
			x : CavaE.GlobalObjet.MousePos.x,
			y : CavaE.GlobalObjet.MousePos.y,
			z : CavaE.GlobalObjet.MousePos.z
		};
		this.stage._event.draging = false;
		if (this.eventObjects['MOUSEUP'] !== undefined) {
			for ( var i = 0, len = this.eventObjects['MOUSEUP'].length; i < len; i++) {
				if (this.eventObjects['MOUSEUP'][i].listening == true) {
					event.target = this.eventObjects['MOUSEUP'][i];
					this.eventObjects['MOUSEUP'][i].executeAction('MOUSEUP',
							event);
				}
			}
		}
	},
	_mousemoveHandler : function() {
		if(this.draging) {
			this.stage.activeLayer.redraw();
		}
		if (this.eventObjects['MOUSEMOVE'] === undefined
				&& this.eventObjects['MOUSEMOVESPECIAL'] === undefined) {
			return;
		}
		var event = {
			x : CavaE.GlobalObjet.MousePos.x,
			y : CavaE.GlobalObjet.MousePos.y,
			z : CavaE.GlobalObjet.MousePos.z
		};
		var topWidget = undefined;
		if (this.eventObjects['MOUSEMOVESPECIAL'] !== undefined) {
			for ( var i = 0, len = this.eventObjects['MOUSEMOVESPECIAL'].length; i < len; i++) {
				if (this.eventObjects['MOUSEMOVESPECIAL'][i].listening == true
						&& this.eventObjects['MOUSEMOVESPECIAL'][i]
								.isInEventBounding(event.x, event.y)) {
					if (topWidget === undefined) {
						topWidget = this.eventObjects['MOUSEMOVESPECIAL'][i];
					} else if (this.eventObjects['MOUSEMOVESPECIAL'][i].drawIndex > topWidget.drawIndex) {
						topWidget = this.eventObjects['MOUSEMOVESPECIAL'][i];
					}
				}
			}
		}
		if (topWidget !== undefined) {
			event.target = topWidget;
			topWidget.executeAction('MOUSEMOVESPECIAL', event);
		}
		if (this.eventObjects['MOUSEMOVE'] !== undefined) {
			for ( var i = 0, len = this.eventObjects['MOUSEMOVE'].length; i < len; i++) {
				if (this.eventObjects['MOUSEMOVE'][i].listening == true) {
					event.target = this.eventObjects['MOUSEMOVE'][i];
					this.eventObjects['MOUSEMOVE'][i].executeAction(
							'MOUSEMOVE', event);
				}
			}
		}
	},
	executeKeyActions : function(eventType) {
		if (this.eventObjects[eventType] == undefined) {
			return;
		}
		if (this.KeyBoardListening) {
			var event = {
				keyCode : CavaE.GlobalObjet.EventKey.code,
				keyValue : CavaE.GlobalObjet.EventKey.value
			};
			for ( var i = 0, len = this.eventObjects[eventType].length; i < len; i++) {
				if (this.eventObjects[eventType][i].listening == true) {
					this.eventObjects[eventType][i].executeAction(eventType,
							event);
				}
			}
		}
	},
	// 注册响应事件对象
	registerEventObject : function(eventType, eventObject) {
		var rightType = true;
		var eventTypes = CavaE.GlobalObjet.EventTypes;
		for ( var type in eventTypes) {
			if (type == eventType) {
				if (this.eventObjects[eventType] === undefined) {
					this.eventObjects[eventType] = [];
				}
				this.eventObjects[eventType].push(eventObject);
				rightType = false;
				break;
			}
		}
		if (rightType) {
			throw new Error('UnDefine SightEventType cannot register!');
		}
	},
	// 去除响应事件对象
	unregisterEventObject : function(eventType, eventObject) {
		var rightType = true;
		var eventTypes = CavaE.GlobalObjet.EventTypes;
		for ( var type in eventTypes) {
			if (type == eventType) {
				if (this.eventObjects[eventType] === undefined) {
					return;
				}
				for ( var i = 0, len = this.eventObjects[eventType].length; i < len; i++) {
					if (this.eventObjects[eventType][i].ID == eventObject.ID) {
						this.eventObjects[eventType].splice(i, 1);
						if (this.eventObjects[eventType].length == 0) {
							this.eventObjects[eventType] = undefined;
						}
						break;
					}
				}
				rightType = false;
			}
		}
		if (rightType) {
			throw new Error('UnDefine SightEventType cannot unregister!');
		}
	}
};
/**
 * Widget
 * 
 */
CavaE.Widget = function() {
	this.ID = CavaE.GlobalObjet.Func.generateUniqueID();
	// 绑定的事件堆栈
	this._event;
	// 所有包含的动作
	this._actions = [];
	// 是否已经存在在该类型的事件堆栈中
	this._registered = {};
	for ( var type in CavaE.GlobalObjet.baseEventTypes) {
		this._registered[type] = false;
	}
	// 层属性，活跃层 active、稳定层 negtive、固定层 fixed 默认为negtive
	this.layer = 'negtive';
	// 是否显示
	this.displaying = true;
	this.displayOptions = {
		rotate : undefined,//角度除以π
		alpha : undefined,
		scale : undefined
	};
	// 是否响应事件
	this.listening = true;
	// 是否已加入stage
	this.nodeStatus = false;
	// 父节点
	this.parent = undefined;
	this.lastParent = undefined;
	// 所属stage
	this.stage = undefined;
	// 位置
	this.position = 'relative'; // 相对定位:其锚点会继承父节点的锚点偏移
	// absolute 绝对定位，锚点偏移根据STAGE(0,0)计算
	// 描点，绘图偏移基准点
	this.anchor = {
		x : 0,
		y : 0
	};
	// 绘制方法
	this._drawFuncs = [];
	// 事件包围盒
	this.eventBoundingBox = undefined;
	// 拖拽状态
	this.dragOptions = {
		dragStart : false,
		draging : false,
		dragBorder : undefined, // {top,left,bottom,right}
		horizontalLock : false,
		verticalLock : false,
		dropTargets : undefined, // []
		// 是否执行拖拽的默认操作
		dragDefaultAction : true,
		// 鼠标相对于锚点的位置
		dragOffset : undefined,
		// 拖拽起始位置
		startPoint : undefined
	};
};
CavaE.Widget.prototype = {
	/**
	 * 可以同时将一个动作加入到多种响应事件中去，指定事件的名称 mouseover.actionname1 mouseup.actionname2,
	 * action
	 */
	on : function(typesStr, action) {
		var types = typesStr.split(' ');
		for ( var n = 0, len = types.length; n < len; n++) {
			var right = false;
			var type = types[n];
			var parts = type.split('.');
			var baseEvent = parts[0];
			for ( var eventType in CavaE.GlobalObjet.EventTypes) {
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
					// specialevent need eventBoudingBox

					if (baseEvent == 'MOUSEIN' || baseEvent == 'MOUSEOUT') {
						if (this.eventBoundingBox === undefined) {
							throw new Error('Expect eventBoundingBox!');
						}
						var that = this;
						if (!this.isActionExist('MOUSEMOVESPECIAL', '_MOUSEIN')) {
							this
									.on(
											'MOUSEMOVESPECIAL._MOUSEIN',
											function(event) {
												if (that.isInEventBounding(
														event.x, event.y)) {
													if (!that.MOUSEIN
															&& !that.dragOptions.draging) {
														that.MOUSEIN = true;
														that.executeAction(
																'MOUSEIN',
																event);
													}
												}
											});
						}
						if (!this.isActionExist('MOUSEMOVE', '_MOUSEOUT')) {
							this.on('MOUSEMOVE._MOUSEOUT', function(event) {
								if (!that.isInEventBounding(event.x, event.y)) {
									if (that.MOUSEIN
											&& !that.dragOptions.draging) {
										that.MOUSEIN = false;
										that.executeAction('MOUSEOUT', event);
									}
								}
							});
						}
					} else if (baseEvent == 'MOUSEOVER') {
						if (this
								.isActionExist('MOUSEMOVESPECIAL', '_MOUSEOVER')) {
							break;
						}
						if (this.eventBoundingBox === undefined) {
							throw new Error('Expect eventBoundingBox!');
						}
						var that = this;
						this.on('MOUSEMOVESPECIAL._MOUSEOVER', function(event) {
							if (that.isInEventBounding(event.x, event.y)) {
								that.executeAction('MOUSEOVER', event);
							}
						});
					} else if (baseEvent == 'MOUSEDRAG') {
						if (this.isActionExist('MOUSEMOVE', '_MOUSEDRAG')) {
							break;
						}
						if (this.eventBoundingBox === undefined) {
							throw new Error('Expect eventBoundingBox!');
						}
						var that = this;
						this.on('MOUSEDOWN._MOUSEDRAG', function(event) {
							that.dragOptions.dragStart = {x:event.x,y:event.y};							
						});
						this.on('MOUSEUP._MOUSEDRAG', function(event) {
							if (that.dragOptions.draging) {
								that.backToNegtive();
								that.stage.negtiveLayer.redraw();
								that.stage.activeLayer.redraw();
								that.executeAction('MOUSEDROP', event);								
							}
							that.dragOptions.draging = false;							
							that.dragOptions.dragStart = false;
						});
						this.on('MOUSEMOVE._MOUSEDRAG', function(event) {
							if(that.dragOptions.dragStart) {
								var Dx = event.x - that.dragOptions.dragStart.x;
								var Dy = event.y - that.dragOptions.dragStart.y;
								if(-10 > Dx || Dx > 10 || -10 > Dy|| Dy > 10) {
									that.dragOptions.draging = true;
									that.stage._event.draging = true;							
									that.executeAction('MOUSEDRAGSTART', event);
									that.moveToActive();
									that.dragOptions.dragStart = false;
								}
							}
							if (that.dragOptions.draging) {
								that.executeAction('MOUSEDRAGING', event);
							}
						});
						// 绑定默认事件
						this.on('MOUSEDRAGING._DEFAULT',
								this.DragAndDropActions.draging);
						this.on('MOUSEDRAGSTART._DEFAULT',
								this.DragAndDropActions.dragStart);
						this.on('MOUSEDROP._DEFAULT',
								this.DragAndDropActions.drop);
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
	 * 可以同时删除多种类型事件，并指定事件名称
	 */
	off : function(typesStr) {
		var types = typesStr.split(' ');
		for ( var n = 0; n < types.length; n++) {
			var type = types[n];
			var parts = type.split('.');
			var baseEvent = parts[0];
			if (this._actions[baseEvent] && parts.length > 1) {
				var name = parts[1];
				for ( var i = 0; i < this._actions[baseEvent].length; i++) {
					if (this._actions[baseEvent][i].name === name) {
						this._actions[baseEvent].splice(i, 1);
						if (this._actions[baseEvent].length === 0) {
							this._actions[baseEvent] = undefined;
							if (baseEvent == 'MOUSEIN') {
								this.off('MOUSEMOVE._MOUSEIN');
							} else if (baseEvent == 'MOUSEOVER') {
								this.off('MOUSEMOVE._MOUSEOVER');
							} else if (baseEvent == 'MOUSEOUT') {
								this.off('MOUSEMOVE._MOUSEOUT');
							} else if (baseEvent == 'MOUSEDRAG') {
								this.off('MOUSEDOWN._MOUSEDRAG');
								this.off('MOUSEUP._MOUSEDRAG');
								this.off('MOUSEMOVE._MOUSEDRAG');
							}
							if (this.nodeStatus) {
								this.stage._event.unregisterEventObject(
										baseEvent, this);
							}
							break;
						}
					}
				}
			} else {
				this._actions[baseEvent] = undefined;
				if (baseEvent == 'MOUSEIN') {
					this.off('MOUSEMOVE._MOUSEIN');
				} else if (baseEvent == 'MOUSEOVER') {
					this.off('MOUSEMOVE._MOUSEOVER');
				} else if (baseEvent == 'MOUSEOUT') {
					this.off('MOUSEMOVE._MOUSEOUT');
				} else if (baseEvent == 'MOUSEDRAG') {
					this.off('MOUSEDOWN._MOUSEDRAG');
					this.off('MOUSEUP._MOUSEDRAG');
					this.off('MOUSEMOVE._MOUSEDRAG');
				}
				if (this.nodeStatus) {
					this.stage._event.unregisterEventObject(baseEvent, this);
				}
			}
		}
	},
	isActionExist : function(eventType, actionName) {
		if (this._actions[eventType] === undefined) {
			return false;
		}
		for ( var i = 0, len = this._actions[eventType].length; i < len; i++) {
			if (this._actions[eventType][i].name == actionName) {
				return true;
			}
		}
		return false;
	},
	executeAction : function(eventType, event) {
		if (this._actions[eventType] === undefined) {
			return;
		}
		if ((eventType == 'MOUSEIN' || eventType == 'MOUSEOVER' || eventType == 'MOUSEOUT')
				&& this.draging) {
			return;
		}
		for ( var i = 0, len = this._actions[eventType].length; i < len; i++) {
			this._actions[eventType][i].handler(event);
		}
	},
	_registerEventObject : function() {
		var eventTypes = CavaE.GlobalObjet.baseEventTypes;
		for ( var eventType in eventTypes) {
			if (this._actions[eventType] === undefined) {
				continue;
			} else {
				this.stage._event.registerEventObject(eventType, this);
				this._registered[eventType] = true;
			}
		}
		this.nodeStatus = true;
		if (this instanceof CavaE.Container || this instanceof CavaE.Stage) {
			for ( var i = 0, len = this._children.length; i < len; i++) {
				this._children[i].stage = this.stage;
				this._children[i]._registerEventObject();
			}
		}
	},
	_unregisterEventObject : function() {
		var eventTypes = this._registered;
		for ( var eventType in eventTypes) {
			if (eventTypes[eventType] == true) {
				this.stage._event.unregisterEventObject(eventType, this);
				this._registered[eventType] = false;
			}
		}
		this.nodeStatus = false;
		if (this instanceof CavaE.Container || this instanceof CavaE.Stage) {
			for ( var i = 0, len = this._children.length; i < len; i++) {
				this._children[i]._unregisterEventObject();
				this._children[i].stage = undefined;
			}
		}
	},
	draw : function(ctx,drawIndex) {
		if (this.displaying) {
			this.drawIndex = drawIndex.num++;
			if (ctx == undefined) {
				ctx = this.stage[this.layer + 'Layer'].context;
			}
			ctx.save();
			var x = this.anchor.x;
			var y = this.anchor.y;
			if(this.displayOptions.scale !== undefined) {
				ctx.scale(this.displayOptions.scale.x,this.displayOptions.scale.y);
				x /= this.displayOptions.scale.x;
				y /= this.displayOptions.scale.y;
			}
			ctx.translate(x,y);
			if(this.displayOptions.rotate !== undefined) {
				ctx.rotate(this.displayOptions.rotate);
			}
			if(this.displayOptions.alpha !== undefined) {
				ctx.globalAlpha= this.displayOptions.alpha;
			}
			if (this instanceof CavaE.Container || this instanceof CavaE.Stage) {
				for ( var i = 0, len = this._children.length; i < len; i++) {
					this._children[i].draw(ctx, this);
				}
			}
			for ( var i = 0, len = this._drawFuncs.length; i < len; i++) {
				this._drawFuncs[i].method(ctx, this);
			}
			ctx.restore();
			ctx = null;
		}
	},
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
	getZIndex : function() {
		for ( var i = 0, len = this.parent._children.length; i < len; i++) {
			if (this.parent._children[i].ID == this.ID) {
				break;
			}
		}
		return this.parent._children.length - i - 1;
	},
	moveUp : function() {
		if (this.getZIndex() == 0) {
			return;
		}
		for ( var i = 0, len = this.parent._children.length; i < len; i++) {
			if (this.parent._children[i].ID == this.ID) {
				this.parent._children.splice(i, 1);
				this.parent._children.splice(i + 1, 0, this);
				break;
			}
		}
	},
	moveTop : function() {
		if (this.getZIndex() == 0) {
			return;
		}
		for ( var i = 0, len = this.parent._children.length; i < len; i++) {
			if (this.parent._children[i].ID == this.ID) {
				this.parent._children.splice(i, 1);
				this.parent._children.push(this);
				break;
			}
		}
	},
	moveDown : function() {
		if (this.getZIndex() == this.parent._children.length - 1) {
			return;
		}
		for ( var i = 0, len = this.parent._children.length; i < len; i++) {
			if (this.parent._children[i].ID == this.ID) {
				this.parent._children.splice(i, 1);
				this.parent._children.splice(i - 1, 0, this);
				break;
			}
		}
	},
	moveBottom : function() {
		if (this.getZIndex() == this.parent._children.length - 1) {
			return;
		}
		for ( var i = 0, len = this.parent._children.length; i < len; i++) {
			if (this.parent._children[i].ID == this.ID) {
				this.parent._children.splice(i, 1);
				this.parent._children.unshift(this);
				break;
			}
		}
	},
	setEventBoundingBox : function(pointArrayOrCallback) {
		this.eventBoundingBox = pointArrayOrCallback;
	},
	isInEventBounding : function(x, y) {
		if (this.eventBoundingBox === undefined) {
			return true;
		}
		var ctx = this.stage.eventLayer.context;
		ctx.save();		
		var x = this.anchor.x;
		var y = this.anchor.y;
		if(this.displayOptions.scale !== undefined) {
			ctx.scale(this.displayOptions.scale.x,this.displayOptions.scale.y);
			x /= this.displayOptions.scale.x;
			y /= this.displayOptions.scale.y;
		}
		ctx.translate(x,y);		
		if(this.displayOptions.rotate !== undefined) {
			ctx.rotate(this.displayOptions.rotate);
		}
		if(this.displayOptions.alpha !== undefined) {
			ctx.globalAlpha=this.displayOptions.alpha;
		}
		if (CavaE.GlobalObjet.Func.isArray(this.eventBoundingBox)) {
			ctx.beginPath();
			ctx.moveTo(this.eventBoundingBox[0].x, this.eventBoundingBox[0].y);
			for ( var i = 1, len = this.eventBoundingBox.length; i < len; i++) {
				ctx.lineTo(this.eventBoundingBox[0].x,
						this.eventBoundingBox[0].y);
			}
			ctx.closePath();
		} else if (CavaE.GlobalObjet.Func.isFunction(this.eventBoundingBox)) {
			this.eventBoundingBox(ctx, this);
		} else {
			ctx = null;
			throw new Error(
					'Function CavaE.Widget.eventBounding expect Array or Function!');
		}
		
		var result =ctx.isPointInPath(x, y); 
		if(CavaE.GlobalObjet.debug) {
			ctx.clearRect(-this.anchor.x,-this.anchor.y,this.stage.attrs.width,this.stage.attrs.height);
			ctx.lineWidth = 10;
			ctx.strokeStyle = 'rgba(255,0,0,.8)';
			ctx.stroke();
		}
		ctx.restore();
		ctx = null;
		return result;
		
	},
	DragAndDropActions : {
		dragStart : function(event) {
			var target = event.target;
			target.dragOptions.dragOffset = {
				x : event.x - target.anchor.x,
				y : event.y - target.anchor.y
			};
			target.dragOptions.startPoint = {
				x : target.anchor.x,
				y : target.anchor.y
			};
			if (target.dragOptions.dropTargets !== undefined) {
				var dropTargets = target.dragOptions.dropTargets;
				var localEvent = {
					x : event.x,
					y : event.y
				};
				for ( var i = 0, len = dropTargets.length; i < len; i++) {
					localEvent.target = dropTargets[i];
					dropTargets[i].executeAction('MOUSEDROPTARGETACTIVE',
							localEvent);
				}
			}
		},
		draging : function(event) {
			var target = event.target;
			var currentX = target.anchor.x;
			var currentY = target.anchor.y;
			if (!target.dragOptions.verticalLock) {
				currentX = event.x - target.dragOptions.dragOffset.x;
			}
			if (!target.dragOptions.horizontalLock) {
				currentY = event.y - target.dragOptions.dragOffset.y;
			}
			if (target.dragOptions.dragBorder === undefined) {
				target.anchor.x = currentX;
				target.anchor.y = currentY;
			} else {
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
		drop : function(event) {
			var target = event.target;
			if (target.dragOptions.dropTargets !== undefined) {
				var dropTargets = target.dragOptions.dropTargets;
				var dropFailure = true;
				var localEvent = {
					x : event.x,
					y : event.y
				};
				for ( var i = 0, len = dropTargets.length; i < len; i++) {
					localEvent.target = dropTargets[i];
					dropTargets[i].executeAction('MOUSEDROPTARGETNEGTIVE',
							localEvent);
				}
				for ( var i = 0, len = dropTargets.length; i < len; i++) {
					if (dropTargets[i].isInEventBounding(target.anchor.x,
							target.anchor.y)) {
						dropFailure = false;
						break;
					}
				}
				event.dropFailure = dropFailure;
				if (dropFailure) {
					target.anchor = target.dragOptions.startPoint;
				}
			}
		}
	},
	addDropTarget : function(widget) {
		if (this.dragOptions.dropTargets === undefined) {
			this.dragOptions.dropTargets = [];
		}
		this.dragOptions.dropTargets.push(widget);
	},
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
	moveToActive : function () {
		this.lastParent = this.parent;
		this.parent._remove(this);
		this.stage.activeLayer._add(this);		
		this.layer = 'active';		
		this.stage.negtiveLayer.redraw();
	},
	moveToAnimation : function () {
		this.lastParent = this.parent;
		this.parent._remove(this);
		this.stage.animationLayer._add(this);		
		this.layer = 'animation';
		this.stage.negtiveLayer.redraw();
		this.stage.playing = true;
	},
	backToNegtive : function (newParent) {
		this.parent._remove(this);
		if(newParent === undefined) {
			this.lastParent._add(this);			
		} else {
			newParent._add(this);			
		}
	}
};
/**
 * Container 作为一组显示对象和集合，实例常用来直接代替最外围的显示对象，包含其内部各个相对独立的显示对象， 例如
 * 键盘地盘与按键的关系:地盘一般声明为Container，按键声明为Widget显示对象 Container与Container可以嵌套，例如
 * 标准键盘与小键盘之间的关系
 */
CavaE.Container = function() {
	// 所有包含的子元素
	this._children = [];
	CavaE.Widget.apply(this, []);
};
CavaE.Container.prototype = {
	addWidget : function(node) {
		if (node.nodeStatus) {
			throw new Error('Widget already added to Stage');
		}
		var i = 0;
		for ( var len = this._children.length; i < len; i++) {
			if (this._children[i] > node.zIndex) {
				break;
			}
		}
		this._children.splice(i, 0, node);
		node.parent = this;
		// 设置锚
		if (node.position == 'relative') {
			node.anchor.x += this.anchor.x;
			node.anchor.y += this.anchor.y;
		}
		if (this.nodeStatus) {
			node.stage = this.stage;
			node._registerEventObject();
		}
	},
	removeWidget : function(node) {
		for ( var i = 0, len = this._children.length; i < len; i++) {
			if (this._children[i].ID == node.ID) {
				this._children.splice(i, 1);
			}
		}
		if (this.nodeStatus) {
			node._unregisterEventObject();
		}
	},
	_add : function(node) {		
		var children = this._children;
		var i = 0;
		for ( var len = children.length; i < len; i++) {
			if (children[i] > node.zIndex) {
				break;
			}
		}
		children.splice(i, 0, node);
		
		node.parent = this;
	},
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
		node.parent = undefined;
	}
};
CavaE.GlobalObjet.Func.Extends(CavaE.Container, CavaE.Widget);
/**
 * Stage 作为一个特殊的Container，是所有Container的ROOT,Stage没有Parent
 */
CavaE.Stage = function(attrs) {
	CavaE.Container.apply(this, []);
	if (this.attrs === undefined) {
		this.attrs = {};
	}
	// DOM STAGE 外层DIV的容器，默认在BODY中创建
	this.attrs.container = document.body;
	// STAGE刷新的帧率
	this.attrs.framing = 1000 / 60;
	this.attrs.x = 0;
	this.attrs.y = 0;
	this.attrs.z = 0;
	// 默认为全屏大小
	this.attrs.width = document.body.clientWidth;
	this.attrs.height = document.body.clientHeight;
	if (attrs !== undefined) {
		CavaE.GlobalObjet.Func.mantle(this.attrs, attrs);
	}
	// 1.创建外层DIV
	var shell = document.createElement('div');
	this.attrs.container.appendChild(shell);
	shell.id = this.ID;
	with (shell.style) {
		position = 'absolute';
		top = this.attrs.x;
		left = this.attrs.y;
		zIndex = this.attrs.z;
		width = this.attrs.width + 'px';
		height = this.attrs.height + 'px';
	}
	;
	// 是否显示
	this.displaying = true;	
	// 是否响应事件
	this.listening = true;
	// 是否已加入stage
	this.nodeStatus = true;

	this.stage = this;
	// 2.创建4个Canvas层,事件响应层,显示层：活跃层，稳定层，固定层
	this.layerIndex = 1000;
	this.eventLayer = new CavaE.Layer(this);
	this.activeLayer = new CavaE.Layer(this);
	this.animationLayer = new CavaE.Layer(this);
	this.negtiveLayer = new CavaE.Layer(this);	
	this.fixedLayer = new CavaE.Layer(this);
	
	// 事件堆栈
	this._event = new CavaE._Event(this);
	shell = null;
	// 刷新是否继续
	this.playing = false;
};
CavaE.Stage.prototype = {
	// 结构
	addWidget : function(node) {
		if (node.nodeStatus) {
			throw new Error('Widget already added to Stage');
		}		
		if (node.layer == 'fixed') {			
			this.fixedLayer._add(node);
		} else if (node.layer == 'negtive') {
			this.negtiveLayer._add(node);
		} else if (node.layer == 'active' || node.layer =='animation') {
			throw new Error(
					'Cannot add active Widget directly, active Widget must be actived from negtive layer.');
		} else {
			throw new Error('undefined layer!');
		}					
		node.stage = this.stage;
		node._registerEventObject();
	},
	removeWidget : function(node) {		
		if (node.layer == 'fixed') {
			this.fixedLayer._remove(node);
		} else if (node.layer == 'negtive') {
			this.negtiveLayer._remove(node);
		}			
		node.stage = undefined;
		node._unregisterEventObject();
	},	
	// 显示
	redrawFixedLayer : function() {
		this.fixedLayer.redraw();
	},
	redrawNegtiveLayer : function() {
		this.negtiveLayer.redraw();
	},
	_initialize : function() {
		this.redrawFixedLayer();
		this.redrawNegtiveLayer();
	},
	_animate : function() {
		var update = function(obj) {
			var obj = obj;
			return function() {
				if(obj.playing) {
					var children = obj.animationLayer._children;				
					obj.animationLayer.context.clearRect(0,0,obj.attrs.width,obj.attrs.height);
					for(var i=0,len=children.length;i<len;i++) {
						children[i].draw(obj.animationLayer.context);
					}
					setTimeout(update, obj.attrs.framing);
				}
			};
		}(this);
		setTimeout(update, this.attrs.framing);
	},
	// 事件
	ignoreKeyboardEvent : function() {
		this._event.KeyBoardListening = false;
	},
	ListenKeyboardEvent : function() {
		this._event.KeyBoardListening = true;
	},
	init : function() {		
		this._initialize();		
		this._event._listen();
	},
	play : function() {
		this.playing = true;
		this._animate();
	},
	stop : function() {
		this.playing = false;
	}

};
CavaE.GlobalObjet.Func.Extends(CavaE.Stage, CavaE.Container);
CavaE.GlobalObjet.Func.Extends(CavaE.Stage, CavaE.Widget);
/**
 * Layer 仅用于物理显示，与显示的层次没有关系
 */
CavaE.Layer = function(stage) {
	CavaE.Container.apply(this, []);
	this.stage = stage;
	// 是否显示
	this.displaying = true;	
	// 是否响应事件
	this.listening = true;
	// 是否已加入stage
	this.nodeStatus = true;
	// 创建LAYER的CANVAS元素
	var canvas = document.createElement('canvas');
	canvas.id = this.ID;
	this.context = canvas.getContext('2d');
	with (canvas.style) {
		position = 'absolute';
		top = 0;
		left = 0;
		zIndex = this.stage.layerIndex--;
	}
	canvas.width = stage.attrs.width;
	canvas.height = stage.attrs.height;
	var shell = document.getElementById(stage.ID);
	shell.appendChild(canvas);
	canvas = null;
	shell = null;
};
CavaE.Layer.prototype = {	
	redraw : function() {		
		var ctx = this.context;
		var children = this._children;
		var drawIndex = {num : 0};
		ctx.clearRect(0,0,this.stage.attrs.width,this.stage.attrs.height);
		for ( var i = 0, len = children.length; i < len; i++) {
			if (children[i].displaying) {
				children[i].draw(ctx,drawIndex);
			}
		}
	}
};
CavaE.GlobalObjet.Func.Extends(CavaE.Layer, CavaE.Container);