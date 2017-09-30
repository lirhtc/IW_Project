function IW_Window_Selectable() {
	this.initialize.apply(this, arguments);
}

IW_Window_Selectable.prototype = Object.create(Window.prototype);
IW_Window_Selectable.prototype.constructor = IW_Window_Selectable;

IW_Window_Selectable.prototype.initialize = function (x, y, width, height) {
	Window.prototype.initialize.call(this, x, y, width, height);
	this.loadWindowskin();
	this.move(x, y, width, height);
	this.updatePadding();
	/*this.updateBackOpacity();
	this.updateTone();
	this.createContents();*/
	this.createCursor();
	this._opening = false;
	this._closing = false;
	this._handlers = {};
	this._stayCount = 0;
	this._index = -1;
	this._iconWidth = 32;
	this._iconHeight = 32;
	this._faceWidth = 144;
	this._faceHeight = 144;
	this.open = true;

};

IW_Window_Selectable.prototype.standardFontSize = function () {
	return 28;
};

IW_Window_Selectable.prototype.standardPadding = function () {
	return 18;
};

IW_Window_Selectable.prototype.textPadding = function () {
	return 6;
};

IW_Window_Selectable.prototype.standardBackOpacity = function () {
	return 192;
};

IW_Window_Selectable.prototype.lineHeight = function () {
	return 36;
};

IW_Window_Selectable.prototype.loadWindowskin = function () {
	this.windowskin = ImageManager.loadSystem('Window');
};

IW_Window_Selectable.prototype.updatePadding = function () {
	this.padding = this.standardPadding();
};

IW_Window_Selectable.prototype.updateBackOpacity = function () {
	this.backOpacity = this.standardBackOpacity();
};

IW_Window_Selectable.prototype.contentsWidth = function () {
	return this.width - this.standardPadding() * 2;
};

IW_Window_Selectable.prototype.contentsHeight = function () {
	return this.height - this.standardPadding() * 2;
};

IW_Window_Selectable.prototype.createCursor = function () {
	this._cursor = new IW_Sprite_Select(0, 0, 0, 0, 'rgba(0,255,0,1)');
	this.addChild(this._cursor);
};

IW_Window_Selectable.prototype.setCursorSize = function (width, height) {
	this._cursor.width = width;
	this._cursor.height = height;
	this._cursor.drawCursor();
};

IW_Window_Selectable.prototype.setCursorPosition = function (x, y) {
	this._cursor.x = x;
	this._cursor.y = y;
	this._cursor.drawCursor();
};

IW_Window_Selectable.prototype.hide = function () {
	this.visible = false;
	this._cursor.hide();
};

IW_Window_Selectable.prototype.show = function () {
	this.visible = true;
	this._cursor.show();
};

IW_Window_Selectable.prototype.index = function () {
	return this._index;
};

IW_Window_Selectable.prototype.activate = function (x, y) {
	this.active = true;
};

IW_Window_Selectable.prototype.deactivate = function (x, y) {
	this.active = false;
	this._cursor.pause();
};

IW_Window_Selectable.prototype.setHandler = function (symbol, method) {
	this._handlers[symbol] = method;
};

IW_Window_Selectable.prototype.isHandled = function (symbol) {
	return !!this._handlers[symbol];
};

IW_Window_Selectable.prototype.callHandler = function (symbol) {
	if (this.isHandled(symbol)) {
		this._handlers[symbol]();
	}
};

IW_Window_Selectable.prototype.isCursorMovable = function () {
	return (this.acitve && this._cursor.visible);
};

IW_Window_Selectable.prototype.isOpenAndActive = function () {
	return (this.active && this.open);
};

IW_Window_Selectable.prototype.update = function () {
	Window.prototype.update.call(this);
	this.processCursorMove();
	this.processHandling();
	this.processWheel();
	this.processTouch();
	this._stayCount++;
};

IW_Window_Selectable.prototype.processCursorMove = function () {
	if (this.isCursorMovable()) {
		var lastIndex = this.index();
		if (Input.isRepeated('down')) {
			this.cursorDown(Input.isTriggered('down'));
		}
		if (Input.isRepeated('up')) {
			this.cursorUp(Input.isTriggered('up'));
		}
		if (Input.isRepeated('right')) {
			this.cursorRight(Input.isTriggered('right'));
		}
		if (Input.isRepeated('left')) {
			this.cursorLeft(Input.isTriggered('left'));
		}	
		if (this.index() !== lastIndex) {
			SoundManager.playCursor();
		}
	}
};

IW_Window_Selectable.prototype.scrollDown = function () {
};

IW_Window_Selectable.prototype.scrollUp = function () {
};

IW_Window_Selectable.prototype.processWheel = function () {
	if (this.isOpenAndActive()) {
		var threshold = 20;
		if (TouchInput.wheelY >= threshold) {
			this.scrollDown();
		}
		if (TouchInput.wheelY <= -threshold) {
			this.scrollUp();
		}
	}
};

IW_Window_Selectable.prototype.isTouchedInsideFrame = function () {
	var x = this.canvasToLocalX(TouchInput.x);
	var y = this.canvasToLocalY(TouchInput.y);	
	return x >= 0 && y >= 0 && x < this.width && y < this.height;
};

