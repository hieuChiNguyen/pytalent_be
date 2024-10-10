import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { Response } from 'express';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { LogicalQuestionsService } from '../service/logical-question.service';
import { CreateLogicalQuestionDto } from '../dto/create-logical-question.dto';
import {
  CREATE_LOGICAL_QUESTION,
  DELETE_LOGICAL_QUESTION,
  GET_DETAIL_LOGICAL_QUESTION,
  RANDOM_LOGICAL_QUESTIONS,
} from '@shared/constant/constants';
import { UpdateLogicalQuestionScoreDto } from '../dto/update-logical-question-score.dto';

@Controller('api/v1/logical-questions')
export class LogicalQuestionsController extends BaseController {
  constructor(
    private readonly logicalQuestionService: LogicalQuestionsService,
  ) {
    super();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async createLogicalQuestion(
    @Body() createLogicalQuestionDto: CreateLogicalQuestionDto,
    @Res() res: Response,
  ) {
    const newLogicalQuestion =
      await this.logicalQuestionService.createLogicalQuestion(
        createLogicalQuestionDto,
      );

    if (newLogicalQuestion) {
      return this.successResponse(
        {
          data: {
            newLogicalQuestion,
            links: {
              createLogicalQuestion: CREATE_LOGICAL_QUESTION,
              deleteLogicalQuestion: DELETE_LOGICAL_QUESTION,
              getDetailLogicalQuestion: GET_DETAIL_LOGICAL_QUESTION,
              randomLogicalQuestions: RANDOM_LOGICAL_QUESTIONS,
            },
          },
          message: 'create logical question success',
        },
        res,
      );
    }

    return this.errorsResponse(
      {
        message: 'create logical question failed',
      },
      res,
    );
  }

  @Get('/random')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.ADMIN, RoleEnum.CANDIDATE]),
  )
  async getRandomLogicalQuestions(@Res() res: Response) {
    const logicalQuestions =
      await this.logicalQuestionService.randomLogicalQuestions();

    const len = logicalQuestions.length;

    if (logicalQuestions) {
      return this.successResponse(
        {
          data: {
            logicalQuestions,
            length: len,
            links: {
              createLogicalQuestion: CREATE_LOGICAL_QUESTION,
              deleteLogicalQuestion: DELETE_LOGICAL_QUESTION,
              getDetailLogicalQuestion: GET_DETAIL_LOGICAL_QUESTION,
              randomLogicalQuestions: RANDOM_LOGICAL_QUESTIONS,
            },
          },
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse({}, res);
    }
  }

  @Get('/detail/:questionId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.ADMIN, RoleEnum.CANDIDATE]),
  )
  async getDetailLogicalQuestion(
    @Param('questionId') questionId: number,
    @Res() res: Response,
  ) {
    const logicalQuestion =
      await this.logicalQuestionService.getDetailLogicalQuestion(questionId);

    return this.successResponse(
      {
        data: {
          logicalQuestion,
          links: {
            createLogicalQuestion: CREATE_LOGICAL_QUESTION,
            deleteLogicalQuestion: DELETE_LOGICAL_QUESTION,
            getDetailLogicalQuestion: GET_DETAIL_LOGICAL_QUESTION,
            randomLogicalQuestions: RANDOM_LOGICAL_QUESTIONS,
          },
        },
        message: 'success',
      },
      res,
    );
  }

  @Delete('/delete/:questionId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async deleteLogicalQuestion(
    @Param('questionId') questionId: number,
    @Res() res: Response,
  ) {
    const deleteQuestion =
      await this.logicalQuestionService.deleteLogicalQuestion(questionId);

    if (deleteQuestion.affected) {
      return this.successResponse(
        {
          data: {
            deleted: true,
          },
          message: 'delete success',
        },
        res,
      );
    }
  }

  @Patch('/update/:questionId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async updateLogicalQuestionScore(
    @Param('questionId') questionId: number,
    @Body() updateLogicalQuestionScore: UpdateLogicalQuestionScoreDto,
    @Res() res: Response,
  ) {
    const updatedQuestion =
      await this.logicalQuestionService.updateLogicalQuestionScore(
        questionId,
        updateLogicalQuestionScore,
      );

    if (updatedQuestion.affected) {
      return this.successResponse(
        {
          data: {
            updated: true,
          },
          message: 'update success',
        },
        res,
      );
    }
  }
}
