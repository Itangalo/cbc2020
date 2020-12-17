function cbc(grades) {
  // Build an array of objects with grades, sorted by difference between person A and B grades.
  var sortedGrades = [];
  for (i = 0; i < grades.length; i++) {
    if (grades[i][0] === '' || grades[i][1] === '') {
      break;
    }
    sortedGrades.push({
      'delta' : grades[i][0] - grades[i][1],
      'A': grades[i][0],
      'B': grades[i][1],
      'line': i
    });
  }
  sortedGrades.sort((a,b) => (a.delta > b.delta) ? 1 : ((b.delta > a.delta) ? -1 : 0));

  // First step is to prepeare for the special case where there are several ways of distributing
  // items between A and B while maintaining maximum total grade. We then need to find a
  // distribution that is likely to give the most equal total grade score for A and B.
  // (This could be done in a way ensuring the most equal total grades possible, but it would
  // be quite complex. Probably by testing all possible combinations, or something.)
  var medianDelta = 0;
  if (sortedGrades.length % 2 == 1) {
    medianDelta = sortedGrades[(sortedGrades.length - 1) / 2]['delta'];
  }
  else {
    medianDelta = (sortedGrades[(sortedGrades.length) / 2 - 1]['delta'] + sortedGrades[(sortedGrades.length) / 2]['delta']) / 2;
  }

  // Sort the items which clearly belong to A and B first.
  var BGrades = [];
  var AGrades = [];
  var undecided = [];
  var item;
  for (i = 0; i < sortedGrades.length; i++) {
    if (sortedGrades[i]['delta'] < medianDelta) {
      sortedGrades[i]['owner'] = 'B';
      BGrades.push(sortedGrades[i]['B']);
    }
    if (sortedGrades[i]['delta'] > medianDelta) {
      sortedGrades[i]['owner'] = 'A';
      AGrades.push(sortedGrades[i]['A']);
    }
    if (sortedGrades[i]['delta'] == medianDelta) {
      item = sortedGrades[i];
      item['sortedPlace'] = i;
      undecided.push(item);
    }
  }

  // Then go through the undecided items, highest to lowest. Award each item to
  // the person who has the lowest total grade-per-item unless that person already
  // has got half the items awarded.
  undecided.sort((a,b) => (a['A'] < b['A']) ? 1 : ((a['A'] > b['A']) ? -1 : 0));
  var AAverage, BAverage;
  if (sortedGrades.length % 2) {
    var oddItems = 1;
    var itemLimit = (sortedGrades.length - 1) / 2;
  }
  else {
    var oddItems = 0;
    var itemLimit = sortedGrades.length / 2;
  }
  while (undecided.length - oddItems) {
    item = undecided.shift();
    AAverage = (AGrades.reduce(function(a, b){return a + b;}, 0)) / AGrades.length;
    BAverage = (BGrades.reduce(function(a, b){return a + b;}, 0)) / BGrades.length;
    // Award the item to B if B has a lower average or A already has gotten half the items.
    if (BAverage < AAverage || AGrades.length >= itemLimit) {
      item['owner'] = 'B';
      BGrades.push(item['B']);
      sortedGrades[item['sortedPlace']] = item;
    }
    else {
      item['owner'] = 'A';
      AGrades.push(item['A']);
      sortedGrades[item['sortedPlace']] = item;
    }
  }

  // Now all items should be awarded, with exception for the middle item in an odd set of items.
  // If this is the case, split the item between A and B.
  if (oddItems == 1) {
    item = undecided.shift();
    AGrades.push(item['A'] / 2);
    BGrades.push(item['B'] / 2);
    item['owner'] = 'A+B';
    sortedGrades[item['sortedPlace']] = item;
  }

  // Calculate the average grades.
  AAverage = (AGrades.reduce(function(a, b){return a + b;}, 0)) / (AGrades.length - oddItems/2);
  BAverage = (BGrades.reduce(function(a, b){return a + b;}, 0)) / (BGrades.length - oddItems/2);
  // For the total average, give the lowest individual average double weight.
  if (AAverage > BAverage) {
    var average = (AAverage + 2 * BAverage) / 3;
  }
  else {
    var average = (2 * AAverage + BAverage) / 3;
  }

  // Build a nice array for outputting the results.
  // First the sumary.
  var output = [
    ['A average grade', AAverage],
    ['B average grade', BAverage],
    ['Box average grade', average],
    ['', ''],
    ['Owner', '']
  ];
  // Then a list of who gets which item.
  sortedGrades.sort((a,b) => (a.line > b.line) ? 1 : ((b.line > a.line) ? -1 : 0));
  for (i = 0; i < sortedGrades.length; i++) {
    output.push([sortedGrades[i]['owner'], '']);
  }
  return output;
}
