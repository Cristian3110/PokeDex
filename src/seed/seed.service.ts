import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  private readonly axios: AxiosInstance = axios;

  async executeSeed() {
    //delete each time it is executed.
    await this.pokemonModel.deleteMany({});

    const { data } = await this.axios.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=100',
    );

    // realizando inserción(fast and better)

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      // console.log({ name, url });

      const segments = url.split('/');
      // adding (+) to convert to number
      const no = +segments[segments.length - 2];

      //creating data poke
      //* realizando inserción individual(slow)
      //const pokemon = await this.pokemonModel.create({ name, no });

      pokemonToInsert.push({ name, no }); // [{name: pikachu , no: 1}]
      // console.log({ pokemon });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    // await Promise.all(insertPromiseArray);
    // console.log(data);
    return `Seed execute`;
  }
}