IW_Window_Selectable.prototype.processTouch = function () {
	if (this.isOpenAndActive()) {
		if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
			this._touching = true;
			this.onTouch(true);
		} else if (TouchInput.isCancelled()) {
			if (this.isCancelEnabled()) {
				this.processCancel();
			}
		}
		if (this._touching) {
			if (TouchInput.isPressed()) {
				this.onTouch(false);
			} else {
				this._touching = false;
			}
		}
	} else {
		this._touching = false;
	}
};
IW_Window_Selectable.prototype.onTouch = function (triggered) {
	var lastIndex = this.index();
	var x = this.canvasToLocalX(TouchInput.x);
	var y = this.canvasToLocalY(TouchInput.y);
	var hitIndex = this.hitTest(x, y);
	if (hitIndex >= 0) {
		if (hitIndex === this.index()) {
			if (triggered && this.isTouchOkEnabled()) {
				this.processOk();
			}
		} else if (this.isCursorMovable()) {
			this.select(hitIndex);
		}
	} else if (this._stayCount >= 10) {
		if (y < this.padding) {
			this.cursorUp();
		} else if (y >= this.height - this.padding) {
			this.cursorDown();
		}
	}
	if (this.index() !== lastIndex) {
		SoundManager.playCursor();
	}
};
IW_Window_Selectable.prototype.hitTest = function (x, y) {
	if (this.isContentsArea(x, y)) {
		var cx = x - this.padding;
		var cy = y - this.padding;
		var cursorIndex = this.findCursorIndex (x,y);
		return cursorIndex;
	}
	return -1;
};
IW_Window_Selectable.prototype.findCursorIndex = function (x, y) {
	return 1;
};
IW_Window_Selectable.prototype.isContentsArea = function (x, y) {
	var left = this.padding;
	var top = this.padding;
	var right = this.width - this.padding;
	var bottom = this.height - this.padding;
	return (x >= left && y >= top && x < right && y < bottom);
};

IW_Window_Selectable.prototype.isTouchOkEnabled = function () {
	return this.isOkEnabled();
};
IW_Window_Selectable.prototype.cursorDown = function (wrap) {};

IW_Window_Selectable.prototype.cursorUp = function (wrap) {};

IW_Window_Selectable.prototype.cursorRight = function (wrap) {};

IW_Window_Selectable.prototype.cursorLeft = function (wrap) {};

IW_Window_Selectable.prototype.cursorPagedown = function () {};

IW_Window_Selectable.prototype.cursorPageup = function () {};

IW_Window_Selectable.prototype.processHandling = function () {
	if (this.isOpenAndActive()) {
		if (this.isOkEnabled() && this.isOkTriggered()) {
			this.processOk();
		} else if (this.isCancelEnabled() && this.isCancelTriggered()) {
			this.processCancel();
		} else if (this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
			this.processPagedown();
		} else if (this.isHandled('pageup') && Input.isTriggered('pageup')) {
			this.processPageup();
		}
	}
};
IW_Window_Selectable.prototype.isOkEnabled = function () {
	return this.isHandled('ok');
};

IW_Window_Selectable.prototype.isCancelEnabled = function () {
	return this.isHandled('cancel');
};

IW_Window_Selectable.prototype.isOkTriggered = function () {
	return Input.isRepeated('ok');
};

IW_Window_Selectable.prototype.isCancelTriggered = function () {
	return Input.isRepeated('cancel');
};

IW_Window_Selectable.prototype.processOk = function () {
	if (this.isCurrentItemEnabled()) {
		this.playOkSound();
		this.updateInputData();
		this.deactivate();
		this.callOkHandler();
	} else {
		this.playBuzzerSound();
	}
};

IW_Window_Selectable.prototype.processCancel = function () {
	this.callCancelHandler();
};

IW_Window_Selectable.prototype.playOkSound = function () {
	SoundManager.playOk();
};

IW_Window_Selectable.prototype.playBuzzerSound = function () {
	SoundManager.playBuzzer();
};
IW_Window_Selectable.prototype.callCancelHandler = function () {
	this.callHandler('cancel');
};

IW_Window_Selectable.prototype.processPageup = function () {
	SoundManager.playCursor();
	this.updateInputData();
	this.deactivate();
	this.callHandler('pageup');
};

IW_Window_Selectable.prototype.processPagedown = function () {
	SoundManager.playCursor();
	this.updateInputData();
	this.deactivate();
	this.callHandler('pagedown');
};

IW_Window_Selectable.prototype.updateInputData = function () {
	Input.update();
	TouchInput.update();
};
IW_Window_Selectable.prototype.updateInputData = function () {
	Input.update();
	TouchInput.update();
};
IW_Window_Selectable.prototype.select = function (index) {
	if (index >= 0) {
		this._index = index;
		this.updateCursor();
		console.log ("origin select function");
	} else {
		this.deselect();
	}
};
IW_Window_Selectable.prototype.deselect = function () {
	this._index = -1;
	this._cursor.hide();
};
IW_Window_Selectable.prototype.updateCursor = function () {
	var cursorRec = this.getCursorRec();
	this.setCursorPosition(cursorRec.x, cursorRec.y);
	this.setCursorSize(cursorRec.width, cursorRec.height);
};
IW_Window_Selectable.prototype.getCursorRec = function (index) {
	var index = this.index();
	var cursorRec = {
		"x": 0,
		"y": 0,
		"width": 32,
		"height": 32,
	}
	return cursorRec;
};

