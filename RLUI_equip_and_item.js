//*********************************************************************************************/
//       								    人物装备栏
//*********************************************************************************************/

//----------------------------------------------------//
// Initials and constructor
//----------------------------------------------------//
function IW_Window_Equip() {
	this.initialize.apply(this, arguments);
}

IW_Window_Equip.prototype = Object.create(Window_Selectable.prototype);
IW_Window_Equip.prototype.constructor = IW_Window_Equip;

IW_Window_Equip.prototype.initialize = function (x, y, r) {
	this.slotCentre = {
		"x": x,
		"y": y,
		"r": r
	};
	this.LoadImage();
	this._cursor = new IW_Select_Cursor();
	this._cursor.hide();
	this._index = 0;
	Window_Selectable.prototype.initialize.call(this,0,0,0,0);
	this.setWindowSize();
};
IW_Window_Equip.prototype.setWindowSize = function () {
	this.height = this.windowHeight();
	this.width = this.windowWidth();
};
//--------------------------------------
//            parameters
//--------------------------------------
IW_Window_Equip.prototype.windowWidth = function () {
	return 816;
};
IW_Window_Equip.prototype.windowHeight = function () {
	return 400;
};
IW_Window_Equip.prototype.slotWidth = function () {
	return 36;
};
IW_Window_Equip.prototype.slotHeight = function () {
	return 36;
};
IW_Window_Equip.prototype.iconWidth = function () {
	return 32;
};
IW_Window_Equip.prototype.iconHeight = function () {
	return 32;
};
IW_Window_Equip.prototype.xSpace = function () { // x space between two slot groups
	return 260;
};
IW_Window_Equip.prototype.ySpace = function () { //y space between two slot groups
	return -70;
};
//--------------------------------------
//          Re-fresh functions
//--------------------------------------
IW_Window_Equip.prototype.setActor = function (actor) {
	if (this._actor !== actor) {
		this._actor = actor;
		this.refresh();
	}
};
IW_Window_Equip.prototype.refresh = function () {
	this.refreshBackground();
};
//--------------------------------------
//  Construction of all Background
//--------------------------------------
IW_Window_Equip.prototype.LoadEquipSlotsBack = function (x, y) {
	var bitmap = ImageManager.loadSystem('slot_window', 0);
	this.bitmap_back = bitmap;
	bitmap.addLoadListener(function () {
		this.bitmap_back = bitmap;
	}
		.bind(this));
	bitmap.addLoadListener(function () {
		this.refreshBackground();
	}
		.bind(this));
};
IW_Window_Equip.prototype.LoadEquipSlots = function () {
	var bitmap = ImageManager.loadBitmap('img/system/', 'slots', 0, true);
	this.bitmap_slots = bitmap;
	bitmap.addLoadListener(function () {
		this.refreshBackground();
	}
		.bind(this));
};
IW_Window_Equip.prototype.LoadEquipIcons = function () {
	var bitmap_icon = ImageManager.loadBitmap('img/system/', 'IconSet-2', 0, true);
	this.bitmap_icon = bitmap_icon;
	bitmap_icon.addLoadListener(function () {
		this.refreshBackground();
	}
		.bind(this));
};
IW_Window_Equip.prototype.LoadImage = function () {
	this.LoadEquipSlotsBack();
	this.LoadEquipSlots();
	this.LoadEquipIcons();
};
IW_Window_Equip.prototype.drawActorInfor = function () {
	var name_position = this.slotPosition(8);
	var name = this._actor.name() + '   Lv ' + this._actor._parameters.level;
	this.contents.drawText(name, name_position.x, 0, 200, 28, 'left');
	var needExpLvl = this._actor.expForLevel(this._actor._parameters.level + 1);
	var currentExp = this._actor._parameters.currentExp;
	var hpper = this._actor._parameters.result.advan[4] / this._actor._parameters.result.advan[6];
	var mpper = this._actor._parameters.result.advan[5] / this._actor._parameters.result.advan[7];
	var hp_color = this.findColor('hp', hpper);
	var hp_text = this._actor._parameters.result.advan[4].toString() + "/" + this._actor._parameters.result.advan[6].toString();
	var mp_text = this._actor._parameters.result.advan[5].toString() + "/" + this._actor._parameters.result.advan[7].toString();
	var exp_text = this._actor._parameters.currentExp.toString() + "/" + this._actor.nextLevelExp().toString();
	this.contents.RUItest(name_position.x, 32, 4, 86, hp_color.color1, hp_color.color1, hpper);
	this.contents.fontSize = 10;
	this.contents.drawText(hp_text, name_position.x + 100, 16, 200, 28, 'left');
	this.contents.RUItest(name_position.x, 40, 4, 86, '#1E90FF', '#87CEFA', mpper);
	this.contents.drawText(mp_text, name_position.x + 100, 24, 200, 28, 'left');
	this.contents.RUItest(name_position.x, 48, 4, 86, '#BF00FF', '#F5A9F2', currentExp / needExpLvl);
	this.contents.drawText(exp_text, name_position.x + 100, 32, 200, 28, 'left');
	this.resetFontSettings();
};
IW_Window_Equip.prototype.findColor = function (name, percentage) {
	switch (name) {
	case 'hp':
		color_R_1 = percentage >= 0.5 ? 255 * (1 - (percentage - 0.5) * 2) : 255;
		color_R_2 = color_R_1;
		color_G_1 = percentage >= 0.5 ? 255 : 255 * percentage * 2;
		color_G_2 = color_G_1;
		color_B_1 = 0;
		color_B_2 = 255;
		break;
	case 'mp':
		break;
	case 'exp':
		break;
	}
	var color = this.convertRGBtoIndex(color_R_1, color_R_2, color_G_1, color_G_2, color_B_1, color_B_2);
	return color;
};

