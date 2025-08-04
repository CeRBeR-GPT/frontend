export default {
  initialize: jest.fn(),
  render: jest.fn().mockImplementation((id, code) => {
    return `<svg id="${id}">${code}</svg>`;
  }),
};
