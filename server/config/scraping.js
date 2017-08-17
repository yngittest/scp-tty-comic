module.exports = {
  loginId: process.env.TSUTAYA_ID,
  loginPass: process.env.TSUTAYA_PASS,
  urls: {
    login: 'https://www.discas.net/netdvd/tLogin.do?pT=0',
    logout: 'http://www.discas.net/netdvd/doLogout.do?pT=0',
    comicTop: 'http://movie-tsutaya.tsite.jp/netdvd/topComic.do?pT=0',
    comicHistory: 'https://movie-tsutaya.tsite.jp/netdvd/comic/comicRentalHistory.do?pT=0&pT=0',
    comicCart: 'https://movie-tsutaya.tsite.jp/netdvd/comic/rentalCart.do?pT=0',
    comicConf: 'http://movie-tsutaya.tsite.jp/netdvd/comic/comicConf.do?id='
  },
  maxVolsAtOnce: process.env.MAX_VOLS_AT_ONCE,
  bnrPattern: process.env.BNR_PATTERN,
  spookyOptions: {
    child: {
      transport: 'http'
    },
    casper: {
      logLevel: 'debug',
      verbose: true,
      waitTimeout: 180000
    }
  }
};
