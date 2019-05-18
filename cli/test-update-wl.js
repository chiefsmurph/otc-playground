const updateWl = require('../helpers/update-wl');

const data = {
  "twitter-magicmiketrader": [
    "RMSL"
  ],
  "twitter-aaaamhim": [
    "RMSL"
  ],
  "twitter-magicmiketrader-aaaamhim": [
    "RMSL"
  ],
  "twitter-stockguru2020": [
    "CMGO",
    "KRFG"
  ],
  "twitter-stock_hacker": [
    "CMGO",
    "TRII",
    "ESRG"
  ],
  "twitter-stockguru2020-stock_hacker": [
    "CMGO"
  ],
  "twitter-DomBuckz": [
    "TRII",
    "CNGT",
    "DAVC",
    "NDYN"
  ],
  "twitter-DomBuckz-stock_hacker": [
    "TRII"
  ],
  "twitter-WishfulTH1NKin": [
    "BFCH",
    "VSHC"
  ],
  "twitter-GoldMemberOTC": [
    "DLCR"
  ],
  "twitter-OCDrises": [
    "LRSV"
  ],
  "finviz-nanoEarlyRunners": [
    "HLTH",
    "DTEA"
  ],
  "finviz-under5Target10Change2Vol200Within10of52Low": [
    "IMGN",
    "SENS"
  ],
  "finviz-under5Target10Change2Vol200": [
    "PLUG",
    "STKL"
  ],
  "finviz-under5TopLosers": [
    "AGE",
    "ECOR"
  ],
  "finviz-pennyStock1milVol": [
    "AMR",
    "AMRH"
  ],
  "finviz-newHighsUp3volOver500k": [
    "ASCMA",
    "GMO"
  ],
  "metrics-advancers-lowest-float": [
    "NSPX",
    "DDDX"
  ],
  "metrics-advancers-lowest-turnover": [
    "CNNA",
    "HMPQ"
  ],
  "metrics-advancers-highest-dollarVolume": [
    "DLCR",
    "IRNC"
  ],
  "metrics-lowest-float": [
    "CRRDF",
    "PIONF"
  ],
  "metrics-lowest-turnover": [
    "CRRDF",
    "LQMT"
  ],
  "metrics-lowest-float-lowest-turnover": [
    "CRRDF"
  ],
  "metrics-highest-dollarVolume": [
    "POTN",
    "RMSL"
  ],
  "day-streaks-6days": [
    "SRDP"
  ],
  "ihub-containsCustodianship": [
    "GMNI",
    "TRDX"
  ],
  "ihub-contains10k": [
    "GMNI",
    "LQMT",
    "INTK",
    "LBSR",
    "GETH",
    "HMNY",
    "VYST",
    "FLES",
    "SRDP",
    "NDYN",
    "LFAP",
    "GZIC",
    "MDTR",
    "GMGI",
    "AXXA",
    "DLYT"
  ],
  "ihub-containsCustodianship-contains10k": [
    "GMNI"
  ],
  "ihub-containsMerger": [
    "DAVC",
    "TFVR",
    "CSOC",
    "DIRV",
    "ISBG",
    "COBI",
    "SRMX",
    "TSTS",
    "IDNG",
    "MGON",
    "ZMRK",
    "AMFE",
    "NNRX",
    "KNOS",
    "VSHC",
    "SOAN",
    "JBZY"
  ],
  "ihub-containsSucks": [
    "DAVC",
    "DLCR",
    "SSOF"
  ],
  "ihub-containsMerger-containsSucks": [
    "DAVC"
  ],
  "ihub-containsReinstatement": [
    "DLCR"
  ],
  "ihub-containsReinstatement-containsSucks": [
    "DLCR"
  ],
  "ihub-contains8k": [
    "TFVR",
    "CSOC",
    "LEAS",
    "GRYO",
    "AVXL",
    "COOP",
    "SNGY"
  ],
  "ihub-containsMerger-contains8k": [
    "TFVR",
    "CSOC"
  ],
  "ihub-containsFinra": [
    "KALY",
    "IPIX",
    "GNCP",
    "GRPS"
  ],
  "stock-invest-top100": [
    "ELGX",
    "KAV",
    "STKL"
  ],
  "stock-invest-undervalued": [
    "MTFB",
    "SOLY",
    "MSMN",
    "0I98"
  ],
  
}

module.exports = async () => {
  await updateWl('5-17-2019', data);
};