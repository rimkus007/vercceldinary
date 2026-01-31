import { PartialType } from '@nestjs/mapped-types';
import { CreateLevelRuleDto } from './create-level-rule.dto';

export class UpdateLevelRuleDto extends PartialType(CreateLevelRuleDto) {}