IW_Window_Equip.prototype.convertRGBtoIndex = function (color_R_1, color_R_2, color_G_1, color_G_2, color_B_1, color_B_2) {
	var color = [];
	color[0] = Math.floor(color_R_1).toString(16);
	color[1] = Math.floor(color_R_2).toString(16);
	color[2] = Math.floor(color_G_1).toString(16);
	color[3] = Math.floor(color_G_2).toString(16);
	color[4] = Math.floor(color_B_1).toString(16);
	color[5] = Math.floor(color_B_2).toString(16);
	for (i = 0; i < 6; i++) {
		if (color[i].length === 1) {
			color[i] = '0' + color[i];
		}
	}
	var color_set = {
		'color1': '#' + color[0] + color[2] + color[4],
		'color2': '#' + color[1] + color[3] + color[5]
	}
	return color_set;
};

IW_Window_Equip.prototype.refreshBackground = function () {
	if (this._actor) { //当前有角色设定
		var bitmap_background = new Bitmap(this.bitmap_back.width, this.bitmap_back.height);
		bitmap_background.blt(this.bitmap_back, 0, 0, this.bitmap_back.width, this.bitmap_back.height, 0, 0);
		var ws = this.slotWidth();
		var hs = this.slotHeight();
		var wi = this.iconWidth();
		var hi = this.iconHeight();
		// 先画出装备栏位 slots
		for (i = 0; i < 17; i++) {
			slot_Position = this.slotPosition(i);
			if (bitmap_background != undefined && this.bitmap_slots != undefined) {
				bitmap_background.blt(this.bitmap_slots, i * ws, 0, ws, hs, slot_Position.x, slot_Position.y);
			}
		}
		//历遍所有已经装备的装备
		for (i = 0; i < this._actor.equips().length; i++) {
			if (this._actor.equips()[i] != null) {
				slots_index = this.typeToSlotIndex(this._actor.equips()[i]); //送入一个item
				iconPosition = this.iconIndextoPosition(this._actor.equips()[i].basic.iconIndex); //计算当前图标位置
				slot_Position = this.slotPosition(slots_index); //计算画图的位置
				var x = slot_Position.x + (this.slotWidth() - wi) * 0.5;
				var y = slot_Position.y + (this.slotHeight() - hi) * 0.5;
				if (bitmap_background != undefined && this.bitmap_icon != undefined) {
					bitmap_background.blt(this.bitmap_icon, iconPosition.x, iconPosition.y, wi, hi, x, y);
				}
			}
		}
		if (bitmap_background != undefined) {
			this.contents = bitmap_background;
			this.drawActorInfor();
		}
		this.contentsOpacity = 250;
	}

};
/*--------------------------------------*/
//  functions used to calculation
//--------------------------------------*/
IW_Window_Equip.prototype.slotPosition = function (index) { //根据中心和角度标index计算x，y位置
	var slot_Position = {
		"x": 0,
		"y": 0
	};
	var slotCentre = this.slotCentre;
	ws = this.slotWidth();
	hs = this.slotHeight();
	if (index <= 7) { //环坐标
		delta_x = Math.floor(slotCentre.r * Math.sin(index * 45 / 180 * Math.PI));
		delta_y = Math.floor(slotCentre.r * Math.cos(index * 45 / 180 * Math.PI));
		slot_Position.x = slotCentre.x + delta_x - ws * 0.5;
		slot_Position.y = slotCentre.y + delta_y - hs * 0.5;
		return slot_Position;
	} else {
		slot_Position.x = (index - 8) % 3 * 70 + slotCentre.x + this.xSpace() - ws * 0.5;
		slot_Position.y = Math.floor((index - 8) / 3) * 70 + slotCentre.y + this.ySpace() - hs * 0.5;
		return slot_Position;
	}

};
IW_Window_Equip.prototype.slotsType = function (item) { //根据item 给出对应的装备栏位编号
	var SlotIndex_map = [99, 6, 2, 4, 3, 5, 7, 0, 13, 14];
	if (!item) {
		return 99;
	} else if (DataManager.isWeapon(item)) {
		return 6;
	} else if (DataManager.isArmor(item)) {
		return SlotIndex_map[item.etypeId];
	} else {
		return 99;
	}

};
IW_Window_Equip.prototype.typeToSlotIndex = function (item) { //根据item 给出对应的装备栏位编号
	if (item.basic.weaponcheck) {
		// 单手或者双手武器，返回主武器位置
		if (item.basic.type === 1 || item.basic.type === 3) {
			return 6;
		}
		// 副手物品，返回副手位置
		if (item.basic.type === 2) {
			return 2;
		}
	} else if (item.basic.armorcheck) {
		var slotPosition = [99, 5, 4, 3, 7, 0, 1, 8, 9, 10, 11, 12, 13, 14, 15, 16];
		if (item.basic.type < slotPosition.length) {
			return slotPosition[item.basic.type];
		}
	}
	return 99;

};
IW_Window_Equip.prototype.iconIndextoPosition = function (index) {
	var position = {
		"x": 0,
		"y": 0
	};
	var pw = this.iconWidth();
	var ph = this.iconHeight();
	position.x = index % 16 * pw;
	position.y = Math.floor(index / 16) * ph;
	return position;
};
IW_Window_Equip.prototype.index = function () {
	return this._index;
};
IW_Window_Equip.prototype.cursorDown = function (wrap) {
	this.select(this.index() - 1);
};
IW_Window_Equip.prototype.cursorUp = function (wrap) {
	if (this.index()===16){this.select(8);}
	else{
	this.select(this.index() + 1);
	}
};
IW_Window_Equip.prototype.cursorRight = function (wrap) {
		if (this.index()===16){this.select(8);}
	else{
	this.select(this.index() + 1);
	}
};
IW_Window_Equip.prototype.cursorLeft = function (wrap) {
	if (this.index()===0){
		this.select(7);
	}
	else{
	this.select(this.index() - 1);
	}
};
IW_Window_Equip.prototype.cursorVisible = function () {
	return (this._cursor) && (this.index() >= 0);
};
IW_Window_Equip.prototype.select = function (index) {
	this._index = index;
	if (this.index()<0){
		SceneManager._scene.switchToItemBagWindow();
	}else{
	this.updateCursor();
	this.updateHelpWindow();
	}
};
IW_Window_Equip.prototype.updateCursor = function () {
	if (this.cursorVisible()) {
		var position = this.slotPosition(this.index());
		this._cursor.show();
		this._cursor.setCursorPosition(position.x+this.paddingLeft(), position.y+this.paddingTop());
		this._cursor.setCursorSize(38, 38);
	} else {
		this._cursor.hide();
	}
};
IW_Window_Equip.prototype.isCursorMovable = function () {
	return this.active;
};
IW_Window_Equip.prototype.activate = function () {
	this.active = true;
	this._cursor.show();
};
IW_Window_Equip.prototype.findEquip = function () {
	return this._actor._RL_equips.equips[this.index()];
};
IW_Window_Equip.prototype.deactivate = function () {
	this.active = false;
};
IW_Window_Equip.prototype.updateHelpWindow = function () {
	var equip = this.findEquip();
	if (SceneManager._scene._help) {
		if (equip) {
			SceneManager._scene._help.show();
			SceneManager._scene._help.drawItemInfo(equip, this._cursor.sprite.x, this._cursor.sprite.y, 0, 1);
			SceneManager._scene._help.update();
		} else {
			SceneManager._scene._help.hide();
		}
	}
};
//**************************************************************************************\\
//           物品信息显示       显示层
//**************************************************************************************\\

