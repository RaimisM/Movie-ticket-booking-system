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

export interface Screenings {
  id: Generated<number>
  movieId: number
  timestamp: string
  ticketAllocation: number
}

export interface Stars {
  movieId: number
  personId: number
}

export interface User {
  id: Generated<number>
  username: string
  role: 'user' | 'admin'
}

export interface DB {
  directors: Directors
  movies: Movies
  people: People
  ratings: Ratings
  screenings: Screenings
  stars: Stars
  user: User
}
