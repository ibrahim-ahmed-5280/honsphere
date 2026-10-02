import { Router } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { extname, resolve } from 'node:path';
import { z } from 'zod';
import { config } from '../../config.js';

export const uploadsRouter = Router();
const router = uploadsRouter;

router.post('/uploads', async (req, res) => {
  const data = z.object({ filename: z.string().max(150), dataUrl: z.string().max(3_000_000) }).parse(req.body);
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(data.dataUrl);
  if (!match) return res.status(400).json({ error: 'Choose a PNG, JPEG or WebP image.' });
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 2_000_000 || bytes.length < 8) return res.status(400).json({ error: 'Image must be under 2 MB.' });
  const kind = match[1];
  const valid = kind === 'png' ? bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
    : kind === 'jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8
      : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) return res.status(400).json({ error: 'The file is not a valid image.' });
  const extension = kind === 'jpeg' ? '.jpg' : `.${kind}`;
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${extension}`;
  const directory = config.uploadDir;
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, filename), bytes, { flag: 'wx' });
  res.status(201).json({ url: `/uploads/${filename}`, originalName: data.filename, extension: extname(filename) });
});

