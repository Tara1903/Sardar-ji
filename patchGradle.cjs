const fs = require('fs');

const path = 'android/build.gradle';
let content = fs.readFileSync(path, 'utf8');

const force = `
allprojects {
    repositories {
        google()
        mavenCentral()
    }
    configurations.all {
        resolutionStrategy {
            force 'org.jetbrains.kotlin:kotlin-stdlib:1.9.25'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.9.25'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.9.25'
        }
    }
}`;

content = content.replace(/allprojects\s*\{\s*repositories\s*\{\s*google\(\)\s*mavenCentral\(\)\s*\}\s*\}/, force);
fs.writeFileSync(path, content, 'utf8');
