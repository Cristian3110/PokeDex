import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination';

@Injectable()
export class PokemonService {
  //property
  private defaultLimit: number;
  constructor(
    // Injecting Model
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    // console.log(process.env.DEFAULT_LIMIT);
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      console.log(error);
      this.handleExecptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 'ascending' })
      .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    //Search for Number
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    //MongoId
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    //name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase(),
      });
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with name, id, or no ${term} not found`,
      );
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });

      // return pokemon;
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExecptions(error);
      console.log(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // this.pokemonModel.findByIdAndDelete(id);
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    //? esto se aplica para cuando no se encuentre por id el dato y solo hacer una sola consulta
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with Id ${id} not found`);
    }

    return {
      msg: 'poke deleted',
    };
  }

  private handleExecptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        ` Pokemon exists in DB ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
