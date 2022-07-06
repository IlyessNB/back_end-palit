import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateCodeDto } from './create-code.dto';
import { CodesService } from './codes.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth-guard';

@Controller('api/codes')
export class CodesController {
  constructor(private codeService: CodesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createCode(@Body() createCode: CreateCodeDto) {
    return this.codeService.createCode(createCode);
  }
}
