// __mocks__/react-router-dom.js
module.exports = {
  useNavigate: jest.fn(),
  Link: ({ children }) => <a>{children}</a>,
  useLocation: jest.fn(),
};
