import {
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiErrorBody } from 'src/types';
import { AllExceptionsFilter } from './all-exceptions.filter';

function run(exception: unknown): { status: number; body: ApiErrorBody } {
  const res = {
    status: jest.fn<unknown, [number]>().mockReturnThis(),
    json: jest.fn<void, [ApiErrorBody]>(),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => ({ method: 'GET', url: '/test' }),
    }),
  } as unknown as ArgumentsHost;
  const filter = new AllExceptionsFilter();
  // keep test output clean
  jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
  jest.spyOn(filter['logger'], 'warn').mockImplementation(() => undefined);
  filter.catch(exception, host);
  return {
    status: res.status.mock.calls[0][0],
    body: res.json.mock.calls[0][0],
  };
}

describe('AllExceptionsFilter', () => {
  it('normalises HttpException', () => {
    const { status, body } = run(new NotFoundException('Blog not found'));
    expect(status).toBe(404);
    expect(body).toMatchObject({
      statusCode: 404,
      message: 'Blog not found',
      error: 'Not Found',
      path: '/test',
    });
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it('keeps validation issues', () => {
    const issues = [{ path: 'page', code: 'too_small', message: 'x' }];
    const { status, body } = run(
      new BadRequestException({ message: 'Validation failed', issues }),
    );
    expect(status).toBe(400);
    expect(body).toMatchObject({
      error: 'Bad Request',
      message: 'Validation failed',
      issues,
    });
  });

  it('maps pg errors without leaking SQL', () => {
    const { status, body } = run(
      Object.assign(new Error('invalid input syntax for type uuid: "x"'), {
        code: '22P02',
      }),
    );
    // an id that slipped past validation can't match a row (ticket 07)
    expect(status).toBe(404);
    expect(body.message).toBe('Not Found');
    expect(JSON.stringify(body)).not.toContain('uuid');
    expect(
      run(Object.assign(new Error('dup'), { code: '23505' })).body,
    ).toMatchObject({
      statusCode: 409,
      message: 'Resource already exists',
      error: 'Conflict',
    });
  });

  it.each(['ECONNREFUSED', '57P01', '08006'])(
    'database unavailable (%s) → 503',
    (code) => {
      const { status, body } = run(
        Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), {
          code,
        }),
      );
      expect(status).toBe(503);
      expect(body).toMatchObject({
        message: 'Service temporarily unavailable',
        error: 'Service Unavailable',
      });
      expect(JSON.stringify(body)).not.toContain('5432');
    },
  );

  it('malformed JSON body → 400 "Malformed JSON body"', () => {
    const parseError = Object.assign(
      new SyntaxError('Unexpected token } in JSON at position 9'),
      { body: '{"a":1,}' },
    );
    expect(run(parseError).body).toMatchObject({
      statusCode: 400,
      message: 'Malformed JSON body',
      error: 'Bad Request',
    });
    const wrapped = new BadRequestException(
      'Unexpected token } in JSON at position 9',
      { cause: parseError },
    );
    expect(run(wrapped).body.message).toBe('Malformed JSON body');
  });

  it('hides unknown errors behind a generic 500', () => {
    const { status, body } = run(new Error('select * from secret'));
    expect(status).toBe(500);
    expect(body).toMatchObject({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});