function IW_Window_ItemHelp() {
	this.initialize.apply(this);

};
IW_Window_ItemHelp.prototype = Object.create(Window_Selectable.prototype);
IW_Window_ItemHelp.prototype.constructor = IW_Window_ItemHelp;

IW_Window_ItemHelp.prototype.initialize = function (baseWindow) {
	//物品信息传送进来的是当前游标的x y 坐标
	Window_Selectable.prototype.initialize.call(this, 0, 0, 0, 0);
	this._actor = null;
	this._statusWindow = baseWindow;
	this._scroll = 0;
	this.contentsOpacity = 255;
	this.contents = new Bitmap();
	this._twdMetaDefault.padding = 8;
	this._cursor = new IW_Select_Cursor();
	this._cursor.hide();
	this._index = 0;
	this._sourceWindowID = 0;
};

IW_Window_ItemHelp.prototype.fontSize = function () {
	return 18;
};
IW_Window_ItemHelp.prototype.lineSpace = function () {
	return 4;
};
IW_Window_ItemHelp.prototype.sideSpace = function () {
	return 4;
};
IW_Window_ItemHelp.prototype.scrollSpeed = function () {
	return 20;
};
IW_Window_ItemHelp.prototype.index = function () {
	return this._index;
};
IW_Window_ItemHelp.prototype.setActor = function (actor) {
	if (this._actor !== actor) {
		this._actor = actor;
		// this.refresh();
	}
};
IW_Window_ItemHelp.prototype.refresh = function () {
	if (this._item && this._sourceWindowID == 0 ) {
		var x = SceneManager._scene._item._cursor.sprite.x;
		var y = SceneManager._scene._item._cursor.sprite.y;
		this.drawItemInfo(this._item, x, y, this._scroll, 0);
		this.updateCursor();
	}
	if (this._item && this._sourceWindowID ==1 ) {
		var x = SceneManager._scene._equip._cursor.sprite.x;
		var y = SceneManager._scene._equip._cursor.sprite.y;
		this.drawItemInfo(this._item, x, y, this._scroll, 1);
		this.updateCursor();
	}
};
IW_Window_ItemHelp.prototype.drawItemInfo = function (item, x, y, scroll, SourceWindowId) { 
	this.contents.clear();
	var align = 'left';
	this._scroll = scroll;
	this._sourceWindowID = SourceWindowId ? SourceWindowId : 0;
	if (item != null) {
		this.contents.clear();
		var equip_height = this.establish_height(item);
		var equip_width = this.establish_width(item);
		var maxHeight = this.max_height(item);
		this._itemInfor = new Bitmap(equip_width, maxHeight);
		this._itemInfor.addLoadListener(function () {
			this.setWindowPosition(x, y, equip_height, equip_width);
			this.width = equip_width;
			this.height = equip_height > 400 ? 400 : equip_height;
			this.drawItemDetails(item, scroll);
			this.contents = new Bitmap(this.width, this.height);
			this.contents.gradientFillRect(0, 0, this.width, this.height, '#E2D68E', '#966E16', true);
			this.contents.blt(this._itemInfor, 0, 28 + this._scroll * this.scrollSpeed(), this.width - 20, this.height - 36, 0, 36);
			this.drawItemName(item);
			this.makeButton(item);
		}
			.bind(this));
	}

};
IW_Window_ItemHelp.prototype.setWindowPosition = function (x, y, equip_height, equip_width) {
	if (this._sourceWindowID === 0) {
		this.x = x >= 410 ? x - equip_width : x + 54;
		if ((this.x + 400) >= 800) {
			this.x = 400;
		}
		this.y = y - equip_height;
	}
	if (this._sourceWindowID === 1) {
		this.x = x >= 410 ? x - equip_width : x + 30;
		if ((this.x + 400) >= 800) {
			this.x = 400;
		}
		this.y = y + 30;
	}
};
IW_Window_ItemHelp.prototype.max_weight = function (item) {
	return 400;
};
IW_Window_ItemHelp.prototype.max_height = function (item) {
	var charactersPerLine = Math.floor((this.max_weight(item) - this.sideSpace() * 2) / this.fontSize());
	var n = 0;
	var num_lines = Math.floor(item.basic.description.length / charactersPerLine + 1) + 2;
	if (item.advan.length > 0) {
		var tempParams = item.advan[0].parameters;
	}
	if (item.advan.length) {
		var paraNum = item.advan.length;
		for (var j = 0; j < paraNum; j++) {
			tempParams = tempParams.plus(item.advan[j].parameters);
		}
		for (var j = 0; j < tempParams.length; j++) {
			if (tempParams[j] != 0) {
				n++;
			}
		}
	}
	var advanNum = item.advan.length;
	for (var j = 0; j < advanNum; j++) {
		if (item.advan[j].trait_id * item.advan[j].trait_dataid > 0) {
			n += 2;
		}
	}
	num_lines += Math.floor((n + 1) / 2) + 1;
	return num_lines * (this.fontSize() + this.lineSpace()) + 32 - this.fontSize();

};
IW_Window_ItemHelp.prototype.establish_height = function (item) {
	var maxHeight = this.max_height(item);
	return maxHeight > 300 ? 300 : maxHeight;
};
IW_Window_ItemHelp.prototype.establish_width = function (item) {
	return 400;
};
IW_Window_ItemHelp.prototype.drawItemDetails = function (item, scroll) {
	this.contents.fontSize = 15;
	this.contents.clear();
	this._item = item;
	this._itemInfor.fontSize = this.fontSize();
	this._itemInfor.drawText('绑定：未绑定', 8, 12 + this.fontSize(), 200, this.fontSize(), 'left');
	var num_para = 0;
	if (item.advan.length > 0) {
		var tempParams = item.advan[0].parameters;
	}
	var paraNum = item.advan.length;
	for (var j = 1; j < paraNum; j++) {
		tempParams = tempParams.plus(item.advan[j].parameters);
	}
	if (tempParams) {
		for (i = 0; i < tempParams.length; i++) {
			if (tempParams[i] != 0) {
				var par_name = this.paraIndexToName(i);
				var par_value = tempParams[i];
				text = par_name + '：' + par_value;
				var x = Math.floor(num_para % 2) * 200 + 8;
				var y = 30 + (this.fontSize() + 4) * (Math.floor(num_para / 2) + 1);
				this._itemInfor.fontSize = this.fontSize();
				this._itemInfor.drawText(text, x, y, 200, this.fontSize(), 'left');
				num_para++;
			}
		}
	}
	if (num_para % 2 > 0) {
		num_para++;
	}
	if (item.advan) {
		var advanNum = item.advan.length;
		for (var j = 0; j < advanNum; j++) {
			if (item.advan[j].trait_id > 0) {
				var text = '●' + $RL_systemSettings.traitDescription[item.advan[j].trait_id];
				text = text.replace('<n>', $RL_systemSettings.dataName[item.advan[j].trait_id][item.advan[j].trait_dataid]);
				text = text.replace('<v>%', item.advan[j].trait_value * 100 + '%');
				text = text.replace('<v>', item.advan[j].trait_value);
				var x = Math.floor(num_para % 2) * 200 + 8;
				var y = 30 + (this.fontSize() + 4) * (Math.floor(num_para / 2) + 1);
				this._itemInfor.fontSize = this.fontSize();
				this._itemInfor.drawText(text, x, y, 200, this.fontSize(), 'left');
				num_para += 2;
			}
		}
	}
	num_para = Math.floor((num_para + 1) / 2);
	var item_description = this.formatDescription(item.basic.description, 20);
	for (var i = 0; i < item_description.length; i++) {
		this._itemInfor.fontSize = this.fontSize();
		this._itemInfor.drawText(item_description[i], 8, 36 + this.fontSize() + (this.fontSize() + 4) * num_para + i * this.fontSize(), 2000, this.fontSize(), 'left');
	}

};
IW_Window_ItemHelp.prototype.formatDescription = function (text, maxLength) {
	var description = [];
	if (text) {
		var lines = Math.floor(text.length / maxLength) + 1;
		var description = [];
		var end = text.length;
		for (var i = 0; i < lines; i++) {
			end = ((i + 1) * maxLength) > text.length ? text.length : ((i + 1) * maxLength);
			description[i] = text.slice(i * maxLength, end);
		}
		return description;
	} else {
		return description;
	}
};
IW_Window_ItemHelp.prototype.paraIndexToName = function (paraIndex) {

	var para_name = $RL_systemSettings.parametersBasicDisplayName.concat($RL_systemSettings.parametersAdvanDisplayName);

	return para_name[paraIndex];
};
IW_Window_ItemHelp.prototype.drawItemName = function (item) {
	if (this._statusWindow){
	var sx = item.basic.iconIndex % 16 * 32;
	var sy = Math.floor(item.basic.iconIndex / 16) * 32;
	var bitmap = new Bitmap(32, 200);
	this._statusWindow.bitmap_icon.addLoadListener(function () {
		this.contents.blt(bitmap, 0, 0, 32, 200, 0, 0);
		this.contents.blt(this._statusWindow.bitmap_icon, sx, sy, 32, 32, 0, 0);
		this.contents.fontSize = this.fontSize();
		this.contents.drawText(item.basic.name, 40, 0, 400, this.lineHeight(), 'left');
	}
		.bind(this));
	}
};
IW_Window_ItemHelp.prototype.makeButton = function (item) {
	this.contents.fontSize = this.fontSize();
	this.contents.drawText('取消', this.width - 80, 0, 100, 32, 'left');
	//物品栏
	if (item && this._sourceWindowID === 0) {
		if (item.basic.weaponcheck || item.basic.armorcheck) {
			this.contents.fontSize = this.fontSize();
			this.contents.drawText('装备', this.width - 150, 0, 100, 32, 'left');
		} else if (item.basic.consumable && !item.basic.weaponcheck && !item.basic.armorcheck) {
			this.contents.fontSize = this.fontSize();
			this.contents.drawText('使用', this.width - 150, 0, 100, 32, 'left');
		}

	};
	if (item && this._sourceWindowID === 1)
		// 装备栏
	{
		if (item.basic.weaponcheck || item.basic.armorcheck) {
			this.contents.fontSize = this.fontSize();
			this.contents.drawText('卸下', this.width - 150, 0, 100, 32, 'left');
		}
	};

};
IW_Window_ItemHelp.prototype.scrollUp = function () {
	if (this._scroll * this.scrollSpeed() + 350 < this._itemInfor.height) {
		this._scroll += 1;
	}
	if (this._sourceWindowID === 0) {
		var x = SceneManager._scene._item._cursor.sprite.x;
		var y = SceneManager._scene._item._cursor.sprite.y;
	}
	if (this._sourceWindowID === 1) {
		var x = SceneManager._scene._equip._cursor.sprite.x;
		var y = SceneManager._scene._equip._cursor.sprite.y;
	}
	this.drawItemInfo(this._item, x, y, this._scroll, this._sourceWindowID);
};
IW_Window_ItemHelp.prototype.scrollDown = function () {
	if (this._scroll > 0) {
		this._scroll -= 1;
	}
	if (this._sourceWindowID === 0) {
		var x = SceneManager._scene._item._cursor.sprite.x;
		var y = SceneManager._scene._item._cursor.sprite.y;
	}
	if (this._sourceWindowID === 1) {
		var x = SceneManager._scene._equip._cursor.sprite.x;
		var y = SceneManager._scene._equip._cursor.sprite.y;
	}

	this.drawItemInfo(this._item, x, y, this._scroll, this._sourceWindowID);
};

