export const allowedFileTypes = [
  // Изображения
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Документы
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Текстовые файлы
  'text/plain',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  // Аудио
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  // Видео (небольшие)
  'video/mp4',
  'video/webm',
];

// Список запрещенных расширений файлов
export const blockedExtensions = [
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.exe',
  '.bat',
  '.cmd',
  '.msi',
  '.dll',
  '.bin',
  '.iso',
];
