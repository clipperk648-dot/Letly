const handler = require('../../api/social/posts');

exports.handler = async (event, context) => {
  return handler(
    {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body,
      query: event.queryStringParameters || {},
    },
    {
      setHeader: (key, value) => {
        if (!event.multiValueHeaders) event.multiValueHeaders = {};
        event.multiValueHeaders[key] = [value];
      },
      status: (code) => {
        return {
          statusCode: code,
          json: (data) => ({
            statusCode: code,
            headers: event.multiValueHeaders || {},
            body: JSON.stringify(data),
          }),
          end: () => ({
            statusCode: code,
            headers: event.multiValueHeaders || {},
          }),
        };
      },
    }
  );
};
