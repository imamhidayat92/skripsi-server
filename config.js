// TODO: Check machine environment variables to ensure all values are used properly.

module.exports = {
   app: {
      name: 'Skripsi Server',
      port: 2014,
      base_path: require('path').normalize(__dirname),

      pagination: {
         limit: 25
      }
   },
   mongodb: {
      host: '127.0.0.1',
      port: 27017,
      username: null,
      password: null,
      collection: 'docs-skripsi'
   },
   morgan: {
      mode: 'dev'
   },
   redis: {
      host: '127.0.0.1',
      port: 6379,
      username: null,
      password: null,
   },
   security: {
      cookie_secret : 'F&J2Pxn!*Lr_UEo66E9)MjhtlDp&pHC5^xp(h%GWs0bXAixXWQ)9evE@eb$EzfT%',
      session_secret: 'fsC&u$LQo5PK&6hofa8WoD73GiaZh9bf4o2Uxh6ByhFiIG7QZx-YGhlG5Xzzu(&R',
      session_timeout: 604800000, // = 1 week.
   }
};