IW_Window_ItemHelp.prototype.cursorDown = function (wrap) {
	this.scrollDown();
};
IW_Window_ItemHelp.prototype.cursorUp = function (wrap) {
	this.scrollUp();
};
IW_Window_ItemHelp.prototype.cursorRight = function (wrap) {
	this.select(1);
};
IW_Window_ItemHelp.prototype.cursorLeft = function (wrap) {
	this.select(0);
};
IW_Window_ItemHelp.prototype.show = function () {
	this.visible = true;
};
IW_Window_ItemHelp.prototype.hide = function () {
	this.visible = false;
};
IW_Window_ItemHelp.prototype.select = function (index) {
	this._lastSelect = this._index;
	this._index = index;
	this.refresh();
};
IW_Window_ItemHelp.prototype.setStatusWindow = function (statuswindow) {
	this._statusWindow = statuswindow;
};
IW_Window_ItemHelp.prototype.cursorVisible = function () {
	return this.active;
};

IW_Window_ItemHelp.prototype.isCursorMovable = function () {
	return this.active;
};

IW_Window_ItemHelp.prototype.activate = function () {
	this.active = true;
	this._cursor.show();
	this.select(0);
};

IW_Window_ItemHelp.prototype.deactivate = function () {
	this.active = false;
	if (this._cursor) {
		this._cursor.hide();
	}
};

