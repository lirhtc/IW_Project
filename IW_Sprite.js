// ======================================================================
// * IW_adwanSellection
// ======================================================================
function IW_Sprite_Select() {
    this.initialize.apply(this, arguments);
}

IW_Sprite_Select.prototype = Object.create(Sprite.prototype);
IW_Sprite_Select.prototype.constructor = IW_Sprite_Select;

IW_Sprite_Select.prototype.initialize = function(x,y,width,height,color) {
    Sprite.prototype.initialize.call(this);   
    this.bitmap = new Bitmap(48,48);
    this.colorm = 'rgba(2, 200, 2, 1)';
    this.x = x || 10;
    this.y = y || 10;
	this.height = height || 32;
	this.width = width || 32;
    this.time = 0;
    this.speed = 10;
    this.speedFactor = -1;
    this.lineWeight = 4;
    this.drawCursor();
};
IW_Sprite_Select.prototype.update = function() {	
	this.updateSpeed();
	this.alpha += this.speed*this.speedFactor; 
};
IW_Sprite_Select.prototype.hide = function() {	
	this.visible = false;
};
IW_Sprite_Select.prototype.show = function() {	
	this.visible = true;
};
IW_Sprite_Select.prototype.pause = function() {
    this.speed = 0;
	this.alpha = 250;
};
IW_Sprite_Select.prototype.drawCursor = function() {
	var width = this.width;
	var height = this.height;
    this.bitmap = new Bitmap (width,height);
    this.bitmap.fillRect(0, 0, this.bitmap.width, this.lineWeight, this.colorm);
    this.bitmap.fillRect(0, 0, this.lineWeight, this.bitmap.height, this.colorm);
    this.bitmap.fillRect(this.bitmap.width-this.lineWeight, this.lineWeight, this.lineWeight, this.bitmap.height-this.lineWeight, this.colorm);
    this.bitmap.fillRect(this.lineWeight, this.bitmap.height-this.lineWeight, this.bitmap.width-this.lineWeight, this.lineWeight, this.colorm);
};
IW_Sprite_Select.prototype.updateSpeed = function() {
	if(this.alpha >= 250){
		this.speedFactor = -1;
	}
	if(this.alpha <= 50){
		this.speedFactor = 1;
	}
};
IW_Sprite_Select.prototype.move = function(keys, values) {
    if (!Array.isArray(kyes))
    {
    	this[keys] = values;
    } 
    else
    {
    	for (var i = 0; i < keys.length; i++){
    		this[keys[i]] = values[i];
    	}
    }
};
//-----------------------------------------------------------------------------
// Sprite_Arrow
//
// The sprite for displaying a arrow.

function Sprite_Arrow() {
    this.initialize.apply(this, arguments);
}

Sprite_Arrow.prototype = Object.create(Sprite_Base.prototype);
Sprite_Arrow.prototype.constructor = Sprite_Arrow;

Sprite_Arrow.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.loadArrow();
    this._yCorrection = 50;
    this._correnctionEnable = 1;
    this.x = 100;
    this.y = 100;
    this._motionCount = 0;
};
Sprite_Arrow.prototype.loadArrow = function() {
    this.bitmap = ImageManager.loadSystem ('arrow',0);
};
Sprite_Arrow.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateMotionCount();
};
Sprite_Arrow.prototype.updateFrame = function() {
    //this.y = (this._correnctionEnable>50)*this._yCorrection + 100;
    this._correnctionEnable = 1- this._correnctionEnable;
    this.y = this._correnctionEnable*this._yCorrection + 100;
    this.setFrame(0,0,this.bitmap.width,this.bitmap.height);
};
Sprite_Arrow.prototype.isAnimationPlaying = function() {
    return true;
};
Sprite_Arrow.prototype.updateVisibility = function() {
    return true;
};
Sprite_Arrow.prototype.motionSpeed = function() {
    return 12;
};
Sprite_Arrow.prototype.updateMotionCount = function() {
    if (++this._motionCount >= this.motionSpeed()) {
        this.updateFrame();
        this._motionCount = 0;
    }
};

// -----------------------------
// The sprite class for tab in a tab-window
// -----------------------------

function Sprite_Tab() {
    this.initialize.apply(this, arguments);
}

Sprite_Tab.prototype = Object.create(Sprite.prototype);
Sprite_Tab.prototype.constructor = Sprite_Tab;
Sprite_Tab.prototype.initialize = function(width,height) {
    Sprite.prototype.initialize.call(this);
	this.tabWidth = width || 50;
	this.tabHeight = height || 30;
	this.bitmap = new Bitmap (width,height);
	this.loadBitmap();
	this.y = -height + 2
};

