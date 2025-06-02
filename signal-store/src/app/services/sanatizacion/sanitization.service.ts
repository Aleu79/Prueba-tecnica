import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SanitizationService {

  constructor() {}

  /**
   * Sanitiza un string genérico:
   * - trim de espacios al inicio y fin
   * - elimina caracteres no permitidos (solo alfanuméricos + algunos símbolos comunes)
   * - escapa HTML para prevenir XSS
   */
  sanitizeString(value: string): string {
    if (!value) return value;

    let sanitized = value.trim();

    // Permite letras, números, guiones, puntos, arroba, guión bajo y espacio
    sanitized = sanitized.replace(/[^a-zA-Z0-9-_.@ ]/g, '');

    sanitized = this.escapeHtml(sanitized);
    return sanitized;
  }

  /**
   * Sanitiza nombres humanos:
   * - permite letras con acentos, espacios, apóstrofes, guiones y puntos
   * - elimina otros caracteres
   * - trim y escape HTML
   */
  sanitizeHumanName(value: string): string {
    if (!value) return value;

    let sanitized = value.trim();

    // Permite letras (mayúsculas, minúsculas), tildes/acento, espacios, apóstrofe, guion y punto
    sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1 \-'.]/g, '');

    sanitized = this.escapeHtml(sanitized);

    return sanitized;
  }

  /**
   * Sanitiza emails:
   * - trim
   * - elimina caracteres inválidos para emails comunes
   * - escape HTML
   */
  sanitizeEmail(value: string): string {
    if (!value) return value;

    let sanitized = value.trim();

    // Permite letras, números, puntos, guiones, guión bajo y arroba
    sanitized = sanitized.replace(/[^a-zA-Z0-9-_.@]/g, '');

    sanitized = this.escapeHtml(sanitized);

    return sanitized;
  }

  /**
   * Sanitiza usernames:
   * - solo letras, números, guiones, guión bajo y punto
   * - trim y escape HTML
   */
  sanitizeUsername(value: string): string {
    if (!value) return value;

    let sanitized = value.trim();

    sanitized = sanitized.replace(/[^a-zA-Z0-9-_\.]/g, '');

    sanitized = this.escapeHtml(sanitized);

    return sanitized;
  }

  /**
   * Sanitiza textos largos, por ejemplo mensajes o comentarios:
   * - trim
   * - elimina caracteres de control
   * - permite la mayoría de caracteres imprimibles y símbolos básicos
   * - escape HTML
   */
  sanitizeFreeText(value: string): string {
    if (!value) return value;

    let sanitized = value.trim();

    // Elimina caracteres no imprimibles (excepto salto de línea)
    sanitized = sanitized.replace(/[^\x20-\x7E\n\r\táéíóúÁÉÍÓÚñÑüÜ¿¡.,;:!?"'()\-\[\]{}@#$%&*+=\/\\|<>^~`°\s]/g, '');

    sanitized = this.escapeHtml(sanitized);

    return sanitized;
  }

  /**
   * Sanitiza cualquier objeto recursivamente.
   * - si el valor es string: aplica sanitizeString o método especificado
   * - si es array: sanitiza cada elemento
   * - si es objeto: sanitiza cada propiedad
   * - otros tipos los deja igual
   * 
   * @param obj objeto a sanitizar
   * @param stringSanitizer función opcional para sanitizar strings
   */
  sanitizeObject(
    obj: any,
    stringSanitizer: (value: string) => string = this.sanitizeString.bind(this)
  ): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return stringSanitizer(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, stringSanitizer));
    }

    if (typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitizedObj[key] = this.sanitizeObject(obj[key], stringSanitizer);
        }
      }
      return sanitizedObj;
    }

    // Para tipos primitivos que no son string (number, boolean) devuelve igual
    return obj;
  }

  /**
   * Escapea caracteres especiales en HTML para prevenir XSS
   * Convierte & < > " ' en sus entidades HTML
   */
  private escapeHtml(text: string): string {
    if (!text) return text;
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Opcional: normaliza un texto Unicode para eliminar tildes/acentos
   * Esto es util para buscar o comparar textos sin acentos
   */
  normalizeUnicode(value: string): string {
    if (!value) return value;
    // NFD descompone caracteres acentuados en base + tilde, luego se eliminan tildes con regex
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
