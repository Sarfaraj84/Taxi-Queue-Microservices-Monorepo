module.exports = {
  '*.js': ['npx eslint --fix', 'npx prettier --write'],
  '*.json': ['npx prettier --write'],
  '*.md': ['npx prettier --write'],
  '*.yml': ['npx prettier --write'],
  '*.yaml': ['npx prettier --write'],
};
