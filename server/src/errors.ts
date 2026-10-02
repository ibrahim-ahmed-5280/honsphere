import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { config } from './config.js';

export const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ error: 'Please check the submitted fields.', details: error.issues });
  if (error instanceof mongoose.Error.ValidationError) return res.status(400).json({ error: error.message });
  if (error instanceof Error && 'code' in error && error.code === 11000) return res.status(409).json({ error: 'That name or slug already exists.' });
  const message = error instanceof Error ? error.message : 'Unexpected server error.';
  console.error(error);
  res.status(500).json({ error: config.production ? 'Unexpected server error.' : message });
};
