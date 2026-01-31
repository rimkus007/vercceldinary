import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Rend le module global
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporte le service pour être utilisé ailleurs
})
export class PrismaModule {}
