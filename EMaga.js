/**
 * pointObject {x: int Number,y:int Number} 
 */
/**
 * @constructor
 * @param options initializeParameters
 * 		Object DIV {leftTop:pointObject,width:int number,height:int number}
 * 		Object PAGE {width:int number,height:int number,pagespan:int number}
 * 		Object ANIMATE {framing:Paging Animation play frame,pagingTime:Paging Animation play duration}
 * @returns {EMaga}
 */

EMaga = function (options) {
	//outter DIV position parameters
	this.DIVPos = {
		leftTop : {x:0,y:0},  //leftTop point pointOjbect
		width : document.body.width,//default equal body width
		height : document.body.height//default equal body height
	};
	if(options !== undefined) {
		if(options.DIV !== undefined) {		
			CavaE.GlobalObject.Func.mantle(this.DIVPos,options.DIV);
		}
	}
	//left&rightPage Common position parameters
	this.PAGEPos = {
		pagespan : 0,//distance between left page and right page
		width : .4* this.DIVPos.width,//single page width default 40% body width
		height : .8* this.DIVPos.height//single page height default 80% body height			
	};
	if(options !== undefined) {
		if(options.PAGE !== undefined) {
			CavaE.GlobalObject.Func.mantle(this.PAGEPos,options.PAGE);
		}
	}
	//padding
	this.PAGEPos.paddingTop = (this.DIVPos.height - this.PAGEPos.height)/2;
	this.PAGEPos.paddingBottom = (this.DIVPos.height - this.PAGEPos.height)/2;
	this.PAGEPos.paddingLeft = (this.DIVPos.width - this.PAGEPos.width*2 - this.PAGEPos.pagespan)/2;
	this.PAGEPos.paddingRight = (this.DIVPos.width - this.PAGEPos.width*2 - this.PAGEPos.pagespan)/2;
	//book
	this.PAGEPos.leftTop = {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop};
	this.PAGEPos.rightTop = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width*2+this.PAGEPos.pagespan,y:this.PAGEPos.paddingTop};
	this.PAGEPos.leftBottom = {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop + this.PAGEPos.height};
	this.PAGEPos.rightBottom = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width*2+this.PAGEPos.pagespan,y:this.PAGEPos.paddingTop + this.PAGEPos.height};
	this.PAGEPos.middleTop = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width + this.PAGEPos.pagespan/2,y:this.PAGEPos.paddingTop};
	this.PAGEPos.middleBottom = {x:this.PAGEPos.paddingLeft + this.PAGEPos.width + this.PAGEPos.pagespan/2,y:this.PAGEPos.paddingTop + this.PAGEPos.height};
	//leftPage position
	this.leftPagePos = {
		leftTop : {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop},
		rightTop : {x:this.PAGEPos.paddingLeft + this.PAGEPos.width,y:this.PAGEPos.paddingTop},
		leftBottom : {x:this.PAGEPos.paddingLeft,y:this.PAGEPos.paddingTop + this.PAGEPos.height},
		rightBottom : {x:this.PAGEPos.paddingLeft + this.PAGEPos.width,y:this.PAGEPos.paddingTop + this.PAGEPos.height}
	};
	//rightPage position
	this.rightPagePos = {
		leftTop : {x:this.PAGEPos.rightTop.x - this.PAGEPos.width,y:this.PAGEPos.paddingTop},
		rightTop : {x:this.PAGEPos.rightTop.x,y:this.PAGEPos.paddingTop},
		leftBottom : {x:this.PAGEPos.rightTop.x - this.PAGEPos.width,y:this.PAGEPos.paddingTop + this.PAGEPos.height},
		rightBottom : {x:this.PAGEPos.rightTop.x,y:this.PAGEPos.paddingTop + this.PAGEPos.height}
	};
	this._pages = [];//array of all pages
	this._pageIndex = 0;//current page number of right page
	this.ANIMATE = {
		framing : 1000/60,//Paging Animation play frame
		pagingTime : 500 //Paging Animation play duration
	};
	if(options !== undefined) {
		if(options.ANIMATE !== undefined) {
			CavaE.GlobalObject.Func.mantle(this.ANIMATE,options.ANIMATE);
		}
	}
	//computing parameters
	this.A = undefined;//crosspoint with up down border
	this.B = undefined;//crosspoint with left right border
	this.M = undefined;//currrent ctrl point
	this._paging = false;//isPaing flag	
	this.shadow = {
		width : 200
	};
	this._shadow = undefined;
	this.animationID = undefined;
	this.currentCtrlPoint = undefined;
	var that = this;
	/**
	 * create stage object
	 */	
	this._stage = new CavaE.Stage({width:this.DIVPos.width,height:this.DIVPos.height,x:this.DIVPos.leftTop.x,y:this.DIVPos.leftTop.y});
	/**
	 * compute paging parameters
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
		//compute shadow effect
		var shadow = {};	
		if(x0 - x1 == 0) {
			var a = 0;
		} else {
			var a= Math.atan((y0-y1)/(x0-x1));	
		}		
		var xm = (x0+x1)/2;
		var ym = (y0+y1)/2;
		shadow.width = that.shadow.width - Math.abs(that.shadow.width*(x0 - that.PAGEPos.middleTop.x)/(that.PAGEPos.width+that.PAGEPos.pagespan/2));
		shadow.xg1 = xm + Math.cos(a)*shadow.width/2;
		shadow.yg1 = ym + Math.sin(a)*shadow.width/2;
		shadow.xg2 = xm - Math.cos(a)*shadow.width/2;
		shadow.yg2 = ym - Math.sin(a)*shadow.width/2;						
		return {xa:x1,ya:ya,xb:xb,yb:y1,yback:yback,xback:xback,sback:sback,shadow:shadow};
	};
	
	/**
	 * paging start
	 * 1.cancel current animation
	 * 2.set currentCtrlPoint equal to ctrlPointName
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
	 * Paging
	 * 
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
					that._shadow = result.shadow;
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
					that._shadow = result.shadow;
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
					that._shadow = result.shadow;
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
					that._shadow = result.shadow;
				}
				if(!that._paging) {			
					animationInit(event.target);
					that._paging = true;				
				}				
				that.rightPage.backPage.move(result.xback-that.PAGEPos.width - that.PAGEPos.paddingLeft - that.PAGEPos.pagespan,result.yback-that.PAGEPos.paddingTop);	
				that.rightPage.backPage.displayOptions.rotate = result.sback;
				break;
		};	
	};
	/**
	 * pagingRelease
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
	 * animationInit
	 */
	var animationInit = function (ctrlPoint) {
		var leftOrRight = undefined;
		switch (ctrlPoint.name) {
			case 'leftTop' :
				leftOrRight = true;
				that.pageShadow.point = that.leftPagePos.leftTop;
				break;
			case 'rightTop' :
				leftOrRight = false;
				that.pageShadow.point = that.rightPagePos.rightTop;
				break;
			case 'leftBottom' :
				leftOrRight = true;
				that.pageShadow.point = that.leftPagePos.leftBottom;
				break;
			case 'rightBottom' :
				leftOrRight = false;
				that.pageShadow.point = that.rightPagePos.rightBottom;
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
		//shadow init
		that.pageShadow.moveToActive();
		that.pageShadow.moveTop();
		that.pageShadow.displaying = true;
	};
	/**
	 * animation
	 * @param Object ctrlPoint 
	 * @param Object targetPosition 
	 * @param String pagingDirection 
	 */
	var animation = function (ctrlPoint,targetPosition,pagingDirection) {
		//set ctrl Point listening		
		for(var i=0,len=that._ctrlPoint._children.length;i<len;i++){
			that._ctrlPoint._children[i].listening = false;
		}
		ctrlPoint.listening =true;
		ctrlPoint.moveToAnimation();
		that.leftPage.moveToAnimation();
		that.rightPage.moveToAnimation();
		//move the ctrlPoint to target position	
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
			for(var i=0,len=that._ctrlPoint._children.length;i<len;i++){
				that._ctrlPoint._children[i].listening = true;
			}
			if(pagingDirection == 'next') {
				that.next(that._pageIndex+2);
			} else if(pagingDirection == 'previous'){
				that.next(that._pageIndex-2);				
			}
			if(that._pageIndex == that._pages.length || that._pageIndex+1 == that._pages.length) {
				that._rtPoint.listening =false;
				that._rbPoint.listening =false;
			} else if(that._pageIndex == 0) {
				that._ltPoint.listening =false;
				that._lbPoint.listening =false;
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
			
			//handle shadow
			that.pageShadow.backToNegtive();
			that.pageShadow.displaying = false;
			that._stage.negtiveLayer.redraw();
		};		
		that._stage.play();		
	};	
	/**
	 * draw ctrl point
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
	 * draw ctrl point boundingbox
	 */
	var ctrlPointBoundingBox = function (ctx,self) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(0,0,that.PAGEPos.width/20,0,2*Math.PI,false);		
		ctx.closePath();
		ctx.restore();
	};
	/**
	 * ctrl point dragBorder
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
	 * leftpage
	 */
	//container
	this.leftPage = new CavaE.Container();
	this.leftPage.move(this.leftPagePos.leftTop.x,this.leftPagePos.leftTop.y);	
	//leftpage currentpage	
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
	
	
	//leftPage backPage
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
	//leftPage bottomPage
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
		
	//rightPage
	//container
	this.rightPage = new CavaE.Container();
	this.rightPage.move(this.rightPagePos.leftTop.x,this.rightPagePos.leftTop.y);	
	// rightpage currentPage
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
	//rightPage backPage
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
	//rightPage bottomPage
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
	
	//blankPage
	this._blankPage = new CavaE.Widget();
	this._stage.init();
	//shadow
	this.pageShadow = new CavaE.Widget();
	this.pageShadow.addDrawFunc (function(ctx,self) {
		ctx.beginPath();
		ctx.moveTo(that.B.x,that.B.y);
		ctx.lineTo(that.M.x,that.M.y);
		ctx.lineTo(that.A.x,that.A.y);
		ctx.lineTo(self.point.x,self.point.y);	
		ctx.closePath();
		ctx.clip();
		ctx.beginPath();
		ctx.lineWidth = that._shadow.width;
		ctx.moveTo(that.B.x,that.B.y);
		ctx.lineTo(that.A.x,that.A.y);
		var gradient = ctx.createLinearGradient(that._shadow.xg1,that._shadow.yg1,that._shadow.xg2,that._shadow.yg2);
		gradient.addColorStop(0,'rgba(220,220,220,.2)');
		gradient.addColorStop(.5,'rgba(120,120,120,.2)');
		gradient.addColorStop(.51,'rgba(255,255,255,.2)');
		gradient.addColorStop(.53,'rgba(255,255,255,.2)');
		gradient.addColorStop(.54,'rgba(30,30,30,.2)');
		gradient.addColorStop(1,'rgba(180,150,150,.2)');
		ctx.strokeStyle = gradient;
		ctx.stroke();
		ctx.closePath();	
	});
	this.pageShadow.name = 'shadow';
	this.pageShadow.displaying = false;
	this._stage.add(this.pageShadow);
};
EMaga.prototype = {		
	addPage : function (page) {		
		this._pages.push(page);
		page.index = this._pages.length-1;	
	},
	next : function (index) {			
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