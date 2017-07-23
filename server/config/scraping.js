module.exports = {
  loginId: process.env.TSUTAYA_ID,
  loginPass: process.env.TSUTAYA_PASS,
  urls: {
    login: 'https://www.discas.net/netdvd/tLogin.do?pT=0',
    logout: 'http://www.discas.net/netdvd/doLogout.do?pT=0',
    comicTop: 'http://movie-tsutaya.tsite.jp/netdvd/topComic.do?pT=0',
    comicHistory: 'https://movie-tsutaya.tsite.jp/netdvd/comic/comicRentalHistory.do?pT=0&pT=0',
    comicConf: 'http://movie-tsutaya.tsite.jp/netdvd/comic/comicConf.do?id='
  },
  maxVolsAtOnce: 30,
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