IW_Window_Selectable.prototype.canvasToLocalX = function(x) {
    var node = this;
    while (node) {
        x -= node.x;
        node = node.parent;
    }
    return x;
};

IW_Window_Selectable.prototype.canvasToLocalY = function(y) {
    var node = this;
    while (node) {
        y -= node.y;
        node = node.parent;
    }
    return y;
};
//*******************************
// Tab Window class
//*******************************
function IW_Window_Tab() {
	this.initialize.apply(this, arguments);
};

IW_Window_Tab.prototype = Object.create(IW_Window_Selectable.prototype);
IW_Window_Tab.prototype.constructor = IW_Window_Tab;

IW_Window_Tab.prototype.initialize = function (x, y, width, height, tabWidth, tabHeight, numTab) {
	IW_Window_Selectable.prototype.initialize.call(this, x, y, width, height);
	var x = x || 0;
	var y = y || 0;
	var width = width || 0;
	var height = height || 0;
	var tabWidth = tabWidth || 50;
	var tabHeight = tabHeight || 30;
	this.numTab = numTab || 1; //total num of tabs
	this.tabNum = 1;// current tab selected
	this.tabOffsetX = 10;
	this.creatTabs(tabWidth, tabHeight, numTab);
	this.setupTabPositions(tabWidth);
	this.move(x, y, width, height);
	this.initializeContents(width, height);
};

IW_Window_Tab.prototype.loadWindowskin = function () {
	this.windowskin = ImageManager.loadSystem('Window_tab');
	this.windowskin.addLoadListener(function () {}
		.bind(this));
};

IW_Window_Tab.prototype.defaultFontSize = function () {
	return 18;
};

IW_Window_Tab.prototype.initializeContents = function (width, height) {
	var num = this.numTab;
	this.contentsBitmaps = [];
	for (var i = 0; i < num; i++) {
		var bitmap = new Bitmap(width, height);
		this.contentsBitmaps.push(bitmap);
	}
};

IW_Window_Tab.prototype.fillBackGround = function (width, height) {
	var rowNum = Math.floor(height / 40) + 1;
	var columNum = Math.floor(width / 40) + 1;
	var bitmap = new Bitmap(width, height);
	for (var i = 0; i < rowNum; i++) {
		for (var j = 0; j < columNum; j++) {
			var sx = 0;
			var sy = 194;
			var sw = 40;
			var sh = 40;
			var tx = (i + 1) * 40 > height ? height - 40 : i * 40;
			var ty = (j + 1) * 40 > width ? width - 40 : j * 40;
			bitmap.blt(this.windowskin, sx, sy, sw, sh, tx, ty);
		}
	}
	return bitmap;
};

IW_Window_Tab.prototype.creatTabs = function (tabWidth, tabHeight, numTab) {
	var tabSprites = [];
	for (var i = 0; i < numTab; i++) {
		var spriteTab = new Sprite_Tab(tabWidth, tabHeight);
		tabSprites.push(spriteTab);
	}
	this.tabSprites = tabSprites;
	for (var i = 0; i < numTab; i++) {
		this.addChild(this.tabSprites[i]);
	}
};

IW_Window_Tab.prototype.setupTabPositions = function (tabWidth) {
	var tabWidth = tabWidth || 50;
	var num = this.tabSprites.length;
	for (var i = 0; i < num; i++) {
		this.tabSprites[i].x = i * tabWidth + this.tabOffsetX;
	}
};

IW_Window_Tab.prototype.selectTab = function (index) {
	var w = this.contentsWidth();
	var h = this.contentsHeight();
	this.contents = new Bitmap(w, h);
	var num = this.tabSprites.length;
	for (var i = 0; i < num; i++) {
		if (i == (index - 1)) {
			this.tabSprites[i].alpha = 1;
			this.tabNum = i + 1;
			this.contents.blt(this.contentsBitmaps[i], 0, 0, w, h, 0, 0);
		} else {
			this.tabSprites[i].alpha = 160;
		}
	}
};

IW_Window_Tab.prototype.setTabName = function (name, tabIndex, fontSize) {
	var name = name || "Tab";
	var tabIndex = (tabIndex - 1) || 0;
	var fontSize = fontSize || this.defaultFontSize();
	var maxWidth = this.tabSprites[tabIndex].width;
	var lineHeight = this.tabSprites[tabIndex].height;
	var y = Math.floor((lineHeight - fontSize * 2) / 2);
	this.tabSprites[tabIndex].bitmap.fontSize = fontSize;
	this.tabSprites[tabIndex].bitmap.drawText(name, 0, y, maxWidth, lineHeight, 'center');
};

IW_Window_Tab.prototype.clearTabName = function (tabIndex) {
	var tabIndex = (tabIndex - 1) || 0;
	this.tabSprites[tabIndex].clearTab();
};

//*******************************
// Skill Tab Window
//*******************************
function IW_Window_TabSkill() {
	this.initialize.apply(this, arguments);
};

