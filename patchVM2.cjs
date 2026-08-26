const fs = require('fs');
const path = 'android/app/src/main/java/com/sardarjifood/app/ui/MainViewModel.kt';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import com.sardarjifood.app.data.repository.StarPayCheckoutPayload')) {
    content = content.replace('import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload', 'import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload\nimport com.sardarjifood.app.data.repository.StarPayCheckoutPayload');
    fs.writeFileSync(path, content, 'utf8');
}
