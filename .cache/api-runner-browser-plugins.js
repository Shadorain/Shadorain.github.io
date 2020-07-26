module.exports = [{
      plugin: require('../node_modules/gatsby-plugin-offline/gatsby-browser.js'),
      options: {"plugins":[]},
    },{
      plugin: require('../node_modules/gatsby-plugin-manifest/gatsby-browser.js'),
      options: {"plugins":[],"name":"tech-blog","short_name":"tech-blog","start_url":"/","background_color":"#1e2127","theme_color":"#1e2127","display":"minimal-ui","icon":"src/images/cam-logo.png","cache_busting_mode":"query","include_favicon":true,"legacy":true,"theme_color_in_head":true,"cacheDigest":"2ac6ed97e4a55531129f411d545adb55"},
    }]