IW_Window_TabSkill.prototype = Object.create(IW_Window_Tab.prototype);
IW_Window_TabSkill.prototype.constructor = IW_Window_TabSkill;

IW_Window_TabSkill.prototype.initialize = function (x, y, width, height) {
	this.cursorIndex = 0;
	this.listIndex = [0,0,0];
	IW_Window_Tab.prototype.initialize.call(this, x, y, width, height, 80, 40, 3);
	//this.iconImage = ImageManager.loadSystem('IconSet-2');
	//var fileSeries = ['img/system/test.png'];
	var fileSeries = ['img/system/IconSet-2.png'];
	var dataKeys = ['iconImage'];
	ImageManager.loadBitmaps (fileSeries, this, dataKeys, this.refresh.bind(this));
};

IW_Window_TabSkill.prototype.refresh = function () {
	this.cursorIndex = 0;
	this.listIndex = [0,0,0];
	this.clearAllTabNames();
	this.setAllTabNames();
	this.fillSkillList();
	this.updateContent();
	this.updateCursor();
    this.selectTab(1);
};

IW_Window_TabSkill.prototype.standardHeight = function () {
	return 36;
};

IW_Window_TabSkill.prototype.setAllTabNames = function () {
	this.setTabName('主动', 1, 18);
	this.setTabName('被动', 2, 18);
	this.setTabName('自动', 3, 18);
};
IW_Window_TabSkill.prototype.clearAllTabNames = function () {
	for (var i=1;i<4;i++){this.clearTabName(i);}
};

// IW_Window_TabSkill.prototype.refresh = function () {
	// this.fillSkillList();
	// this.selectTab(1);
	// this.cursorIndex = 0;
	// this.listIndex = [0,0,0];
	// this.updateContent();
	// this.updateCursor();
// };

IW_Window_TabSkill.prototype.actor = function () {
	return $IW_gameParty.menuActor();
};

IW_Window_TabSkill.prototype.fillSkillList = function () {
	this.contentsBitmaps[0] = this.fillBitmapSkill(1);
	this.contentsBitmaps[1] = this.fillBitmapSkill(2);
	this.contentsBitmaps[2] = this.fillBitmapSkill(3);
};

IW_Window_TabSkill.prototype.fillBitmapSkill = function (skillType) {
	var skillList = this.findSkillList(skillType);
	var numSkill = skillList.length;
	var pw = this._iconWidth;
	var ph = this._iconHeight;
	bitmap = new Bitmap(this.width, numSkill * 34);
	if (numSkill) {
		bitmap.addLoadListener(function () {
			for (var i = 0; i < numSkill; i++) {
				var skillName = skillList[i].name;
				var iconIndex = skillList[i].iconIndex;
				var sx = iconIndex % 16 * pw;
				var sy = Math.floor(iconIndex / 16) * ph;
				bitmap.blt(this.iconImage, sx, sy, pw, ph, 5, i * 32);
				skillName += "(等级 " + skillList[i].level + ")"
				bitmap.drawText(skillName, pw + 10, i * 32, this.width, this.lineHeight());
			}
		}
			.bind(this));
	}
	return bitmap;
};

IW_Window_TabSkill.prototype.findSkillList = function (skillType) {
	var skillType = skillType || this.tabNum;
	var actor = this.actor();
	var skillTotalNum = actor._RL_skills.length;
	var skillList = [];
	for (var i=0; i<skillTotalNum ;i++ ){
		if (actor._RL_skills[i].skillType === skillType) {
			skillList.push (actor._RL_skills[i]);
		}
	}
	return skillList;
};

IW_Window_TabSkill.prototype.isCursorMovable = function () {
	return (this.findSkillList().length > 0);
};

IW_Window_TabSkill.prototype.cursorUp = function () {
	//Try to move the cursor upwards
	if (this.cursorIndex > 0) {
		this.cursorMoveUp();
	} else if (this.listIndex[this.tabNum - 1] > 0) {
		this.contentMoveUp();
	}
};

IW_Window_TabSkill.prototype.cursorRight = function () {
	if (this.tabNum < 3) {
		this.selectTab(this.tabNum + 1);
	}
};

IW_Window_TabSkill.prototype.cursorLeft = function () {
	//Try to move the cursor upwards
	if (this.tabNum > 1) {
		this.selectTab(this.tabNum - 1);
	}
};

IW_Window_TabSkill.prototype.cursorDown = function () {
	//Try to move the cursor upwards
	var numRow = Math.floor(this.contentsHeight() / 32);
	var skillNum = this.findSkillList().length;
	if (this.cursorIndex < (numRow - 1)) {
		this.cursorMoveDown();
	} else if ((this.listIndex[this.tabNum - 1] + numRow) < (skillNum)) {
		this.contentMoveDown();
	}
};

IW_Window_TabSkill.prototype.cursorMoveUp = function () {
	this.cursorIndex -= 1;
	this.updateCursor();
};

IW_Window_TabSkill.prototype.cursorMoveDown = function () {
	this.cursorIndex += 1;
	this.updateCursor();
};

IW_Window_TabSkill.prototype.contentMoveUp = function () {
	this.listIndex[this.tabNum - 1] -= 1;
	this.updateContent();
};

IW_Window_TabSkill.prototype.contentMoveDown = function () {
	this.listIndex[this.tabNum - 1] += 1;
	this.updateContent();
};

