module.exports = {
  testDir: './tests', timeout: 60000, workers: 1,
  use: { baseURL: 'http://127.0.0.1:3107', browserName: 'chromium', headless: true },
};
