//===========================================================================
//  
//===========================================================================
const path = require('path');
const express = require('express');
const request = require('supertest');
const router = require('../../src/routes/static');
const STATUS_CODE = require('../__utils__/status_codes');
const { ErrorHandler } = require('../__utils__/error_handler');

const PUBLIC_DIRECTORY_PATH = path.join(__dirname, '../../public');

const CONTENT_TYPE_TEXT_HTML = 'text/html; charset=utf-8';
const HTML_FILE_HEADER = '<!DOCTYPE html>';

describe('Static Route Tests', () => {

  const app = express();

  beforeAll(() => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', router.initialize(PUBLIC_DIRECTORY_PATH));
    app.use(ErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('responds to Get / by sending the index.html file', async () => {
    const res = await request(app).get('/');

    expect(res.header['content-type'].toLowerCase()).toEqual(CONTENT_TYPE_TEXT_HTML);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text.startsWith(HTML_FILE_HEADER)).toEqual(true);
  });

  test('responds to Get /<anything> also by sending the index.html file', async () => {
    const res = await request(app).get('/anything');

    expect(res.header['content-type'].toLowerCase()).toEqual(CONTENT_TYPE_TEXT_HTML);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text.startsWith(HTML_FILE_HEADER)).toEqual(true);
  });
});
//===========================================================================