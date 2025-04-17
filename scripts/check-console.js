const { execSync } = require('child_process');

const ignoreFiles = ['scripts/check-console.js'];

try {
  // Get current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  console.log(`Committing to ${currentBranch} branch... running pre-commit check...`);

  // Get staged files
  const files = execSync('git diff --cached --name-only')
  .toString()
  .split('\n')
  .filter(file =>
    (file.endsWith('.js') || file.endsWith('.jsx')) &&
    !ignoreFiles.includes(file)
  );

  let found = false;

  for (const file of files) {
    if (!file) continue;
    try {
      const content = execSync(`git show :${file}`).toString();
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (line.includes('console.log')) {
          console.error(`console.log found in ${file}:${index + 1}`);
          found = true;
        }
      });
    } catch (err) {
      // File might be deleted or binary; ignore
    }
  }

  if (found) {
    console.error('console.log found. Aborting commit.');
    process.exit(1);
  } else {
    console.log(`Pre-commit check passed. Committing to ${currentBranch} branch.`);
    process.exit(0);
  }

} catch (err) {
  console.error('Pre-commit hook failed with error:', err.message);
  process.exit(1);
}
