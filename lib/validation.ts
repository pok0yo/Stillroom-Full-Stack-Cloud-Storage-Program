import { createHash } from 'node:crypto';
import { filename, MAX_BYTES, Problem, type Kind } from './domain';
const formats: Record<string, [string, Kind]> = {
  pdf: ['application/pdf', 'document'], txt: ['text/plain; charset=utf-8', 'document'], csv: ['text/csv; charset=utf-8', 'document'],
  jpg: ['image/jpeg', 'image'], jpeg: ['image/jpeg', 'image'], png: ['image/png', 'image'], webp: ['image/webp', 'image'],
  mp3: ['audio/mpeg', 'audio'], wav: ['audio/wav', 'audio'], mp4: ['video/mp4', 'video'], webm: ['video/webm', 'video'],
};
export const extensions = Object.keys(formats);
export function validateUpload(rawName: unknown, buffer: Buffer) {
  const name = filename(rawName);
  const ext = name.split('.').pop()!.toLowerCase();
  if (!formats[ext]) throw new Problem(400, 'This file extension is not supported.');
  if (!buffer.length || buffer.length > MAX_BYTES) throw new Problem(413, 'Files must be nonempty and at most 20 MiB.');
  const starts = (hex: string) => buffer.subarray(0, hex.length / 2).equals(Buffer.from(hex, 'hex'));
  const ascii = (start: number, end: number) => buffer.toString('ascii', start, end);
  let valid = false;
  switch (ext) {
    case 'pdf': valid = ascii(0, 5) === '%PDF-' && buffer.subarray(-1024).includes(Buffer.from('%%EOF')); break;
    case 'png': valid = starts('89504e470d0a1a0a') && buffer.length >= 33 && ascii(12, 16) === 'IHDR'; break;
    case 'jpg': case 'jpeg': valid = starts('ffd8ff') && buffer.subarray(-2).equals(Buffer.from('ffd9', 'hex')); break;
    case 'webp': valid = buffer.length >= 20 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP' && buffer.readUInt32LE(4) + 8 === buffer.length; break;
    case 'wav': valid = buffer.length >= 44 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE' && buffer.readUInt32LE(4) + 8 === buffer.length; break;
    case 'mp3': valid = buffer.length >= 10 && (ascii(0, 3) === 'ID3' || (buffer[0] === 255 && (buffer[1] & 0xe0) === 0xe0 && (buffer[1] & 6) !== 0)); break;
    case 'mp4': valid = buffer.length >= 24 && ascii(4, 8) === 'ftyp' && buffer.readUInt32BE(0) >= 16 && buffer.readUInt32BE(0) <= buffer.length && /^(isom|iso[2-9]|mp4[12]|avc1|M4V )$/.test(ascii(8, 12)); break;
    case 'webm': valid = starts('1a45dfa3') && buffer.subarray(0, 4096).includes(Buffer.from('webm')); break;
    case 'txt': case 'csv': {
      let text: string;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(buffer); } catch { throw new Problem(400, 'Text must use valid UTF-8 encoding.'); }
      valid = !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/u.test(text) && !/<\s*(?:!doctype\s+html|html|svg|script)\b/i.test(text);
      break;
    }
  }
  if (!valid) throw new Problem(400, 'The file contents do not match an allowed format.');
  return { name, searchName: name.toLowerCase(), size: buffer.length, mime: formats[ext][0], kind: formats[ext][1], digest: createHash('sha256').update(buffer).digest('hex') };
}