IW_Window_ItemHelp.prototype.updateCursor = function () {
	if (this.cursorVisible()) {
		this._cursor.show();
		this._cursor.setCursorPosition(this.x + 250 + this.index() * 70, this.y + 9);
		this._cursor.setCursorSize(51, 29);
	} else {
		this._cursor.hide();
	}
};
//******************************************************************\\
//           物品栏窗口
//******************************************************************\\

function IW_Window_ItemBag() {
	this.initialize.apply(this, arguments);
}

IW_Window_ItemBag.prototype = Object.create(Window_Selectable.prototype);
IW_Window_ItemBag.prototype.constructor = IW_Window_ItemBag;

IW_Window_ItemBag.prototype.initialize = function (base_window) {
	Window_Selectable.prototype.initialize.call(this, 0, 400, 816, 214);
	this._statusWindow = base_window;
	this.updateSlots();
	this.contentsOpacity = 255;
	this.backOpacity = 0;
	this.active = true;
	this._cursor = new IW_Select_Cursor();
	this._cursor.hide();
	this._index = 0;
	this.refresh();
};
IW_Window_ItemBag.prototype.updateSlots = function () {
	this.contents.clear();
	var bitmap = ImageManager.loadBitmap('img/system/', 'slots', 0, true);
	var bitmap_2 = new Bitmap(816, 224);
	bitmap.addLoadListener(function () {
		for (var i = 0; i < 17; i++) { //横行绘制
			for (var j = 0; j < 3; j++) { //纵列绘制
				bitmap_2.blt(bitmap, 0, 0, 36, 36, i * 45 + 11, j * 45);
			}
		}
		for (var i = 0; i < 13; i++) {
			bitmap_2.blt(bitmap, 0, 0, 36, 36, i * 45 + 11, 3 * 45)
		}
		this.contents = bitmap_2;
	}
		.bind(this));
	for (var i = 0; i < $IW_gameParty.allItems().length; i++) {
		if ($IW_gameParty.allItems()[i] != null && $IW_gameParty.allItems()[i].num > 0) {
			this.drawItem(i);
		}
	}

};
// change the visibility, color, size of the cursor accoding to the current item.
IW_Window_ItemBag.prototype.updateCursor = function () {
	var item = $IW_gameParty.allItems()[this.index()];
	if (this.cursorVisible()) {
		this._cursor.show();
		this.updateCursorPosition();
		this.updateHelpWindow();
	}

};
IW_Window_ItemBag.prototype.refresh = function () {
	this.updateSlots();
	this.updateCursor();
};

