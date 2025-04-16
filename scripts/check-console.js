const { execSync } = require('child_process');
const fs = require('fs');

try {
  const files = execSync('git diff --cached --name-only')
    .toString()
    .split('\n')
    .filter(file => file.endsWith('.js') || file.endsWith('.jsx'));

  const hasConsoleLog = files.some(file => {
    if (!fs.existsSync(file)) return false;
    const content = fs.readFileSync(file, 'utf-8');
    return content.includes('console.log');
  });

  if (hasConsoleLog) {
    console.error('\x1b[31m✖ Commit blocked: Remove all console.log statements.\x1b[0m');
    process.exit(1);
  }

  process.exit(0);
} catch (err) {
  console.error('Error while checking console logs:', err.message);
  process.exit(1);
}
