const fs = require('fs');

const path = 'android/app/build.gradle';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/versionCode 24/, 'versionCode 25');
content = content.replace(/versionName "2.2.2"/, 'versionName "2.3.0"');
content = content.replace(/APP_VERSION_NAME", "\\"2.2.2\\""/, 'APP_VERSION_NAME", "\\"2.3.0\\""');
content = content.replace(/APP_VERSION_CODE", "24"/, 'APP_VERSION_CODE", "25"');

fs.writeFileSync(path, content, 'utf8');
