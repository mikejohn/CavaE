/**
 * @constructor
 * @param options 初始化参数 
 * 		Object DIV {leftTop:左上角绝对坐标,width:宽,height:高}
 * 		Object PAGE {width:页宽,height:页高,pagespan:左右页间距}
 * 		Object ANIMATE {framing:翻页动画效果帧率,pagingTime:动作完成后,动画播放时间}
 * @returns {EMaga}
 */

EMaga = function (options) {	
	//默认DIV是全屏显示
	this.DIVPos = {
		leftTop : {x:0,y:0},  //由用户指定,默认为屏幕左上顶点
		width : document.body.width,//由用户指定,默认为BODY宽
		height : document.body.height//由用户指定,默认为BODY高
	};
	if(options.DIV !== undefined) {		
		CavaE.GlobalObject.Func.mantle(this.DIVPos,options.DIV);
	}
	//默认PAGE大小是DIV的80%
	//默认两页中间距离为0
	this.PAGEPos = {
		pagespan : 0,//两页中间间距,由用户指定,默认为0
		width : .4* this.DIVPos.width,//由用户指定,默认为外层DIV宽的80%(含中间距)
		height : .8* this.DIVPos.height//由用户指定,默认为外层DIV高的80%			
	};
	if(options.PAGE !== undefined) {
		CavaE.GlobalObject.Func.mantle(this.PAGEPos,options.PAGE);
	}
	//一下参数由用户指定数据计算得出
	//四边间距
	this.PAGEPos.paddingTop = (this.DIVPos.height - this.PAGEPos.height)/2;
	this.PAGEPos.paddingBottom = (this.DIVPos.height - this.PAGEPos.height)/2;
	this.PAGEPos.paddingLeft = (this.DIVPos.width - this.PAGEPos.width*2 - this.PAGEPos.pagespan)/2;
	this.PAGEPos.paddingRight = (this.DIVPos.width - this.PAGEPos.width*2 - this.PAGEPos.pagespan)/2;
	//四角顶点
	this.PAGEPos.leftTop = {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop};
	this.PAGEPos.rightTop = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width*2+this.PAGEPos.pagespan,y:this.PAGEPos.paddingTop};
	this.PAGEPos.leftBottom = {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop + this.PAGEPos.height};
	this.PAGEPos.rightBottom = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width*2+this.PAGEPos.pagespan,y:this.PAGEPos.paddingTop + this.PAGEPos.height};
	//上下边中间点
	this.PAGEPos.middleTop = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width + this.PAGEPos.pagespan/2,y:this.PAGEPos.paddingTop};
	this.PAGEPos.middleBottom = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width + this.PAGEPos.pagespan/2,y:this.PAGEPos.paddingTop + this.PAGEPos.height};
	//左页顶点
	this.leftPagePos = {
		leftTop : {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop},
		rightTop : {x:this.PAGEPos.paddingLeft + this.PAGEPos.width,y:this.PAGEPos.paddingTop},
		leftBottom : {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop + this.PAGEPos.height},
		rightBottom : {x:this.PAGEPos.paddingLeft + this.PAGEPos.width,y:this.PAGEPos.paddingTop + this.PAGEPos.height}
	};
	//右页顶点
	this.rightPagePos = {
		leftTop : {x:this.PAGEPos.rightTop.x - this.PAGEPos.width,y:this.PAGEPos.paddingTop},
		rightTop : {x:this.PAGEPos.rightTop.x,y:this.PAGEPos.paddingTop},
		leftBottom : {x:this.PAGEPos.rightTop.x - this.PAGEPos.width,y:this.PAGEPos.paddingTop + this.PAGEPos.height},
		rightBottom : {x:this.PAGEPos.rightTop.x,y:this.PAGEPos.paddingTop + this.PAGEPos.height}
	};
	this._pages = [];//存放所有PAGE对象
	this._pageIndex = 0;//当前显示右页页码
	this.ANIMATE = {
		framing : 1000/60,//翻页动画播放帧率
		pagingTime : 500 //翻页动画播放时间
	};
	if(options.ANIMATE !== undefined) {
		CavaE.GlobalObject.Func.mantle(this.ANIMATE,options.ANIMATE);
	}
	//绘图参数
	this.A = undefined;//与左右边交点
	this.B = undefined;//与上下边交点
	this.M = undefined;//拖拽页角移动点
	this._paging = false;//是否正在翻页
	this.animationID = undefined;
	this.currentCtrlPoint = undefined;
	var that = this;
	/**
	 * 初始化舞台
	 */	
	this._stage = new CavaE.Stage({width:this.DIVPos.width,height:this.DIVPos.height,x:this.PAGEPos.leftTop.x,y:this.PAGEPos.leftTop.y});
	/**
	 * 翻页三角函数计算
	 */
	var computePaging = function (M) {
		var point = null;
		switch (M.target.name) {
			case 'leftTop' :
				point = that.PAGEPos.leftTop;
				break;
			case 'rightTop' :
				point = that.PAGEPos.rightTop;				
				break;
			case 'leftBottom' :
				point = that.PAGEPos.leftBottom;
				break;
			case 'rightBottom' :
				point = that.PAGEPos.rightBottom;				
				break;
			default :
				throw new Error('Unkown Drag Point');
		};		
		var x0 = M.target.anchor.x;
		var y0 = M.target.anchor.y;		
		var x1 = point.x;
		var y1 = point.y;
		var ya,xb,yback,xback,sback;
		if(y1 - y0 == 0) {
			ya = y1;
		} else {
			ya = (y1*y1 - y0*y0 -x0*x0 -x1*x1 + 2*x1*x0)/2/(y1-y0);
		}
		if(x1 - x0 == 0) {
			xb = x1;
			sback = 0;
		} else {
			xb  = (x1*x1 - x0*x0 - y0*y0 - y1*y1 + 2*y1*y0)/2/(x1-x0);
			switch (M.target.name) {
				case 'leftTop' :
					sback = Math.atan((ya-y0)/(x1-x0))/Math.PI*180+90;
					break;
				case 'leftBottom' :
					sback = Math.atan((ya-y0)/(x1-x0))/Math.PI*180-90;
					break;
				case 'rightBottom' : 
					sback = Math.atan((ya-y0)/(x1-x0))/Math.PI*180+90;
					break;
				case 'rightTop' :
					sback = Math.atan((ya-y0)/(x1-x0))/Math.PI*180-90;
					break;
			}			
		}
		
		if(x1 -x0 == 0 && ya -y0 == 0) {
			yback = 0;
			xback = 0;
		} else {
			switch (M.target.name) {			
				case 'leftTop' :
					var R = Math.abs(2*((that.PAGEPos.middleTop.y - (ya-y1)/(x1-xb)*that.PAGEPos.middleTop.x - ya +(ya-y1)/(x1-xb)*x1))/Math.sqrt(1+(ya-y1)/(x1-xb)*(ya-y1)/(x1-xb)));
					var a = Math.atan(-(x1-xb)/(ya-y1));					
					yback = that.PAGEPos.middleTop.y - Math.sin(a)*R;
					xback = that.PAGEPos.middleTop.x - Math.cos(a)*R;
					break;
				case 'leftBottom' :				
					var R = Math.abs(2*((that.PAGEPos.middleTop.y - (ya-y1)/(x1-xb)*that.PAGEPos.middleTop.x - ya +(ya-y1)/(x1-xb)*x1))/Math.sqrt(1+(ya-y1)/(x1-xb)*(ya-y1)/(x1-xb)));
					var a = Math.atan(-(x1-xb)/(ya-y1));
					yback = that.PAGEPos.middleTop.y - Math.sin(a)*R;					
					xback = that.PAGEPos.middleTop.x - Math.cos(a)*R;					
					break;
				case 'rightTop' :					
					xback = x0;
					yback = y0;
					break;
				case 'rightBottom' :
					yback = Number(y0)+ (ya-y0)/Math.sqrt( (ya-y0)*(ya-y0)+(x1-x0)*(x1-x0) )*that.PAGEPos.height;	
					xback = Number(x0)+ (x1-x0)/Math.sqrt( (ya-y0)*(ya-y0)+(x1-x0)*(x1-x0) )*that.PAGEPos.height;					
					break;				
			}			
		}
		return {xa:x1,ya:ya,xb:xb,yb:y1,yback:yback,xback:xback,sback:sback};
	};
	/**
	 * 4个翻页点翻页方法
	 */
	/**
	 * 翻页开始方法
	 * 1.判断翻页动画是否执行完成,如果没有完成结束翻页动画;
	 * 2.
	 */
	var pagingStart = function (event) {				
		if(that.animationID !== undefined) {
			clearInterval(that.animationID);
			that.animationID = undefined;
		} else {
			that.currentCtrlPoint = event.target.name;
		}
	};
	/**
	 * 翻页过程方法
	 * 1.需要知道用户拖拽的是哪个控制点
	 * 2.根据不同控制点得出相对点坐标
	 * 3.计算出A,B,M,BACK点坐标
	 */
	var Paging = function (event) {		
		var tempM = {x:event.target.anchor.x,y:event.target.anchor.y};		
		var result = computePaging(event);
		var tempA = {x:result.xa,y:result.ya};
		var tempB = {x:result.xb,y:result.yb};
		
		switch (event.target.name) {
			case 'leftTop' :				
				if(tempB.x >= that.PAGEPos.middleBottom.x) {					
					return;
				} else {
					that.M = {x:that._ltPoint.anchor.x,y:that._ltPoint.anchor.y};
					that.A = tempA;
					that.B = tempB;
				}
				if(!that._paging) {			
					animationInit(event.target);
					that._paging = true;
				}
				that.leftPage.backPage.move(result.xback-that.PAGEPos.paddingLeft,result.yback-that.PAGEPos.paddingTop);
				that.leftPage.backPage.displayOptions.rotate = result.sback;
				that.leftPage.backPage.displayOptions.offset = {x:that.PAGEPos.pagespan/2,y:0};
				break;
			case 'leftBottom' :				
				if(tempB.x >= that.PAGEPos.middleBottom.x) {					
					return;
				} else {
					that.M = {x:that._lbPoint.anchor.x,y:that._lbPoint.anchor.y};
					that.A = tempA;
					that.B = tempB;
				}
				if(!that._paging) {			
					animationInit(event.target);
					that._paging = true;
				}
				that.leftPage.backPage.displayOptions.rotate = result.sback;
				that.leftPage.backPage.move(result.xback-that.PAGEPos.paddingLeft,result.yback-that.PAGEPos.paddingTop);
				that.leftPage.backPage.displayOptions.offset = {x:that.PAGEPos.pagespan/2,y:0};
				break;
			case 'rightBottom' :					
				if(tempB.x <= that.PAGEPos.middleBottom.x) {					
					return;
				} else {
					that.M = {x:that._rbPoint.anchor.x,y:that._rbPoint.anchor.y};;
					that.A = tempA;
					that.B = tempB;
				}		
				if(!that._paging) {			
					animationInit(event.target);
					that._paging = true;				
				}
				that.rightPage.backPage.move(result.xback-that.PAGEPos.width - that.PAGEPos.paddingLeft - that.PAGEPos.pagespan,result.yback-that.PAGEPos.paddingTop);	
				that.rightPage.backPage.displayOptions.rotate = result.sback;
				break;
			case 'rightTop' :		
				if(tempB.x <= that.PAGEPos.middleBottom.x) {					
					return;
				} else {
					that.M = {x:that._rtPoint.anchor.x,y:that._rtPoint.anchor.y};
					that.A = tempA;
					that.B = tempB;
				}
				if(!that._paging) {			
					animationInit(event.target);
					that._paging = true;				
				}				
				that.rightPage.backPage.move(result.xback-that.PAGEPos.width - that.PAGEPos.paddingLeft - that.PAGEPos.pagespan,result.yback-that.PAGEPos.paddingTop);	
				that.rightPage.backPage.displayOptions.rotate = result.sback;
				break;
		};
//		var ctx = that._stage.eventLayer.context;
//		ctx.clearRect(0,0,that.DIVPos.width,that.DIVPos.height);
//		ctx.beginPath();
//		ctx.moveTo(that.M.x,that.M.y);
//		ctx.lineTo(that.A.x,that.A.y);
//		ctx.lineTo(that.B.x,that.B.y);
//		ctx.closePath();
//		ctx.stroke();		
	};
	/**
	 * 翻页结束
	 */
	var pagingRelease = function (event) {
		switch (event.target.name) {
			case 'leftTop' :
				if(event.target.anchor.x < that.PAGEPos.middleTop.x) {
					animation(event.target,that.PAGEPos.leftTop,'not');
				} else {
					animation(event.target,that.PAGEPos.rightTop,'previous');
				}
				break;
			case 'leftBottom' :
				if(event.target.anchor.x < that.PAGEPos.middleBottom.x) {
					animation(event.target,that.PAGEPos.leftBottom,'not');
				} else {
					animation(event.target,that.PAGEPos.rightBottom,'previous');
				}
				break;
			case 'rightTop' :
				if(event.target.anchor.x > that.PAGEPos.middleTop.x) {
					animation(event.target,that.PAGEPos.rightTop,'not');
				} else {
					animation(event.target,that.PAGEPos.leftTop,'next');
				}
				break;
			case 'rightBottom' :
				if(event.target.anchor.x > that.PAGEPos.middleBottom.x) {					
					animation(event.target,that.PAGEPos.rightBottom,'not');					
				} else {
					animation(event.target,that.PAGEPos.leftBottom,'next');
				}
				break;
			
		};		
	};
	/**
	 * 翻页动作初始化
	 */
	var animationInit = function (ctrlPoint) {
		var leftOrRight = undefined;
		switch (ctrlPoint.name) {
			case 'leftTop' :
				leftOrRight = true;
				break;
			case 'rightTop' :
				leftOrRight = false;
				break;
			case 'leftBottom' :
				leftOrRight = true;
				break;
			case 'rightBottom' :
				leftOrRight = false;
				break;
		}
		if(leftOrRight) {
			that.leftPage.currentPage.displayOptions.clipEnable = true;
			that.leftPage.backPage.displayOptions.clipEnable = true;
			that.leftPage.bottomPage.displayOptions.clipEnable = true;
			that.leftPage.currentPage.displaying = true;
			that.leftPage.backPage.displaying = true;					
			that.leftPage.bottomPage.displaying = true;	
			that.leftPage.moveToActive();					
			that.rightPage.currentPage.displayOptions.clipEnable = true;
			that.rightPage.currentPage.removeClipFunc('rightBack');
			that.rightPage.currentPage.addClipFunc(rightPagePreviousChipMethod,'rightBottom');
			that.rightPage.moveToActive();
			ctrlPoint.moveTop();			
		} else {
			that.rightPage.currentPage.displayOptions.clipEnable = true;
			that.rightPage.backPage.displayOptions.clipEnable = true;
			that.rightPage.bottomPage.displayOptions.clipEnable = true;					
			that.rightPage.currentPage.displaying = true;
			that.rightPage.backPage.displaying = true;
			that.rightPage.bottomPage.displaying = true;									
			that.rightPage.moveToActive();
			that.leftPage.currentPage.displayOptions.clipEnable = true;
			that.leftPage.currentPage.removeClipFunc('leftBack');
			that.leftPage.currentPage.addClipFunc(leftPageNextChipMethod,'leftBottom');					
			that.leftPage.moveToActive();
			ctrlPoint.moveTop();			
		}
	};
	/**
	 * 翻页动画
	 * @param Object ctrlPoint 翻页控制点
	 * @param Object targetPosition 动画目标坐标
	 * @param String pagingDirection 翻页方向
	 */
	var animation = function (ctrlPoint,targetPosition,pagingDirection) {
		//屏蔽其他控制点监听事件
		for(var i=0,len=that._ctrlPoint._children.length;i<len;i++){
			that._ctrlPoint._children[i].listening = false;
		}
		ctrlPoint.listening =true;
		ctrlPoint.moveToAnimation();
		that.leftPage.moveToAnimation();
		that.rightPage.moveToAnimation();
		//计算每帧动画步长		
		var vx = (targetPosition.x - ctrlPoint.anchor.x)/that.ANIMATE.pagingTime * that.ANIMATE.framing;
		var vy = (targetPosition.y - ctrlPoint.anchor.y)/that.ANIMATE.pagingTime * that.ANIMATE.framing;		
		var animate = function () {
			var newx = ctrlPoint.anchor.x+vx;
			var newy = ctrlPoint.anchor.y+vy;			
			switch (ctrlPoint.name) {
				case 'leftTop' :
					if(newx < that.PAGEPos.leftTop.x || newy < that.PAGEPos.leftTop.y) {						
						ctrlPoint.move(that.PAGEPos.leftTop.x,that.PAGEPos.leftTop.y);						
						animateEnd(pagingDirection);
						return;
					} else {					
						ctrlPoint.move(newx,newy);
					}
					break;
				case 'leftBottom' :
					if(newx < that.PAGEPos.leftBottom.x || newy > that.PAGEPos.leftBottom.y) {						
						ctrlPoint.move(that.PAGEPos.leftBottom.x,that.PAGEPos.leftBottom.y);
						animateEnd(pagingDirection);
						return;
					} else {						
						ctrlPoint.move(newx,newy);
					}
					break;
				case 'rightBottom' :
					if(newx > that.PAGEPos.rightBottom.x || newy > that.PAGEPos.rightBottom.y) {						
						ctrlPoint.move(that.PAGEPos.rightBottom.x,that.PAGEPos.rightBottom.y);
						animateEnd(pagingDirection);
						return;
					} else {
						ctrlPoint.move(newx,newy);
					}
					break;
				case 'rightTop' :
					if(newx > that.PAGEPos.rightTop.x || newy < that.PAGEPos.rightTop.y) {						
						ctrlPoint.move(that.PAGEPos.rightTop.x,that.PAGEPos.rightTop.y);
						animateEnd(pagingDirection);
						return;
					} else {
						ctrlPoint.move(newx,newy);
					}					
					break;									
			};			
			
			var event = {
				x : ctrlPoint.anchor.x,
				y : ctrlPoint.anchor.y,
				target : ctrlPoint
			};
			Paging(event);
			that._stage.activeLayer.redraw();					
		};		
		that.animationID = setInterval(animate,that.ANIMATE.framing);
		
		var animateEnd = function(pagingDirection) {
			that._stage.stop();
			clearInterval(that.animationID);
			that.animationID = undefined;			
			that._paging = false;
			//console.log('animateEnd');			
			for(var i=0,len=that._ctrlPoint._children.length;i<len;i++){
				that._ctrlPoint._children[i].listening = true;
			}
			if(pagingDirection == 'next') {
				that.next(that._pageIndex+2);
			} else if(pagingDirection == 'previous'){
				that.next(that._pageIndex-2);				
			}
			that.rightPage.currentPage.displayOptions.clipEnable = false;
			that.rightPage.backPage.displayOptions.clipEnable = false;
			that.rightPage.bottomPage.displayOptions.clipEnable = false;					
			that.rightPage.currentPage.displaying = true;
			that.rightPage.backPage.displaying = false;
			that.rightPage.bottomPage.displaying = false;	
			that.leftPage.currentPage.displayOptions.clipEnable = false;
			that.leftPage.backPage.displayOptions.clipEnable = false;
			that.leftPage.bottomPage.displayOptions.clipEnable = false;
			that.leftPage.currentPage.displaying = true;
			that.leftPage.backPage.displaying = false;					
			that.leftPage.bottomPage.displaying = false;
			
			that.leftPage.currentPage.removeClipFunc('leftBottom');
			that.leftPage.currentPage.addClipFunc(leftPagePreviousChipMethod,'leftBack');
			that.rightPage.currentPage.removeClipFunc('rightBottom');
			that.rightPage.currentPage.addClipFunc(rightPageNextChipMethod,'rightBack');
			ctrlPoint.backToNegtive();
			that.leftPage.backToNegtive();
			that.rightPage.backToNegtive();			
			that._stage.negtiveLayer.redraw();
		};		
		that._stage.play();		
	};	
	/**
	 * 默认控制点画法
	 */
	var ctrlPointDrawing = function (ctx,self) {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(80,80,80,.35)';
		ctx.arc(0,0,that.PAGEPos.width/20,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	};	
	/**
	 * 默认控制点包围盒方法
	 */
	var ctrlPointBoundingBox = function (ctx,self) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(0,0,that.PAGEPos.width/20,0,2*Math.PI,false);		
		ctx.closePath();
		ctx.restore();
	};
	/**
	 * 拖拽范围
	 */
	var dragBorder = {
		top : this.PAGEPos.leftTop.y+1,
		bottom : this.PAGEPos.leftBottom.y-1,
		left : this.PAGEPos.leftTop.x+1,
		right : this.PAGEPos.rightTop.x-1
	};
	
	this._ctrlPoint = new CavaE.Container();	
	this._ltPoint = new CavaE.Widget();
	this._ltPoint.move(this.PAGEPos.leftTop.x, this.PAGEPos.leftTop.y);
	this._ltPoint.name = 'leftTop';	
	this._ltPoint.addDrawFunc(ctrlPointDrawing);
	this._ltPoint.setEventBoundingBox(ctrlPointBoundingBox);
	this._ltPoint.dragOptions.dragBorder = dragBorder;	
	this._ltPoint.on('MOUSEDRAG');
	this._ltPoint.on('MOUSEDRAGSTART', pagingStart);
	this._ltPoint.on('MOUSEDRAGING', Paging);
	this._ltPoint.on('MOUSEDROP',pagingRelease);	
	this._ctrlPoint.add(this._ltPoint);
	//
	this._rtPoint = new CavaE.Widget();
	this._rtPoint.move(this.PAGEPos.rightTop.x, this.PAGEPos.rightTop.y);
	this._rtPoint.name = 'rightTop';	
	this._rtPoint.addDrawFunc(ctrlPointDrawing);
	this._rtPoint.setEventBoundingBox(ctrlPointBoundingBox);	
	this._rtPoint.dragOptions.dragBorder = dragBorder;
	this._rtPoint.on('MOUSEDRAG');
	this._rtPoint.on('MOUSEDRAGSTART', pagingStart);
	this._rtPoint.on('MOUSEDRAGING', Paging);
	this._rtPoint.on('MOUSEDROP',pagingRelease);		
	this._ctrlPoint.add(this._rtPoint);
	//
	this._lbPoint = new CavaE.Widget();
	this._lbPoint.move(this.PAGEPos.leftBottom.x, this.PAGEPos.leftBottom.y);
	this._lbPoint.name = 'leftBottom';	
	this._lbPoint.addDrawFunc(ctrlPointDrawing);
	this._lbPoint.setEventBoundingBox(ctrlPointBoundingBox);
	this._lbPoint.dragOptions.dragBorder = dragBorder;
	this._lbPoint.on('MOUSEDRAG');
	this._lbPoint.on('MOUSEDRAGSTART', pagingStart);
	this._lbPoint.on('MOUSEDRAGING', Paging);
	this._lbPoint.on('MOUSEDROP',pagingRelease);		
	this._ctrlPoint.add(this._lbPoint);
	//
	this._rbPoint = new CavaE.Widget();
	this._rbPoint.name = 'rightBottom';
	this._rbPoint.move(this.PAGEPos.rightBottom.x, this.PAGEPos.rightBottom.y);
	this._rbPoint.addDrawFunc(ctrlPointDrawing);
	this._rbPoint.setEventBoundingBox(ctrlPointBoundingBox);
	this._rbPoint.dragOptions.dragBorder = dragBorder;
	this._rbPoint.on('MOUSEDRAG');
	this._rbPoint.on('MOUSEDRAGSTART', pagingStart);
	this._rbPoint.on('MOUSEDRAGING', Paging);
	this._rbPoint.on('MOUSEDROP',pagingRelease); 
	this._ctrlPoint.add(this._rbPoint);
	
	this._stage.add(this._ctrlPoint);
	/**
	 * 左页
	 */
	//左边的页
	this.leftPage = new CavaE.Container();
	this.leftPage.move(this.leftPagePos.leftTop.x,this.leftPagePos.leftTop.y);	
	//左页的内容
	//左页当前页
	this.leftPage.currentPage = new CavaE.Container();
	var leftPagePreviousChipMethod = function (ctx) {		
		switch (that.currentCtrlPoint) {
			case 'leftBottom' :
				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(that.PAGEPos.width,0);
				ctx.lineTo(that.PAGEPos.width,that.PAGEPos.height);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft,that.A.y-that.PAGEPos.paddingTop);								
				ctx.lineTo(0,0);
				ctx.closePath();
				break;
			case 'leftTop' :
				ctx.beginPath();
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.PAGEPos.width,0);
				ctx.lineTo(that.PAGEPos.width,that.PAGEPos.height);
				ctx.lineTo(0,that.PAGEPos.height);
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft,that.A.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);
				ctx.closePath();								
				break;
		}		
		ctx.clip();
	};
	var leftPageNextChipMethod = function (ctx) {		
		switch (that.currentCtrlPoint) {
			case 'rightBottom' :
				ctx.beginPath();
				ctx.lineTo(0,0);
				ctx.lineTo(that.PAGEPos.width,0);
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft,that.A.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);								
				ctx.lineTo(that.PAGEPos.width,that.PAGEPos.height);
				ctx.lineTo(0,that.PAGEPos.height);
				ctx.closePath();
				break;
			case 'rightTop' :				
				ctx.beginPath();
				ctx.lineTo(0,0);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);				
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft,that.A.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.PAGEPos.width,that.PAGEPos.height);
				ctx.lineTo(0,that.PAGEPos.height);
				ctx.closePath();								
				break;
		}		
		ctx.clip();
	};
	this.leftPage.currentPage.addClipFunc(leftPagePreviousChipMethod,'leftBack');
	this.leftPage.add(this.leftPage.currentPage);
	
	
	//左页背页
	this.leftPage.backPage = new CavaE.Container();
	this.leftPage.backPage.displaying = false;
	this.leftPage.backPage.addClipFunc(function (ctx) {		
		ctx.beginPath();						
		ctx.moveTo(that.A.x - that.PAGEPos.paddingLeft,that.A.y-that.PAGEPos.paddingTop);
		ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft,that.M.y-that.PAGEPos.paddingTop);
		ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);			
		ctx.closePath();		
		ctx.clip();
	});
	this.leftPage.add(this.leftPage.backPage);
	//左页底页
	this.leftPage.bottomPage = new CavaE.Container();
	this.leftPage.bottomPage.displaying = false;
	this.leftPage.bottomPage.addClipFunc(function (ctx) {		
		ctx.beginPath();						
		ctx.moveTo(that.A.x - that.PAGEPos.paddingLeft,that.A.y-that.PAGEPos.paddingTop);			
		ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);
		ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft,that.B.y-that.PAGEPos.paddingTop);
		ctx.closePath();		
		ctx.clip();
	});	
	this.leftPage.add(this.leftPage.bottomPage);		
	this._stage.add(this.leftPage);
		
	//右边的页
	this.rightPage = new CavaE.Container();
	this.rightPage.move(this.rightPagePos.leftTop.x,this.rightPagePos.leftTop.y);	
	//右页的内容
	//右页当前页
	
	var rightPageNextChipMethod = function (ctx) {		
		switch (that.currentCtrlPoint) {
			case 'rightBottom' :				
				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(that.PAGEPos.width,0);			
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.A.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.B.y-that.PAGEPos.paddingTop);				
				ctx.lineTo(0,that.PAGEPos.height);
				ctx.closePath();				
				break;
			case 'rightTop' :
				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.B.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.A.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.PAGEPos.width,that.PAGEPos.height);
				ctx.lineTo(0,that.PAGEPos.height);				
				ctx.closePath();
				break;
		}
		ctx.clip();
	};
	var rightPagePreviousChipMethod = function (ctx) {		
		switch (that.currentCtrlPoint) {
			case 'leftBottom' :
				ctx.beginPath();						
				ctx.moveTo(0,0);
				ctx.lineTo(that.PAGEPos.width,0);
				ctx.lineTo(that.PAGEPos.width,that.PAGEPos.height);
				ctx.lineTo(0,that.PAGEPos.height);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.B.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.A.y-that.PAGEPos.paddingTop);								
				ctx.lineTo(0,0);		
				ctx.closePath();
				break;
			case 'leftTop' :
				ctx.beginPath();						
				ctx.moveTo(0,0);
				ctx.lineTo(that.PAGEPos.width,0);
				ctx.lineTo(that.PAGEPos.width,that.PAGEPos.height);
				ctx.lineTo(0,that.PAGEPos.height);
				ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.A.y-that.PAGEPos.paddingTop);				
				ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.M.y-that.PAGEPos.paddingTop);
				ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.B.y-that.PAGEPos.paddingTop);								
				ctx.lineTo(0,0);		
				ctx.closePath();
				break;
		}				
		ctx.clip();
	};
	this.rightPage.currentPage = new CavaE.Container();
	this.rightPage.currentPage.addClipFunc(rightPageNextChipMethod,'rightBack');
	this.rightPage.add(this.rightPage.currentPage);
	//右页背页
	this.rightPage.backPage = new CavaE.Container();
	this.rightPage.backPage.displaying = false;
	this.rightPage.backPage.addClipFunc(function (ctx) {
		ctx.beginPath();						
		ctx.moveTo(that.A.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.A.y-that.PAGEPos.paddingTop);
		ctx.lineTo(that.M.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.M.y-that.PAGEPos.paddingTop);
		ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.B.y-that.PAGEPos.paddingTop);			
		ctx.closePath();
		ctx.clip();
	});
	this.rightPage.add(this.rightPage.backPage);
	//右页底页
	this.rightPage.bottomPage = new CavaE.Container();
	this.rightPage.bottomPage.displaying = false;
	this.rightPage.bottomPage.addClipFunc(function (ctx) {		
		ctx.beginPath();						
		ctx.moveTo(that.A.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.A.y-that.PAGEPos.paddingTop);			
		ctx.lineTo(that.B.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.B.y-that.PAGEPos.paddingTop);
		ctx.lineTo(that.A.x - that.PAGEPos.paddingLeft - that.PAGEPos.width - that.PAGEPos.pagespan,that.B.y-that.PAGEPos.paddingTop);
		ctx.closePath();		
		ctx.clip();
	});
	this.rightPage.add(this.rightPage.bottomPage);		
	this._stage.add(this.rightPage);	
	
	//空白页
	this._blankPage = new CavaE.Widget();
	this._stage.init();
};
EMaga.prototype = {		
	addPage : function (page) {		
		this._pages.push(page);
		page.index = this._pages.length-1;	
	},
	next : function (index) {	
		if(index == this._pages.length || index+1 == this._pages.length) {
			this._rtPoint.listening =false;
			this._rbPoint.listening =false;
		} else if(index == 0) {
			this._ltPoint.listening =false;
			this._lbPoint.listening =false;
		}
		this._clearPage(this.rightPage.currentPage);
		this._clearPage(this.rightPage.backPage);
		this._clearPage(this.rightPage.bottomPage);
		this._clearPage(this.leftPage.currentPage);
		this._clearPage(this.leftPage.backPage);
		this._clearPage(this.leftPage.bottomPage);		
		if(this._pages[index] === undefined) {
			this.rightPage.currentPage.add(this._blankPage);
			this._blankPage._nodeStatus = false;
		} else {
			this.rightPage.currentPage.add(this._pages[index]);
		}
		if(this._pages[index+1] === undefined) {
			this.rightPage.currentPage.add(this._blankPage);
			this._blankPage._nodeStatus = false;
		} else {
			this.rightPage.backPage.add(this._pages[index+1]);
		}
		if(this._pages[index+2] === undefined) {
			this.rightPage.currentPage.add(this._blankPage);
			this._blankPage._nodeStatus = false;
		} else {
			this.rightPage.bottomPage.add(this._pages[index+2]);
		}
		
		if(this._pages[index-1] === undefined) {
			this.leftPage.currentPage.add(this._blankPage);
			this._blankPage._nodeStatus = false;
		} else {
			this.leftPage.currentPage.add(this._pages[index-1]);
		}
		if(this._pages[index-2] === undefined) {
			this.leftPage.backPage.add(this._blankPage);
			this._blankPage._nodeStatus = false;
		} else {
			this.leftPage.backPage.add(this._pages[index-2]);
		}
		if(this._pages[index-3] === undefined) {
			this.leftPage.bottomPage.add(this._blankPage);
			this._blankPage._nodeStatus = false;
		} else {
			this.leftPage.bottomPage.add(this._pages[index-3]);
		}
		this._stage.negtiveLayer.redraw();
		this._pageIndex = index;
	},
	_clearPage : function (Page){
		for(var i=0;i<Page._children.length;) {			
			Page.remove(Page._children[i]);
		}		
	}			
};