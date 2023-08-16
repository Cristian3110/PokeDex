import { PartialType } from '@nestjs/mapped-types';
import { CreatePokemonDto } from './create-pokemon.dto';

// updatePokemonDto con las opcionales extandidas desde CreatePokemonDto
export class UpdatePokemonDto extends PartialType(CreatePokemonDto) {}
