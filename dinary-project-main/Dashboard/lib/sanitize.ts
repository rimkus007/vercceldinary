import DOMPurify from 'dompurify';

export interface SanitizeOptions {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'ul', 'ol', 'li',
    'a', 'span', 'div',
    'img', 'picture',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'width', 'height',
    'class', 'id', 'style', 'target', 'rel'
  ],
  ALLOW_DATA_ATTR: false,
};

export class SanitizeService {
  static sanitizeHtml(dirty: string, options: SanitizeOptions = DEFAULT_OPTIONS): string {
    if (!dirty || typeof dirty !== 'string') {
      return '';
    }

    const config = {
      ALLOWED_TAGS: options.ALLOWED_TAGS || DEFAULT_OPTIONS.ALLOWED_TAGS,
      ALLOWED_ATTR: options.ALLOWED_ATTR || DEFAULT_OPTIONS.ALLOWED_ATTR,
      ALLOW_DATA_ATTR: options.ALLOW_DATA_ATTR ?? DEFAULT_OPTIONS.ALLOW_DATA_ATTR,
      // Sécurité supplémentaire
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      SANITIZE_DOM: true,
      SANITIZE_NAMED_PROPS: true,
      WHOLE_DOCUMENT: false,
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: null,
        attributeNameCheck: null,
        allowCustomizedBuiltInElements: false,
      },
    };

    // Configuration spéciale pour les liens
    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      if (data.attrName === 'href') {
        // Bloquer les protocoles dangereux
        const value = node.getAttribute('href') || '';
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
        
        if (dangerousProtocols.some(protocol => value.toLowerCase().startsWith(protocol))) {
          node.removeAttribute('href');
        }
        
        // Ajouter rel="noopener noreferrer" pour les liens externes
        if (value.startsWith('http') && !node.getAttribute('rel')) {
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
        }
      }
      
      // Supprimer les attributs onclick et autres événements
      if (data.attrName.startsWith('on')) {
        node.removeAttribute(data.attrName);
      }
    });

    return DOMPurify.sanitize(dirty, config);
  }

  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Échapper les caractères HTML dangereux
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    try {
      const parsedUrl = new URL(url);
      
      // Autoriser uniquement http/https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return '';
      }
      
      // Bloquer les domaines dangereux
      const dangerousDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
      if (dangerousDomains.includes(parsedUrl.hostname)) {
        return '';
      }
      
      return url;
    } catch {
      return '';
    }
  }

  static createSafeHtml(content: string, options: SanitizeOptions = DEFAULT_OPTIONS): { __html: string } {
    return {
      __html: this.sanitizeHtml(content, options)
    };
  }
}

// Hook React pour utiliser le sanitize
export const useSanitizedHtml = (dirty: string, options?: SanitizeOptions) => {
  return SanitizeService.createSafeHtml(dirty, options);
};
