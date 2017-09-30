function consoleCenter() {
	this.initialize.apply(this, arguments);
}
consoleCenter.prototype.constructor = consoleCenter;
consoleCenter.prototype.initialize = function () {};

consoleCenter.prototype.runMove = function (moveStep) {
	var order = "";
	var moveSlice = moveStep.move.match(/[a,b](\.){0}/g);
	for (var i = 0; i < moveSlice.length; i++) {
		var param = moveSlice[i] === "a" ? moveStep.targetA : moveStep.targetB;
		if (order.length === 0) {
			order = moveStep.move.replace(moveSlice[i], param);
		} else {
			order = order.replace(moveSlice[i], param);
		}
	}
	eval(order);
};
consoleCenter.prototype.processBuffs = function (target, turn, time) {
	target.tempParams = [];
	var paramIndex = [];
	for (var a in target._RL_parameters.result) {
		target._RL_parameters.result[a].map(function (m) {
			target.tempParams.push(m);
		});
	}

	if (target.buffs) {
		for (var i = target.buffs.length - 1; i >= 0; i--) { //判断是不是到了回合数，如果超过了生效回合，则清除效果
			if (target.buffs[i].endturn >= turn) {
				//检查时间点对不对
				if (time === target.buffs[i].time) {
					//先处理属性变化
					for (var j = 0; j < target.buffs[i].effectParam.length; j++) {
						var order = "";
						var moveSlice = target.buffs[i].effectParam[j].match(/[a,b](\.){1}[A-Z]{2,3}/g);
						for (var m = 0; m < moveSlice.length; m++) {
							paramIndex = moveSlice.map(function (m) {
									return $RL_systemSettings.parametersShortName.indexOf(m.slice(2, m.length));
								});
							if (order.length === 0) {
								order = target.buffs[i].effectParam[j].replace(moveSlice[m], "target.tempParams[" + paramIndex[0] + "]");
							} else {
								order = order.replace(moveSlice[m], "target.tempParams[" + paramIndex[0] + "]");
							}
						}
						console.log(order);
						eval(order);
					}
					//在处理封印变化
					if ("seals" in target.buffs[i]) {
						if (!("seal" in target)) {
							target.seal = [];
						}
						for (var j = 0; j < target.buffs[i].seals.length; j++) {
							target.seal.push({
								"type": target.buffs[i].seals[j].type,
								"id": target.buffs[i].seals[j].id,
								"startTurn": target.buffs[i].seals[j].startTurn + turn,
								"last": target.buffs[i].seals[j].last
							});
						}
					}
				}
			} //如果时间节点不对，直接删除
			else {
				target.buffs.splice(i, 1);
			}
		}
	} else {
		target.buffs = [];
	}
};
consoleCenter.prototype.skillToBuffs = function (actor, skill, turn) {
	//用于把技能换成buff 这样在buff 处理阶段一起处理
	//*** 技能是否可以使用的判定 ***
	var skill_cast_check = true;
	// 1 - 判定，技能是否存在于角色技能栏中
	skill_cast_check = skill_cast_check && actor.findSkill(skill);

	// 2 - 判定，技能是否被封印
	actor.buffs.seals.serch(["type", "id"], ["skill", skill.id]).map(
		function (m) {
		if ((m.startTurn + m.last) >= turn) {
			skill_cast_check = false;
		}
	});

	// 3 - 判定，是否支付的起消耗
	skill_cast_check = costCheck && this.costCheck(skill, actor);

	// 4 - 判定，是否满足释放条件
	skill_cast_check = limitCheck && this.limitCheck(skill, actor);

	// 如果满足所有执行条件，则开始执行此技能
	if (skill_cast_check) {
		// 5 - 执行，构建目标列
		var skill_target_array = this.findTargetList(skill, actor, party, enermy);
	}
};

// convert a skill into moves. a skill or item may contains more than 1 move
consoleCenter.skillToMoves(user, party, enermy, skill) {
	var moveNum = target.length;
	var moves = [];
	var buffs = [];
	// seperate a skill
	for (int i = 0; i < moveNum; i++) {
		if (skill.duration.length >= i && skill.duration[i] != 0) {
			// check the duration : buffs duration>0 instant: duration = 0

		} else {
			// duration = 0
			var target = this.findTargetList();
		}
	}
};
consoleCenter.prototype.costCheck = function (skill, actor) {
	//检测给定的技能释放是否支付的起消耗
	var costParamOrder = [];
	var cost = [];
	for (var key in skill.cost) {
		costParamOrder.push($RL_systemSettings.parametersShortName.indexOf(key));
		cost.push(skill.cost[key]);
	}
	var cost_length = cost.length;
	for (var i = 0; i < cost_length; i++) {
		if (actor._RL_parameters.result.advan[costParamOrder[i]] < cost[i]) {
			return false;
		}
	}
	return true;
};

consoleCenter.prototype.limitCheck = function (skill, actor) {
	//检测给定的技能释放是否支付的起消耗
	var limitParamOrder = [];
	var limit = [];
	var limitCheck = true;
	for (var key in skill.require) {
		limitParamOrder.push($RL_systemSettings.parametersShortName.indexOf(key));
		limit.push(skill.require[key]);
	}
	var limit_length = limit.length;
	for (var i = 0; i < limit_length; i++) {
		limitCheck = limitCheck && (limit[i] >= 0 ? actor._RL_parameters.result.advan[costParamOrder[i]] < cost[i] : actor._RL_parameters.result.advan[costParamOrder[i]] > cost[i]);
	}
	return limitCheck;
};

consoleCenter.prototype.findTargetList = function (actor, skill, party, enermy, selectTarget) {
	//根据技能返回目标列表
	var tempTargetsList = [];
	var targetsList = []
	var moveNum = skill.target.length;
	for (int i = 0; i < moveNum; i++) {
		switch (skill.range) {
		case "enemy": {
				tempTargetsList = enermy;
			}
		case "party": {
				tempTargetsList = party;
			}
		case "all": {
				tempTargetsList = enermy.concat(party);
			}
		case "self": {
				tempTargetsList.push(actor);
			}
		}
		targetsList.push(this.findTargetByRange(tempTargetsList, skill, selectTarget));

	}
	return targetsList;
};

// used to find the targets according to the range of a skill
consoleCenter.findTargetByRange = function (tempTargetsList, skill, selectTarget) {
	switch (skill.range) {
	case "single": {
			if (selectTarget) {
				return selectTarget;
			} else {
				return tempTargetsList[0];
			}
		}
	case "cross":
	case "verti":
	case "horizon":
	case "nx":
	case "all": {
			return selectTarget;
		}
	default:
		return null;
	}
};

// Process use Item treat the item as a conbination of skills 
consoleCenter.useItem = function (user, party, enermy, ) {
	// in the battle
	if (BattleManager._phase) {}
	else
		// not in the battle
	{
		for ()
			//not in battle so the target can be only self
			var targetsList = this.findSkillTarget(user, skill, party, enermy, null);
	}
};
