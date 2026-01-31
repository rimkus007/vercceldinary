import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/AdminGuard';
import { AdminService } from './admin.service';
import { RejectVerificationDto } from './dto/reject-verification.dto';
// Import all DTOs
import { ManualRechargeDto } from './dto/manual-recharge.dto';
import { RejectRechargeDto } from './dto/reject-recharge.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateMissionDto } from './dto/create-mission.dto';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { CreateXpRuleDto } from './dto/create-xp-rule.dto';
import { UpdateXpRuleDto } from './dto/update-xp-rule.dto';
import { CreateLevelRuleDto } from './dto/create-level-rule.dto';
import { UpdateLevelRuleDto } from './dto/update-level-rule.dto';
import { AudienceRole } from '@prisma/client';
import { ChurnStatsQueryDto, ConversionStatsQueryDto, RetentionStatsQueryDto } from './dto/stats-query.dto';
import { TicketsService } from '../tickets/tickets.service';
import { UpdateTicketDto } from '../tickets/dto/update-ticket.dto';
import { RespondTicketDto } from '../tickets/dto/respond-ticket.dto';
import { CommissionsService } from '../commissions/commissions.service';

class RejectSuggestionDto {
  reason?: string;
}
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ticketsService: TicketsService,
    private readonly commissionsService: CommissionsService,
  ) {}

  // --- 📊 DASHBOARD & STATS ---
  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('referral-stats')
  getReferralStats() {
    return this.adminService.getReferralStats();
  }

  /**
   * Récupère les revenus de la plateforme basés sur les commissions
   * GET /admin/revenues?startDate=2025-01-01&endDate=2025-12-31
   */
  @Get('revenues')
  getPlatformRevenues(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.commissionsService.getPlatformRevenues(start, end);
  }

  // --- 📈 ANALYSES DYNAMIQUES ---
  @Get('analytics/churn')
  getChurnMetrics() {
    return this.adminService.getChurnMetrics();
  }

  @Get('analytics/retention')
  getRetentionMetrics() {
    return this.adminService.getRetentionMetrics();
  }

  @Get('analytics/ltv')
  getLTVMetrics() {
    return this.adminService.getLTVMetrics();
  }

  @Get('analytics/conversion')
  getConversionMetrics() {
    return this.adminService.getConversionMetrics();
  }

  @Get('analytics/geographic')
  getGeographicMetrics() {
    return this.adminService.getGeographicMetrics();
  }

  // --- 📋 SYSTÈME DE TÂCHES ---
  @Get('tasks')
  getAdminTasks() {
    return this.adminService.getAdminTasks();
  }

  @Post('tasks/:taskId/complete')
  markTaskAsCompleted(@Param('taskId') taskId: string) {
    return this.adminService.markTaskAsCompleted(taskId);
  }

  // --- 👥 USER & MERCHANT MANAGEMENT ---
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/search')
  searchUsers(
    @Query('q') query: string,
    @Query('role') role?: 'USER' | 'MERCHANT'
  ) {
    return this.adminService.searchUsers(query, role);
  }

  @Get('merchants')
  getAllMerchants() {
    return this.adminService.getAllMerchants();
  }

  @Get('merchants/suggestions')
  getMerchantSuggestions() {
    return this.adminService.listSuggestions();
  }

  @Get('merchants/:id')
  getMerchantDetails(@Param('id') id: string) {
    return this.adminService.getMerchantDetails(id);
  }

  @Get('merchants-stats/revenue')
  getMerchantsRevenue() {
    return this.adminService.getMerchantsRevenueStats();
  }

  @Get('referrals')
  getAllReferrals() {
    return this.adminService.getAllReferrals();
  }

  // --- 💰 RECHARGE MANAGEMENT ---
  @Post('recharges/manual')
  createManualRecharge(@Body() body: ManualRechargeDto) {
    return this.adminService.createManualRecharge(body);
  }

  @Get('recharges')
  getAllRecharges() {
    return this.adminService.getAllRecharges();
  }

  @Get('recharges/pending')
  getPendingRecharges() {
    return this.adminService.getPendingRecharges();
  }

  @Patch('recharges/:id/approve')
  approveRecharge(@Param('id') id: string) {
    return this.adminService.approveRecharge(id);
  }

  @Patch('recharges/:id/reject')
  rejectRecharge(
    @Param('id') id: string,
    @Body() rejectDto: RejectRechargeDto,
  ) {
    const rejectionReason = rejectDto.reason || 'Aucun motif fourni.';
    return this.adminService.rejectRecharge(id, rejectionReason);
  }

  // --- 🔔 NOTIFICATIONS ---
  @Post('notifications/send')
  sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.adminService.sendNotification(createNotificationDto);
  }

  // --- 🎯 MISSIONS (CRUD) ---
  @Post('missions')
  createMission(@Body() createMissionDto: CreateMissionDto) {
    // Le DTO inclut maintenant le rôle, le service s'en occupe
    return this.adminService.createMission(createMissionDto);
  }

  // ✨ CORRECTION : Accepter le query param 'role'
  @Get('missions')
  getAllMissions(@Query('role') role?: AudienceRole) {
    // Valider le rôle si nécessaire, ou laisser le service gérer
    if (role && !['USER', 'MERCHANT'].includes(role)) {
      throw new BadRequestException(
        'Rôle invalide. Doit être USER ou MERCHANT.',
      );
    }
    return this.adminService.getAllMissions(role);
  }

  @Patch('missions/:id')
  updateMission(
    @Param('id') id: string,
    @Body() data: Partial<CreateMissionDto>,
  ) {
    return this.adminService.updateMission(id, data);
  }

  @Delete('missions/:id')
  deleteMission(@Param('id') id: string) {
    return this.adminService.deleteMission(id);
  }

  // --- 💲 COMMISSION RULES (CRUD) ---
  @Post('commission-rules')
  createCommissionRule(@Body() createDto: CreateCommissionRuleDto) {
    return this.adminService.createCommissionRule(createDto);
  }

  /**
   * Liste les règles de commission. Le paramètre `target` permet de filtrer
   * les commissions destinées aux utilisateurs ou aux commerçants. Exemple :
   * /admin/commission-rules?target=MERCHANT
   */
  @Get('commission-rules')
  getCommissionRules(@Query('target') target?: 'USER' | 'MERCHANT') {
    return this.adminService.getCommissionRules(target);
  }

  @Patch('commission-rules/:id')
  updateCommissionRule(
    @Param('id') id: string,
    @Body() updateDto: UpdateCommissionRuleDto,
  ) {
    return this.adminService.updateCommissionRule(id, updateDto);
  }

  @Delete('commission-rules/:id')
  deleteCommissionRule(@Param('id') id: string) {
    return this.adminService.deleteCommissionRule(id);
  }

  // --- 📨 SUPPORT / TICKETS ---
  /**
   * Récupère toutes les demandes de support envoyées par les utilisateurs ou
   * commerçants. Ces demandes sont généralement créées via l'API /requests
   * côté client. Elles sont renvoyées triées du plus récent au plus ancien.
   */
  @Get('requests')
  getRequests() {
    return this.adminService.getAllRequests();
  }

  /**
   * Marque une demande comme résolue. Cela supprime la demande de la liste
   * des tickets ouverts et envoie une notification au demandeur pour lui
   * signaler que sa requête a été traitée.
   */
  @Patch('requests/:id/resolve')
  resolveRequest(@Param('id') id: string) {
    return this.adminService.resolveRequest(id);
  }

  // --- ✨ GAMIFICATION ---
  @Get('gamification/stats')
  getGamificationStats() {
    return this.adminService.getGamificationStats();
  }

  @Get('gamification/levels')
  getGamificationLevels() {
    return this.adminService.getGamificationLevels();
  }

  @Get('gamification/user-progressions')
  getUserProgressions() {
    return this.adminService.getUserProgressions();
  }

  // --- ⭐ XP RULES (CRUD) ---
  @Post('gamification/xp-rules')
  createXpRule(@Body() createXpRuleDto: CreateXpRuleDto) {
    return this.adminService.createXpRule(createXpRuleDto);
  }

  /**
   * Liste les règles d'XP. Vous pouvez passer le paramètre `role` dans
   * la requête pour filtrer les règles destinées aux utilisateurs ou aux
   * commerçants. Exemple : /admin/gamification/xp-rules?role=MERCHANT
   */
  @Get('gamification/xp-rules')
  getXpRules(@Query('role') role?: 'USER' | 'MERCHANT') {
    return this.adminService.getXpRules(role);
  }

  @Patch('gamification/xp-rules/:id')
  updateXpRule(
    @Param('id') id: string,
    @Body() updateXpRuleDto: UpdateXpRuleDto,
  ) {
    return this.adminService.updateXpRule(id, updateXpRuleDto);
  }

  @Delete('gamification/xp-rules/:id')
  deleteXpRule(@Param('id') id: string) {
    return this.adminService.deleteXpRule(id);
  }

  @Post('gamification/level-rules')
  async createLevelRule(@Body() createLevelRuleDto: CreateLevelRuleDto) {
    try {
      return await this.adminService.createLevelRule(createLevelRuleDto);
    } catch (err: any) {
      
      // Prisma unique constraint
      if (err instanceof ConflictException) throw err;
      if (err?.code === 'P2002') {
        throw new ConflictException(
          `Conflit en base : une règle pour le niveau ${createLevelRuleDto.level} existe déjà.`,
        );
      }
      // Return a clearer 500
      throw new InternalServerErrorException(
        err?.message ||
          'Erreur interne lors de la création de la règle de niveau',
      );
    }
  }

  /**
   * Liste les règles de niveau. Vous pouvez passer le paramètre `role` pour
   * filtrer les règles destinées aux utilisateurs ou aux commerçants.
   */
  @Get('gamification/level-rules')
  getLevelRules(@Query('role') role?: 'USER' | 'MERCHANT') {
    return this.adminService.getLevelRules(role);
  }

  @Patch('gamification/level-rules/:id')
  updateLevelRule(
    @Param('id') id: string,
    @Body() updateLevelRuleDto: UpdateLevelRuleDto,
  ) {
    return this.adminService.updateLevelRule(id, updateLevelRuleDto);
  }
  @Get('gamification/rankings')
  getGlobalRanking() {
    return this.adminService.getGlobalRanking();
  }

  @Delete('gamification/level-rules/:id')
  deleteLevelRule(@Param('id') id: string) {
    return this.adminService.deleteLevelRule(id);
  }
  @Get('gamification/rankings/weekly')
  getWeeklyRanking() {
    return this.adminService.getWeeklyRanking();
  }

  // --- 🛡️ IDENTITY VERIFICATION ---
  // MISE À JOUR: La route des vérifications en attente
  @Get('identity/pending')
  getPendingVerifications(@Query('role') role: 'USER' | 'MERCHANT' = 'USER') {
    // Accepte un paramètre 'role'
    return this.adminService.getPendingVerifications(role);
  }

  @Patch('identity/:id/approve')
  approveVerification(
    @Param('id') id: string,
    @Body() approveDto: { sensitiveData?: any; notes?: string },
    @Req() req: any,
  ) {
    const adminId = req.user?.userId || req.user?.id;
    return this.adminService.approveVerification(id, adminId, approveDto.sensitiveData, approveDto.notes);
  }

  @Patch('identity/:id/reject')
  rejectVerification(
    @Param('id') id: string,
    @Body() rejectDto: RejectVerificationDto,
  ) {
    return this.adminService.rejectVerification(id, rejectDto.reason);
  }

  @Get('withdrawals')
  getAllWithdrawals() {
    return this.adminService.getAllWithdrawals();
  }

  @Get('withdrawals/pending')
  getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Patch('withdrawals/:id/approve')
  approveWithdrawal(@Param('id') id: string) {
    return this.adminService.approveWithdrawal(id);
  }

  @Patch('withdrawals/:id/reject')
  rejectWithdrawal(@Param('id') id: string, @Body('reason') reason: string) {
    if (!reason) {
      throw new BadRequestException('Un motif de rejet est requis.');
    }
    return this.adminService.rejectWithdrawal(id, reason);
  }

  // --- 📈 UTILISATEURS & TRANSACTIONS STATS ---
  /**
   * Récupère les statistiques agrégées par utilisateur (somme envoyée, reçue et nombre de transactions).
   * Accessible uniquement aux administrateurs.
   */
  @Get('users/stats')
  getUserStats() {
    return this.adminService.getUserStats();
  }

  /**
   * Retourne toutes les transactions de la plateforme avec les informations sur l'expéditeur et le destinataire.
   * Accessible uniquement aux administrateurs.
   */
  @Get('transactions')
  getAllTransactions() {
    return this.adminService.getAllTransactions();
  }

  /**
   * Retourne le bilan comptable complet d'un utilisateur spécifique
   * avec toutes ses transactions détaillées.
   */
  @Get('users/:id/balance')
  getUserBalance(@Param('id') id: string) {
    return this.adminService.getUserBalance(id);
  }

  /**
   * Récupère toutes les transactions d'un utilisateur spécifique
   */
  @Get('users/:id/transactions')
  getUserTransactions(@Param('id') id: string) {
    return this.adminService.getUserTransactions(id);
  }

  /**
   * Retourne les données des zones d'activité intense (hot zones)
   * avec statistiques par zone géographique
   */
  @Get('activity/hot-zones')
  getHotZones(@Query('timeRange') timeRange?: string) {
    return this.adminService.getHotZones(timeRange);
  }

  /**
   * Retourne les données pour la carte interactive des activités
   * avec répartition géographique détaillée
   */
  @Get('activity/interactive-map')
  getInteractiveMap() {
    return this.adminService.getInteractiveMap();
  }

  // --- 📉 ANALYSE CHURN, CONVERSION & RÉTENTION ---
  /**
   * Statistiques de churn (attrition) pour l'ensemble des utilisateurs.
   * @param query - Paramètres de filtrage (period, riskLevel, churnRate, segment)
   * @example GET /admin/stats/churn?period=30d&riskLevel=high&churnRate=50
   */
  @Get('stats/churn')
  getChurnStats(@Query() query: ChurnStatsQueryDto) {
    return this.adminService.getChurnStats(query);
  }

  /**
   * Statistiques de conversion pour l'entonnoir utilisateurs.
   * @param query - Paramètres de filtrage (period, userType, conversionRate, segment)
   * @example GET /admin/stats/conversion?period=7d&userType=new&conversionRate=20
   */
  @Get('stats/conversion')
  getConversionStats(@Query() query: ConversionStatsQueryDto) {
    return this.adminService.getConversionStats(query);
  }

  /**
   * Statistiques de rétention pour les utilisateurs.
   * @param query - Paramètres de filtrage (period, retentionRate, cohortSize)
   * @example GET /admin/stats/retention?period=90d&retentionRate=60
   */
  @Get('stats/retention')
  getRetentionStats(@Query() query: RetentionStatsQueryDto) {
    return this.adminService.getRetentionStats(query);
  }

  // --- 💬 MESSAGERIE ---
  /**
   * Liste des conversations entre l'admin et les utilisateurs avec aperçu du dernier message.
   */
  @Get('messages')
  getMessagesConversations() {
    return this.adminService.getMessagesConversations();
  }

  /**
   * Récupère l'historique des messages avec un utilisateur donné.
   */
  @Get('messages/:userId')
  getMessagesByUser(@Param('userId') userId: string) {
    return this.adminService.getMessagesByUser(userId);
  }

  /**
   * Envoie un message à un utilisateur depuis l'admin.
   * Accepte du texte et optionnellement un fichier joint.
   */
  @Post('messages/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/messages',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  )
  async sendMessageToUser(
    @Param('userId') userId: string,
    @Body('content') content: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileUrl = file ? `/uploads/messages/${file.filename}` : undefined;
    const fileName = file ? file.originalname : undefined;
    const fileType = file ? file.mimetype : undefined;
    
    return this.adminService.sendMessageToUser(
      userId,
      content || '(Fichier joint)',
      fileUrl,
      fileName,
      fileType
    );
  }

  // --- ✅ ACCOUNT STATUS MANAGEMENT ---
  /**
   * Met à jour le statut d'un utilisateur (actif, inactif, suspendu, en attente).
   * Permet à l'admin de désactiver ou suspendre un compte utilisateur. Le corps
   * de la requête doit contenir un champ `status` avec l'une des valeurs
   * autorisées : 'active', 'inactive', 'pending' ou 'suspended'.
   */
  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateUserStatus(id, status);
  }

  /**
   * Met à jour le statut d'un commerçant (actif, inactif ou en attente).
   * Le corps de la requête doit contenir un champ `status` avec l'une des
   * valeurs autorisées : 'active', 'inactive' ou 'pending'.
   */
  @Patch('merchants/:id/status')
  updateMerchantStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateMerchantStatus(id, status);
  }
  @Get('suggestions')
  async listSuggestions() {
    return this.adminService.listSuggestions();
  }

  // ➜ Approuver une suggestion (crée un Merchant + passe status=approved)
  @Patch('suggestions/:id/approve')
  async approveSuggestion(@Param('id') id: string) {
    return this.adminService.approveSuggestion(id);
  }

  // ➜ Rejeter une suggestion (status=rejected + raison optionnelle)
  @Patch('suggestions/:id/reject')
  async rejectSuggestion(
    @Param('id') id: string,
    @Body() dto: RejectSuggestionDto,
  ) {
    return this.adminService.rejectSuggestion(id, dto.reason);
  }
  @Delete('suggestions/:id')
  async deleteSuggestion(@Param('id') id: string) {
    return this.adminService.deleteSuggestion(id);
  }

  // --- 🎯 GESTION DES RÈGLES DE PARRAINAGE ---
  /**
   * Endpoint PUBLIC : Récupère les règles actives pour affichage côté client/marchand
   * Pas besoin d'authentification admin
   */
  @Get('referral-rules/public/:userRole')
  @UseGuards(AuthGuard('jwt')) // Juste authentifié, pas besoin d'être admin
  async getPublicReferralRules(@Param('userRole') userRole: 'USER' | 'MERCHANT') {
    return this.adminService.getPublicReferralRules(userRole);
  }

  /**
   * Récupère toutes les règles de parrainage configurées
   */
  @Get('referral-rules')
  getReferralRules() {
    return this.adminService.getReferralRules();
  }

  /**
   * Initialise les règles de parrainage par défaut (4 combinaisons)
   */
  @Post('referral-rules/initialize')
  initializeDefaultReferralRules() {
    return this.adminService.initializeDefaultReferralRules();
  }

  /**
   * Crée une nouvelle règle de parrainage personnalisée
   */
  @Post('referral-rules')
  createReferralRule(@Body() data: {
    referrerType: 'USER' | 'MERCHANT';
    refereeType: 'USER' | 'MERCHANT';
    requiredAction: string;
    referrerReward: number;
    refereeReward: number;
    isActive?: boolean;
    description?: string;
  }) {
    return this.adminService.createReferralRule(data);
  }

  /**
   * Met à jour une règle de parrainage existante
   */
  @Patch('referral-rules/:id')
  updateReferralRule(
    @Param('id') id: string,
    @Body() data: {
      requiredAction?: string;
      referrerReward?: number;
      refereeReward?: number;
      isActive?: boolean;
      description?: string;
    }
  ) {
    return this.adminService.updateReferralRule(id, data);
  }

  /**
   * Supprime une règle de parrainage
   */
  @Delete('referral-rules/:id')
  deleteReferralRule(@Param('id') id: string) {
    return this.adminService.deleteReferralRule(id);
  }

  // --- 👥 GESTION DE LA CRÉATION D'UTILISATEURS ---

  /**
   * Vérifie si un email est déjà utilisé
   */
  @Get('check-email/:email')
  async checkEmailExists(@Param('email') email: string) {
    return this.adminService.checkEmailExists(email);
  }

  /**
   * Crée un nouveau client (USER)
   */
  @Post('create-user')
  async createUser(@Body() userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
    wilaya?: string;
    sendWelcomeEmail?: boolean;
    requireEmailVerification?: boolean;
    initialStatus?: 'active' | 'pending' | 'suspended';
  }) {
    return this.adminService.createUserAccount(userData);
  }

  /**
   * Crée un nouveau marchand (MERCHANT)
   */
  @Post('create-merchant')
  async createMerchant(@Body() merchantData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    wilaya?: string;
    sendWelcomeEmail?: boolean;
    requireEmailVerification?: boolean;
    initialStatus?: 'active' | 'pending' | 'suspended';
  }) {
    return this.adminService.createMerchantAccount(merchantData);
  }

  // --- 📨 MESSAGERIE ---
  /**
   * Récupère le nombre de messages non lus par l'admin
   */
  @Get('messages/unread-count')
  async getUnreadMessagesCount() {
    return this.adminService.getUnreadMessagesCount();
  }

  // --- 🎫 TICKETS DE SUPPORT ---
  /**
   * Récupère le nombre de tickets ouverts
   */
  @Get('tickets/open-count')
  async getOpenTicketsCount() {
    return this.ticketsService.getOpenTicketsCount();
  }

  /**
   * Récupère tous les tickets de support
   */
  @Get('tickets')
  getAllTickets() {
    return this.ticketsService.findAll();
  }

  /**
   * Récupère les détails d'un ticket spécifique
   */
  @Get('tickets/:id')
  getTicket(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  /**
   * Met à jour un ticket (statut, priorité, réponse admin)
   */
  @Patch('tickets/:id')
  updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  /**
   * Répond à un ticket via la messagerie
   * Crée un message lié au ticket
   */
  @Post('tickets/:id/respond')
  respondToTicket(
    @Param('id') id: string,
    @Body() respondTicketDto: RespondTicketDto,
  ) {
    return this.ticketsService.respondToTicket(id, respondTicketDto.response);
  }

  /**
   * Supprime un ticket
   */
  @Delete('tickets/:id')
  deleteTicket(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
