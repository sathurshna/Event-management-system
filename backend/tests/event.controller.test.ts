import { Request, Response } from 'express';
import { createEvent, deleteEvent } from '../src/controllers/event.controller';
import { pool } from '../src/config/db';
import { AppError } from '../src/middleware/errorHandler';

// Mock the db pool
jest.mock('../src/config/db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('Event Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: { userId: 'host_123', email: 'host@test.com' },
      body: {},
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event and auto-rsvp the host', async () => {
      mockRequest.body = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2023-12-01T10:00:00Z',
        location: 'Test Location',
        isPublic: true,
        coverImage: 'image.jpg'
      };

      (pool.query as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]); // Event insert
      (pool.query as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]); // RSVP insert

      createEvent(mockRequest as Request, mockResponse as Response, nextFunction);
      await new Promise(process.nextTick);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Event created successfully',
          data: expect.objectContaining({ id: expect.any(String) })
        })
      );
    });

    it('should call next with error if db query fails', async () => {
      mockRequest.body = {
        title: 'Test Event',
        date: '2023-12-01T10:00:00Z',
      };

      const mockError = new Error('DB Error');
      (pool.query as jest.Mock).mockRejectedValueOnce(mockError);

      createEvent(mockRequest as Request, mockResponse as Response, nextFunction);
      await new Promise(process.nextTick);

      expect(nextFunction).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteEvent', () => {
    it('should delete the event if host owns it', async () => {
      mockRequest.params = { id: 'event_123' };
      
      // Mock delete
      (pool.query as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);

      deleteEvent(mockRequest as Request, mockResponse as Response, nextFunction);
      await new Promise(process.nextTick);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Event deleted successfully'
        })
      );
    });

    it('should throw 404 if event not found or user is not the host', async () => {
      mockRequest.params = { id: 'event_123' };
      
      // Mock delete returns 0 affectedRows
      (pool.query as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);

      deleteEvent(mockRequest as Request, mockResponse as Response, nextFunction);
      await new Promise(process.nextTick);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const errorArg = nextFunction.mock.calls[0][0];
      expect(errorArg.statusCode).toBe(404);
    });
  });
});
