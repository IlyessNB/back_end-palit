import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './create-post.dto';
import { UsersService } from '../users/users.service';
import { TextsService } from './post-body/texts/texts.service';
import { CodesService } from './post-body/codes/codes.service';
import { LikesService } from '../likes/likes.service';
import { RemarksService } from '../remarks/remarks.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private usersService: UsersService,
    private textsService: TextsService,
    private codesService: CodesService,
    private likesService: LikesService,
    private remarksService: RemarksService,
  ) {}

  async createPost(postCreate: CreatePostDto) {
    const post: Post = this.postRepository.create({
      title: postCreate.title,
      createdDate: postCreate.createdDate,
      idVideo: postCreate.idVideo,
      idPicture: postCreate.idPicture,
      user: await this.usersService.findByUserId(postCreate.idUser),
      code: await this.codesService.findByCodeId(postCreate.idCode),
      text: await this.textsService.findByTextId(postCreate.idText),
    });
    return this.postRepository.save(post);
  }

  async getAll(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['user', 'code', 'text', 'likes', 'remarks'],
      order: {
        id: 'DESC',
      },
    });
  }

  async findByPostId(postId: number): Promise<Post> {
    const posts = await this.postRepository.find({
      where: { id: postId },
      relations: ['user', 'code', 'text', 'remarks'],
    });
    return posts[0];
  }

  async findByUserId(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { idUser: userId },
      relations: ['user', 'code', 'text', 'likes', 'remarks'],
    });
  }

  async deletePostById(postId: number) {
    try {
      const post: Post = await this.findByPostId(postId);
      await this.remarksService.deleteRemarksByPostId(postId);
      await this.likesService.deleteLikesByPostId(postId);
      await this.postRepository.delete(postId);
      if (post.code != null) {
        this.codesService.deleteCodeById(post.code.id);
      } else if (post.text != null) {
        this.textsService.deleteTextById(post.text.id);
      }
    } catch (error) {
      console.log('likes delete error: ' + error);
    }
  }
}
