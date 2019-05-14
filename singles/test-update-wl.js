const updateWl = require('../helpers/update-wl');

module.exports = async () => {
  await updateWl('5-13-2019', {
    "ihub-containsMerger": [
      "XHUA",
      "LEAS",
      "GRDO",
      "SPRV",
      "DAVC",
      "VYST",
      "GXXM",
      "VSHC",
      "RGBP",
      "DMHI",
      "ADNY"
    ],
    "ihub-containsReinstatement": [
      "XHUA",
      "SHOM"
    ],
  });
};