IW_Window_ItemBag.prototype.cursorVisible = function () {
	return (this._cursor) && (this.index() >= 0);
};

IW_Window_ItemBag.prototype.isCursorMovable = function () {
	return this.active;
};
IW_Window_ItemBag.prototype.activate = function () {
	this.active = true;
	this._cursor.show();
	this.select(0);
};
IW_Window_ItemBag.prototype.index = function () {
	return this._index;
};

IW_Window_ItemBag.prototype.item = function () {
	return $IW_gameParty.items[this._index];
};

IW_Window_ItemBag.prototype.isOKenable = function () {
	return this._index;
};

IW_Window_ItemBag.prototype.processOk = function () {
	if (this.isCurrentItemEnabled()) {
		this.playOkSound();
		this.updateInputData();
		this.deactivate();
		this.callOkHandler();
	} else {
		this.playBuzzerSound();
	}
};

IW_Window_ItemBag.prototype.isCurrentItemEnabled = function () {
	return $IW_gameParty.allItems()[this.index()];
};

IW_Window_ItemBag.prototype.updateCursorPosition = function () {
	if (this.index() === 64) {
		this._cursor.setCursorPosition(592 + 20, 138 + 417);
		this._cursor.setCursorSize(100, 32);
	}
	if (this.index() === 65) {
		this._cursor.setCursorPosition(692 + 20, 138 + 417);
		this._cursor.setCursorSize(80, 32);
	}
	if (this.index() < 64 && this.index() >= 0) {
		var ix = this.index() % 17 * 45 + 29;
		var iy = Math.floor(this.index() / 17) * 45 + 417;
		this._cursor.setCursorPosition(ix, iy);
		this._cursor.setCursorSize(37, 37);
	}
	if (this.index() === -1) {
		this._cursor.hide();
	}
};

IW_Window_ItemBag.prototype.cursorDown = function (wrap) {
	if (this.index() < 47) {
		this.select(this.index() + 17);
	} else if (this.index() < 49) {
		this.select(64);
	} else if (this.index() < 51) {
		this.select(65);
	} else if (this.index() < 64) {
		this.select(this.index() - 51);
	} else if (this.index() === 64) {
		this.select(13);
	} else if (this.index() === 65) {
		this.select(15);
	}
};
IW_Window_ItemBag.prototype.cursorUp = function (wrap) {
	if (this.index() < 13) {
		SceneManager._scene.switchToEquipWindow();
	} else if (this.index() < 15) {
		this.select(64);
	} else if (this.index() < 17) {
		this.select(65);
	} else if (this.index() < 64) {
		this.select(this.index() - 17);
	} else if (this.index() === 64) {
		this.select(47);
	} else if (this.index() === 65) {
		this.select(49);
	}
};
IW_Window_ItemBag.prototype.cursorRight = function (wrap) {
	if (this.index() <= 64) {
		this.select(this.index() + 1);
	} else if (this.index() === 65) {
		this.select(0);
	}
};
IW_Window_ItemBag.prototype.cursorLeft = function (wrap) {
	if (this.index() > 0) {
		this.select(this.index() - 1);
	} else if (this.index() === 0) {
		this.select(65);
	}
};

IW_Window_ItemBag.prototype.select = function (index) {
	this._lastSelect = this._index;
	this._index = index;
	this.refresh();
	//this.updateHelpWindow();
};

