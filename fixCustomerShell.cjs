const fs = require('fs');
const path = 'android/app/src/main/java/com/sardarjifood/app/ui/NativeFoodApp.kt';
let content = fs.readFileSync(path, 'utf8');

const regex = /onCheckout = \{ navController\.navigate\("checkout"\) \},[\s\n]*onLaunchStarPay = \{ payload ->[\s\n]*val encoded = java\.net\.URLEncoder\.encode\(payload\.checkoutUrl, "UTF-8"\)[\s\n]*navController\.navigate\("starpay_checkout\?url=\\$encoded"\)[\s\n]*\},/g;

content = content.replace(regex, 'onCheckout = { navController.navigate("checkout") },');
fs.writeFileSync(path, content, 'utf8');
