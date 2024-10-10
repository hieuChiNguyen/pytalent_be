import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { GamesService } from '../services/games.service';
import { CustomizeException } from '@exception/customize.exception';

describe('GamesService', () => {
  describe('#createGame', () => {
    const table = [
      {
        params: {
          category: GameCategoryEnum.LOGICAL,
          timeLimit: 90,
          totalQuestionLevel: 20,
        },
        expected: {
          id: 1,
          category: GameCategoryEnum.LOGICAL,
          timeLimit: 90,
          totalQuestionLevel: 20,
        },
        existed: null,
      },
      {
        params: {
          category: GameCategoryEnum.MEMORY,
          timeLimit: null,
          totalQuestionLevel: 25,
        },
        expected: {
          id: 2,
          category: GameCategoryEnum.MEMORY,
          timeLimit: null,
          totalQuestionLevel: 25,
        },
        existed: null,
      },
      {
        params: {
          category: GameCategoryEnum.LOGICAL,
          timeLimit: 60,
          totalQuestionLevel: 15,
        },
        expected: 'GAME_EXISTED',
        existed: {
          id: 1,
          category: GameCategoryEnum.LOGICAL,
          timeLimit: 60,
          totalQuestionLevel: 15,
        },
      },
    ];

    test.each(table)(
      'params: $params',
      async ({ params, expected, existed }) => {
        const mockGameRepository = {
          findOne: jest.fn().mockResolvedValue(existed),
          save: jest.fn().mockResolvedValue(expected),
        };

        const mockI18n = { t: jest.fn().mockReturnValue('GAME_EXISTED') };

        const service = new GamesService(
          mockGameRepository as any,
          mockI18n as any,
        );

        if (existed) {
          await expect(service.createGame(params)).rejects.toThrow(
            new CustomizeException('GAME_EXISTED'),
          );
        }

        if (!existed) {
          const result = await service.createGame(params);

          expect(mockGameRepository.findOne).toHaveBeenCalledWith({
            where: { category: params.category },
          });

          expect(mockGameRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              category: params.category,
              timeLimit: params.timeLimit,
              totalQuestionLevel: params.totalQuestionLevel,
            }),
          );

          expect(result).toEqual(expected);
        }
      },
    );
  });

  describe('#getAllGames', () => {
    const table = [
      {
        listGames: [
          {
            id: 1,
            category: GameCategoryEnum.LOGICAL,
            timeLimit: 90,
            totalQuestionLevel: 20,
          },
          {
            id: 2,
            category: GameCategoryEnum.MEMORY,
            timeLimit: null,
            totalQuestionLevel: 25,
          },
        ],
        expected: [
          {
            id: 1,
            category: GameCategoryEnum.LOGICAL,
            timeLimit: 90,
            totalQuestionLevel: 20,
          },
          {
            id: 2,
            category: GameCategoryEnum.MEMORY,
            timeLimit: null,
            totalQuestionLevel: 25,
          },
        ],
      },
      {
        listGames: null,
        expected: 'No games have been created',
      },
    ];

    test.each(table)('', async ({ listGames, expected }) => {
      const gameRepository = {
        findAllGames: jest.fn().mockResolvedValue(listGames),
      };

      const service = new GamesService(gameRepository as any, {} as any);

      if (!listGames) {
        await expect(service.getAllGames()).rejects.toThrow(
          new CustomizeException('No games have been created'),
        );
      }

      if (listGames) {
        const result = await service.getAllGames();
        expect(gameRepository.findAllGames).toHaveBeenCalled();
        expect(result).toEqual(expected);
      }
    });
  });

  describe('#getGameById', () => {
    const table = [
      {
        gameId: 1,
        expected: {
          id: 1,
          category: GameCategoryEnum.LOGICAL,
          timeLimit: 90,
          totalQuestionLevel: 20,
        },
      },
      {
        gameId: 2,
        expected: null,
      },
    ];

    test.each(table)('gameId: $gameId', async ({ gameId, expected }) => {
      const gameRepository = {
        findOne: jest.fn().mockResolvedValue(expected),
      };

      const i18nMock = {
        t: jest.fn().mockReturnValue('GAME_NOT_FOUND'),
      };

      const service = new GamesService(gameRepository as any, i18nMock as any);

      if (!expected) {
        await expect(service.getGameById(gameId)).rejects.toThrow(
          new CustomizeException('GAME_NOT_FOUND'),
        );
      }

      if (expected) {
        const result = await service.getGameById(gameId);
        expect(gameRepository.findOne).toHaveBeenCalledWith({
          where: { id: gameId },
        });
        expect(result).toEqual(expected);
      }
    });
  });
});