IW_Window_ItemBag.prototype.setActor = function (actor) {
	if (this._actor !== actor) {
		this._actor = actor;
		// this.refresh();
	}
};
IW_Window_ItemBag.prototype.drawItem = function (index) {
	if (this._statusWindow) {
		var item = $IW_gameParty.allItems()[index];
		var sx = item.basic.iconIndex % 16 * 32;
		var sy = Math.floor(item.basic.iconIndex / 16) * 32;
		var ix = index % 17 * 45 + 11 + 2;
		var iy = Math.floor(index / 17) * 45 + 2;
		this._statusWindow.bitmap_icon.addLoadListener(function () {
			this.contents.blt(this._statusWindow.bitmap_icon, sx, sy, 32, 32, ix, iy);
			this.contents.fontSize = 15;
			this.contents.drawText('x' + $IW_gameParty.allItems()[index].num, ix, iy + 23, 32, 8, 'right');
		}
			.bind(this));
	}
};
IW_Window_ItemBag.prototype.slotPosition = function (index) {
	var ix = index % 17 * 45 + 11 + 2;
	var iy = Math.floor(index / 17) * 45 + 2;
	var slotCentre = {
		'x': ix,
		'y': iy
	};
};

IW_Window_ItemBag.prototype.setStatusWindow = function (statuswindow) {
	this._statusWindow = statuswindow;
};

IW_Window_ItemBag.prototype.updateHelpWindow = function () {
	if (SceneManager._scene._help) {
		if ($IW_gameParty.allItems()[this.index()] != null) {
			SceneManager._scene._help.show();
			SceneManager._scene._help.drawItemInfo($IW_gameParty.allItems()[this.index()], this._cursor.sprite.x, this._cursor.sprite.y, 0, 0);
			SceneManager._scene._help.update();
		} else {
			SceneManager._scene._help.hide();
		}
	}
};
//--------------------------------------
//  Sence Object
//--------------------------------------

function IW_Scene_Equip() {
	this.initialize.apply(this, arguments);
}

IW_Scene_Equip.prototype = Object.create(Scene_MenuBase.prototype);
IW_Scene_Equip.prototype.constructor = IW_Scene_Equip;

IW_Scene_Equip.prototype.initialize = function () {
	Scene_MenuBase.prototype.initialize.call(this);
	this._memberIndex = 0;
};

IW_Scene_Equip.prototype.creatEquipWindow = function () {
	// 构建用于显示身上装备以及空位的窗口
	this._equip = new IW_Window_Equip(206, 196, 100);
	this._equip.LoadEquipSlotsBack();
	this._equip.LoadEquipSlots();
	this._equip.LoadEquipIcons();
	this._equip.refreshBackground();
	this._equip.deactivate();
	this._equip.setHandler('ok', this.onEquipSlotOk.bind(this));
	this._equip.setHandler('cancel', this.popSenceEquip.bind(this));
	this.addWindow(this._equip);
};
IW_Scene_Equip.prototype.creatItemWindow = function () {
	// 构建用于显示物品栏的窗口
	this._item = new IW_Window_ItemBag();
	this._item.updateSlots();
	this._item.setHandler('ok', this.onItemBagOk.bind(this));
	this._item.setHandler('cancel', this.popSenceEquip.bind(this));
	this.addWindow(this._item);
};
IW_Scene_Equip.prototype.creatHelpWindow = function () {
	//构建用于显示物品信息的窗口的显示层
	this._help = new IW_Window_ItemHelp();
	this._help.setHandler('ok', this.onItemOk.bind(this));
	this._help.setHandler('cancel', this.onItemCancel.bind(this));
	this.addChild(this._help);
};
IW_Scene_Equip.prototype.refreshActor = function () {
	var actor = this.actor();
	this._equip.setActor(actor);
	this._item.setActor(actor);
	this._help.setActor(actor);
};
IW_Scene_Equip.prototype.setStatusWindow = function () {
	this._item.setStatusWindow(this._equip);
	this._help.setStatusWindow(this._equip);
};
// creat all windows and cursor
IW_Scene_Equip.prototype.create = function () {
	Scene_MenuBase.prototype.create.call(this);
	this.creatEquipWindow();
	this.creatItemWindow();
	this.creatHelpWindow();
	this.refreshActor();
	this.setStatusWindow();
	this._item.select(0);
	this.swap();
};

//当前目标是装备栏中物品，激活信息窗口
IW_Scene_Equip.prototype.onEquipSlotOk = function () {
    Input.clear();
	if (this._equip.findEquip()) {
	    console.log('error');
		this._help.activate();
		this._help.refresh();
		this._equip.deactivate();
		this._equip._cursor.pause();;
	}

};

//当前目标是物品栏中物品，激活信息窗口
IW_Scene_Equip.prototype.onItemBagOk = function () {
	if ($IW_gameParty.allItems()[this._item.index()] != null) {
		this._help.activate();
		this._help.refresh();
		this._item._cursor.pause();
		this._item.deactivate();
	}
};

//exit from equip sence
IW_Scene_Equip.prototype.popSenceEquip = function () {
	this._equip.deactivate();
	this._item.deactivate();
	SceneManager.pop();
};

// 选择物品的使用，或者取消
// index 1 取消 0为使用或者装备
IW_Scene_Equip.prototype.onItemOk = function () {
	if (this._help.index() === 1) {
		if (this._help._sourceWindowID === 0) {
			this.onItemCancel();
		}
		if (this._help._sourceWindowID === 1) {
			this.onEquipCancel();
		}
	}
	if (this._help.index() === 0) {
		//物品栏，使用或者装备物品
		if (this._help._sourceWindowID === 0) {
			this.onUseItemOrEquip();
		}
		if (this._help._sourceWindowID === 1) {
			//卸下身上装备
			this.onUnEquip();
		}

	}
};