IW_Window_TabSkill.prototype.processCursorMove = function () {
	if (this.isCursorMovable()) {
		var lastIndex = this.index();
		if (Input.isRepeated('down')) {
			this.cursorDown(Input.isTriggered('down'));
		}
		if (Input.isRepeated('up')) {
			this.cursorUp(Input.isTriggered('up'));
		}
		if (this.index() !== lastIndex) {
			SoundManager.playCursor();
		}
	}
	if (Input.isRepeated('right')) {
		this.cursorRight(Input.isTriggered('right'));
	}
	if (Input.isRepeated('left')) {
		this.cursorLeft(Input.isTriggered('left'));
	}

};

IW_Window_TabSkill.prototype.findCursorIndex = function (x, y) {
	return Math.floor (y/this.standardHeight());
};
IW_Window_TabSkill.prototype.select = function (index) {
	if (index >= 0) {
		this.cursorIndex = index;
		this.updateCursor();
	} else {
		this.deselect();
	}
};
IW_Window_TabSkill.prototype.processPagedown = function () {
	SoundManager.playCursor();
	this.updateInputData();
	this.callHandler('pagedown');
};

IW_Window_TabSkill.prototype.processPageup = function () {
	SoundManager.playCursor();
	this.updateInputData();
	this.callHandler('pageup');
};

IW_Window_TabSkill.prototype.updateCursor = function () {
	var x = this.paddingLeft();
	var y = this.paddingTop() + this.cursorIndex * 32 - 2;
	var width = this.contentsWidth();
	var height = this.standardHeight();
	var skill = this.findSkillList()[this.listIndex[this.tabNum - 1] + this.cursorIndex];
	this.setCursorSize(width, height);
	this.setCursorPosition(x, y);
	if (SceneManager._scene._helpWindow) {
		SceneManager._scene._helpWindow.updateHelp(skill);
	}
};

IW_Window_TabSkill.prototype.updateContent = function () {
	var sx = 0;
	var sy = this.listIndex[this.tabNum - 1]* 32;
	var width = this.contentsWidth();
	var bitmap = this.contentsBitmaps[this.tabNum-1];	
	if (!!bitmap){
	var height = (sy + this.contentsHeight()) > bitmap.height ?  bitmap.height - sy : this.contentsHeight();
	var skill = this.findSkillList()[this.listIndex[this.tabNum - 1] + this.cursorIndex];
	this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
	this.contents.blt(bitmap, sx, sy, width, height, 0, 0);
	if (SceneManager._scene._helpWindow) {
		SceneManager._scene._helpWindow.updateHelp(skill);
	}}
};

IW_Window_TabSkill.prototype.selectTab = function (index) {
	var w = this.contentsWidth();
	var h = this.contentsHeight();
	this.contents = new Bitmap(w, h);
	var num = this.tabSprites.length;
	for (var i = 0; i < num; i++) {
		if (i == (index - 1)) {
			this.tabSprites[i].alpha = 1;
			this.tabNum = i + 1;
			this.contents.blt(this.contentsBitmaps[i], 0, 0, w, h, 0, 0);
			this.updateContent();
			this.updateCursor();
		} else {
			this.tabSprites[i].alpha = 160;
		}
	}
};

IW_Window_TabSkill.prototype.scrollDown = function () {
	var totalNum = this.findSkillList().length;
	var listNum = this.listIndex[this.tabNum - 1];
	var bottomCheck = (listNum + this.cursorIndex) < (totalNum - 1) ? false : true;
	if (!bottomCheck) {
		this.listIndex[this.tabNum - 1] += 1;
		this.updateCursor();
	}
};

IW_Window_TabSkill.prototype.scrollUp = function () {
	if (this.listIndex[this.tabNum - 1] > 0)
	{
		this.listIndex[this.tabNum - 1] -= 1;
		
		this.updateCursor();
	}
};

IW_Window_TabSkill.prototype.processWheel = function () {
	if (this.isOpenAndActive()) {
		var threshold = 20;
		if (TouchInput.wheelY >= threshold) {
			this.cursorDown();
		}
		if (TouchInput.wheelY <= -threshold) {
			this.cursorUp();
		}
	}
};
IW_Window_TabSkill.prototype.processTouch = function () {
	if (this.isOpenAndActive()) {
		if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
			this._touching = true;
			this.onTouch(true);
		} else if (TouchInput.isCancelled()) {
			if (this.isCancelEnabled()) {
				this.processCancel();
			}
		} else if (TouchInput.isTriggered() && this.isTouchedInsideTabs())
		{
			var tabWidth = this.tabSprites[0].width;
			var selectedTabNum = Math.floor((TouchInput.x - 10 - this.x)/tabWidth) + 1;
			this.selectTab(selectedTabNum);
		}
		if (this._touching) {
			if (TouchInput.isPressed()) {
				this.onTouch(false);
			} else {
				this._touching = false;
			}
		}
	} else {
		this._touching = false;
	}
};
IW_Window_TabSkill.prototype.isTouchedInsideTabs = function () {
	var rangeX_Min = this.x + 10;
	var rangeX_Max = rangeX_Min + this.numTab * this.tabSprites[0].width;
	var rangeY_Min = this.y + 2 - this.tabSprites[0].height;
	var rangeY_Max = 2 + this.y;
	return (TouchInput.x > rangeX_Min) && (TouchInput.x < rangeX_Max) && (TouchInput.y > rangeY_Min) && (TouchInput.y < rangeY_Max);
};
//*******************************
// Skill Help Window class
//*******************************
function IW_Window_SkillHelp() {
	this.initialize.apply(this, arguments);
};

