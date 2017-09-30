var pending = (function (callback) {
	var count = 0;
	var returns = {};
	console.log(count);
	return function (key) {
		count++;
		console.log(count);
		return function (error, data) {
			count--;
			console.log(count);
			returns[key] = data;
			if (count === 0) {
				callback(returns);
			}
		}
	}
});

ImageManager.loadBitmaps = function(fileSeries, fileContainers, dataKeys, callback) {
	if (fileSeries.length <= 0) {return false;}
	var done = this.pending(function() {		
		callback();
	});
	for(var i = 0; i < fileSeries.length; i++) {
		var fileName = fileSeries[i].match(/[a-zA-Z0-9_]*(?=\.png)/);
		if (i<dataKeys.length) {fileName = dataKeys[i];}
		fileContainers[fileName] = Bitmap.load(fileSeries[i]);
		fileContainers[fileName].addLoadListener(done(fileContainers[i]));
	}
};

ImageManager.pending = function(callback) {
  var count = 0;
  var returns = {};
  return function(key) {
    count++;
    return function(error, data) {
      count--;
      key = data;
      if (count === 0) {
        callback();
      }
    }
  }
};
