export default () => {
  process.env.DATABASE_URL =
    'postgresql://mundoporix:mundoporix_dev@localhost:5432/mundoporix_test?schema=public';
  process.env.NODE_ENV = 'test';
};
