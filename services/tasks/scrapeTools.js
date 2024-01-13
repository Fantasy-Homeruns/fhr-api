'use strict';

let scrapeTools = {
  isNormalInteger: (str) => {
    var n = ~~Number(str);
    return String(n) === str && n >= 0;
  },

  advancedSplit: (string, delimiter) => {
     return string.split(new RegExp(`(${delimiter})`, 'i'));
  },

  removeFirstInitial: (player) => {
    // first remove first initial if exists
    var pName, playerName = player.split(' ');
    if (playerName.length > 1) {
      let firstName = playerName[0].trim();
      firstName = firstName.replace(/\./g,'');
      if (firstName.length === 1) {
        // get rid of it .. initial
        pName = playerName[1];
      } else {
        let secondName = playerName[1].replace(/\./g,'');
        pName = firstName + ' ' + secondName;
      }
    } else {
      pName = playerName[0];
    }
    return pName;
  },

  removeAccents: (player) => {
    var strAccents = player.split('');
    var strAccentsOut = new Array();
    var strAccentsLen = strAccents.length;
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (var y = 0; y < strAccentsLen; y++) {
      if (accents.indexOf(strAccents[y]) != -1) {
        strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
      } else {
        strAccentsOut[y] = strAccents[y];
      }
    }
    strAccentsOut = strAccentsOut.join('');

    let last2 = strAccentsOut.substr(strAccentsOut.length - 2);
    if (last2 == "Jr") {
      strAccentsOut += ".";
    }
    return strAccentsOut.trim();
  },
};

module.exports = scrapeTools;
