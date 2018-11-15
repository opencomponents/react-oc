const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const all = chars + digits;
function randomChar(includeDigits) {
  const size = includeDigits ? chars.length + digits.length : chars.length;
  const index = parseInt(Math.floor(Math.random() * size));
  return all[index];
}

export const data = (context, callback) => {
  const { name = 'World' } = context.params;
  const { staticPath } = context;

  callback(null, {
    name,
    staticPath,
    // 5 digit random string.
    uniq: randomChar() + randomChar(true) + randomChar(true) + randomChar(true) + randomChar(true)
  });
};