IW_Window_SkillHelp.prototype = Object.create(IW_Window_Selectable.prototype);
IW_Window_SkillHelp.prototype.constructor = IW_Window_SkillHelp;

IW_Window_SkillHelp.prototype.initialize = function (x, y, width, height) {
	IW_Window_Selectable.prototype.initialize.call(this, x, y, width, height);
	this.loadWindowskin();
	this._cursor.hide();
	this.scroll = 0;
};

IW_Window_SkillHelp.prototype.updateHelp = function (skill) {
	this.constructContent(skill);
};

IW_Window_SkillHelp.prototype.loadWindowskin = function () {
	this.windowskin = ImageManager.loadSystem('Window_new');
};

IW_Window_SkillHelp.prototype.constructContent = function (skill) {
	if (skill){
	this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
	var width = this.contentsWidth;
	var lineNum = 3;
	var description = "";
	var seedsNum = skill.skillSeeds.length;
	for (var i = 0; i < seedsNum; i++) {
		var tempSeeds = this.overWriteSeed(skill, i);
		description += tempSeeds.message;
		description = description.replace('<heal>', tempSeeds.heal);
		description = description.replace('<damage>', tempSeeds.damage);
		description = description.replace('<parameterChange>', tempSeeds.parameterChange);
		var target = this.getTarget(tempSeeds);
		description = description.replace('<target>', target);
		description += ".";
	}
	description = this.formatDescription(description);
	lineNum += description.length;
	var bitmap = new Bitmap(this.contentsWidth(), lineNum * 32);
	bitmap.addLoadListener(function () {
		bitmap.drawText("名称：" + skill.name, 0, 0, this.contentsWidth(), 36);
		var costName = this.getCostName(skill);
		bitmap.drawText("消耗：" + costName, 0, this.contents.fontSize, this.contentsWidth(), 36);
		bitmap.drawText("详细描述：", 0, this.contents.fontSize * 2, this.contentsWidth(), 36);
		var lineNumDescription = description.length;
		for (var i = 0; i < lineNumDescription; i++) {
			bitmap.drawText(description[i], 0, this.contents.fontSize * (3 + i), this.contentsWidth(), 36);
		}
		this.displayContent(bitmap);
	}
		.bind(this));
		this.makeButtons(skill);
	}
	else {this.contents.clear();}
};

IW_Window_SkillHelp.prototype.overWriteSeed = function (skill, index) {
	var seed = null;
	if (index < skill.skillSeeds.length) {
		seed = $dataIWSkillSeeds[skill.skillSeeds[index]];
		if (index < skill.seedsParameters.length) {
			var overWriteFunction = skill.seedsParameters[index];
			for (var a in skill.seedsParameters[index]) {
				if (seed[a]) {
					seed[a] = skill.seedsParameters[index][a];
				}
			}
		}
	}
	return seed;
};

IW_Window_SkillHelp.prototype.getTarget = function (tempSeeds) {
	var target = "默认目标";
	switch (tempSeeds.targetType) {
	case "self":
		target = "自身";
		break;
	case "enemy":
		target = "敌方";
		break;
	case "party":
		target = " 我方";
		break;
	case "all":
		target = "全体";
		break;
	default:
		target = "默认目标";
	}

	switch (tempSeeds.targetRange) {
	case "single":
		if (target != "自身") {
			target += "单体";
			break;
		}
		break;
	case "cross":
		target += " 十字";
		break;
	case "all":
		target += "单位";
		break;
	default:
		target += tempSeeds.targetRange.match(/\d{1,2}/);
	}

	return target;
};

IW_Window_SkillHelp.prototype.formatDescription = function (description) {
	var fontSize = 28;
	var numPerLine = Math.floor(this.contentsWidth() / fontSize) + 1;
	var numLines = Math.floor(description.length / numPerLine) + 1;
	var descrip = []
	for (var i = 0; i < numLines; i++) {
		var end = ((i + 1) * numPerLine) > description.length ? description.length : ((i + 1) * numPerLine);
		descrip[i] = description.slice(numPerLine * i, end);
	}
	return descrip;
};

IW_Window_SkillHelp.prototype.getCostName = function (skill) {
	if (skill.cost.length > 0) {
		var shortName = skill.cost.match(/\w{1,4}/);
		switch (shortName) {
		case "CMP":
			var charactName = "MP";
			break;
		case "CHP":
			var charactName = "HP";
			break;
		default:
			var charactName = "MP";
		}
		charactName = skill.cost.match(/\d+/) + charactName;
	} else {
		var charactName = "无";
	}
	return charactName;
};

IW_Window_SkillHelp.prototype.displayContent = function (bitmap) {
	this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
	var sy = this.scroll * 32;
	var sh = (sy + this.contentsHeight()) > bitmap.height ? bitmap.height - sy : this.contentsHeight();
	this.contents.blt(bitmap, 0, sy, this.contentsWidth(), sh, 0, 0);
};