Sprite_Tab.prototype.loadBitmap = function() {
    this.tabBitmap = ImageManager.loadSystem ('Window_tab'); 
	this.tabBitmap.addLoadListener (function (){this.initializeTab()}.bind(this));
};

Sprite_Tab.prototype.initializeTab = function() {
	this.genrateTab();
};
Sprite_Tab.prototype.clearTab = function() {
	this.bitmap.clear();
	this.genrateTab();
};

Sprite_Tab.prototype.genrateTab = function() {
	this.height = this.tabHeight;
	this.width = this.tabWidth;
	var lineNum = Math.floor (this.height/20) + 1;
	var columNum = Math.floor (this.width/20) + 1;
	// process first line
	this.bitmap.blt (this.tabBitmap,0,193,this.width-8,this.height-6,4,6);
	for (var i=1; i<=columNum; i++){
		if (i===1){
			var sx = 97;
			var sy = 0;
			var sw = 20;
			var sh = 20;
			var tx = 0;
			var ty = 0;
		}
		else {
			var sx = i*20 < this.width ? 117 : 172;
			var sy = 0;
			var sw = 20;
			var sh = 20;
			var tx = i*20 < this.width ? (i-1)*20 : this.width-20;
			var ty = 0;
		}
		this.bitmap.blt(this.tabBitmap,sx,sy,sw,sh,tx,ty);
	}
	for (var i = 2; i<= lineNum ; i++){
		var ty = i*20 > this.height ? this.height-20 : (i-1)*20;
		// left side
		this.bitmap.blt (this.tabBitmap,97,20,20,20,0,ty);
		// right side
		this.bitmap.blt (this.tabBitmap,172,20,20,20,this.width-20,ty);
	}
};

// -----------------------------
// The sprite class for damage display
// -----------------------------

function Sprite_Damage() {
    this.initialize.apply(this, arguments);
}

Sprite_Damage.prototype = Object.create(Sprite.prototype);

Sprite_Damage.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this._duration = 90;
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
    this._damageBitmap = ImageManager.loadSystem('Damage');
	this.digitGap = 10;
	this.scaleX = 0.5;
	this.scaleY = 0.5;
};

Sprite_Damage.prototype.createDigits = function(baseRow, value) {
    var string = Math.abs(value).toString();
    var row = baseRow + (value < 0 ? 1 : 0);
    var w = this.digitWidth();
    var h = this.digitHeight();
    for (var i = 0; i < string.length; i++) {
        var sprite = this.createChildSprite(1+i*this.digitGap);
        var n = Number(string[i]);
        sprite.setFrame(n * w, row * h, w, h);
        sprite.x = (i - (string.length - 1) / 2) * w * this.scaleX;
    }
	this.show = true;
};

Sprite_Damage.prototype.createChildSprite = function(delay) {
    var sprite = new Sprite();
	sprite.visible = false;
    sprite.bitmap = this._damageBitmap;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 1;
    sprite.y = -40;
	sprite.stayCount = 0;
	sprite.scale._x = this.scaleX;
	sprite.scale._y = this.scaleY;
	sprite.delay = delay;
    this.addChild(sprite);
    return sprite;
};

Sprite_Damage.prototype.digitWidth = function() {
    return (this._damageBitmap ? this._damageBitmap.width / 10 : 0);
};

Sprite_Damage.prototype.digitHeight = function() {
    return (this._damageBitmap ? this._damageBitmap.height / 5 : 0);
};

Sprite_Damage.prototype.updateChild = function(sprite) {
    /*sprite.dy += 0.5;
    sprite.ry += sprite.dy;
    if (sprite.ry >= 0) {
        sprite.ry = 0;
        sprite.dy *= -0.6;
    }
    sprite.y = Math.round(sprite.ry);
    sprite.setBlendColor(this._flashColor);*/
	if (!sprite.visible && sprite.delay>0){
		sprite.delay--;
		if (sprite.delay<=0) {sprite.visible = true;}
	}
	if (sprite.visible && sprite.stayCount<=83){
		sprite.stayCount+=5;
		sprite.y = Math.sin(sprite.stayCount * Math.PI / 100) * this.digitHeight();
	}
	
};

Sprite_Damage.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (this._duration > 0) {
        this._duration--;
        for (var i = 0; i < this.children.length; i++) {
            this.updateChild(this.children[i]);
        }
    } else {
		this.alpha -= 0.05;
		if (this.alpha<=0) {
			this.remove();
		}
	}
    //this.updateFlash();
    //this.updateOpacity();
};

