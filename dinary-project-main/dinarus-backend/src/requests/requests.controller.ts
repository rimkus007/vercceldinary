import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RespondRequestDto } from './dto/respond-request.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Request() req, @Body() createRequestDto: CreateRequestDto) {
    const requesterId = req.user.userId;
    return this.requestsService.create(requesterId, createRequestDto);
  }

  @Get()
  findMyRequests(@Request() req) {
    const userId = req.user.userId;
    return this.requestsService.findReceived(userId);
  }

  @Patch(':id/respond')
  respondToRequest(
    @Request() req,
    @Param('id') requestId: string,
    @Body() respondRequestDto: RespondRequestDto,
  ) {
    const payerId = req.user.userId;
    return this.requestsService.respondToRequest(
      payerId,
      requestId,
      respondRequestDto,
    );
  }
}
