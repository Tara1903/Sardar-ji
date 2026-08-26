const fs = require('fs');
const path = 'android/app/src/main/java/com/sardarjifood/app/ui/NativeFoodApp.kt';
let content = fs.readFileSync(path, 'utf8');

const regex1 = /onLaunchStarPay = \{ payload ->[\s\n]*navController\.navigate\("starpay_checkout\?url=\\?\$\{[^}]+\}"\)[\s\n]*\},/g;

content = content.replace(regex1, `onLaunchStarPay = { payload -> 
                                val encoded = java.net.URLEncoder.encode(payload.checkoutUrl, "UTF-8")
                                navController.navigate("starpay_checkout?url=$encoded")
                            },`);

fs.writeFileSync(path, content, 'utf8');
