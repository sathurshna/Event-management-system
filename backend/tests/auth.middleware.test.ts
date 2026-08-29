import { Request, Response, NextFunction } from 'express';
import { protect } from '../src/middleware/auth.middleware';
import * as authUtils from '../src/utils/auth.utils';
import { AppError } from '../src/middleware/errorHandler';

// Mock the auth utilities
jest.mock('../src/utils/auth.utils');

describe('Auth Middleware - protect', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should throw 401 if no authorization header is present', () => {
    protect(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const errorArg = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(errorArg.statusCode).toBe(401);
    expect(errorArg.message).toBe('Not authenticated. Please log in.');
  });

  it('should throw 401 if authorization header does not start with Bearer', () => {
    mockRequest.headers = { authorization: 'Basic some_token' };

    protect(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const errorArg = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(errorArg.statusCode).toBe(401);
  });

  it('should call next with error if token verification fails', () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    
    const verifyMock = authUtils.verifyAccessToken as jest.Mock;
    const mockError = new Error('jwt malformed');
    verifyMock.mockImplementation(() => { throw mockError; });

    protect(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(mockError);
  });

  it('should attach user payload to request and call next if token is valid', () => {
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    
    const mockPayload = { id: 'user_123', email: 'test@example.com' };
    const verifyMock = authUtils.verifyAccessToken as jest.Mock;
    verifyMock.mockReturnValue(mockPayload);

    protect(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual(mockPayload);
    expect(nextFunction).toHaveBeenCalledWith(); // Called with no arguments (success)
  });
});
