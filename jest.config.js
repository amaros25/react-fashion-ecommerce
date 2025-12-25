module.exports = {
  testEnvironment: 'jsdom', // Definiert die Testumgebung (jsdom für DOM-Tests)
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy', // Mock von CSS-Dateien
    '^react-router-dom$': '<rootDir>/__mocks__/react-router-dom.js', // Mock für react-router-dom
  },
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest', // Transpiliert JS/JSX-Dateien mit Babel
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
