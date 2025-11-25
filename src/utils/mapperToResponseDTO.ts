import { User } from '../entity/userEntity';
import { UserResponseDto } from '../dto/userDTO';
import { Story } from '../entity/storyEntity';
import { StoryResponseDTO } from '../dto/storyDTO';

export const mapUserToResponseDto = (user: User): UserResponseDto => {
  return {
    userId: user.userId,
    username: user.username,
    name: user.name,
    email: user.email,
    joinDate: user.joinDate,
    role: user.role,
  };
};

export const mapStoryToResponseDTO = (story: Story): StoryResponseDTO => {
  return {
    storyId: story.storyId,
    title: story.title,
    body: story.body,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
    userId: story.userId
  }
}