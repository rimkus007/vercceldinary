// src/admin/dto/update-xp-rule.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateXpRuleDto } from './create-xp-rule.dto';

export class UpdateXpRuleDto extends PartialType(CreateXpRuleDto) {}
