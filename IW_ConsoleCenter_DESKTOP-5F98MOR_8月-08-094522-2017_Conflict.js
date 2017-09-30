function consoleCenter() {
	this.initialize.apply(this, arguments);
}
consoleCenter.prototype.constructor = consoleCenter;
consoleCenter.prototype.initialize = function () {};

// conver skill into buffs
consoleCenter.prototype.converSkillToBuff = function (skill, party, enemy, target, castActor) {
	var seedsArray = this.getSkillSeeds(skill);
	seedsArray = this.overWriteSkillSeeds(seedsArray, this.getreWriteObjects(skill));
	var buffsArray = seedsArray.map(function (seed) {
			this.convertSeedToBuff(seed, party, enemy, target, castActor)
		}.bind(this));
};

//re-write the seeds according to the coresponsed object
consoleCenter.prototype.overWriteSkillSeeds = function (seedsArray, reWriteObjectsArray) {
	return seedsArray.map (function (e,i,A) {
		if (reWriteObjectsArray.length<=(i+1)  && reWriteObjectsArray[i])
		{
			for (var key in reWriteObjectsArray[i])
				{
			    A[i][key] = reWriteObjectsArray[i][key];
			    }
			return A[i];
		}
		else 
		{
			return e;
		}				
    });
};


consoleCenter.prototype.getSkillSeeds = function (generalItem) {
	var seeds = [];
	if (generalItem && generalItem.hasOwnProperty('skillSeeds')) {
		generalItem.skillSeeds.forEach(function (e) {
			seeds.push($dataIWSkillSeeds[e]);
		});
	}
	if (generalItem && generalItem.basic.hasOwnProperty('skillSeeds')) {
		generalItem.basic.skillSeeds.forEach(function (e) {
			seeds.push($dataIWSkillSeeds[e]);
		});
	}
	return seeds;
};

consoleCenter.prototype.getreWriteObjects = function (generalItem) {
	var reWriteObjects = [];
	if (generalItem && generalItem.hasOwnProperty('seedsParameters')) {
		generalItem.seedsParameters.forEach(function (e) {
			reWriteObjects.push($dataIWSkillSeeds[e]);
		});
	}
	return reWriteObjects;
};

consoleCenter.prototype.processBuffs = function (party, enemy, player, timeKey) {
	if (player.buff) {
		if (!!player.buff.parameterChange) {
			var numBuff = player.buff.parameterChange.length;
			console.log (numBuff);
			for (var i = 0; i < numBuff; i++) {
				var buff = player.buff.parameterChange[i];
				this.processParameterChange(party, enemy, player, timeKey, i);
			}
		}
	}
};

consoleCenter.prototype.processParameterChange = function (party, enemy, actor, timeKey, buffIndex) {
	var buff = actor.buff.parameterChange[buffIndex];
	var keys = [];
	// keys are short names of parameters
	for (var a in buff.buffParameters) {
		keys.push(a);
	}
	var parameterIndex = $RL_systemSettings.parametersShortName.indexOf(keys[0]);
	if (timeKey === buff.effectTime && timeKey === 6 ){
		if (parameterIndex >= 5) {
		var functionString = buff.effects.replace("T." + keys[0], "actor._parameters.result.advan[" + (parameterIndex - 5 )+ "]");
		functionString = "return " + functionString + ";";
		var anonymousFunction = new Function("actor",functionString);
		var parameterValue = anonymousFunction(actor);
		this.changeParameter(actor, keys[0], parameterValue);
		buff.effected = true;
		}}
	this.removeBuff (actor, buffIndex, "parameterChange");
};

consoleCenter.prototype.changeParameter = function (actor, key, value) {
// value = (value-reduction) * linearReduction * multiReduction - finalReduction
	var valueCalculator = {
		"valueReduction" : 0,
		"linearReduction" : 1,
		"multiReduction" : 1,
		"finalReduction" : 0 
	};
	if (actor.buff.handler && actor.buff.handler.parameterChangeHandler)
	{
		var numHandler = actor.buff.handler.parameterChangeHandler.length;
		for (var i=0; i<numHandler; i++)
		{
			var handler =  actor.buff.handler.parameterChangeHandler[i];
			if (handler.key === key) {handler(actor, key, value, valueCalculator);}
		}
	}
	var index = $RL_systemSettings.parametersShortName.indexOf(key);
	var vR = valueCalculator.valueReduction;
	var lR = valueCalculator.linearReduction;
	var mR = valueCalculator.multiReduction;
	var fR = valueCalculator.finalReduction;
	value = (value - vR) * lR * mR - fR;
	if (index>=5){actor._parameters.result.advan[index-5] = value;}
	else {actor._parameters.result.basic[index] = value;}
};

