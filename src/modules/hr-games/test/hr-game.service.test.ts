import { CustomizeException } from '@exception/customize.exception';
import { HrGamesService } from '../services/hr-game.service';
import { RoleEnum } from '@common/enum/role.enum';
import { GameCategoryEnum } from '@common/enum/game-category.enum';

describe('HrGamesService', () => {
  describe('#checkExistedHr', () => {
    const table = [
      {
        hrId: 1,
        hr: {
          id: 1,
          username: 'HR1',
          password:
            '$2b$10$8NoeFbeBargsDsClhpfkDexfk0RtV6kDSJa/yTOwJ3Wbo3n6e3k/.',
          email: 'hr1@gmail.com',
          role: RoleEnum.HR,
        },
        expected: true,
      },
      {
        hrId: 2,
        hr: null,
        expected: false,
      },
    ];

    test.each(table)('hrId: $hrId', async ({ hrId, hr, expected }) => {
      const mockUsersRepository = {
        findOne: jest.fn().mockResolvedValueOnce(hr),
      };

      const service = new HrGamesService(
        {} as any,
        mockUsersRepository as any,
        {} as any,
        {} as any,
      );

      const result = await service.checkExistedHr(hrId);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: hrId, role: RoleEnum.HR },
      });

      expect(result).toEqual(expected);
    });
  });

  describe('#checkExistedGame', () => {
    const table = [
      {
        gameId: 1,
        game: {
          id: 1,
          category: GameCategoryEnum.LOGICAL,
          timeLimit: 90,
          totalQuestionLevel: 20,
        },
        expected: true,
      },
      {
        gameId: 2,
        game: null,
        expected: false,
      },
    ];

    test.each(table)('gameId: $gameId', async ({ gameId, game, expected }) => {
      const mockGamesRepository = {
        findOne: jest.fn().mockResolvedValueOnce(game),
      };

      const service = new HrGamesService(
        {} as any,
        {} as any,
        mockGamesRepository as any,
        {} as any,
      );

      const result = await service.checkExistedGame(gameId);

      expect(mockGamesRepository.findOne).toHaveBeenCalledWith({
        where: { id: gameId },
      });

      expect(result).toEqual(expected);
    });
  });

  describe('#getExistedHrGame', () => {
    const table = [
      {
        gameId: 1,
        hrId: 1,
        expected: {
          id: 1,
          hrId: 1,
          gameId: 1,
        },
      },
    ];

    test.each(table)(
      'gameId: $gameId, hrId: $hrId',
      async ({ gameId, hrId, expected }) => {
        const mockHrGamesRepository = {
          findOne: jest.fn().mockResolvedValueOnce(expected),
        };

        const service = new HrGamesService(
          mockHrGamesRepository as any,
          {} as any,
          {} as any,
          {} as any,
        );

        const result = await service.getExistedHrGame(hrId, gameId);

        expect(mockHrGamesRepository.findOne).toHaveBeenCalledWith({
          where: { hrId: hrId, gameId: gameId },
        });

        expect(result).toEqual(expected);
      },
    );
  });

  describe('#createHrGames', () => {
    const table = [
      {
        params: { hrId: 1, gameId: 1 },
        hrExist: false,
        expectedException: 'message.HR_NOT_FOUND',
      },
      {
        params: { hrId: 1, gameId: 1 },
        hrExist: true,
        gameExist: false,
        expectedException: 'message.GAME_NOT_FOUND',
      },
      {
        params: { hrId: 1, gameId: 1 },
        hrExist: true,
        gameExist: true,
        hrGameExist: true,
        expectedException: 'message.HR_GAME_EXISTED',
      },
      {
        params: { hrId: 1, gameId: 1 },
        hrExist: true,
        gameExist: true,
        hrGameExist: false,
        expected: { id: 1, hrId: 1, gameId: 1 },
      },
    ];

    test.each(table)(
      'params: $params',
      async ({
        params,
        hrExist,
        gameExist,
        hrGameExist,
        expected,
        expectedException,
      }) => {
        const mockHrGamesRepository = {
          findOne: jest
            .fn()
            .mockResolvedValueOnce(hrGameExist ? { id: 1 } : null),
          save: jest.fn().mockResolvedValueOnce(expected),
        };

        const mockUsersRepository = {
          findOne: jest.fn().mockResolvedValueOnce(hrExist ? { id: 1 } : null),
        };

        const mockGameRepository = {
          findOne: jest
            .fn()
            .mockResolvedValueOnce(gameExist ? { id: 1 } : null),
        };

        const mockI18n = {
          t: jest.fn().mockImplementation((msg) => msg),
        };

        const service = new HrGamesService(
          mockHrGamesRepository as any,
          mockUsersRepository as any,
          mockGameRepository as any,
          mockI18n as any,
        );

        if (expectedException) {
          await expect(service.createHrGames(params)).rejects.toThrow(
            expectedException,
          );
        }

        if (expected) {
          const result = await service.createHrGames(params);
          expect(mockHrGamesRepository.save).toHaveBeenCalled();
          expect(result).toEqual(expected);
        }
      },
    );
  });

  describe('#getGamesByHrId', () => {
    const table = [
      {
        hrId: 1,
        hrExists: false,
        expectedException: 'message.HR_NOT_FOUND',
      },
      {
        hrId: 1,
        hrExists: true,
        expected: [],
        expectedException: 'message.NO_HR_GAMES',
      },
      {
        hrId: 1,
        hrExists: true,
        expected: [
          { gameId: 1, hrId: 1 },
          { gameId: 2, hrId: 1 },
        ],
      },
    ];

    test.each(table)(
      'hrId: $hrId',
      async ({ hrId, hrExists, expected, expectedException }) => {
        const mockHrGamesRepository = {
          findAllGamesByHrId: jest.fn().mockResolvedValue(expected || []),
        };

        const mockUsersRepository = {
          findOne: jest.fn().mockResolvedValue(hrExists ? { id: hrId } : null),
        };

        const mockI18n = {
          t: jest.fn().mockImplementation((msg) => msg),
        };

        const service = new HrGamesService(
          mockHrGamesRepository as any,
          mockUsersRepository as any,
          {} as any,
          mockI18n as any,
        );

        if (expectedException) {
          await expect(service.getGamesByHrId(hrId)).rejects.toThrow(
            new CustomizeException(expectedException),
          );
        } else {
          const result = await service.getGamesByHrId(hrId);
          expect(result).toEqual(expected);
        }
      },
    );
  });

  describe('#getAllHrGames', () => {
    const table = [
      {
        hrGames: [],
        expectedException: 'There are not any games authorized to any hr',
      },
      {
        hrGames: [
          { hrId: 1, gameId: 1 },
          { hrId: 2, gameId: 2 },
        ],
        expected: [
          { hrId: 1, gameId: 1 },
          { hrId: 2, gameId: 2 },
        ],
      },
    ];

    test.each(table)('', async ({ hrGames, expected, expectedException }) => {
      const mockHrGamesRepository = {
        findAllHrGames: jest.fn().mockResolvedValue(hrGames),
      };

      const service = new HrGamesService(
        mockHrGamesRepository as any,
        {} as any,
        {} as any,
        {} as any,
      );

      if (expectedException) {
        await expect(service.getAllHrGames()).rejects.toThrow(
          new CustomizeException(expectedException),
        );
      } else {
        const result = await service.getAllHrGames();
        expect(result).toEqual(expected);
      }
    });
  });

  describe('#deleteHrGame', () => {
    const table = [
      {
        hrId: 1,
        gameId: 1,
        expected: { affected: 1 },
      },
      {
        hrId: 2,
        gameId: 2,
        expected: { affected: 0 },
      },
    ];

    test.each(table)(
      'hrId: $hrId, gameId: $gameId',
      async ({ hrId, gameId, expected }) => {
        const mockHrGamesRepository = {
          delete: jest.fn().mockResolvedValue(expected),
        };

        const service = new HrGamesService(
          mockHrGamesRepository as any,
          {} as any,
          {} as any,
          {} as any,
        );

        const result = await service.deleteHrGame(hrId, gameId);

        expect(mockHrGamesRepository.delete).toHaveBeenCalledWith({
          hrId,
          gameId,
        });

        expect(result).toEqual(expected);
      },
    );
  });
});
