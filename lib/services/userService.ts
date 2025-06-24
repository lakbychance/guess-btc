import prisma from '../prisma';

export interface CreateUserData {
    username: string;
}

export interface UserData {
    id: string;
    username: string;
    score: number;
}

export class UserService {
    static async createUser(data: CreateUserData): Promise<UserData> {
        const user = await prisma.user.create({
            data: {
                username: data.username
            }
        });
        return user;
    }

    static async findUserByUsername(username: string): Promise<UserData | null> {
        const user = await prisma.user.findUnique({
            where: {
                username
            }
        });
        return user;
    }

    static async findUserById(id: string): Promise<UserData | null> {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        });
        return user;
    }

    static async getUserScore(username: string): Promise<{ username: string; score: number } | null> {
        const user = await this.findUserByUsername(username);
        if (!user) {
            return null;
        }
        return {
            username: user.username,
            score: user.score
        };
    }

    static async incrementUserScore(id: string): Promise<UserData> {
        const user = await prisma.user.update({
            where: {
                id
            },
            data: {
                score: {
                    increment: 1
                }
            }
        });
        return user;
    }
} 