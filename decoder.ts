function numberFromUnknown(u: unknown): number {
    if (typeof u === 'number') {
        return u
    }
    throw new Error('not a number')
}

function integerFromNumber(n: number): number {
    if (Number.isInteger(n)) {
        return n
    }
    throw new Error('not an integer')
}

function integerFromUnknown(u: unknown): number {
    return integerFromNumber(numberFromUnknown(u))
}

import { array as arrayL } from 'fp-ts/lib/Array'
import { Either, right, left, either } from 'fp-ts/lib/Either'

type Decoder<I, A> = (i: I) => Either<string, A>

const numberFromUnknownDecoder: Decoder<unknown, number> = u =>
    typeof u === 'number' ? right(u) : left('not a number')

const integerFromNumberDecoder: Decoder<number, number> = n =>
    Number.isInteger(n) ? right(n) : left('not an integer')

const integerFromUnknownDecoder: Decoder<unknown, number> = u =>
    either.chain(numberFromUnknownDecoder(u), integerFromNumberDecoder)

const unknownToString: Decoder<unknown, string> = u => typeof u === 'string' ? right(u) : left('not a string')

const unknownToRecord: Decoder<unknown, Record<string, unknown>> = u => either.map(unknownToString(u), s => ({ s }))

function record<A>(d: Decoder<unknown, A>): Decoder<unknown, Record<string, A>> {
    return u => either.map(d(u), a => ({ a }))
}

function tuple<I1, I2, A1, A2>(
    d1: Decoder<I1, A1>,
    d2: Decoder<I2, A2>
  ): Decoder<[I1, I2], [A1, A2]> {
      return ([i1, i2]) => either.chain(d1(i1), a1 => either.map(d2(i2), a2 => ([a1, a2])))
  }

function array<I, A>(d: Decoder<I, A>): Decoder<Array<I>, Array<A>> {
    return is => arrayL.reduce(is, right([]), (acc, i) => either.map(acc, r => r.concat(d(i))))
}
