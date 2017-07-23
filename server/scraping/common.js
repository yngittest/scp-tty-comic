module.exports.distinct = function(list, key) {
  var filteredList = [];
  var uniqueList = {};
  for(var i = 0; i < list.length; i++) {
    if(!uniqueList[list[i][key]]) {
      uniqueList[list[i][key]] = list[i];
      filteredList.push(list[i]);
    }
  }
  return filteredList;
};
