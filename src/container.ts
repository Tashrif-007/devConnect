import 'reflect-metadata';
import { container } from 'tsyringe';

import { UserRepository } from './repositories/userRepository';
import { AuthRepository } from './repositories/authRepository';
import { StoryRepository } from './repositories/storyRepository';
import { CategoryRepository } from './repositories/categoryRepository';
import { TransactionRepository } from './repositories/transactionRepository';
import { VoteRepository } from './repositories/voteRepository';
import { CommentRepository } from './repositories/commentRepository';

import { UserService } from './services/userService';
import { AuthService } from './services/authService';
import { StoryService } from './services/storyService';
import { CategoryService } from './services/categoryService';
import { EmailService } from './services/emailService';
import { AiService } from './services/aiService';
import { VoteService } from './services/voteService';
import { CommentService } from './services/commentService';
import { CloudinaryService } from './services/cloudinaryService';

import { UserController } from './controllers/userController';
import { AuthController } from './controllers/authController';
import { StoryController } from './controllers/storyController';
import { CategoryController } from './controllers/categoryController';
import { AdminController } from './controllers/adminController';
import { VoteController } from './controllers/voteController';
import { CommentController } from './controllers/commentController';

import {
    DatabaseContextManager,
    databaseContext,
} from './utils/databaseContext';

container.registerSingleton(UserRepository);
container.registerSingleton(AuthRepository);
container.registerSingleton(StoryRepository);
container.registerSingleton(CategoryRepository);
container.registerSingleton(TransactionRepository);
container.registerSingleton(VoteRepository);
container.registerSingleton(CommentRepository);

container.registerSingleton(EmailService);
container.registerSingleton(AiService);
container.registerSingleton(CloudinaryService);
container.registerSingleton(CategoryService);
container.registerSingleton(StoryService);
container.registerSingleton(UserService);
container.registerSingleton(AuthService);
container.registerSingleton(VoteService);
container.registerSingleton(CommentService);

container.register(UserController, { useClass: UserController });
container.register(AuthController, { useClass: AuthController });
container.register(StoryController, { useClass: StoryController });
container.register(CategoryController, { useClass: CategoryController });
container.register(AdminController, { useClass: AdminController });
container.register(VoteController, { useClass: VoteController });
container.register(CommentController, { useClass: CommentController });

container.registerInstance(DatabaseContextManager, databaseContext);

export { container };
