import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileUploadValidator, type FileValidationOptions } from '../utils/file-upload.utils';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(private options: FileValidationOptions) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    if (request.file) {
      try {
        FileUploadValidator.validateFile(request.file, this.options);
        
        // Générer un nom de fichier sécurisé
        const originalName = request.file.originalname;
        const secureName = FileUploadValidator.generateUniqueFileName(originalName);
        
        // Remplacer le nom de fichier dans la requête
        request.file.originalname = secureName;
        
      } catch (error) {
        throw new BadRequestException(`Erreur avec le fichier ${request.file.originalname}: ${error.message}`);
      }
    }
    
    if (request.files) {
      const validatedFiles: any[] = [];
      
      for (const file of request.files) {
        try {
          FileUploadValidator.validateFile(file, this.options);
          
          const secureName = FileUploadValidator.generateUniqueFileName(file.originalname);
          file.originalname = secureName;
          
          validatedFiles.push(file);
        } catch (error) {
          throw new BadRequestException(`Erreur avec le fichier ${file.originalname}: ${error.message}`);
        }
      }
      
      request.files = validatedFiles;
    }
    
    return next.handle();
  }
}