IW_Window_SkillHelp.prototype.makeButtons = function (skill) {
	/*this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
	var sy = this.scroll * 32;
	var sh = (sy + this.contentsHeight()) > bitmap.height ? bitmap.height - sy : this.contentsHeight();
	this.contents.blt(bitmap, 0, sy, this.contentsWidth(), sh, 0, 0);*/
	this.contents.drawText ( "放弃技能" ,0,this.contents.height - 36, this.contentsWidth(), 36);
};

//*******************************
// Skill Help Window class
//*******************************
function IW_Window_SkillFace() {
	this.initialize.apply(this, arguments);
};

IW_Window_SkillFace.prototype = Object.create(Window_Base.prototype);
IW_Window_SkillFace.prototype.constructor = IW_Window_SkillFace;

IW_Window_SkillFace.prototype.initialize = function (x, y, width, height) {
	Window_Base.prototype.initialize.call(this, x, y, width, height);
	this.windowskin = ImageManager.loadSystem('Window_new'); 
	this.initializeDisplayObjects();
};

IW_Window_SkillFace.prototype.actor = function () {
	return 	$IW_gameParty.menuActor();
};

IW_Window_SkillFace.prototype.refresh = function () {
	this.contents.clear();
	this.initializeDisplayObjects();
};

IW_Window_SkillFace.prototype.initializeDisplayObjects = function () {	
	this.drawActorFace (this.actor(),0,0,128,128);
	this.drawActorInfor();
};

IW_Window_SkillFace.prototype.drawActorInfor = function () {
	var name = this.actor()._parameters.name;
	var level = "Lv. " + this.actor()._parameters.level;
	this.contents.drawText (name + "  " +level, 130,0,200,36);
	this.drawBars();
};

IW_Window_SkillFace.prototype.drawBars = function () {	
	var hpper = this.actor()._parameters.result.advan[4] / this.actor()._parameters.result.advan[6];
	var mpper = this.actor()._parameters.result.advan[5] / this.actor()._parameters.result.advan[7];
	var expper = this.actor().currentExp()/this.actor().nextLevelExp();
	this.contents.drawText ("HP ", 130,28,200,36);
	this.contents.drawText ("MP ", 130,56,200,36);
	this.contents.drawText ("EXP ", 130,84,200,36);
	this.contents.barGenerator (170,37,15,130, '#64FE2E' , '#64FE2E',hpper);
	this.contents.barGenerator (170,65,15,130, '#40D1FA' , '#40D1FA',mpper);
	this.contents.barGenerator (170,93,15,130, '#FFBF00' , '#FFBF00',expper);
    hpper = Math.floor(hpper * 1000) / 10;
	mpper = Math.floor(mpper * 1000) / 10;
	expper = Math.floor(expper * 1000) / 10;
	this.contents.fontSize = 11;
	this.contents.drawText (hpper + "%", 235,26,200,36);
	this.contents.drawText (mpper + "%", 235,54,200,36);
	this.contents.drawText (expper + "%", 235,82,200,36);
	this.contents.fontSize = 28;
};

//*******************************
// Message Window class
// desp: display a message inGame
//*******************************
function IW_MessageWindow() {
	this.initialize.apply(this, arguments);
};

IW_MessageWindow.prototype = Object.create(Sprite.prototype);
IW_MessageWindow.prototype.constructor = IW_MessageWindow;

IW_MessageWindow.prototype.initialize = function () {
	Sprite.prototype.initialize.call(this);
	this.stayCountThreshold = 60;
	this.stayCount = 0
	this.fadeSpeed = 2;
	this.loadBitmaps();
	this._fadeOut = false;
	this._fadeIn = false;
	this.visible = true;
	this.open = false;
	this.complete = true;
	this.alpha = 0;
	this.textContents = [];
	this.windowStyle = 1;
	this.x = 200;
	this.y = 20;
	this.fontSize = 28;
};
IW_MessageWindow.prototype.loadBitmaps = function () {
	this.windowSkin = ImageManager.loadSystem('Window_new');
};
IW_MessageWindow.prototype.update = function () {
	this.updateFade();
	this.updateStay();
	this.updateMessageManager();
	this.updateContents();
};
IW_MessageWindow.prototype.updateFade = function () {
	if (this._fadeIn){
		if (this.windowSkin.isReady()){
			this.complete = false;
			this.alpha += this.fadeSpeed/100;
			if (this.alpha >= 1){
				this._fadeIn = false;
				this.open = true;
				this.stayCount = 0;
			}
		}
	}
	if (this._fadeOut){
		if (this.windowSkin.isReady()){
			this.alpha -= this.fadeSpeed/100;
			if (this.alpha <= 0) {
				this._fadeOut = false;
				this.open = false;
				this.stayCount = 0;
				this.complete = true;
			}
		}
	}
};
IW_MessageWindow.prototype.updateStay = function () {
	if (!this._fideIn && !this._fideOut && this.open){
		this.stayCount++;
		if (this.stayCount > this.stayCountThreshold){
			this._fadeOut = true;
			
		}
	}
};

