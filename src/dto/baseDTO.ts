import { plainToClass, ClassConstructor } from 'class-transformer';

export abstract class BaseResponseDTO {
    static fromEntity<T, E>(this: ClassConstructor<T>, entity: E): T {
        return plainToClass(this, entity, {
            excludeExtraneousValues: true,
        });
    }

    static fromEntities<T, E>(this: ClassConstructor<T>, entities: E[]): T[] {
        return entities.map((entity) =>
            plainToClass(this, entity, {
                excludeExtraneousValues: true,
            }),
        );
    }
}
