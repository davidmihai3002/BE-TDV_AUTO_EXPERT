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
    expect(status).toBe(400);
    expect(body.message).toBe('Invalid input');
    expect(JSON.stringify(body)).not.toContain('uuid');
    expect(run(Object.assign(new Error('dup'), { code: '23505' })).status).toBe(
      409,
    );
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
