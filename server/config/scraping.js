module.exports = {
  loginId: process.env.TSUTAYA_ID,
  loginPass: process.env.TSUTAYA_PASS,
  urls: {
    login: 'https://www.discas.net/netdvd/tLogin.do?pT=0',
    logout: 'http://www.discas.net/netdvd/doLogout.do?pT=0',
    comicTop: 'http://movie-tsutaya.tsite.jp/netdvd/topComic.do?pT=0',
    comicHistory: 'https://movie-tsutaya.tsite.jp/netdvd/comic/comicRentalHistory.do?pT=0&pT=0',
    comicCart: 'https://movie-tsutaya.tsite.jp/netdvd/comic/rentalCart.do?pT=0',
    comicConf: 'https://movie-tsutaya.tsite.jp/netdvd/comic/comicConf.do?pT=0&id=',
    comicPutCart: 'https://movie-tsutaya.tsite.jp/netdvd/comic/comicRentalCart.do?cartflg=1&pT=0&id='
  },
  maxVolsAtOnce: process.env.MAX_VOLS_AT_ONCE,
  bnrPattern: process.env.BNR_PATTERN,
  enablePutCart: process.env.ENABLE_PUT_CART,
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
