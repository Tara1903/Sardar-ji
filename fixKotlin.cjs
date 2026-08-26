const fs = require('fs');

const appPath = 'android/app/src/main/java/com/sardarjifood/app/ui/NativeFoodApp.kt';
let code = fs.readFileSync(appPath, 'utf8');

const regex = /onLaunchStarPay = \{ payload -> navController\.navigate\("starpay_checkout\?url=\\?\$\{[^\}]+\}"\) \},/g;

code = code.replace(regex, `onLaunchStarPay = { payload -> 
                                val encoded = java.net.URLEncoder.encode(payload.checkoutUrl, "UTF-8")
                                navController.navigate("starpay_checkout?url=$encoded")
                              },`);

fs.writeFileSync(appPath, code);
console.log('Fixed Kotlin syntax');