IW_MessageWindow.prototype.updateMessageManager = function () {
	if ($gameMessage._texts.length>0){
		this.textContents.push($gameMessage._texts.splice(0,1)[0]);
	}
};

IW_MessageWindow.prototype.updateContents = function () {
	if (this.textContents.length>0 && this.complete){
		this.constructBackground();
	}
};

IW_MessageWindow.prototype.constructBackground = function () {
	switch (this.windowStyle){
		case 1:
			this.constructBaseWindow();
	}
};

IW_MessageWindow.prototype.constructBaseWindow = function () {
	var text = this.textContents.splice(0,1);
	var width = this.mearesureWidth(text[0]) + 50;
	var height = this.mearesureHeight(text[0])+20;
	this.bitmap = new Bitmap (width,height);
	this.width = width;
	this.height = height;
	this.bitmap.addLoadListener(
	function(){
	for (var i= 0; i < (Math.floor(width/95)+1); i++){
		for (var j = 0; j < (Math.floor(height/95)+1); j++ ){
			this.bitmap.blt(this.windowSkin,1,1,95,95,i*95,j*95);
		}
	}
	this.bitmap.fontSize = this.fontSize;
	this.bitmap.drawText (text[0],0,10,width,this.fontSize,'center');
	this._fadeIn = true;
	}.bind(this));
};

IW_MessageWindow.prototype.mearesureWidth = function (text) {
	return (text.length*this.fontSize)>300 ? 300 : text.length*this.fontSize;	
};

IW_MessageWindow.prototype.mearesureHeight = function (text) {
	//var lines = Math.floor (text.length*this.bitmap.fontSize);	
	return this.fontSize*(Math.floor(text.length/30)+1);
};

IW_MessageWindow.prototype.add = function (text) {
	this.textContents.push(text);
};
// window with new skin
function IW_Window_New() {
	this.initialize.apply(this, arguments);
};

IW_Window_New.prototype = Object.create(Window_Base.prototype);
IW_Window_New.prototype.constructor = IW_Window_New;

IW_Window_New.prototype.initialize = function (x, y, width, height) {
	Window_Base.prototype.initialize.call(this, x, y, width, height);
	this.loadWindowskin();
};

IW_Window_New.prototype.loadWindowskin = function () {
	this.windowskin = ImageManager.loadSystem('Window_new');
};

// window for battle victory
function IW_Window_Victory() {
	this.initialize.apply(this, arguments);
};

IW_Window_Victory.prototype = Object.create(IW_Window_New.prototype);
IW_Window_Victory.prototype.constructor = IW_Window_Victory;

IW_Window_Victory.prototype.initialize = function (x, y, width, height) {
	var x = Math.floor(Graphics.width*0.1) || x;
	var y = 150 || y;
	var width = Math.floor(Graphics.width*0.8) || width;
	var height = 350 || height;
	IW_Window_New.prototype.initialize.call(this, x, y, width, height);
	this.creatTitle();
	this.constructContents();
};

IW_Window_Victory.prototype.creatTitle = function () {
	this.titleSprite = new Sprite_Victory();
	this.titleSprite.x = Math.floor(Graphics.width - this.titleSprite.width)/2 - this.x;
	this.titleSprite.y = -128;
	this.addChild(this.titleSprite);
};

IW_Window_Victory.prototype.constructContents = function () {
	this.drawText();
};

IW_Window_Victory.prototype.drawText = function () {
	this.contents.textColor = '#ff8d23';
	this.contents.fontSize = 32;
	var width = this.width - this.paddingLeft() - this.paddingRight();
	this.contents.drawText('Loot',11,11,width,24,'left');
};

// window for battle lose
function IW_Window_Defeat() {
	this.initialize.apply(this, arguments);
};

IW_Window_Defeat.prototype = Object.create(IW_Window_New.prototype);
IW_Window_Defeat.prototype.constructor = IW_Window_Defeat;

IW_Window_Defeat.prototype.initialize = function (x, y, width, height) {
	IW_Window_New.prototype.initialize.call(this, x, y, width, height);
	this.constructContents();
};

IW_Window_Defeat.prototype.constructContents = function () {
	this.drawText();
};

IW_Window_Defeat.prototype.drawText = function () {
	this.contents.textColor = '#ff8d23';
	var width = this.width - this.paddingLeft() - this.paddingRight();
	this.contents.drawText('Game Over!',0,0,width,24,'center');
};

/* The method to display a bar
 *
 *
 */
Bitmap.prototype.barGenerator = function (x, y, w, maxLength, color1, color2, fillPercent) {
	var context = this._context;
	var grad = context.createLinearGradient(x, y , x + w + maxLength * fillPercent, y + w);
	var startCoords = [];
	grad.addColorStop(0, color1);
	grad.addColorStop(1, color2);
	context.save();
	context.beginPath();
	context.moveTo(x + w, y);
	context.lineTo(x + maxLength + w, y);
	context.lineTo(x + maxLength, y + w);
	context.lineTo(x , y + w);
	context.lineTo(x + w, y);
	context.lineWidth = 3;
	context.clip();
	context.fillStyle = grad;
	context.fillRect(x, y, (w + maxLength) * fillPercent, w);
	context.strokeStyle = grad;
	context.stroke();
	context.restore();
	this._setDirty();
};