consoleCenter.prototype.convertSeedToBuff = function (seed, party, enemy, target, castActor) {
	var target = this.findTarget(seed, party, enemy, target, castActor);
	var tempBuff = {
		"buffType": seed.effectType,
		"id": 1,
		"caster": castActor,
		"duration": this.getDuration(seed),
		"effects": seed.effects,
		"effectFrquency": 0,
		"effectTime": seed.effectTime,
		"buffParameters": {},
		"buffEffected" : false,
		"buffRemoveParameter": {}
	};
	tempBuff.effects = tempBuff.effects.replace ("heal",seed.heal);
	tempBuff.effects = tempBuff.effects.replace ("damage",seed.damage);
	tempBuff.effects = tempBuff.effects.replace ("parameterChange",seed.parameterChange);
	if (Array.isArray(target)) {
		target.forEach(function (e, i, A) {
			if (tempBuff.buffType === "parameterChange") {
				var parameterKey = seed.targetParameter;
				tempBuff.buffParameters[parameterKey] = seed.effects;
				if (!target.buff) {
					target.buff = {};
				}
				if (!target.buff.parameterChange) {
					target.buff.parameterChange = [];
				}
				target.buff.parameterChange.push(tempBuff);
			}
		}.bind(this));
	} else {
		if (tempBuff.buffType === "parameterChange") {
			var parameterKey = seed.targetParameter;
			tempBuff.buffParameters[parameterKey] = seed.effects;
			if (!target.buff) {
				target.buff = {};
			}
			if (!target.buff.parameterChange) {
				target.buff.parameterChange = [];
			}
			tempBuff.effected = false;
			target.buff.parameterChange.push(tempBuff);
		}
	};
};

consoleCenter.prototype.findTarget = function (seed, party, enemy, target, castActor) {
	
	if (party){var targetGroup = party.contains(target) ? party : enemy;}
	if (enemy){var casterGroup = party.contains(castActor) ? party : enemy;}
	switch (seed.targetType) {
	case "self":
		var targetList = target;
		break;
	case "enemy":
		var targetList = enemy;
		break;
	case "party":
		var targetList = party;
		break;
	case "all":
		var targetList = party.concat(enemy);
		break;
	default:
		var targetList = target;
	}
	switch (seed.targetRange) {
	case "single":
		var finalTarget = target;
		break;
	case "cross":
		var finalTarget = this.getCrossTarget(targetList, target); ;
		break;
	case "all":
		var targetList = party;
		break;
	default:
		var targetList = castActor;
	}
    return targetList;
};

consoleCenter.prototype.getCrossTarget = function (targetList, target) {
	return target;
};

consoleCenter.prototype.getDuration = function (seed) {
	switch (seed.duration[0]) {
	case "N":
		var duration = {
			"N": seed.duration.match(/\d+/)
		};
		break;
	case "S":
		var duration = {
			"S": seed.duration.match(/\d+/) * 60
		};
		break;
	default:
		var duration = {
			"S": 0
		};
	}
	return duration;
};

consoleCenter.prototype.applyItemToTarget = function (target, item) {
	this.converSkillToBuff(item, [], [], target, target);
	this.processBuffs([],[],target,6);
};

consoleCenter.prototype.removeBuff = function (actor, buffIndex, buffType) {
	try {
		var buff = actor.buff[buffType][buffIndex];
		if (buff.effected && buff.effectTime ===6 ){
			actor.buff[buffType].splice(buffIndex, 1);}
		
	} catch (e) {
		this.outputLogFile(e.message);
		console.log(e.message);
	}
};

consoleCenter.prototype.outputLogFile = function (message) {
	var fs = require('fs');
	var path = require('path').dirname(process.mainModule.filename);
	path += "/systemLog/";
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
	var date = new Date();
	var fileName = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
	path += fileName + ".txt";
	var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	fs.open(path, "a", 0644, function (e, fd) {
		if (e)
			throw e;
		fs.write(fd, time + "  " + message + '\r\n', 0, 'utf8', function (e) {
			if (e)
				throw e;
			fs.closeSync(fd);
		})
	});
};