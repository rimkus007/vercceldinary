// src/products/products.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request, // Ajout de Request pour la compatibilité avec GetUser
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crée un nouveau produit.
   * L'image est optionnelle.
   */
  @Post()
  @UseInterceptors(FileInterceptor('image')) // Intercepte un fichier nommé 'image'
  create(
    @GetUser() user: User,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File, // Le fichier est optionnel
  ) {
    // On passe l'ID de l'utilisateur et le fichier (s'il existe) au service
    return this.productsService.create(createProductDto, user.id, file);
  }

  /**
   * Récupère tous les produits du commerçant connecté.
   */
  @Get()
  findAll(@GetUser() user: User) {
    return this.productsService.findAllForUser(user.id);
  }

  /**
   * Met à jour un produit.
   * L'image est optionnelle.
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateProductDto: CreateProductDto, // On peut réutiliser le DTO
    @UploadedFile() file?: Express.Multer.File, // Le fichier est optionnel
  ) {
    return this.productsService.update(id, updateProductDto, user.id, file);
  }

  /**
   * Supprime un produit.
   */
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.productsService.remove(id, user.id);
  }
}