Sprite_Damage.prototype.remove = function() {
    var index = this.parent.children.indexOf (this);
	this.parent.children.splice(index,1);
};

// -----------------------------
// The sprite class for hp bar
// -----------------------------

function Sprite_HpBar() {
    this.initialize.apply(this, arguments);
}

Sprite_HpBar.prototype = Object.create(Sprite.prototype);

Sprite_HpBar.prototype.initialize = function() {
	Sprite_Base.prototype.initialize.call(this);
	this.anchor.x = 0.5;
	this.anchor.y = 1;
	this.creatBitmap(40,10);
};

Sprite_HpBar.prototype.creatBitmap = function(w,h) {
	this.bitmap = new Bitmap (w,h);
	var context = this.bitmap._context;
	context.lineWidth = 3;
	context.moveTo(0,0);
	context.strokeStyle = '#FF4500';
	context.strokeRect(0,0,w,h);
};

Sprite_HpBar.prototype.displayHpBar = function(currentHp,maxHp) {
	if (!maxHp || maxHp<=0){maxHp = 1;}
	var ratio = currentHp/maxHp;
	var w = this.bitmap.width;
	var h = this.bitmap.height;
	this.creatBitmap(w,h);
	var context = this.bitmap._context;
	context.fillStyle = '#FF4500';
	context.fillRect(0,0,Math.floor(w*ratio),h);
};
	
// -----------------------------
// The sprite class for frame effect index 1
// -----------------------------

function Sprite_FrameEffect_1() {
    this.initialize.apply(this, arguments);
}

Sprite_FrameEffect_1.prototype = Object.create(Sprite.prototype);

Sprite_FrameEffect_1.prototype.initialize = function() {
	Sprite.prototype.initialize.call(this);
	this.bitmap = ImageManager.loadSystem('windowSh');
	this.visible = false;
	this.frameStay = 0;
	this.frameIndex = 0;
};
Sprite_FrameEffect_1.prototype.update = function() {
    Sprite.prototype.update.call(this);
	this.updateFrameCount();
	this.updateFrame();
}
Sprite_FrameEffect_1.prototype.frameSpace = function() {
    return 2;
}
Sprite_FrameEffect_1.prototype.updateFrameCount = function() {
    this.frameStay++;
	if (this.frameStay >= this.frameSpace()){
		this.frameStay = 0;
		this.frameIndex = (this.frameIndex+1)%15;
	}
}
Sprite_FrameEffect_1.prototype.updateFrame = function() {
	var index = 14 - this.frameIndex;
    var x = (index % 5) * 300;
	var y = (Math.floor(index / 5)) * 128;
	this.setFrame(x,y,300,128);
}

// -----------------------------
// The sprite class for Victory
// -----------------------------


function Sprite_Victory() {
    this.initialize.apply(this, arguments);
}

Sprite_Victory.prototype = Object.create(Sprite.prototype);

Sprite_Victory.prototype.initialize = function() {
	Sprite.prototype.initialize.call(this);
	this.frame = new Sprite_FrameEffect_1();
	this.frame.visible = true;
	this.addChild(this.frame);
	this.setupContent();
	this.alpha = 1;
	this.stayCount = 0;
	this.x = 250;
	this.y = 50;
};

Sprite_Victory.prototype.setupContent = function() {
	this.bitmap = new Bitmap(300,128);
	this.bitmap.textColor = '#ff8d23';
	var y = (128 - this.bitmap.fontSize) /2;
	this.bitmap.fontSize = 36;
	this.bitmap.drawText('Victory!',0,y,300,24,'center');
};

Sprite_Victory.prototype.stayTime = function() {
	return 30;
};

Sprite_Victory.prototype.update = function() {
	Sprite.prototype.update.call(this);
	//this.updateStay();
};

Sprite_Victory.prototype.remove = function() {
	var index = this.parent.children.indexOf (this);
	this.parent.children.splice(index,1);
};

Sprite_Victory.prototype.updateStay = function() {
	if (this.alpha < 1 && this.stayCount == 0){
		this.alpha += 0.05;
	} else if (this.alpha >= 1 && this.stayCount <= this.stayTime()){
		this.stayCount += 1;
	} else if (this.alpha > 0 && this.stayCount >= this.stayTime()){
		this.alpha -= 0.02;
	} else if (this.alpha <= 0.01 && this.stayCount >= this.stayTime()){
		this.remove();
	}
};
