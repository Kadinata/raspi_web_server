//===========================================================================
//  
//===========================================================================
const express = require('express');
const request = require('supertest');
const router = require('../../src/routes/static');

const CONTENT_TYPE_TEXT_HTML = 'text/html; charset=UTF-8';

const STATUS_CODE_OK = 200;

describe('Static Route Tests', () => {
  const app = express();

  beforeAll(() => {
    app.use('/', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('responds to GET / by sending the single page app html', async () => {
    const res = await request(app).get('/');
    expect(res.header['content-type']).toEqual(CONTENT_TYPE_TEXT_HTML);
    expect(res.statusCode).toEqual(STATUS_CODE_OK);
  });
});
//===========================================================================