//浮动物品信息窗口取消
IW_Scene_Equip.prototype.onItemCancel = function () {
	this._help.deactivate();
	this._help.deselect();
	this._help.hide();
	// window Item
	if (this._help._sourceWindowID === 0) {
		this._item.activate();
		this._item.select(this._item._lastSelect);
		this._item._cursor.resume();
	}
	//window Equip
	if (this._help._sourceWindowID === 1) {
		this._equip.activate();
		this._equip.select(this._equip.index());
		this._equip._cursor.resume();
	}
};

IW_Scene_Equip.prototype.onUnEquip = function () {
	if ($IW_gameParty._items.indexOf(null) >= 0) {
		var currentEquip = this.actor()._RL_equips.equips[this._equip.index()];
		console.log(currentEquip);
		$IW_gameParty.gainItem(currentEquip,1,0,0);
		this.actor()._RL_equips.equips[this._equip.index()] = null;
		//this._equip._actor.discardEquip(this._equip.index());
		this.actor().refresh();
		this.refresh();
	} else {
		$gameTemp.toast("物品栏已满，无法解除装备", '#ffff00');
	}
};

IW_Scene_Equip.prototype.onEquipCancel = function () {
	this._help.deactivate();
	this._help.deselect();
	this._help.hide();
	this._equip.activate();
	this._equip.select(this._equip.index());
};

IW_Scene_Equip.prototype.onUseItemOrEquip = function () {
	var index = this._item.index();
	var item = $IW_gameParty.allItems()[index];
	if (item.basic.weaponcheck || item.basic.armorcheck)
	{
		this._equip._actor.changeEquip(item, index);
	}
	else
	{
		this.useItem(item);
	}
	this.refresh();
};

IW_Scene_Equip.prototype.useItem = function (item) {
	var target = this.actor();
	$gameConsole.converSkillToBuff(item, null, null, target, target);
	$gameConsole.processBuffs (null, null, target, 6);
};

// swith to equip window from item bag
IW_Scene_Equip.prototype.switchToEquipWindow = function () {
	Input.clear();
	this._item.select(-1);
	this._item.deactivate();
	this._item._cursor.hide();
	this._equip.activate();
	this._equip.select(0);
};

// swith to itemBag window from equip Window
IW_Scene_Equip.prototype.switchToItemBagWindow = function () {
	Input.clear();
    this._item.activate();
	this._equip.deactivate();
	this._equip._cursor.hide();
};
IW_Scene_Equip.prototype.refresh = function () {
	this._equip.refresh();
	this._item.refresh();
	this.onItemCancel();
};
IW_Scene_Equip.prototype.applyItem = function () {
	var action = new Game_Action(this.user());
	action.setItemObject(this.item());
	this.itemTargetActors().forEach(function (target) {
		for (var i = 0; i < action.numRepeats(); i++) {
			action.apply(target);
		}
	}, this);
};

IW_Scene_Equip.prototype.itemTargetActors = function () {
	var action = new Game_Action(this.user());
	action.setItemObject(this.item());
	if (!action.isForFriend()) {
		return [];
	} else if (action.isForAll()) {
		return $gameParty.members();
	} else {

		return [$gameParty.members()[SceneManager._scene._equip._actor._actorId - 1]];

	}
};
//swap the curor layer with its windowlayer to make sure the cursor is on the top of the window
IW_Scene_Equip.prototype.swap = function () {
	var length = SceneManager._scene.children.length;
	var array = SceneManager._scene.children;
	array[length - 2] = array.splice(length - 1, 1, array[length - 2])[0];
};

//return the current active actor
IW_Scene_Equip.prototype.actor = function () {
	return $IW_gameActors.actor($IW_gameParty._menuActorId);
};
IW_Scene_Equip.prototype.item = function () {
	return this._item.item();
};
IW_Scene_Equip.prototype.user = function () {
	var members = $gameParty.movableMembers();
	var bestActor = members[0];
	var bestPha = 0;
	for (var i = 0; i < members.length; i++) {
		if (members[i].pha > bestPha) {
			bestPha = members[i].pha;
			bestActor = members[i];
		}
	}
	return bestActor;
};

Bitmap.prototype.RUItest = function (x, y, r, maxLength, color1, color2, fillPercent) {
	var context = this._context;
	var grad = context.createLinearGradient(x - r, y - r, x + r + maxLength * fillPercent, y - r);
	var startCoords = [];
	grad.addColorStop(0, color1);
	grad.addColorStop(1, color2);
	context.save();
	context.beginPath();
	context.moveTo(x, y + r);
	context.arc(x, y, r, 0.5 * Math.PI, 1.5 * Math.PI);
	context.moveTo(x, y + r);
	context.lineTo(x + maxLength, y + r);
	context.lineTo(x + maxLength + 0.71 * r, y);
	context.lineTo(x + maxLength, y - r);
	context.lineTo(x, y - r);
	context.lineWidth = 3;
	context.clip();
	context.fillStyle = grad;
	context.fillRect(x - r, y - r, Math.floor((2 * r + maxLength) * fillPercent), r * 2);
	context.strokeStyle = grad;
	context.stroke();
	context.restore();
	this._setDirty();
};
