// __mocks__/react-router-dom.js
const React = require('react');
const actual = jest.requireActual('react-router-dom');

module.exports = {
  ...actual,
  useNavigate: jest.fn(),
  Link: ({ children }) => <a>{children}</a>,
  useLocation: jest.fn(),
  MemoryRouter: ({ children }) => <div>{children}</div>,
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useParams: jest.fn().mockReturnValue({}),
};
