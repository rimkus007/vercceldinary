import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { FriendshipStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('request/:username')
  async sendRequest(@Req() req, @Param('username') username: string) {
    return this.friendsService.sendRequest(req.user.id, username);
  }

  @Get('pending')
  async getPending(@Req() req) {
    return this.friendsService.getPendingRequests(req.user.id);
  }

  @Patch('request/:id/respond')
  async respond(
    @Req() req,
    @Param('id') id: string,
    @Body('status') status: FriendshipStatus,
  ) {
    return this.friendsService.respondToRequest(req.user.id, id, status);
  }

  @Get()
  async getFriends(@Req() req) {
    return this.friendsService.getFriends(req.user.id);
  }
}
