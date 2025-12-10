import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Province } from 'src/provinces/entities/province.entity';
import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    const province = await this.provinceRepository.findOne({
      where: { id: createQuizDto.provinceId },
    });
    if (!province) {
      throw new Error('Province not found');
    }
    const quiz = this.quizRepository.create({
      question: createQuizDto.question,
      choices: createQuizDto.choices,
      answer: createQuizDto.answer,
      explanation: createQuizDto.explanation,
      province: province,
    });
    return this.quizRepository.save(quiz);
  }

  async findAll(): Promise<Quiz[]> {
    return await this.quizRepository.find({ relations: ['province'] });
  }

  async findOne(id: number): Promise<Quiz | null> {
    return await this.quizRepository.findOne({ where: { id }, relations: ['province'] });
  }

  async findByProvince(provinceId: number): Promise<Quiz[]> {
    return await this.quizRepository.find({
      where: { province: { id: provinceId } },
      relations: ['province'],
    });
  }

  async update(id: number, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.quizRepository.findOne({ where: { id }, relations: ['province'] });
    if (!quiz) {
      throw new Error(`Quiz #${id} not found`);
    }
    if (updateQuizDto.provinceId !== undefined) {
      const province = await this.provinceRepository.findOne({
        where: { id: updateQuizDto.provinceId },
      });
      if (!province) {
        throw new Error('Province not found');
      }
      quiz.province = province;
    }
    Object.assign(quiz, updateQuizDto);
    return this.quizRepository.save(quiz);
  }

  async remove(id: number) {
    const quiz = await this.quizRepository.findOne({ where: { id } });
    if (!quiz) {
      throw new Error(`Quiz #${id} not found`);
    }
    await this.quizRepository.delete(id);
    return { message: `Quiz #${id} deleted successfully` };
  }
}
