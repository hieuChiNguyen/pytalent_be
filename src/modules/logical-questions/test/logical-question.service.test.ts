import { CustomizeException } from '@exception/customize.exception';
import { LogicalQuestionsService } from '../service/logical-question.service';

describe('LogicalQuestionsService', () => {
  describe('#getDetailLogicalQuestion', () => {
    const table = [
      {
        questionId: 1,
        logicalQuestionExist: true,
        expected: {
          id: 1,
          firstStatement: 'First statement example',
          secondStatement: 'Second statement example',
          conclusion: 'Conclusion example',
        },
      },
      {
        questionId: 2,
        logicalQuestionExist: false,
        expected: null,
      },
    ];

    test.each(table)(
      'questionId: $questionId',
      async ({ questionId, expected }) => {
        const mockLogicalQuestionRepository = {
          findOne: jest.fn().mockResolvedValueOnce(expected),
        };

        const mockI18n = {
          t: jest.fn().mockImplementation((msg) => msg),
        };

        const service = new LogicalQuestionsService(
          mockLogicalQuestionRepository as any,
          mockI18n as any,
        );

        if (!expected) {
          await expect(
            service.getDetailLogicalQuestion(questionId),
          ).rejects.toThrow(
            new CustomizeException('message.LOGICAL_QUESTION_NOT_FOUND'),
          );
        }

        if (expected) {
          const result = await service.getDetailLogicalQuestion(questionId);
          expect(mockLogicalQuestionRepository.findOne).toHaveBeenCalledWith({
            where: {
              id: questionId,
            },
            select: ['id', 'firstStatement', 'secondStatement', 'conclusion'],
          });
          expect(result).toEqual(expected);
        }
      },
    );
  });

  // describe('LogicalQuestionsService', () => {
  //   describe('#deleteLogicalQuestion', () => {
  //     const table = [
  //       {
  //         questionId: 1,
  //         logicalQuestionExists: true,
  //         expected: { affected: 1 }, // Assuming delete returns an object with affected
  //       },
  //       {
  //         questionId: 2,
  //         logicalQuestionExists: false,
  //         expectedException: 'message.LOGICAL_QUESTION_NOT_FOUND',
  //       },
  //     ];

  //     test.each(table)(
  //       'questionId: $questionId',
  //       async ({
  //         questionId,
  //         logicalQuestionExists,
  //         expected,
  //         expectedException,
  //       }) => {
  //         const mockLogicalQuestionRepository = {
  //           findOne: jest
  //             .fn()
  //             .mockResolvedValue(logicalQuestionExists ? {} : null),
  //           delete: jest.fn().mockResolvedValue(expected),
  //         };

  //         const mockI18n = {
  //           t: jest.fn().mockImplementation((msg) => msg),
  //         };

  //         const service = new LogicalQuestionsService(
  //           mockLogicalQuestionRepository as any,
  //           mockI18n as any,
  //         );

  //         if (expectedException) {
  //           await expect(
  //             service.deleteLogicalQuestion(questionId),
  //           ).rejects.toThrow(new CustomizeException(expectedException));
  //         } else {
  //           const result = await service.deleteLogicalQuestion(questionId);
  //           expect(mockLogicalQuestionRepository.findOne).toHaveBeenCalledWith({
  //             where: { id: questionId },
  //           });
  //           expect(mockLogicalQuestionRepository.delete).toHaveBeenCalledWith(
  //             questionId,
  //           );
  //           expect(result).toEqual(expected);
  //         }
  //       },
  //     );
  //   });
  // });
});
