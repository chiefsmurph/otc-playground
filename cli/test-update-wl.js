const updateWl = require('../helpers/update-wl');

module.exports = async () => {
  await updateWl('5-14-2019', {"accumulation-infinity":["UDHI","FNQQF","BXXRF","TVIPF","BRYYF","ERGTF","MGIDF"],"accumulation-lt25":["PVCTW","EXLA","XALL","IGEX","IMLE"],"accumulation-negative":["NTRR","QPAG"]});
};