const updateWl = require('../helpers/update-wl');

const data = {
  "finviz-nanoEarlyRunners": [
    "CAPR",
    "HLTH"
  ],
  "finviz-under5Target10Change2Vol200Within10of52Low": [
    "CSLT",
    "RTIX"
  ],
  "finviz-under5Target10Change2Vol200": [
    "LLNW",
    "MDXG"
  ],
  "finviz-under5TopLosers": [
    "GENE",
    "ONCS"
  ],
  "finviz-pennyStock1milVol": [
    "AMR",
    "AMRH"
  ],
  "finviz-newHighsUp3volOver500k": [
    "ASCMA",
    "AVP"
  ],
  "barchart-topStocks": [
    "NOC",
    "FICO"
  ],
  "barchart-signalStrength": [
    "NOC",
    "NEE"
  ],
  "barchart-topStocks-signalStrength": [
    "NOC"
  ],
  "barchart-signalDirection": [
    "SHOP",
    "JJSF"
  ],
  "barchart-upgrades": [
    "FCNCA",
    "ORLY"
  ],
  "day-streaks-4days": [
    "OWCP",
    "VATE",
    "BOPFF"
  ],
  "day-streaks-7days": [
    "MJNA"
  ],
  "day-streaks-5days": [
    "CLOK",
    "UNVC"
  ],
  "day-streaks-3days": [
    "NXTTF",
    "ASTI"
  ],
  "day-streaks-6days": [
    "TTCM"
  ]
}

module.exports = async () => {
  await updateWl('5-22-2019', data);
};