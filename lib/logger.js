
const bytes = require('pretty-bytes')
const hrtime = require('pretty-hrtime')
const onFinished = require('on-finished')

exports.log = log

exports.middleware = function (req, res, next) {
  onFinished(res, response(process.hrtime()))
  request(req)
  next()
}

function request (req) {
  const fields = {
    method: req.method,
    url: req.originalUrl || req.url,
    size: size(req.headers['content-length']),
    httpVersion: req.httpVersionMajor + '.' + req.httpVersionMinor,
    referrer: req.headers['referer'] || req.headers['referrer'],
    userAgent: req.headers['user-agent']
  }

  log('info', 'request', fields)
}

function response (start) {
  return function (err, res) {
    const fields = {
      method: res.req.method,
      url: res.req.originalUrl || res.req.url,
      status: res.statusCode,
      size: size(res.getHeader('content-length')),
      duration: duration(start)
    }

    if (err) {
      log('error', 'response failed', fields)
    } else {
      log('info', 'response', fields)
    }
  }
}

function log (level, message, fields) {
  console.log(JSON.stringify({ level, message, fields }))
}

function size (input) {
  if (!input) return null
  if (typeof input !== 'number') input = parseInt(input, 10)
  return bytes(input)
}

function duration (start) {
  if (!start) return null
  return hrtime(process.hrtime(start))
}
