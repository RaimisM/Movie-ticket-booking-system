import type { ColumnType } from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export interface Directors {
  movieId: number
  personId: number
}

export interface Movies {
  id: Generated<number>
  title: string
  year: number
}

export interface People {
  id: Generated<number>
  name: string
  birth: number
}

export interface Ratings {
  movieId: number
  rating: number
  votes: number
}

export interface Screening {
  id: Generated<number>
  movieId: number
  date: string
  time: string
  capacity: number
}

export interface Stars {
  movieId: number
  personId: number
}

export interface User {
  id: Generated<number>
  userName: string
  role: 'user' | 'admin'
}

export interface DB {
  directors: Directors
  movies: Movies
  people: People
  ratings: Ratings
  screening: Screening
  stars: Stars
  user: User
}
