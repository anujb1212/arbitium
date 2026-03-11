
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model TradingBalance
 * 
 */
export type TradingBalance = $Result.DefaultSelection<Prisma.$TradingBalancePayload>
/**
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model Trade
 * 
 */
export type Trade = $Result.DefaultSelection<Prisma.$TradePayload>
/**
 * Model BalanceTransfer
 * 
 */
export type BalanceTransfer = $Result.DefaultSelection<Prisma.$BalanceTransferPayload>
/**
 * Model Kline
 * 
 */
export type Kline = $Result.DefaultSelection<Prisma.$KlinePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const OrderSide: {
  BUY: 'BUY',
  SELL: 'SELL'
};

export type OrderSide = (typeof OrderSide)[keyof typeof OrderSide]


export const OrderStatus: {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  FILLED: 'FILLED',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]


export const TransferDirection: {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW'
};

export type TransferDirection = (typeof TransferDirection)[keyof typeof TransferDirection]


export const TransferStatus: {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus]


export const KlineInterval: {
  ONE_MINUTE: 'ONE_MINUTE',
  FIVE_MINUTES: 'FIVE_MINUTES',
  FIFTEEN_MINUTES: 'FIFTEEN_MINUTES',
  ONE_HOUR: 'ONE_HOUR',
  ONE_DAY: 'ONE_DAY'
};

export type KlineInterval = (typeof KlineInterval)[keyof typeof KlineInterval]

}

export type OrderSide = $Enums.OrderSide

export const OrderSide: typeof $Enums.OrderSide

export type OrderStatus = $Enums.OrderStatus

export const OrderStatus: typeof $Enums.OrderStatus

export type TransferDirection = $Enums.TransferDirection

export const TransferDirection: typeof $Enums.TransferDirection

export type TransferStatus = $Enums.TransferStatus

export const TransferStatus: typeof $Enums.TransferStatus

export type KlineInterval = $Enums.KlineInterval

export const KlineInterval: typeof $Enums.KlineInterval

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tradingBalance`: Exposes CRUD operations for the **TradingBalance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TradingBalances
    * const tradingBalances = await prisma.tradingBalance.findMany()
    * ```
    */
  get tradingBalance(): Prisma.TradingBalanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trade`: Exposes CRUD operations for the **Trade** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Trades
    * const trades = await prisma.trade.findMany()
    * ```
    */
  get trade(): Prisma.TradeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.balanceTransfer`: Exposes CRUD operations for the **BalanceTransfer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BalanceTransfers
    * const balanceTransfers = await prisma.balanceTransfer.findMany()
    * ```
    */
  get balanceTransfer(): Prisma.BalanceTransferDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.kline`: Exposes CRUD operations for the **Kline** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Klines
    * const klines = await prisma.kline.findMany()
    * ```
    */
  get kline(): Prisma.KlineDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    TradingBalance: 'TradingBalance',
    Order: 'Order',
    Trade: 'Trade',
    BalanceTransfer: 'BalanceTransfer',
    Kline: 'Kline'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "tradingBalance" | "order" | "trade" | "balanceTransfer" | "kline"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      TradingBalance: {
        payload: Prisma.$TradingBalancePayload<ExtArgs>
        fields: Prisma.TradingBalanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TradingBalanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TradingBalanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>
          }
          findFirst: {
            args: Prisma.TradingBalanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TradingBalanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>
          }
          findMany: {
            args: Prisma.TradingBalanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>[]
          }
          create: {
            args: Prisma.TradingBalanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>
          }
          createMany: {
            args: Prisma.TradingBalanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TradingBalanceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>[]
          }
          delete: {
            args: Prisma.TradingBalanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>
          }
          update: {
            args: Prisma.TradingBalanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>
          }
          deleteMany: {
            args: Prisma.TradingBalanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TradingBalanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TradingBalanceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>[]
          }
          upsert: {
            args: Prisma.TradingBalanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradingBalancePayload>
          }
          aggregate: {
            args: Prisma.TradingBalanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTradingBalance>
          }
          groupBy: {
            args: Prisma.TradingBalanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<TradingBalanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.TradingBalanceCountArgs<ExtArgs>
            result: $Utils.Optional<TradingBalanceCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      Trade: {
        payload: Prisma.$TradePayload<ExtArgs>
        fields: Prisma.TradeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TradeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TradeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          findFirst: {
            args: Prisma.TradeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TradeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          findMany: {
            args: Prisma.TradeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          create: {
            args: Prisma.TradeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          createMany: {
            args: Prisma.TradeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TradeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          delete: {
            args: Prisma.TradeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          update: {
            args: Prisma.TradeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          deleteMany: {
            args: Prisma.TradeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TradeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TradeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          upsert: {
            args: Prisma.TradeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          aggregate: {
            args: Prisma.TradeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrade>
          }
          groupBy: {
            args: Prisma.TradeGroupByArgs<ExtArgs>
            result: $Utils.Optional<TradeGroupByOutputType>[]
          }
          count: {
            args: Prisma.TradeCountArgs<ExtArgs>
            result: $Utils.Optional<TradeCountAggregateOutputType> | number
          }
        }
      }
      BalanceTransfer: {
        payload: Prisma.$BalanceTransferPayload<ExtArgs>
        fields: Prisma.BalanceTransferFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BalanceTransferFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BalanceTransferFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>
          }
          findFirst: {
            args: Prisma.BalanceTransferFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BalanceTransferFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>
          }
          findMany: {
            args: Prisma.BalanceTransferFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>[]
          }
          create: {
            args: Prisma.BalanceTransferCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>
          }
          createMany: {
            args: Prisma.BalanceTransferCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BalanceTransferCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>[]
          }
          delete: {
            args: Prisma.BalanceTransferDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>
          }
          update: {
            args: Prisma.BalanceTransferUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>
          }
          deleteMany: {
            args: Prisma.BalanceTransferDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BalanceTransferUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BalanceTransferUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>[]
          }
          upsert: {
            args: Prisma.BalanceTransferUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BalanceTransferPayload>
          }
          aggregate: {
            args: Prisma.BalanceTransferAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBalanceTransfer>
          }
          groupBy: {
            args: Prisma.BalanceTransferGroupByArgs<ExtArgs>
            result: $Utils.Optional<BalanceTransferGroupByOutputType>[]
          }
          count: {
            args: Prisma.BalanceTransferCountArgs<ExtArgs>
            result: $Utils.Optional<BalanceTransferCountAggregateOutputType> | number
          }
        }
      }
      Kline: {
        payload: Prisma.$KlinePayload<ExtArgs>
        fields: Prisma.KlineFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KlineFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KlineFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>
          }
          findFirst: {
            args: Prisma.KlineFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KlineFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>
          }
          findMany: {
            args: Prisma.KlineFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>[]
          }
          create: {
            args: Prisma.KlineCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>
          }
          createMany: {
            args: Prisma.KlineCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KlineCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>[]
          }
          delete: {
            args: Prisma.KlineDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>
          }
          update: {
            args: Prisma.KlineUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>
          }
          deleteMany: {
            args: Prisma.KlineDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KlineUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.KlineUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>[]
          }
          upsert: {
            args: Prisma.KlineUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KlinePayload>
          }
          aggregate: {
            args: Prisma.KlineAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKline>
          }
          groupBy: {
            args: Prisma.KlineGroupByArgs<ExtArgs>
            result: $Utils.Optional<KlineGroupByOutputType>[]
          }
          count: {
            args: Prisma.KlineCountArgs<ExtArgs>
            result: $Utils.Optional<KlineCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    tradingBalance?: TradingBalanceOmit
    order?: OrderOmit
    trade?: TradeOmit
    balanceTransfer?: BalanceTransferOmit
    kline?: KlineOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    orders: number
    transfers: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | UserCountOutputTypeCountOrdersArgs
    transfers?: boolean | UserCountOutputTypeCountTransfersArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTransfersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BalanceTransferWhereInput
  }


  /**
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    trades: number
    takerTrades: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trades?: boolean | OrderCountOutputTypeCountTradesArgs
    takerTrades?: boolean | OrderCountOutputTypeCountTakerTradesArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountTradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TradeWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountTakerTradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TradeWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    vaultlyUserId: string | null
    email: string | null
    createdAt: Date | null
    updatedAt: Date | null
    welcomeBonusCredited: boolean | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    vaultlyUserId: string | null
    email: string | null
    createdAt: Date | null
    updatedAt: Date | null
    welcomeBonusCredited: boolean | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    vaultlyUserId: number
    email: number
    createdAt: number
    updatedAt: number
    welcomeBonusCredited: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    vaultlyUserId?: true
    email?: true
    createdAt?: true
    updatedAt?: true
    welcomeBonusCredited?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    vaultlyUserId?: true
    email?: true
    createdAt?: true
    updatedAt?: true
    welcomeBonusCredited?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    vaultlyUserId?: true
    email?: true
    createdAt?: true
    updatedAt?: true
    welcomeBonusCredited?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    vaultlyUserId: string
    email: string | null
    createdAt: Date
    updatedAt: Date
    welcomeBonusCredited: boolean
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vaultlyUserId?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    welcomeBonusCredited?: boolean
    tradingBalance?: boolean | User$tradingBalanceArgs<ExtArgs>
    orders?: boolean | User$ordersArgs<ExtArgs>
    transfers?: boolean | User$transfersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vaultlyUserId?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    welcomeBonusCredited?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vaultlyUserId?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    welcomeBonusCredited?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    vaultlyUserId?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    welcomeBonusCredited?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "vaultlyUserId" | "email" | "createdAt" | "updatedAt" | "welcomeBonusCredited", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tradingBalance?: boolean | User$tradingBalanceArgs<ExtArgs>
    orders?: boolean | User$ordersArgs<ExtArgs>
    transfers?: boolean | User$transfersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      tradingBalance: Prisma.$TradingBalancePayload<ExtArgs> | null
      orders: Prisma.$OrderPayload<ExtArgs>[]
      transfers: Prisma.$BalanceTransferPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vaultlyUserId: string
      email: string | null
      createdAt: Date
      updatedAt: Date
      welcomeBonusCredited: boolean
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tradingBalance<T extends User$tradingBalanceArgs<ExtArgs> = {}>(args?: Subset<T, User$tradingBalanceArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    orders<T extends User$ordersArgs<ExtArgs> = {}>(args?: Subset<T, User$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    transfers<T extends User$transfersArgs<ExtArgs> = {}>(args?: Subset<T, User$transfersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly vaultlyUserId: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly welcomeBonusCredited: FieldRef<"User", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.tradingBalance
   */
  export type User$tradingBalanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    where?: TradingBalanceWhereInput
  }

  /**
   * User.orders
   */
  export type User$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * User.transfers
   */
  export type User$transfersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    where?: BalanceTransferWhereInput
    orderBy?: BalanceTransferOrderByWithRelationInput | BalanceTransferOrderByWithRelationInput[]
    cursor?: BalanceTransferWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BalanceTransferScalarFieldEnum | BalanceTransferScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model TradingBalance
   */

  export type AggregateTradingBalance = {
    _count: TradingBalanceCountAggregateOutputType | null
    _avg: TradingBalanceAvgAggregateOutputType | null
    _sum: TradingBalanceSumAggregateOutputType | null
    _min: TradingBalanceMinAggregateOutputType | null
    _max: TradingBalanceMaxAggregateOutputType | null
  }

  export type TradingBalanceAvgAggregateOutputType = {
    available: number | null
    locked: number | null
  }

  export type TradingBalanceSumAggregateOutputType = {
    available: bigint | null
    locked: bigint | null
  }

  export type TradingBalanceMinAggregateOutputType = {
    id: string | null
    userId: string | null
    available: bigint | null
    locked: bigint | null
    updatedAt: Date | null
  }

  export type TradingBalanceMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    available: bigint | null
    locked: bigint | null
    updatedAt: Date | null
  }

  export type TradingBalanceCountAggregateOutputType = {
    id: number
    userId: number
    available: number
    locked: number
    updatedAt: number
    _all: number
  }


  export type TradingBalanceAvgAggregateInputType = {
    available?: true
    locked?: true
  }

  export type TradingBalanceSumAggregateInputType = {
    available?: true
    locked?: true
  }

  export type TradingBalanceMinAggregateInputType = {
    id?: true
    userId?: true
    available?: true
    locked?: true
    updatedAt?: true
  }

  export type TradingBalanceMaxAggregateInputType = {
    id?: true
    userId?: true
    available?: true
    locked?: true
    updatedAt?: true
  }

  export type TradingBalanceCountAggregateInputType = {
    id?: true
    userId?: true
    available?: true
    locked?: true
    updatedAt?: true
    _all?: true
  }

  export type TradingBalanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TradingBalance to aggregate.
     */
    where?: TradingBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TradingBalances to fetch.
     */
    orderBy?: TradingBalanceOrderByWithRelationInput | TradingBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TradingBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TradingBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TradingBalances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TradingBalances
    **/
    _count?: true | TradingBalanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TradingBalanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TradingBalanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TradingBalanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TradingBalanceMaxAggregateInputType
  }

  export type GetTradingBalanceAggregateType<T extends TradingBalanceAggregateArgs> = {
        [P in keyof T & keyof AggregateTradingBalance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTradingBalance[P]>
      : GetScalarType<T[P], AggregateTradingBalance[P]>
  }




  export type TradingBalanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TradingBalanceWhereInput
    orderBy?: TradingBalanceOrderByWithAggregationInput | TradingBalanceOrderByWithAggregationInput[]
    by: TradingBalanceScalarFieldEnum[] | TradingBalanceScalarFieldEnum
    having?: TradingBalanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TradingBalanceCountAggregateInputType | true
    _avg?: TradingBalanceAvgAggregateInputType
    _sum?: TradingBalanceSumAggregateInputType
    _min?: TradingBalanceMinAggregateInputType
    _max?: TradingBalanceMaxAggregateInputType
  }

  export type TradingBalanceGroupByOutputType = {
    id: string
    userId: string
    available: bigint
    locked: bigint
    updatedAt: Date
    _count: TradingBalanceCountAggregateOutputType | null
    _avg: TradingBalanceAvgAggregateOutputType | null
    _sum: TradingBalanceSumAggregateOutputType | null
    _min: TradingBalanceMinAggregateOutputType | null
    _max: TradingBalanceMaxAggregateOutputType | null
  }

  type GetTradingBalanceGroupByPayload<T extends TradingBalanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TradingBalanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TradingBalanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TradingBalanceGroupByOutputType[P]>
            : GetScalarType<T[P], TradingBalanceGroupByOutputType[P]>
        }
      >
    >


  export type TradingBalanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    available?: boolean
    locked?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tradingBalance"]>

  export type TradingBalanceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    available?: boolean
    locked?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tradingBalance"]>

  export type TradingBalanceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    available?: boolean
    locked?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tradingBalance"]>

  export type TradingBalanceSelectScalar = {
    id?: boolean
    userId?: boolean
    available?: boolean
    locked?: boolean
    updatedAt?: boolean
  }

  export type TradingBalanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "available" | "locked" | "updatedAt", ExtArgs["result"]["tradingBalance"]>
  export type TradingBalanceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TradingBalanceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TradingBalanceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $TradingBalancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TradingBalance"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      available: bigint
      locked: bigint
      updatedAt: Date
    }, ExtArgs["result"]["tradingBalance"]>
    composites: {}
  }

  type TradingBalanceGetPayload<S extends boolean | null | undefined | TradingBalanceDefaultArgs> = $Result.GetResult<Prisma.$TradingBalancePayload, S>

  type TradingBalanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TradingBalanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TradingBalanceCountAggregateInputType | true
    }

  export interface TradingBalanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TradingBalance'], meta: { name: 'TradingBalance' } }
    /**
     * Find zero or one TradingBalance that matches the filter.
     * @param {TradingBalanceFindUniqueArgs} args - Arguments to find a TradingBalance
     * @example
     * // Get one TradingBalance
     * const tradingBalance = await prisma.tradingBalance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TradingBalanceFindUniqueArgs>(args: SelectSubset<T, TradingBalanceFindUniqueArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TradingBalance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TradingBalanceFindUniqueOrThrowArgs} args - Arguments to find a TradingBalance
     * @example
     * // Get one TradingBalance
     * const tradingBalance = await prisma.tradingBalance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TradingBalanceFindUniqueOrThrowArgs>(args: SelectSubset<T, TradingBalanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TradingBalance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradingBalanceFindFirstArgs} args - Arguments to find a TradingBalance
     * @example
     * // Get one TradingBalance
     * const tradingBalance = await prisma.tradingBalance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TradingBalanceFindFirstArgs>(args?: SelectSubset<T, TradingBalanceFindFirstArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TradingBalance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradingBalanceFindFirstOrThrowArgs} args - Arguments to find a TradingBalance
     * @example
     * // Get one TradingBalance
     * const tradingBalance = await prisma.tradingBalance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TradingBalanceFindFirstOrThrowArgs>(args?: SelectSubset<T, TradingBalanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TradingBalances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradingBalanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TradingBalances
     * const tradingBalances = await prisma.tradingBalance.findMany()
     * 
     * // Get first 10 TradingBalances
     * const tradingBalances = await prisma.tradingBalance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tradingBalanceWithIdOnly = await prisma.tradingBalance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TradingBalanceFindManyArgs>(args?: SelectSubset<T, TradingBalanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TradingBalance.
     * @param {TradingBalanceCreateArgs} args - Arguments to create a TradingBalance.
     * @example
     * // Create one TradingBalance
     * const TradingBalance = await prisma.tradingBalance.create({
     *   data: {
     *     // ... data to create a TradingBalance
     *   }
     * })
     * 
     */
    create<T extends TradingBalanceCreateArgs>(args: SelectSubset<T, TradingBalanceCreateArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TradingBalances.
     * @param {TradingBalanceCreateManyArgs} args - Arguments to create many TradingBalances.
     * @example
     * // Create many TradingBalances
     * const tradingBalance = await prisma.tradingBalance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TradingBalanceCreateManyArgs>(args?: SelectSubset<T, TradingBalanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TradingBalances and returns the data saved in the database.
     * @param {TradingBalanceCreateManyAndReturnArgs} args - Arguments to create many TradingBalances.
     * @example
     * // Create many TradingBalances
     * const tradingBalance = await prisma.tradingBalance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TradingBalances and only return the `id`
     * const tradingBalanceWithIdOnly = await prisma.tradingBalance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TradingBalanceCreateManyAndReturnArgs>(args?: SelectSubset<T, TradingBalanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TradingBalance.
     * @param {TradingBalanceDeleteArgs} args - Arguments to delete one TradingBalance.
     * @example
     * // Delete one TradingBalance
     * const TradingBalance = await prisma.tradingBalance.delete({
     *   where: {
     *     // ... filter to delete one TradingBalance
     *   }
     * })
     * 
     */
    delete<T extends TradingBalanceDeleteArgs>(args: SelectSubset<T, TradingBalanceDeleteArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TradingBalance.
     * @param {TradingBalanceUpdateArgs} args - Arguments to update one TradingBalance.
     * @example
     * // Update one TradingBalance
     * const tradingBalance = await prisma.tradingBalance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TradingBalanceUpdateArgs>(args: SelectSubset<T, TradingBalanceUpdateArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TradingBalances.
     * @param {TradingBalanceDeleteManyArgs} args - Arguments to filter TradingBalances to delete.
     * @example
     * // Delete a few TradingBalances
     * const { count } = await prisma.tradingBalance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TradingBalanceDeleteManyArgs>(args?: SelectSubset<T, TradingBalanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TradingBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradingBalanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TradingBalances
     * const tradingBalance = await prisma.tradingBalance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TradingBalanceUpdateManyArgs>(args: SelectSubset<T, TradingBalanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TradingBalances and returns the data updated in the database.
     * @param {TradingBalanceUpdateManyAndReturnArgs} args - Arguments to update many TradingBalances.
     * @example
     * // Update many TradingBalances
     * const tradingBalance = await prisma.tradingBalance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TradingBalances and only return the `id`
     * const tradingBalanceWithIdOnly = await prisma.tradingBalance.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TradingBalanceUpdateManyAndReturnArgs>(args: SelectSubset<T, TradingBalanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TradingBalance.
     * @param {TradingBalanceUpsertArgs} args - Arguments to update or create a TradingBalance.
     * @example
     * // Update or create a TradingBalance
     * const tradingBalance = await prisma.tradingBalance.upsert({
     *   create: {
     *     // ... data to create a TradingBalance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TradingBalance we want to update
     *   }
     * })
     */
    upsert<T extends TradingBalanceUpsertArgs>(args: SelectSubset<T, TradingBalanceUpsertArgs<ExtArgs>>): Prisma__TradingBalanceClient<$Result.GetResult<Prisma.$TradingBalancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TradingBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradingBalanceCountArgs} args - Arguments to filter TradingBalances to count.
     * @example
     * // Count the number of TradingBalances
     * const count = await prisma.tradingBalance.count({
     *   where: {
     *     // ... the filter for the TradingBalances we want to count
     *   }
     * })
    **/
    count<T extends TradingBalanceCountArgs>(
      args?: Subset<T, TradingBalanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TradingBalanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TradingBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradingBalanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TradingBalanceAggregateArgs>(args: Subset<T, TradingBalanceAggregateArgs>): Prisma.PrismaPromise<GetTradingBalanceAggregateType<T>>

    /**
     * Group by TradingBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradingBalanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TradingBalanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TradingBalanceGroupByArgs['orderBy'] }
        : { orderBy?: TradingBalanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TradingBalanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTradingBalanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TradingBalance model
   */
  readonly fields: TradingBalanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TradingBalance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TradingBalanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TradingBalance model
   */
  interface TradingBalanceFieldRefs {
    readonly id: FieldRef<"TradingBalance", 'String'>
    readonly userId: FieldRef<"TradingBalance", 'String'>
    readonly available: FieldRef<"TradingBalance", 'BigInt'>
    readonly locked: FieldRef<"TradingBalance", 'BigInt'>
    readonly updatedAt: FieldRef<"TradingBalance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TradingBalance findUnique
   */
  export type TradingBalanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * Filter, which TradingBalance to fetch.
     */
    where: TradingBalanceWhereUniqueInput
  }

  /**
   * TradingBalance findUniqueOrThrow
   */
  export type TradingBalanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * Filter, which TradingBalance to fetch.
     */
    where: TradingBalanceWhereUniqueInput
  }

  /**
   * TradingBalance findFirst
   */
  export type TradingBalanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * Filter, which TradingBalance to fetch.
     */
    where?: TradingBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TradingBalances to fetch.
     */
    orderBy?: TradingBalanceOrderByWithRelationInput | TradingBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TradingBalances.
     */
    cursor?: TradingBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TradingBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TradingBalances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TradingBalances.
     */
    distinct?: TradingBalanceScalarFieldEnum | TradingBalanceScalarFieldEnum[]
  }

  /**
   * TradingBalance findFirstOrThrow
   */
  export type TradingBalanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * Filter, which TradingBalance to fetch.
     */
    where?: TradingBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TradingBalances to fetch.
     */
    orderBy?: TradingBalanceOrderByWithRelationInput | TradingBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TradingBalances.
     */
    cursor?: TradingBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TradingBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TradingBalances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TradingBalances.
     */
    distinct?: TradingBalanceScalarFieldEnum | TradingBalanceScalarFieldEnum[]
  }

  /**
   * TradingBalance findMany
   */
  export type TradingBalanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * Filter, which TradingBalances to fetch.
     */
    where?: TradingBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TradingBalances to fetch.
     */
    orderBy?: TradingBalanceOrderByWithRelationInput | TradingBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TradingBalances.
     */
    cursor?: TradingBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TradingBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TradingBalances.
     */
    skip?: number
    distinct?: TradingBalanceScalarFieldEnum | TradingBalanceScalarFieldEnum[]
  }

  /**
   * TradingBalance create
   */
  export type TradingBalanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * The data needed to create a TradingBalance.
     */
    data: XOR<TradingBalanceCreateInput, TradingBalanceUncheckedCreateInput>
  }

  /**
   * TradingBalance createMany
   */
  export type TradingBalanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TradingBalances.
     */
    data: TradingBalanceCreateManyInput | TradingBalanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TradingBalance createManyAndReturn
   */
  export type TradingBalanceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * The data used to create many TradingBalances.
     */
    data: TradingBalanceCreateManyInput | TradingBalanceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TradingBalance update
   */
  export type TradingBalanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * The data needed to update a TradingBalance.
     */
    data: XOR<TradingBalanceUpdateInput, TradingBalanceUncheckedUpdateInput>
    /**
     * Choose, which TradingBalance to update.
     */
    where: TradingBalanceWhereUniqueInput
  }

  /**
   * TradingBalance updateMany
   */
  export type TradingBalanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TradingBalances.
     */
    data: XOR<TradingBalanceUpdateManyMutationInput, TradingBalanceUncheckedUpdateManyInput>
    /**
     * Filter which TradingBalances to update
     */
    where?: TradingBalanceWhereInput
    /**
     * Limit how many TradingBalances to update.
     */
    limit?: number
  }

  /**
   * TradingBalance updateManyAndReturn
   */
  export type TradingBalanceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * The data used to update TradingBalances.
     */
    data: XOR<TradingBalanceUpdateManyMutationInput, TradingBalanceUncheckedUpdateManyInput>
    /**
     * Filter which TradingBalances to update
     */
    where?: TradingBalanceWhereInput
    /**
     * Limit how many TradingBalances to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TradingBalance upsert
   */
  export type TradingBalanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * The filter to search for the TradingBalance to update in case it exists.
     */
    where: TradingBalanceWhereUniqueInput
    /**
     * In case the TradingBalance found by the `where` argument doesn't exist, create a new TradingBalance with this data.
     */
    create: XOR<TradingBalanceCreateInput, TradingBalanceUncheckedCreateInput>
    /**
     * In case the TradingBalance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TradingBalanceUpdateInput, TradingBalanceUncheckedUpdateInput>
  }

  /**
   * TradingBalance delete
   */
  export type TradingBalanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
    /**
     * Filter which TradingBalance to delete.
     */
    where: TradingBalanceWhereUniqueInput
  }

  /**
   * TradingBalance deleteMany
   */
  export type TradingBalanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TradingBalances to delete
     */
    where?: TradingBalanceWhereInput
    /**
     * Limit how many TradingBalances to delete.
     */
    limit?: number
  }

  /**
   * TradingBalance without action
   */
  export type TradingBalanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradingBalance
     */
    select?: TradingBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TradingBalance
     */
    omit?: TradingBalanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradingBalanceInclude<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    price: number | null
    qty: number | null
    filledQty: number | null
    lockedAmount: number | null
  }

  export type OrderSumAggregateOutputType = {
    price: bigint | null
    qty: bigint | null
    filledQty: bigint | null
    lockedAmount: bigint | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    userId: string | null
    market: string | null
    side: $Enums.OrderSide | null
    price: bigint | null
    qty: bigint | null
    filledQty: bigint | null
    status: $Enums.OrderStatus | null
    lockedAmount: bigint | null
    commandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    market: string | null
    side: $Enums.OrderSide | null
    price: bigint | null
    qty: bigint | null
    filledQty: bigint | null
    status: $Enums.OrderStatus | null
    lockedAmount: bigint | null
    commandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    userId: number
    market: number
    side: number
    price: number
    qty: number
    filledQty: number
    status: number
    lockedAmount: number
    commandId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    price?: true
    qty?: true
    filledQty?: true
    lockedAmount?: true
  }

  export type OrderSumAggregateInputType = {
    price?: true
    qty?: true
    filledQty?: true
    lockedAmount?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    userId?: true
    market?: true
    side?: true
    price?: true
    qty?: true
    filledQty?: true
    status?: true
    lockedAmount?: true
    commandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    userId?: true
    market?: true
    side?: true
    price?: true
    qty?: true
    filledQty?: true
    status?: true
    lockedAmount?: true
    commandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    userId?: true
    market?: true
    side?: true
    price?: true
    qty?: true
    filledQty?: true
    status?: true
    lockedAmount?: true
    commandId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    userId: string
    market: string
    side: $Enums.OrderSide
    price: bigint
    qty: bigint
    filledQty: bigint
    status: $Enums.OrderStatus
    lockedAmount: bigint
    commandId: string
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    market?: boolean
    side?: boolean
    price?: boolean
    qty?: boolean
    filledQty?: boolean
    status?: boolean
    lockedAmount?: boolean
    commandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    trades?: boolean | Order$tradesArgs<ExtArgs>
    takerTrades?: boolean | Order$takerTradesArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    market?: boolean
    side?: boolean
    price?: boolean
    qty?: boolean
    filledQty?: boolean
    status?: boolean
    lockedAmount?: boolean
    commandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    market?: boolean
    side?: boolean
    price?: boolean
    qty?: boolean
    filledQty?: boolean
    status?: boolean
    lockedAmount?: boolean
    commandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    userId?: boolean
    market?: boolean
    side?: boolean
    price?: boolean
    qty?: boolean
    filledQty?: boolean
    status?: boolean
    lockedAmount?: boolean
    commandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "market" | "side" | "price" | "qty" | "filledQty" | "status" | "lockedAmount" | "commandId" | "createdAt" | "updatedAt", ExtArgs["result"]["order"]>
  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    trades?: boolean | Order$tradesArgs<ExtArgs>
    takerTrades?: boolean | Order$takerTradesArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OrderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      trades: Prisma.$TradePayload<ExtArgs>[]
      takerTrades: Prisma.$TradePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      market: string
      side: $Enums.OrderSide
      price: bigint
      qty: bigint
      filledQty: bigint
      status: $Enums.OrderStatus
      lockedAmount: bigint
      commandId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {OrderUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    trades<T extends Order$tradesArgs<ExtArgs> = {}>(args?: Subset<T, Order$tradesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    takerTrades<T extends Order$takerTradesArgs<ExtArgs> = {}>(args?: Subset<T, Order$takerTradesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly userId: FieldRef<"Order", 'String'>
    readonly market: FieldRef<"Order", 'String'>
    readonly side: FieldRef<"Order", 'OrderSide'>
    readonly price: FieldRef<"Order", 'BigInt'>
    readonly qty: FieldRef<"Order", 'BigInt'>
    readonly filledQty: FieldRef<"Order", 'BigInt'>
    readonly status: FieldRef<"Order", 'OrderStatus'>
    readonly lockedAmount: FieldRef<"Order", 'BigInt'>
    readonly commandId: FieldRef<"Order", 'String'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order updateManyAndReturn
   */
  export type OrderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to delete.
     */
    limit?: number
  }

  /**
   * Order.trades
   */
  export type Order$tradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    where?: TradeWhereInput
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    cursor?: TradeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Order.takerTrades
   */
  export type Order$takerTradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    where?: TradeWhereInput
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    cursor?: TradeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model Trade
   */

  export type AggregateTrade = {
    _count: TradeCountAggregateOutputType | null
    _avg: TradeAvgAggregateOutputType | null
    _sum: TradeSumAggregateOutputType | null
    _min: TradeMinAggregateOutputType | null
    _max: TradeMaxAggregateOutputType | null
  }

  export type TradeAvgAggregateOutputType = {
    price: number | null
    qty: number | null
  }

  export type TradeSumAggregateOutputType = {
    price: bigint | null
    qty: bigint | null
  }

  export type TradeMinAggregateOutputType = {
    id: string | null
    market: string | null
    makerOrderId: string | null
    takerOrderId: string | null
    price: bigint | null
    qty: bigint | null
    takerSide: $Enums.OrderSide | null
    executedAt: Date | null
  }

  export type TradeMaxAggregateOutputType = {
    id: string | null
    market: string | null
    makerOrderId: string | null
    takerOrderId: string | null
    price: bigint | null
    qty: bigint | null
    takerSide: $Enums.OrderSide | null
    executedAt: Date | null
  }

  export type TradeCountAggregateOutputType = {
    id: number
    market: number
    makerOrderId: number
    takerOrderId: number
    price: number
    qty: number
    takerSide: number
    executedAt: number
    _all: number
  }


  export type TradeAvgAggregateInputType = {
    price?: true
    qty?: true
  }

  export type TradeSumAggregateInputType = {
    price?: true
    qty?: true
  }

  export type TradeMinAggregateInputType = {
    id?: true
    market?: true
    makerOrderId?: true
    takerOrderId?: true
    price?: true
    qty?: true
    takerSide?: true
    executedAt?: true
  }

  export type TradeMaxAggregateInputType = {
    id?: true
    market?: true
    makerOrderId?: true
    takerOrderId?: true
    price?: true
    qty?: true
    takerSide?: true
    executedAt?: true
  }

  export type TradeCountAggregateInputType = {
    id?: true
    market?: true
    makerOrderId?: true
    takerOrderId?: true
    price?: true
    qty?: true
    takerSide?: true
    executedAt?: true
    _all?: true
  }

  export type TradeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trade to aggregate.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Trades
    **/
    _count?: true | TradeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TradeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TradeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TradeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TradeMaxAggregateInputType
  }

  export type GetTradeAggregateType<T extends TradeAggregateArgs> = {
        [P in keyof T & keyof AggregateTrade]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrade[P]>
      : GetScalarType<T[P], AggregateTrade[P]>
  }




  export type TradeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TradeWhereInput
    orderBy?: TradeOrderByWithAggregationInput | TradeOrderByWithAggregationInput[]
    by: TradeScalarFieldEnum[] | TradeScalarFieldEnum
    having?: TradeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TradeCountAggregateInputType | true
    _avg?: TradeAvgAggregateInputType
    _sum?: TradeSumAggregateInputType
    _min?: TradeMinAggregateInputType
    _max?: TradeMaxAggregateInputType
  }

  export type TradeGroupByOutputType = {
    id: string
    market: string
    makerOrderId: string
    takerOrderId: string
    price: bigint
    qty: bigint
    takerSide: $Enums.OrderSide
    executedAt: Date
    _count: TradeCountAggregateOutputType | null
    _avg: TradeAvgAggregateOutputType | null
    _sum: TradeSumAggregateOutputType | null
    _min: TradeMinAggregateOutputType | null
    _max: TradeMaxAggregateOutputType | null
  }

  type GetTradeGroupByPayload<T extends TradeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TradeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TradeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TradeGroupByOutputType[P]>
            : GetScalarType<T[P], TradeGroupByOutputType[P]>
        }
      >
    >


  export type TradeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    market?: boolean
    makerOrderId?: boolean
    takerOrderId?: boolean
    price?: boolean
    qty?: boolean
    takerSide?: boolean
    executedAt?: boolean
    makerOrder?: boolean | OrderDefaultArgs<ExtArgs>
    takerOrder?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    market?: boolean
    makerOrderId?: boolean
    takerOrderId?: boolean
    price?: boolean
    qty?: boolean
    takerSide?: boolean
    executedAt?: boolean
    makerOrder?: boolean | OrderDefaultArgs<ExtArgs>
    takerOrder?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    market?: boolean
    makerOrderId?: boolean
    takerOrderId?: boolean
    price?: boolean
    qty?: boolean
    takerSide?: boolean
    executedAt?: boolean
    makerOrder?: boolean | OrderDefaultArgs<ExtArgs>
    takerOrder?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectScalar = {
    id?: boolean
    market?: boolean
    makerOrderId?: boolean
    takerOrderId?: boolean
    price?: boolean
    qty?: boolean
    takerSide?: boolean
    executedAt?: boolean
  }

  export type TradeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "market" | "makerOrderId" | "takerOrderId" | "price" | "qty" | "takerSide" | "executedAt", ExtArgs["result"]["trade"]>
  export type TradeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    makerOrder?: boolean | OrderDefaultArgs<ExtArgs>
    takerOrder?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type TradeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    makerOrder?: boolean | OrderDefaultArgs<ExtArgs>
    takerOrder?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type TradeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    makerOrder?: boolean | OrderDefaultArgs<ExtArgs>
    takerOrder?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $TradePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Trade"
    objects: {
      makerOrder: Prisma.$OrderPayload<ExtArgs>
      takerOrder: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      market: string
      makerOrderId: string
      takerOrderId: string
      price: bigint
      qty: bigint
      takerSide: $Enums.OrderSide
      executedAt: Date
    }, ExtArgs["result"]["trade"]>
    composites: {}
  }

  type TradeGetPayload<S extends boolean | null | undefined | TradeDefaultArgs> = $Result.GetResult<Prisma.$TradePayload, S>

  type TradeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TradeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TradeCountAggregateInputType | true
    }

  export interface TradeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Trade'], meta: { name: 'Trade' } }
    /**
     * Find zero or one Trade that matches the filter.
     * @param {TradeFindUniqueArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TradeFindUniqueArgs>(args: SelectSubset<T, TradeFindUniqueArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Trade that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TradeFindUniqueOrThrowArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TradeFindUniqueOrThrowArgs>(args: SelectSubset<T, TradeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trade that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindFirstArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TradeFindFirstArgs>(args?: SelectSubset<T, TradeFindFirstArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trade that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindFirstOrThrowArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TradeFindFirstOrThrowArgs>(args?: SelectSubset<T, TradeFindFirstOrThrowArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Trades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Trades
     * const trades = await prisma.trade.findMany()
     * 
     * // Get first 10 Trades
     * const trades = await prisma.trade.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tradeWithIdOnly = await prisma.trade.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TradeFindManyArgs>(args?: SelectSubset<T, TradeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Trade.
     * @param {TradeCreateArgs} args - Arguments to create a Trade.
     * @example
     * // Create one Trade
     * const Trade = await prisma.trade.create({
     *   data: {
     *     // ... data to create a Trade
     *   }
     * })
     * 
     */
    create<T extends TradeCreateArgs>(args: SelectSubset<T, TradeCreateArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Trades.
     * @param {TradeCreateManyArgs} args - Arguments to create many Trades.
     * @example
     * // Create many Trades
     * const trade = await prisma.trade.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TradeCreateManyArgs>(args?: SelectSubset<T, TradeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Trades and returns the data saved in the database.
     * @param {TradeCreateManyAndReturnArgs} args - Arguments to create many Trades.
     * @example
     * // Create many Trades
     * const trade = await prisma.trade.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Trades and only return the `id`
     * const tradeWithIdOnly = await prisma.trade.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TradeCreateManyAndReturnArgs>(args?: SelectSubset<T, TradeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Trade.
     * @param {TradeDeleteArgs} args - Arguments to delete one Trade.
     * @example
     * // Delete one Trade
     * const Trade = await prisma.trade.delete({
     *   where: {
     *     // ... filter to delete one Trade
     *   }
     * })
     * 
     */
    delete<T extends TradeDeleteArgs>(args: SelectSubset<T, TradeDeleteArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Trade.
     * @param {TradeUpdateArgs} args - Arguments to update one Trade.
     * @example
     * // Update one Trade
     * const trade = await prisma.trade.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TradeUpdateArgs>(args: SelectSubset<T, TradeUpdateArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Trades.
     * @param {TradeDeleteManyArgs} args - Arguments to filter Trades to delete.
     * @example
     * // Delete a few Trades
     * const { count } = await prisma.trade.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TradeDeleteManyArgs>(args?: SelectSubset<T, TradeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Trades
     * const trade = await prisma.trade.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TradeUpdateManyArgs>(args: SelectSubset<T, TradeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trades and returns the data updated in the database.
     * @param {TradeUpdateManyAndReturnArgs} args - Arguments to update many Trades.
     * @example
     * // Update many Trades
     * const trade = await prisma.trade.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Trades and only return the `id`
     * const tradeWithIdOnly = await prisma.trade.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TradeUpdateManyAndReturnArgs>(args: SelectSubset<T, TradeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Trade.
     * @param {TradeUpsertArgs} args - Arguments to update or create a Trade.
     * @example
     * // Update or create a Trade
     * const trade = await prisma.trade.upsert({
     *   create: {
     *     // ... data to create a Trade
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Trade we want to update
     *   }
     * })
     */
    upsert<T extends TradeUpsertArgs>(args: SelectSubset<T, TradeUpsertArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Trades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeCountArgs} args - Arguments to filter Trades to count.
     * @example
     * // Count the number of Trades
     * const count = await prisma.trade.count({
     *   where: {
     *     // ... the filter for the Trades we want to count
     *   }
     * })
    **/
    count<T extends TradeCountArgs>(
      args?: Subset<T, TradeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TradeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Trade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TradeAggregateArgs>(args: Subset<T, TradeAggregateArgs>): Prisma.PrismaPromise<GetTradeAggregateType<T>>

    /**
     * Group by Trade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TradeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TradeGroupByArgs['orderBy'] }
        : { orderBy?: TradeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TradeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTradeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Trade model
   */
  readonly fields: TradeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Trade.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TradeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    makerOrder<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    takerOrder<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Trade model
   */
  interface TradeFieldRefs {
    readonly id: FieldRef<"Trade", 'String'>
    readonly market: FieldRef<"Trade", 'String'>
    readonly makerOrderId: FieldRef<"Trade", 'String'>
    readonly takerOrderId: FieldRef<"Trade", 'String'>
    readonly price: FieldRef<"Trade", 'BigInt'>
    readonly qty: FieldRef<"Trade", 'BigInt'>
    readonly takerSide: FieldRef<"Trade", 'OrderSide'>
    readonly executedAt: FieldRef<"Trade", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Trade findUnique
   */
  export type TradeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade findUniqueOrThrow
   */
  export type TradeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade findFirst
   */
  export type TradeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trades.
     */
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade findFirstOrThrow
   */
  export type TradeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trades.
     */
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade findMany
   */
  export type TradeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trades to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade create
   */
  export type TradeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The data needed to create a Trade.
     */
    data: XOR<TradeCreateInput, TradeUncheckedCreateInput>
  }

  /**
   * Trade createMany
   */
  export type TradeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Trades.
     */
    data: TradeCreateManyInput | TradeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trade createManyAndReturn
   */
  export type TradeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * The data used to create many Trades.
     */
    data: TradeCreateManyInput | TradeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Trade update
   */
  export type TradeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The data needed to update a Trade.
     */
    data: XOR<TradeUpdateInput, TradeUncheckedUpdateInput>
    /**
     * Choose, which Trade to update.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade updateMany
   */
  export type TradeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Trades.
     */
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyInput>
    /**
     * Filter which Trades to update
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to update.
     */
    limit?: number
  }

  /**
   * Trade updateManyAndReturn
   */
  export type TradeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * The data used to update Trades.
     */
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyInput>
    /**
     * Filter which Trades to update
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Trade upsert
   */
  export type TradeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The filter to search for the Trade to update in case it exists.
     */
    where: TradeWhereUniqueInput
    /**
     * In case the Trade found by the `where` argument doesn't exist, create a new Trade with this data.
     */
    create: XOR<TradeCreateInput, TradeUncheckedCreateInput>
    /**
     * In case the Trade was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TradeUpdateInput, TradeUncheckedUpdateInput>
  }

  /**
   * Trade delete
   */
  export type TradeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter which Trade to delete.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade deleteMany
   */
  export type TradeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trades to delete
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to delete.
     */
    limit?: number
  }

  /**
   * Trade without action
   */
  export type TradeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
  }


  /**
   * Model BalanceTransfer
   */

  export type AggregateBalanceTransfer = {
    _count: BalanceTransferCountAggregateOutputType | null
    _avg: BalanceTransferAvgAggregateOutputType | null
    _sum: BalanceTransferSumAggregateOutputType | null
    _min: BalanceTransferMinAggregateOutputType | null
    _max: BalanceTransferMaxAggregateOutputType | null
  }

  export type BalanceTransferAvgAggregateOutputType = {
    amountInPaise: number | null
  }

  export type BalanceTransferSumAggregateOutputType = {
    amountInPaise: bigint | null
  }

  export type BalanceTransferMinAggregateOutputType = {
    id: string | null
    userId: string | null
    direction: $Enums.TransferDirection | null
    amountInPaise: bigint | null
    status: $Enums.TransferStatus | null
    idempotencyKey: string | null
    vaultlyRef: string | null
    createdAt: Date | null
    resolvedAt: Date | null
  }

  export type BalanceTransferMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    direction: $Enums.TransferDirection | null
    amountInPaise: bigint | null
    status: $Enums.TransferStatus | null
    idempotencyKey: string | null
    vaultlyRef: string | null
    createdAt: Date | null
    resolvedAt: Date | null
  }

  export type BalanceTransferCountAggregateOutputType = {
    id: number
    userId: number
    direction: number
    amountInPaise: number
    status: number
    idempotencyKey: number
    vaultlyRef: number
    createdAt: number
    resolvedAt: number
    _all: number
  }


  export type BalanceTransferAvgAggregateInputType = {
    amountInPaise?: true
  }

  export type BalanceTransferSumAggregateInputType = {
    amountInPaise?: true
  }

  export type BalanceTransferMinAggregateInputType = {
    id?: true
    userId?: true
    direction?: true
    amountInPaise?: true
    status?: true
    idempotencyKey?: true
    vaultlyRef?: true
    createdAt?: true
    resolvedAt?: true
  }

  export type BalanceTransferMaxAggregateInputType = {
    id?: true
    userId?: true
    direction?: true
    amountInPaise?: true
    status?: true
    idempotencyKey?: true
    vaultlyRef?: true
    createdAt?: true
    resolvedAt?: true
  }

  export type BalanceTransferCountAggregateInputType = {
    id?: true
    userId?: true
    direction?: true
    amountInPaise?: true
    status?: true
    idempotencyKey?: true
    vaultlyRef?: true
    createdAt?: true
    resolvedAt?: true
    _all?: true
  }

  export type BalanceTransferAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BalanceTransfer to aggregate.
     */
    where?: BalanceTransferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BalanceTransfers to fetch.
     */
    orderBy?: BalanceTransferOrderByWithRelationInput | BalanceTransferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BalanceTransferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BalanceTransfers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BalanceTransfers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BalanceTransfers
    **/
    _count?: true | BalanceTransferCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BalanceTransferAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BalanceTransferSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BalanceTransferMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BalanceTransferMaxAggregateInputType
  }

  export type GetBalanceTransferAggregateType<T extends BalanceTransferAggregateArgs> = {
        [P in keyof T & keyof AggregateBalanceTransfer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBalanceTransfer[P]>
      : GetScalarType<T[P], AggregateBalanceTransfer[P]>
  }




  export type BalanceTransferGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BalanceTransferWhereInput
    orderBy?: BalanceTransferOrderByWithAggregationInput | BalanceTransferOrderByWithAggregationInput[]
    by: BalanceTransferScalarFieldEnum[] | BalanceTransferScalarFieldEnum
    having?: BalanceTransferScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BalanceTransferCountAggregateInputType | true
    _avg?: BalanceTransferAvgAggregateInputType
    _sum?: BalanceTransferSumAggregateInputType
    _min?: BalanceTransferMinAggregateInputType
    _max?: BalanceTransferMaxAggregateInputType
  }

  export type BalanceTransferGroupByOutputType = {
    id: string
    userId: string
    direction: $Enums.TransferDirection
    amountInPaise: bigint
    status: $Enums.TransferStatus
    idempotencyKey: string
    vaultlyRef: string | null
    createdAt: Date
    resolvedAt: Date | null
    _count: BalanceTransferCountAggregateOutputType | null
    _avg: BalanceTransferAvgAggregateOutputType | null
    _sum: BalanceTransferSumAggregateOutputType | null
    _min: BalanceTransferMinAggregateOutputType | null
    _max: BalanceTransferMaxAggregateOutputType | null
  }

  type GetBalanceTransferGroupByPayload<T extends BalanceTransferGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BalanceTransferGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BalanceTransferGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BalanceTransferGroupByOutputType[P]>
            : GetScalarType<T[P], BalanceTransferGroupByOutputType[P]>
        }
      >
    >


  export type BalanceTransferSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    direction?: boolean
    amountInPaise?: boolean
    status?: boolean
    idempotencyKey?: boolean
    vaultlyRef?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["balanceTransfer"]>

  export type BalanceTransferSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    direction?: boolean
    amountInPaise?: boolean
    status?: boolean
    idempotencyKey?: boolean
    vaultlyRef?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["balanceTransfer"]>

  export type BalanceTransferSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    direction?: boolean
    amountInPaise?: boolean
    status?: boolean
    idempotencyKey?: boolean
    vaultlyRef?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["balanceTransfer"]>

  export type BalanceTransferSelectScalar = {
    id?: boolean
    userId?: boolean
    direction?: boolean
    amountInPaise?: boolean
    status?: boolean
    idempotencyKey?: boolean
    vaultlyRef?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
  }

  export type BalanceTransferOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "direction" | "amountInPaise" | "status" | "idempotencyKey" | "vaultlyRef" | "createdAt" | "resolvedAt", ExtArgs["result"]["balanceTransfer"]>
  export type BalanceTransferInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BalanceTransferIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BalanceTransferIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $BalanceTransferPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BalanceTransfer"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      direction: $Enums.TransferDirection
      amountInPaise: bigint
      status: $Enums.TransferStatus
      idempotencyKey: string
      vaultlyRef: string | null
      createdAt: Date
      resolvedAt: Date | null
    }, ExtArgs["result"]["balanceTransfer"]>
    composites: {}
  }

  type BalanceTransferGetPayload<S extends boolean | null | undefined | BalanceTransferDefaultArgs> = $Result.GetResult<Prisma.$BalanceTransferPayload, S>

  type BalanceTransferCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BalanceTransferFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BalanceTransferCountAggregateInputType | true
    }

  export interface BalanceTransferDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BalanceTransfer'], meta: { name: 'BalanceTransfer' } }
    /**
     * Find zero or one BalanceTransfer that matches the filter.
     * @param {BalanceTransferFindUniqueArgs} args - Arguments to find a BalanceTransfer
     * @example
     * // Get one BalanceTransfer
     * const balanceTransfer = await prisma.balanceTransfer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BalanceTransferFindUniqueArgs>(args: SelectSubset<T, BalanceTransferFindUniqueArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BalanceTransfer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BalanceTransferFindUniqueOrThrowArgs} args - Arguments to find a BalanceTransfer
     * @example
     * // Get one BalanceTransfer
     * const balanceTransfer = await prisma.balanceTransfer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BalanceTransferFindUniqueOrThrowArgs>(args: SelectSubset<T, BalanceTransferFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BalanceTransfer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BalanceTransferFindFirstArgs} args - Arguments to find a BalanceTransfer
     * @example
     * // Get one BalanceTransfer
     * const balanceTransfer = await prisma.balanceTransfer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BalanceTransferFindFirstArgs>(args?: SelectSubset<T, BalanceTransferFindFirstArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BalanceTransfer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BalanceTransferFindFirstOrThrowArgs} args - Arguments to find a BalanceTransfer
     * @example
     * // Get one BalanceTransfer
     * const balanceTransfer = await prisma.balanceTransfer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BalanceTransferFindFirstOrThrowArgs>(args?: SelectSubset<T, BalanceTransferFindFirstOrThrowArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BalanceTransfers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BalanceTransferFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BalanceTransfers
     * const balanceTransfers = await prisma.balanceTransfer.findMany()
     * 
     * // Get first 10 BalanceTransfers
     * const balanceTransfers = await prisma.balanceTransfer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const balanceTransferWithIdOnly = await prisma.balanceTransfer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BalanceTransferFindManyArgs>(args?: SelectSubset<T, BalanceTransferFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BalanceTransfer.
     * @param {BalanceTransferCreateArgs} args - Arguments to create a BalanceTransfer.
     * @example
     * // Create one BalanceTransfer
     * const BalanceTransfer = await prisma.balanceTransfer.create({
     *   data: {
     *     // ... data to create a BalanceTransfer
     *   }
     * })
     * 
     */
    create<T extends BalanceTransferCreateArgs>(args: SelectSubset<T, BalanceTransferCreateArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BalanceTransfers.
     * @param {BalanceTransferCreateManyArgs} args - Arguments to create many BalanceTransfers.
     * @example
     * // Create many BalanceTransfers
     * const balanceTransfer = await prisma.balanceTransfer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BalanceTransferCreateManyArgs>(args?: SelectSubset<T, BalanceTransferCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BalanceTransfers and returns the data saved in the database.
     * @param {BalanceTransferCreateManyAndReturnArgs} args - Arguments to create many BalanceTransfers.
     * @example
     * // Create many BalanceTransfers
     * const balanceTransfer = await prisma.balanceTransfer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BalanceTransfers and only return the `id`
     * const balanceTransferWithIdOnly = await prisma.balanceTransfer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BalanceTransferCreateManyAndReturnArgs>(args?: SelectSubset<T, BalanceTransferCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BalanceTransfer.
     * @param {BalanceTransferDeleteArgs} args - Arguments to delete one BalanceTransfer.
     * @example
     * // Delete one BalanceTransfer
     * const BalanceTransfer = await prisma.balanceTransfer.delete({
     *   where: {
     *     // ... filter to delete one BalanceTransfer
     *   }
     * })
     * 
     */
    delete<T extends BalanceTransferDeleteArgs>(args: SelectSubset<T, BalanceTransferDeleteArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BalanceTransfer.
     * @param {BalanceTransferUpdateArgs} args - Arguments to update one BalanceTransfer.
     * @example
     * // Update one BalanceTransfer
     * const balanceTransfer = await prisma.balanceTransfer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BalanceTransferUpdateArgs>(args: SelectSubset<T, BalanceTransferUpdateArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BalanceTransfers.
     * @param {BalanceTransferDeleteManyArgs} args - Arguments to filter BalanceTransfers to delete.
     * @example
     * // Delete a few BalanceTransfers
     * const { count } = await prisma.balanceTransfer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BalanceTransferDeleteManyArgs>(args?: SelectSubset<T, BalanceTransferDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BalanceTransfers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BalanceTransferUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BalanceTransfers
     * const balanceTransfer = await prisma.balanceTransfer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BalanceTransferUpdateManyArgs>(args: SelectSubset<T, BalanceTransferUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BalanceTransfers and returns the data updated in the database.
     * @param {BalanceTransferUpdateManyAndReturnArgs} args - Arguments to update many BalanceTransfers.
     * @example
     * // Update many BalanceTransfers
     * const balanceTransfer = await prisma.balanceTransfer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BalanceTransfers and only return the `id`
     * const balanceTransferWithIdOnly = await prisma.balanceTransfer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BalanceTransferUpdateManyAndReturnArgs>(args: SelectSubset<T, BalanceTransferUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BalanceTransfer.
     * @param {BalanceTransferUpsertArgs} args - Arguments to update or create a BalanceTransfer.
     * @example
     * // Update or create a BalanceTransfer
     * const balanceTransfer = await prisma.balanceTransfer.upsert({
     *   create: {
     *     // ... data to create a BalanceTransfer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BalanceTransfer we want to update
     *   }
     * })
     */
    upsert<T extends BalanceTransferUpsertArgs>(args: SelectSubset<T, BalanceTransferUpsertArgs<ExtArgs>>): Prisma__BalanceTransferClient<$Result.GetResult<Prisma.$BalanceTransferPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BalanceTransfers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BalanceTransferCountArgs} args - Arguments to filter BalanceTransfers to count.
     * @example
     * // Count the number of BalanceTransfers
     * const count = await prisma.balanceTransfer.count({
     *   where: {
     *     // ... the filter for the BalanceTransfers we want to count
     *   }
     * })
    **/
    count<T extends BalanceTransferCountArgs>(
      args?: Subset<T, BalanceTransferCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BalanceTransferCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BalanceTransfer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BalanceTransferAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BalanceTransferAggregateArgs>(args: Subset<T, BalanceTransferAggregateArgs>): Prisma.PrismaPromise<GetBalanceTransferAggregateType<T>>

    /**
     * Group by BalanceTransfer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BalanceTransferGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BalanceTransferGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BalanceTransferGroupByArgs['orderBy'] }
        : { orderBy?: BalanceTransferGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BalanceTransferGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBalanceTransferGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BalanceTransfer model
   */
  readonly fields: BalanceTransferFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BalanceTransfer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BalanceTransferClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BalanceTransfer model
   */
  interface BalanceTransferFieldRefs {
    readonly id: FieldRef<"BalanceTransfer", 'String'>
    readonly userId: FieldRef<"BalanceTransfer", 'String'>
    readonly direction: FieldRef<"BalanceTransfer", 'TransferDirection'>
    readonly amountInPaise: FieldRef<"BalanceTransfer", 'BigInt'>
    readonly status: FieldRef<"BalanceTransfer", 'TransferStatus'>
    readonly idempotencyKey: FieldRef<"BalanceTransfer", 'String'>
    readonly vaultlyRef: FieldRef<"BalanceTransfer", 'String'>
    readonly createdAt: FieldRef<"BalanceTransfer", 'DateTime'>
    readonly resolvedAt: FieldRef<"BalanceTransfer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BalanceTransfer findUnique
   */
  export type BalanceTransferFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * Filter, which BalanceTransfer to fetch.
     */
    where: BalanceTransferWhereUniqueInput
  }

  /**
   * BalanceTransfer findUniqueOrThrow
   */
  export type BalanceTransferFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * Filter, which BalanceTransfer to fetch.
     */
    where: BalanceTransferWhereUniqueInput
  }

  /**
   * BalanceTransfer findFirst
   */
  export type BalanceTransferFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * Filter, which BalanceTransfer to fetch.
     */
    where?: BalanceTransferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BalanceTransfers to fetch.
     */
    orderBy?: BalanceTransferOrderByWithRelationInput | BalanceTransferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BalanceTransfers.
     */
    cursor?: BalanceTransferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BalanceTransfers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BalanceTransfers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BalanceTransfers.
     */
    distinct?: BalanceTransferScalarFieldEnum | BalanceTransferScalarFieldEnum[]
  }

  /**
   * BalanceTransfer findFirstOrThrow
   */
  export type BalanceTransferFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * Filter, which BalanceTransfer to fetch.
     */
    where?: BalanceTransferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BalanceTransfers to fetch.
     */
    orderBy?: BalanceTransferOrderByWithRelationInput | BalanceTransferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BalanceTransfers.
     */
    cursor?: BalanceTransferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BalanceTransfers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BalanceTransfers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BalanceTransfers.
     */
    distinct?: BalanceTransferScalarFieldEnum | BalanceTransferScalarFieldEnum[]
  }

  /**
   * BalanceTransfer findMany
   */
  export type BalanceTransferFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * Filter, which BalanceTransfers to fetch.
     */
    where?: BalanceTransferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BalanceTransfers to fetch.
     */
    orderBy?: BalanceTransferOrderByWithRelationInput | BalanceTransferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BalanceTransfers.
     */
    cursor?: BalanceTransferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BalanceTransfers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BalanceTransfers.
     */
    skip?: number
    distinct?: BalanceTransferScalarFieldEnum | BalanceTransferScalarFieldEnum[]
  }

  /**
   * BalanceTransfer create
   */
  export type BalanceTransferCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * The data needed to create a BalanceTransfer.
     */
    data: XOR<BalanceTransferCreateInput, BalanceTransferUncheckedCreateInput>
  }

  /**
   * BalanceTransfer createMany
   */
  export type BalanceTransferCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BalanceTransfers.
     */
    data: BalanceTransferCreateManyInput | BalanceTransferCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BalanceTransfer createManyAndReturn
   */
  export type BalanceTransferCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * The data used to create many BalanceTransfers.
     */
    data: BalanceTransferCreateManyInput | BalanceTransferCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BalanceTransfer update
   */
  export type BalanceTransferUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * The data needed to update a BalanceTransfer.
     */
    data: XOR<BalanceTransferUpdateInput, BalanceTransferUncheckedUpdateInput>
    /**
     * Choose, which BalanceTransfer to update.
     */
    where: BalanceTransferWhereUniqueInput
  }

  /**
   * BalanceTransfer updateMany
   */
  export type BalanceTransferUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BalanceTransfers.
     */
    data: XOR<BalanceTransferUpdateManyMutationInput, BalanceTransferUncheckedUpdateManyInput>
    /**
     * Filter which BalanceTransfers to update
     */
    where?: BalanceTransferWhereInput
    /**
     * Limit how many BalanceTransfers to update.
     */
    limit?: number
  }

  /**
   * BalanceTransfer updateManyAndReturn
   */
  export type BalanceTransferUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * The data used to update BalanceTransfers.
     */
    data: XOR<BalanceTransferUpdateManyMutationInput, BalanceTransferUncheckedUpdateManyInput>
    /**
     * Filter which BalanceTransfers to update
     */
    where?: BalanceTransferWhereInput
    /**
     * Limit how many BalanceTransfers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BalanceTransfer upsert
   */
  export type BalanceTransferUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * The filter to search for the BalanceTransfer to update in case it exists.
     */
    where: BalanceTransferWhereUniqueInput
    /**
     * In case the BalanceTransfer found by the `where` argument doesn't exist, create a new BalanceTransfer with this data.
     */
    create: XOR<BalanceTransferCreateInput, BalanceTransferUncheckedCreateInput>
    /**
     * In case the BalanceTransfer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BalanceTransferUpdateInput, BalanceTransferUncheckedUpdateInput>
  }

  /**
   * BalanceTransfer delete
   */
  export type BalanceTransferDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
    /**
     * Filter which BalanceTransfer to delete.
     */
    where: BalanceTransferWhereUniqueInput
  }

  /**
   * BalanceTransfer deleteMany
   */
  export type BalanceTransferDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BalanceTransfers to delete
     */
    where?: BalanceTransferWhereInput
    /**
     * Limit how many BalanceTransfers to delete.
     */
    limit?: number
  }

  /**
   * BalanceTransfer without action
   */
  export type BalanceTransferDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BalanceTransfer
     */
    select?: BalanceTransferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BalanceTransfer
     */
    omit?: BalanceTransferOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BalanceTransferInclude<ExtArgs> | null
  }


  /**
   * Model Kline
   */

  export type AggregateKline = {
    _count: KlineCountAggregateOutputType | null
    _avg: KlineAvgAggregateOutputType | null
    _sum: KlineSumAggregateOutputType | null
    _min: KlineMinAggregateOutputType | null
    _max: KlineMaxAggregateOutputType | null
  }

  export type KlineAvgAggregateOutputType = {
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    tradeCount: number | null
  }

  export type KlineSumAggregateOutputType = {
    open: bigint | null
    high: bigint | null
    low: bigint | null
    close: bigint | null
    volume: bigint | null
    tradeCount: number | null
  }

  export type KlineMinAggregateOutputType = {
    id: string | null
    market: string | null
    interval: $Enums.KlineInterval | null
    openTime: Date | null
    closeTime: Date | null
    open: bigint | null
    high: bigint | null
    low: bigint | null
    close: bigint | null
    volume: bigint | null
    tradeCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type KlineMaxAggregateOutputType = {
    id: string | null
    market: string | null
    interval: $Enums.KlineInterval | null
    openTime: Date | null
    closeTime: Date | null
    open: bigint | null
    high: bigint | null
    low: bigint | null
    close: bigint | null
    volume: bigint | null
    tradeCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type KlineCountAggregateOutputType = {
    id: number
    market: number
    interval: number
    openTime: number
    closeTime: number
    open: number
    high: number
    low: number
    close: number
    volume: number
    tradeCount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type KlineAvgAggregateInputType = {
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    tradeCount?: true
  }

  export type KlineSumAggregateInputType = {
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    tradeCount?: true
  }

  export type KlineMinAggregateInputType = {
    id?: true
    market?: true
    interval?: true
    openTime?: true
    closeTime?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    tradeCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type KlineMaxAggregateInputType = {
    id?: true
    market?: true
    interval?: true
    openTime?: true
    closeTime?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    tradeCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type KlineCountAggregateInputType = {
    id?: true
    market?: true
    interval?: true
    openTime?: true
    closeTime?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    tradeCount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type KlineAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Kline to aggregate.
     */
    where?: KlineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Klines to fetch.
     */
    orderBy?: KlineOrderByWithRelationInput | KlineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KlineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Klines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Klines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Klines
    **/
    _count?: true | KlineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KlineAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KlineSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KlineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KlineMaxAggregateInputType
  }

  export type GetKlineAggregateType<T extends KlineAggregateArgs> = {
        [P in keyof T & keyof AggregateKline]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKline[P]>
      : GetScalarType<T[P], AggregateKline[P]>
  }




  export type KlineGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KlineWhereInput
    orderBy?: KlineOrderByWithAggregationInput | KlineOrderByWithAggregationInput[]
    by: KlineScalarFieldEnum[] | KlineScalarFieldEnum
    having?: KlineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KlineCountAggregateInputType | true
    _avg?: KlineAvgAggregateInputType
    _sum?: KlineSumAggregateInputType
    _min?: KlineMinAggregateInputType
    _max?: KlineMaxAggregateInputType
  }

  export type KlineGroupByOutputType = {
    id: string
    market: string
    interval: $Enums.KlineInterval
    openTime: Date
    closeTime: Date
    open: bigint
    high: bigint
    low: bigint
    close: bigint
    volume: bigint
    tradeCount: number
    createdAt: Date
    updatedAt: Date
    _count: KlineCountAggregateOutputType | null
    _avg: KlineAvgAggregateOutputType | null
    _sum: KlineSumAggregateOutputType | null
    _min: KlineMinAggregateOutputType | null
    _max: KlineMaxAggregateOutputType | null
  }

  type GetKlineGroupByPayload<T extends KlineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KlineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KlineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KlineGroupByOutputType[P]>
            : GetScalarType<T[P], KlineGroupByOutputType[P]>
        }
      >
    >


  export type KlineSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    market?: boolean
    interval?: boolean
    openTime?: boolean
    closeTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    tradeCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["kline"]>

  export type KlineSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    market?: boolean
    interval?: boolean
    openTime?: boolean
    closeTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    tradeCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["kline"]>

  export type KlineSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    market?: boolean
    interval?: boolean
    openTime?: boolean
    closeTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    tradeCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["kline"]>

  export type KlineSelectScalar = {
    id?: boolean
    market?: boolean
    interval?: boolean
    openTime?: boolean
    closeTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    tradeCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type KlineOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "market" | "interval" | "openTime" | "closeTime" | "open" | "high" | "low" | "close" | "volume" | "tradeCount" | "createdAt" | "updatedAt", ExtArgs["result"]["kline"]>

  export type $KlinePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Kline"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      market: string
      interval: $Enums.KlineInterval
      openTime: Date
      closeTime: Date
      open: bigint
      high: bigint
      low: bigint
      close: bigint
      volume: bigint
      tradeCount: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["kline"]>
    composites: {}
  }

  type KlineGetPayload<S extends boolean | null | undefined | KlineDefaultArgs> = $Result.GetResult<Prisma.$KlinePayload, S>

  type KlineCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<KlineFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: KlineCountAggregateInputType | true
    }

  export interface KlineDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Kline'], meta: { name: 'Kline' } }
    /**
     * Find zero or one Kline that matches the filter.
     * @param {KlineFindUniqueArgs} args - Arguments to find a Kline
     * @example
     * // Get one Kline
     * const kline = await prisma.kline.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KlineFindUniqueArgs>(args: SelectSubset<T, KlineFindUniqueArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Kline that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {KlineFindUniqueOrThrowArgs} args - Arguments to find a Kline
     * @example
     * // Get one Kline
     * const kline = await prisma.kline.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KlineFindUniqueOrThrowArgs>(args: SelectSubset<T, KlineFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Kline that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KlineFindFirstArgs} args - Arguments to find a Kline
     * @example
     * // Get one Kline
     * const kline = await prisma.kline.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KlineFindFirstArgs>(args?: SelectSubset<T, KlineFindFirstArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Kline that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KlineFindFirstOrThrowArgs} args - Arguments to find a Kline
     * @example
     * // Get one Kline
     * const kline = await prisma.kline.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KlineFindFirstOrThrowArgs>(args?: SelectSubset<T, KlineFindFirstOrThrowArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Klines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KlineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Klines
     * const klines = await prisma.kline.findMany()
     * 
     * // Get first 10 Klines
     * const klines = await prisma.kline.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const klineWithIdOnly = await prisma.kline.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KlineFindManyArgs>(args?: SelectSubset<T, KlineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Kline.
     * @param {KlineCreateArgs} args - Arguments to create a Kline.
     * @example
     * // Create one Kline
     * const Kline = await prisma.kline.create({
     *   data: {
     *     // ... data to create a Kline
     *   }
     * })
     * 
     */
    create<T extends KlineCreateArgs>(args: SelectSubset<T, KlineCreateArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Klines.
     * @param {KlineCreateManyArgs} args - Arguments to create many Klines.
     * @example
     * // Create many Klines
     * const kline = await prisma.kline.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KlineCreateManyArgs>(args?: SelectSubset<T, KlineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Klines and returns the data saved in the database.
     * @param {KlineCreateManyAndReturnArgs} args - Arguments to create many Klines.
     * @example
     * // Create many Klines
     * const kline = await prisma.kline.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Klines and only return the `id`
     * const klineWithIdOnly = await prisma.kline.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KlineCreateManyAndReturnArgs>(args?: SelectSubset<T, KlineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Kline.
     * @param {KlineDeleteArgs} args - Arguments to delete one Kline.
     * @example
     * // Delete one Kline
     * const Kline = await prisma.kline.delete({
     *   where: {
     *     // ... filter to delete one Kline
     *   }
     * })
     * 
     */
    delete<T extends KlineDeleteArgs>(args: SelectSubset<T, KlineDeleteArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Kline.
     * @param {KlineUpdateArgs} args - Arguments to update one Kline.
     * @example
     * // Update one Kline
     * const kline = await prisma.kline.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KlineUpdateArgs>(args: SelectSubset<T, KlineUpdateArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Klines.
     * @param {KlineDeleteManyArgs} args - Arguments to filter Klines to delete.
     * @example
     * // Delete a few Klines
     * const { count } = await prisma.kline.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KlineDeleteManyArgs>(args?: SelectSubset<T, KlineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Klines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KlineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Klines
     * const kline = await prisma.kline.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KlineUpdateManyArgs>(args: SelectSubset<T, KlineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Klines and returns the data updated in the database.
     * @param {KlineUpdateManyAndReturnArgs} args - Arguments to update many Klines.
     * @example
     * // Update many Klines
     * const kline = await prisma.kline.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Klines and only return the `id`
     * const klineWithIdOnly = await prisma.kline.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends KlineUpdateManyAndReturnArgs>(args: SelectSubset<T, KlineUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Kline.
     * @param {KlineUpsertArgs} args - Arguments to update or create a Kline.
     * @example
     * // Update or create a Kline
     * const kline = await prisma.kline.upsert({
     *   create: {
     *     // ... data to create a Kline
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Kline we want to update
     *   }
     * })
     */
    upsert<T extends KlineUpsertArgs>(args: SelectSubset<T, KlineUpsertArgs<ExtArgs>>): Prisma__KlineClient<$Result.GetResult<Prisma.$KlinePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Klines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KlineCountArgs} args - Arguments to filter Klines to count.
     * @example
     * // Count the number of Klines
     * const count = await prisma.kline.count({
     *   where: {
     *     // ... the filter for the Klines we want to count
     *   }
     * })
    **/
    count<T extends KlineCountArgs>(
      args?: Subset<T, KlineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KlineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Kline.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KlineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KlineAggregateArgs>(args: Subset<T, KlineAggregateArgs>): Prisma.PrismaPromise<GetKlineAggregateType<T>>

    /**
     * Group by Kline.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KlineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KlineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KlineGroupByArgs['orderBy'] }
        : { orderBy?: KlineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KlineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKlineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Kline model
   */
  readonly fields: KlineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Kline.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KlineClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Kline model
   */
  interface KlineFieldRefs {
    readonly id: FieldRef<"Kline", 'String'>
    readonly market: FieldRef<"Kline", 'String'>
    readonly interval: FieldRef<"Kline", 'KlineInterval'>
    readonly openTime: FieldRef<"Kline", 'DateTime'>
    readonly closeTime: FieldRef<"Kline", 'DateTime'>
    readonly open: FieldRef<"Kline", 'BigInt'>
    readonly high: FieldRef<"Kline", 'BigInt'>
    readonly low: FieldRef<"Kline", 'BigInt'>
    readonly close: FieldRef<"Kline", 'BigInt'>
    readonly volume: FieldRef<"Kline", 'BigInt'>
    readonly tradeCount: FieldRef<"Kline", 'Int'>
    readonly createdAt: FieldRef<"Kline", 'DateTime'>
    readonly updatedAt: FieldRef<"Kline", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Kline findUnique
   */
  export type KlineFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * Filter, which Kline to fetch.
     */
    where: KlineWhereUniqueInput
  }

  /**
   * Kline findUniqueOrThrow
   */
  export type KlineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * Filter, which Kline to fetch.
     */
    where: KlineWhereUniqueInput
  }

  /**
   * Kline findFirst
   */
  export type KlineFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * Filter, which Kline to fetch.
     */
    where?: KlineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Klines to fetch.
     */
    orderBy?: KlineOrderByWithRelationInput | KlineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Klines.
     */
    cursor?: KlineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Klines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Klines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Klines.
     */
    distinct?: KlineScalarFieldEnum | KlineScalarFieldEnum[]
  }

  /**
   * Kline findFirstOrThrow
   */
  export type KlineFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * Filter, which Kline to fetch.
     */
    where?: KlineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Klines to fetch.
     */
    orderBy?: KlineOrderByWithRelationInput | KlineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Klines.
     */
    cursor?: KlineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Klines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Klines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Klines.
     */
    distinct?: KlineScalarFieldEnum | KlineScalarFieldEnum[]
  }

  /**
   * Kline findMany
   */
  export type KlineFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * Filter, which Klines to fetch.
     */
    where?: KlineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Klines to fetch.
     */
    orderBy?: KlineOrderByWithRelationInput | KlineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Klines.
     */
    cursor?: KlineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Klines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Klines.
     */
    skip?: number
    distinct?: KlineScalarFieldEnum | KlineScalarFieldEnum[]
  }

  /**
   * Kline create
   */
  export type KlineCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * The data needed to create a Kline.
     */
    data: XOR<KlineCreateInput, KlineUncheckedCreateInput>
  }

  /**
   * Kline createMany
   */
  export type KlineCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Klines.
     */
    data: KlineCreateManyInput | KlineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Kline createManyAndReturn
   */
  export type KlineCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * The data used to create many Klines.
     */
    data: KlineCreateManyInput | KlineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Kline update
   */
  export type KlineUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * The data needed to update a Kline.
     */
    data: XOR<KlineUpdateInput, KlineUncheckedUpdateInput>
    /**
     * Choose, which Kline to update.
     */
    where: KlineWhereUniqueInput
  }

  /**
   * Kline updateMany
   */
  export type KlineUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Klines.
     */
    data: XOR<KlineUpdateManyMutationInput, KlineUncheckedUpdateManyInput>
    /**
     * Filter which Klines to update
     */
    where?: KlineWhereInput
    /**
     * Limit how many Klines to update.
     */
    limit?: number
  }

  /**
   * Kline updateManyAndReturn
   */
  export type KlineUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * The data used to update Klines.
     */
    data: XOR<KlineUpdateManyMutationInput, KlineUncheckedUpdateManyInput>
    /**
     * Filter which Klines to update
     */
    where?: KlineWhereInput
    /**
     * Limit how many Klines to update.
     */
    limit?: number
  }

  /**
   * Kline upsert
   */
  export type KlineUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * The filter to search for the Kline to update in case it exists.
     */
    where: KlineWhereUniqueInput
    /**
     * In case the Kline found by the `where` argument doesn't exist, create a new Kline with this data.
     */
    create: XOR<KlineCreateInput, KlineUncheckedCreateInput>
    /**
     * In case the Kline was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KlineUpdateInput, KlineUncheckedUpdateInput>
  }

  /**
   * Kline delete
   */
  export type KlineDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
    /**
     * Filter which Kline to delete.
     */
    where: KlineWhereUniqueInput
  }

  /**
   * Kline deleteMany
   */
  export type KlineDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Klines to delete
     */
    where?: KlineWhereInput
    /**
     * Limit how many Klines to delete.
     */
    limit?: number
  }

  /**
   * Kline without action
   */
  export type KlineDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Kline
     */
    select?: KlineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Kline
     */
    omit?: KlineOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    vaultlyUserId: 'vaultlyUserId',
    email: 'email',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    welcomeBonusCredited: 'welcomeBonusCredited'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const TradingBalanceScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    available: 'available',
    locked: 'locked',
    updatedAt: 'updatedAt'
  };

  export type TradingBalanceScalarFieldEnum = (typeof TradingBalanceScalarFieldEnum)[keyof typeof TradingBalanceScalarFieldEnum]


  export const OrderScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    market: 'market',
    side: 'side',
    price: 'price',
    qty: 'qty',
    filledQty: 'filledQty',
    status: 'status',
    lockedAmount: 'lockedAmount',
    commandId: 'commandId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const TradeScalarFieldEnum: {
    id: 'id',
    market: 'market',
    makerOrderId: 'makerOrderId',
    takerOrderId: 'takerOrderId',
    price: 'price',
    qty: 'qty',
    takerSide: 'takerSide',
    executedAt: 'executedAt'
  };

  export type TradeScalarFieldEnum = (typeof TradeScalarFieldEnum)[keyof typeof TradeScalarFieldEnum]


  export const BalanceTransferScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    direction: 'direction',
    amountInPaise: 'amountInPaise',
    status: 'status',
    idempotencyKey: 'idempotencyKey',
    vaultlyRef: 'vaultlyRef',
    createdAt: 'createdAt',
    resolvedAt: 'resolvedAt'
  };

  export type BalanceTransferScalarFieldEnum = (typeof BalanceTransferScalarFieldEnum)[keyof typeof BalanceTransferScalarFieldEnum]


  export const KlineScalarFieldEnum: {
    id: 'id',
    market: 'market',
    interval: 'interval',
    openTime: 'openTime',
    closeTime: 'closeTime',
    open: 'open',
    high: 'high',
    low: 'low',
    close: 'close',
    volume: 'volume',
    tradeCount: 'tradeCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type KlineScalarFieldEnum = (typeof KlineScalarFieldEnum)[keyof typeof KlineScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'OrderSide'
   */
  export type EnumOrderSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderSide'>
    


  /**
   * Reference to a field of type 'OrderSide[]'
   */
  export type ListEnumOrderSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderSide[]'>
    


  /**
   * Reference to a field of type 'OrderStatus'
   */
  export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>
    


  /**
   * Reference to a field of type 'OrderStatus[]'
   */
  export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>
    


  /**
   * Reference to a field of type 'TransferDirection'
   */
  export type EnumTransferDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransferDirection'>
    


  /**
   * Reference to a field of type 'TransferDirection[]'
   */
  export type ListEnumTransferDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransferDirection[]'>
    


  /**
   * Reference to a field of type 'TransferStatus'
   */
  export type EnumTransferStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransferStatus'>
    


  /**
   * Reference to a field of type 'TransferStatus[]'
   */
  export type ListEnumTransferStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransferStatus[]'>
    


  /**
   * Reference to a field of type 'KlineInterval'
   */
  export type EnumKlineIntervalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KlineInterval'>
    


  /**
   * Reference to a field of type 'KlineInterval[]'
   */
  export type ListEnumKlineIntervalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KlineInterval[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    vaultlyUserId?: StringFilter<"User"> | string
    email?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    welcomeBonusCredited?: BoolFilter<"User"> | boolean
    tradingBalance?: XOR<TradingBalanceNullableScalarRelationFilter, TradingBalanceWhereInput> | null
    orders?: OrderListRelationFilter
    transfers?: BalanceTransferListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    vaultlyUserId?: SortOrder
    email?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    welcomeBonusCredited?: SortOrder
    tradingBalance?: TradingBalanceOrderByWithRelationInput
    orders?: OrderOrderByRelationAggregateInput
    transfers?: BalanceTransferOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    vaultlyUserId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    email?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    welcomeBonusCredited?: BoolFilter<"User"> | boolean
    tradingBalance?: XOR<TradingBalanceNullableScalarRelationFilter, TradingBalanceWhereInput> | null
    orders?: OrderListRelationFilter
    transfers?: BalanceTransferListRelationFilter
  }, "id" | "vaultlyUserId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    vaultlyUserId?: SortOrder
    email?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    welcomeBonusCredited?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    vaultlyUserId?: StringWithAggregatesFilter<"User"> | string
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    welcomeBonusCredited?: BoolWithAggregatesFilter<"User"> | boolean
  }

  export type TradingBalanceWhereInput = {
    AND?: TradingBalanceWhereInput | TradingBalanceWhereInput[]
    OR?: TradingBalanceWhereInput[]
    NOT?: TradingBalanceWhereInput | TradingBalanceWhereInput[]
    id?: StringFilter<"TradingBalance"> | string
    userId?: StringFilter<"TradingBalance"> | string
    available?: BigIntFilter<"TradingBalance"> | bigint | number
    locked?: BigIntFilter<"TradingBalance"> | bigint | number
    updatedAt?: DateTimeFilter<"TradingBalance"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type TradingBalanceOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    available?: SortOrder
    locked?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type TradingBalanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: TradingBalanceWhereInput | TradingBalanceWhereInput[]
    OR?: TradingBalanceWhereInput[]
    NOT?: TradingBalanceWhereInput | TradingBalanceWhereInput[]
    available?: BigIntFilter<"TradingBalance"> | bigint | number
    locked?: BigIntFilter<"TradingBalance"> | bigint | number
    updatedAt?: DateTimeFilter<"TradingBalance"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type TradingBalanceOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    available?: SortOrder
    locked?: SortOrder
    updatedAt?: SortOrder
    _count?: TradingBalanceCountOrderByAggregateInput
    _avg?: TradingBalanceAvgOrderByAggregateInput
    _max?: TradingBalanceMaxOrderByAggregateInput
    _min?: TradingBalanceMinOrderByAggregateInput
    _sum?: TradingBalanceSumOrderByAggregateInput
  }

  export type TradingBalanceScalarWhereWithAggregatesInput = {
    AND?: TradingBalanceScalarWhereWithAggregatesInput | TradingBalanceScalarWhereWithAggregatesInput[]
    OR?: TradingBalanceScalarWhereWithAggregatesInput[]
    NOT?: TradingBalanceScalarWhereWithAggregatesInput | TradingBalanceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TradingBalance"> | string
    userId?: StringWithAggregatesFilter<"TradingBalance"> | string
    available?: BigIntWithAggregatesFilter<"TradingBalance"> | bigint | number
    locked?: BigIntWithAggregatesFilter<"TradingBalance"> | bigint | number
    updatedAt?: DateTimeWithAggregatesFilter<"TradingBalance"> | Date | string
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    userId?: StringFilter<"Order"> | string
    market?: StringFilter<"Order"> | string
    side?: EnumOrderSideFilter<"Order"> | $Enums.OrderSide
    price?: BigIntFilter<"Order"> | bigint | number
    qty?: BigIntFilter<"Order"> | bigint | number
    filledQty?: BigIntFilter<"Order"> | bigint | number
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    lockedAmount?: BigIntFilter<"Order"> | bigint | number
    commandId?: StringFilter<"Order"> | string
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    trades?: TradeListRelationFilter
    takerTrades?: TradeListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    market?: SortOrder
    side?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    filledQty?: SortOrder
    status?: SortOrder
    lockedAmount?: SortOrder
    commandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    trades?: TradeOrderByRelationAggregateInput
    takerTrades?: TradeOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    commandId?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    userId?: StringFilter<"Order"> | string
    market?: StringFilter<"Order"> | string
    side?: EnumOrderSideFilter<"Order"> | $Enums.OrderSide
    price?: BigIntFilter<"Order"> | bigint | number
    qty?: BigIntFilter<"Order"> | bigint | number
    filledQty?: BigIntFilter<"Order"> | bigint | number
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    lockedAmount?: BigIntFilter<"Order"> | bigint | number
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    trades?: TradeListRelationFilter
    takerTrades?: TradeListRelationFilter
  }, "id" | "commandId">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    market?: SortOrder
    side?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    filledQty?: SortOrder
    status?: SortOrder
    lockedAmount?: SortOrder
    commandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    userId?: StringWithAggregatesFilter<"Order"> | string
    market?: StringWithAggregatesFilter<"Order"> | string
    side?: EnumOrderSideWithAggregatesFilter<"Order"> | $Enums.OrderSide
    price?: BigIntWithAggregatesFilter<"Order"> | bigint | number
    qty?: BigIntWithAggregatesFilter<"Order"> | bigint | number
    filledQty?: BigIntWithAggregatesFilter<"Order"> | bigint | number
    status?: EnumOrderStatusWithAggregatesFilter<"Order"> | $Enums.OrderStatus
    lockedAmount?: BigIntWithAggregatesFilter<"Order"> | bigint | number
    commandId?: StringWithAggregatesFilter<"Order"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type TradeWhereInput = {
    AND?: TradeWhereInput | TradeWhereInput[]
    OR?: TradeWhereInput[]
    NOT?: TradeWhereInput | TradeWhereInput[]
    id?: StringFilter<"Trade"> | string
    market?: StringFilter<"Trade"> | string
    makerOrderId?: StringFilter<"Trade"> | string
    takerOrderId?: StringFilter<"Trade"> | string
    price?: BigIntFilter<"Trade"> | bigint | number
    qty?: BigIntFilter<"Trade"> | bigint | number
    takerSide?: EnumOrderSideFilter<"Trade"> | $Enums.OrderSide
    executedAt?: DateTimeFilter<"Trade"> | Date | string
    makerOrder?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    takerOrder?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }

  export type TradeOrderByWithRelationInput = {
    id?: SortOrder
    market?: SortOrder
    makerOrderId?: SortOrder
    takerOrderId?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    takerSide?: SortOrder
    executedAt?: SortOrder
    makerOrder?: OrderOrderByWithRelationInput
    takerOrder?: OrderOrderByWithRelationInput
  }

  export type TradeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    makerOrderId_takerOrderId?: TradeMakerOrderIdTakerOrderIdCompoundUniqueInput
    AND?: TradeWhereInput | TradeWhereInput[]
    OR?: TradeWhereInput[]
    NOT?: TradeWhereInput | TradeWhereInput[]
    market?: StringFilter<"Trade"> | string
    makerOrderId?: StringFilter<"Trade"> | string
    takerOrderId?: StringFilter<"Trade"> | string
    price?: BigIntFilter<"Trade"> | bigint | number
    qty?: BigIntFilter<"Trade"> | bigint | number
    takerSide?: EnumOrderSideFilter<"Trade"> | $Enums.OrderSide
    executedAt?: DateTimeFilter<"Trade"> | Date | string
    makerOrder?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    takerOrder?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }, "id" | "makerOrderId_takerOrderId">

  export type TradeOrderByWithAggregationInput = {
    id?: SortOrder
    market?: SortOrder
    makerOrderId?: SortOrder
    takerOrderId?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    takerSide?: SortOrder
    executedAt?: SortOrder
    _count?: TradeCountOrderByAggregateInput
    _avg?: TradeAvgOrderByAggregateInput
    _max?: TradeMaxOrderByAggregateInput
    _min?: TradeMinOrderByAggregateInput
    _sum?: TradeSumOrderByAggregateInput
  }

  export type TradeScalarWhereWithAggregatesInput = {
    AND?: TradeScalarWhereWithAggregatesInput | TradeScalarWhereWithAggregatesInput[]
    OR?: TradeScalarWhereWithAggregatesInput[]
    NOT?: TradeScalarWhereWithAggregatesInput | TradeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Trade"> | string
    market?: StringWithAggregatesFilter<"Trade"> | string
    makerOrderId?: StringWithAggregatesFilter<"Trade"> | string
    takerOrderId?: StringWithAggregatesFilter<"Trade"> | string
    price?: BigIntWithAggregatesFilter<"Trade"> | bigint | number
    qty?: BigIntWithAggregatesFilter<"Trade"> | bigint | number
    takerSide?: EnumOrderSideWithAggregatesFilter<"Trade"> | $Enums.OrderSide
    executedAt?: DateTimeWithAggregatesFilter<"Trade"> | Date | string
  }

  export type BalanceTransferWhereInput = {
    AND?: BalanceTransferWhereInput | BalanceTransferWhereInput[]
    OR?: BalanceTransferWhereInput[]
    NOT?: BalanceTransferWhereInput | BalanceTransferWhereInput[]
    id?: StringFilter<"BalanceTransfer"> | string
    userId?: StringFilter<"BalanceTransfer"> | string
    direction?: EnumTransferDirectionFilter<"BalanceTransfer"> | $Enums.TransferDirection
    amountInPaise?: BigIntFilter<"BalanceTransfer"> | bigint | number
    status?: EnumTransferStatusFilter<"BalanceTransfer"> | $Enums.TransferStatus
    idempotencyKey?: StringFilter<"BalanceTransfer"> | string
    vaultlyRef?: StringNullableFilter<"BalanceTransfer"> | string | null
    createdAt?: DateTimeFilter<"BalanceTransfer"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"BalanceTransfer"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type BalanceTransferOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    direction?: SortOrder
    amountInPaise?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    vaultlyRef?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type BalanceTransferWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idempotencyKey?: string
    AND?: BalanceTransferWhereInput | BalanceTransferWhereInput[]
    OR?: BalanceTransferWhereInput[]
    NOT?: BalanceTransferWhereInput | BalanceTransferWhereInput[]
    userId?: StringFilter<"BalanceTransfer"> | string
    direction?: EnumTransferDirectionFilter<"BalanceTransfer"> | $Enums.TransferDirection
    amountInPaise?: BigIntFilter<"BalanceTransfer"> | bigint | number
    status?: EnumTransferStatusFilter<"BalanceTransfer"> | $Enums.TransferStatus
    vaultlyRef?: StringNullableFilter<"BalanceTransfer"> | string | null
    createdAt?: DateTimeFilter<"BalanceTransfer"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"BalanceTransfer"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "idempotencyKey">

  export type BalanceTransferOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    direction?: SortOrder
    amountInPaise?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    vaultlyRef?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    _count?: BalanceTransferCountOrderByAggregateInput
    _avg?: BalanceTransferAvgOrderByAggregateInput
    _max?: BalanceTransferMaxOrderByAggregateInput
    _min?: BalanceTransferMinOrderByAggregateInput
    _sum?: BalanceTransferSumOrderByAggregateInput
  }

  export type BalanceTransferScalarWhereWithAggregatesInput = {
    AND?: BalanceTransferScalarWhereWithAggregatesInput | BalanceTransferScalarWhereWithAggregatesInput[]
    OR?: BalanceTransferScalarWhereWithAggregatesInput[]
    NOT?: BalanceTransferScalarWhereWithAggregatesInput | BalanceTransferScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BalanceTransfer"> | string
    userId?: StringWithAggregatesFilter<"BalanceTransfer"> | string
    direction?: EnumTransferDirectionWithAggregatesFilter<"BalanceTransfer"> | $Enums.TransferDirection
    amountInPaise?: BigIntWithAggregatesFilter<"BalanceTransfer"> | bigint | number
    status?: EnumTransferStatusWithAggregatesFilter<"BalanceTransfer"> | $Enums.TransferStatus
    idempotencyKey?: StringWithAggregatesFilter<"BalanceTransfer"> | string
    vaultlyRef?: StringNullableWithAggregatesFilter<"BalanceTransfer"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BalanceTransfer"> | Date | string
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"BalanceTransfer"> | Date | string | null
  }

  export type KlineWhereInput = {
    AND?: KlineWhereInput | KlineWhereInput[]
    OR?: KlineWhereInput[]
    NOT?: KlineWhereInput | KlineWhereInput[]
    id?: StringFilter<"Kline"> | string
    market?: StringFilter<"Kline"> | string
    interval?: EnumKlineIntervalFilter<"Kline"> | $Enums.KlineInterval
    openTime?: DateTimeFilter<"Kline"> | Date | string
    closeTime?: DateTimeFilter<"Kline"> | Date | string
    open?: BigIntFilter<"Kline"> | bigint | number
    high?: BigIntFilter<"Kline"> | bigint | number
    low?: BigIntFilter<"Kline"> | bigint | number
    close?: BigIntFilter<"Kline"> | bigint | number
    volume?: BigIntFilter<"Kline"> | bigint | number
    tradeCount?: IntFilter<"Kline"> | number
    createdAt?: DateTimeFilter<"Kline"> | Date | string
    updatedAt?: DateTimeFilter<"Kline"> | Date | string
  }

  export type KlineOrderByWithRelationInput = {
    id?: SortOrder
    market?: SortOrder
    interval?: SortOrder
    openTime?: SortOrder
    closeTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    tradeCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KlineWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    market_interval_openTime?: KlineMarketIntervalOpenTimeCompoundUniqueInput
    AND?: KlineWhereInput | KlineWhereInput[]
    OR?: KlineWhereInput[]
    NOT?: KlineWhereInput | KlineWhereInput[]
    market?: StringFilter<"Kline"> | string
    interval?: EnumKlineIntervalFilter<"Kline"> | $Enums.KlineInterval
    openTime?: DateTimeFilter<"Kline"> | Date | string
    closeTime?: DateTimeFilter<"Kline"> | Date | string
    open?: BigIntFilter<"Kline"> | bigint | number
    high?: BigIntFilter<"Kline"> | bigint | number
    low?: BigIntFilter<"Kline"> | bigint | number
    close?: BigIntFilter<"Kline"> | bigint | number
    volume?: BigIntFilter<"Kline"> | bigint | number
    tradeCount?: IntFilter<"Kline"> | number
    createdAt?: DateTimeFilter<"Kline"> | Date | string
    updatedAt?: DateTimeFilter<"Kline"> | Date | string
  }, "id" | "market_interval_openTime">

  export type KlineOrderByWithAggregationInput = {
    id?: SortOrder
    market?: SortOrder
    interval?: SortOrder
    openTime?: SortOrder
    closeTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    tradeCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: KlineCountOrderByAggregateInput
    _avg?: KlineAvgOrderByAggregateInput
    _max?: KlineMaxOrderByAggregateInput
    _min?: KlineMinOrderByAggregateInput
    _sum?: KlineSumOrderByAggregateInput
  }

  export type KlineScalarWhereWithAggregatesInput = {
    AND?: KlineScalarWhereWithAggregatesInput | KlineScalarWhereWithAggregatesInput[]
    OR?: KlineScalarWhereWithAggregatesInput[]
    NOT?: KlineScalarWhereWithAggregatesInput | KlineScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Kline"> | string
    market?: StringWithAggregatesFilter<"Kline"> | string
    interval?: EnumKlineIntervalWithAggregatesFilter<"Kline"> | $Enums.KlineInterval
    openTime?: DateTimeWithAggregatesFilter<"Kline"> | Date | string
    closeTime?: DateTimeWithAggregatesFilter<"Kline"> | Date | string
    open?: BigIntWithAggregatesFilter<"Kline"> | bigint | number
    high?: BigIntWithAggregatesFilter<"Kline"> | bigint | number
    low?: BigIntWithAggregatesFilter<"Kline"> | bigint | number
    close?: BigIntWithAggregatesFilter<"Kline"> | bigint | number
    volume?: BigIntWithAggregatesFilter<"Kline"> | bigint | number
    tradeCount?: IntWithAggregatesFilter<"Kline"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Kline"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Kline"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    tradingBalance?: TradingBalanceCreateNestedOneWithoutUserInput
    orders?: OrderCreateNestedManyWithoutUserInput
    transfers?: BalanceTransferCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    tradingBalance?: TradingBalanceUncheckedCreateNestedOneWithoutUserInput
    orders?: OrderUncheckedCreateNestedManyWithoutUserInput
    transfers?: BalanceTransferUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    tradingBalance?: TradingBalanceUpdateOneWithoutUserNestedInput
    orders?: OrderUpdateManyWithoutUserNestedInput
    transfers?: BalanceTransferUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    tradingBalance?: TradingBalanceUncheckedUpdateOneWithoutUserNestedInput
    orders?: OrderUncheckedUpdateManyWithoutUserNestedInput
    transfers?: BalanceTransferUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TradingBalanceCreateInput = {
    id?: string
    available?: bigint | number
    locked?: bigint | number
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutTradingBalanceInput
  }

  export type TradingBalanceUncheckedCreateInput = {
    id?: string
    userId: string
    available?: bigint | number
    locked?: bigint | number
    updatedAt?: Date | string
  }

  export type TradingBalanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    available?: BigIntFieldUpdateOperationsInput | bigint | number
    locked?: BigIntFieldUpdateOperationsInput | bigint | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutTradingBalanceNestedInput
  }

  export type TradingBalanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    available?: BigIntFieldUpdateOperationsInput | bigint | number
    locked?: BigIntFieldUpdateOperationsInput | bigint | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradingBalanceCreateManyInput = {
    id?: string
    userId: string
    available?: bigint | number
    locked?: bigint | number
    updatedAt?: Date | string
  }

  export type TradingBalanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    available?: BigIntFieldUpdateOperationsInput | bigint | number
    locked?: BigIntFieldUpdateOperationsInput | bigint | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradingBalanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    available?: BigIntFieldUpdateOperationsInput | bigint | number
    locked?: BigIntFieldUpdateOperationsInput | bigint | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateInput = {
    id: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutOrdersInput
    trades?: TradeCreateNestedManyWithoutMakerOrderInput
    takerTrades?: TradeCreateNestedManyWithoutTakerOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id: string
    userId: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trades?: TradeUncheckedCreateNestedManyWithoutMakerOrderInput
    takerTrades?: TradeUncheckedCreateNestedManyWithoutTakerOrderInput
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    trades?: TradeUpdateManyWithoutMakerOrderNestedInput
    takerTrades?: TradeUpdateManyWithoutTakerOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trades?: TradeUncheckedUpdateManyWithoutMakerOrderNestedInput
    takerTrades?: TradeUncheckedUpdateManyWithoutTakerOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id: string
    userId: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeCreateInput = {
    id?: string
    market: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
    makerOrder: OrderCreateNestedOneWithoutTradesInput
    takerOrder: OrderCreateNestedOneWithoutTakerTradesInput
  }

  export type TradeUncheckedCreateInput = {
    id?: string
    market: string
    makerOrderId: string
    takerOrderId: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
  }

  export type TradeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    makerOrder?: OrderUpdateOneRequiredWithoutTradesNestedInput
    takerOrder?: OrderUpdateOneRequiredWithoutTakerTradesNestedInput
  }

  export type TradeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    makerOrderId?: StringFieldUpdateOperationsInput | string
    takerOrderId?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeCreateManyInput = {
    id?: string
    market: string
    makerOrderId: string
    takerOrderId: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
  }

  export type TradeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    makerOrderId?: StringFieldUpdateOperationsInput | string
    takerOrderId?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BalanceTransferCreateInput = {
    id?: string
    direction: $Enums.TransferDirection
    amountInPaise: bigint | number
    status?: $Enums.TransferStatus
    idempotencyKey: string
    vaultlyRef?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
    user: UserCreateNestedOneWithoutTransfersInput
  }

  export type BalanceTransferUncheckedCreateInput = {
    id?: string
    userId: string
    direction: $Enums.TransferDirection
    amountInPaise: bigint | number
    status?: $Enums.TransferStatus
    idempotencyKey: string
    vaultlyRef?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BalanceTransferUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: EnumTransferDirectionFieldUpdateOperationsInput | $Enums.TransferDirection
    amountInPaise?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTransferStatusFieldUpdateOperationsInput | $Enums.TransferStatus
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    vaultlyRef?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutTransfersNestedInput
  }

  export type BalanceTransferUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTransferDirectionFieldUpdateOperationsInput | $Enums.TransferDirection
    amountInPaise?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTransferStatusFieldUpdateOperationsInput | $Enums.TransferStatus
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    vaultlyRef?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BalanceTransferCreateManyInput = {
    id?: string
    userId: string
    direction: $Enums.TransferDirection
    amountInPaise: bigint | number
    status?: $Enums.TransferStatus
    idempotencyKey: string
    vaultlyRef?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BalanceTransferUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: EnumTransferDirectionFieldUpdateOperationsInput | $Enums.TransferDirection
    amountInPaise?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTransferStatusFieldUpdateOperationsInput | $Enums.TransferStatus
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    vaultlyRef?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BalanceTransferUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTransferDirectionFieldUpdateOperationsInput | $Enums.TransferDirection
    amountInPaise?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTransferStatusFieldUpdateOperationsInput | $Enums.TransferStatus
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    vaultlyRef?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type KlineCreateInput = {
    id?: string
    market: string
    interval: $Enums.KlineInterval
    openTime: Date | string
    closeTime: Date | string
    open: bigint | number
    high: bigint | number
    low: bigint | number
    close: bigint | number
    volume: bigint | number
    tradeCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KlineUncheckedCreateInput = {
    id?: string
    market: string
    interval: $Enums.KlineInterval
    openTime: Date | string
    closeTime: Date | string
    open: bigint | number
    high: bigint | number
    low: bigint | number
    close: bigint | number
    volume: bigint | number
    tradeCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KlineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    interval?: EnumKlineIntervalFieldUpdateOperationsInput | $Enums.KlineInterval
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: BigIntFieldUpdateOperationsInput | bigint | number
    high?: BigIntFieldUpdateOperationsInput | bigint | number
    low?: BigIntFieldUpdateOperationsInput | bigint | number
    close?: BigIntFieldUpdateOperationsInput | bigint | number
    volume?: BigIntFieldUpdateOperationsInput | bigint | number
    tradeCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KlineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    interval?: EnumKlineIntervalFieldUpdateOperationsInput | $Enums.KlineInterval
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: BigIntFieldUpdateOperationsInput | bigint | number
    high?: BigIntFieldUpdateOperationsInput | bigint | number
    low?: BigIntFieldUpdateOperationsInput | bigint | number
    close?: BigIntFieldUpdateOperationsInput | bigint | number
    volume?: BigIntFieldUpdateOperationsInput | bigint | number
    tradeCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KlineCreateManyInput = {
    id?: string
    market: string
    interval: $Enums.KlineInterval
    openTime: Date | string
    closeTime: Date | string
    open: bigint | number
    high: bigint | number
    low: bigint | number
    close: bigint | number
    volume: bigint | number
    tradeCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KlineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    interval?: EnumKlineIntervalFieldUpdateOperationsInput | $Enums.KlineInterval
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: BigIntFieldUpdateOperationsInput | bigint | number
    high?: BigIntFieldUpdateOperationsInput | bigint | number
    low?: BigIntFieldUpdateOperationsInput | bigint | number
    close?: BigIntFieldUpdateOperationsInput | bigint | number
    volume?: BigIntFieldUpdateOperationsInput | bigint | number
    tradeCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KlineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    interval?: EnumKlineIntervalFieldUpdateOperationsInput | $Enums.KlineInterval
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    closeTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: BigIntFieldUpdateOperationsInput | bigint | number
    high?: BigIntFieldUpdateOperationsInput | bigint | number
    low?: BigIntFieldUpdateOperationsInput | bigint | number
    close?: BigIntFieldUpdateOperationsInput | bigint | number
    volume?: BigIntFieldUpdateOperationsInput | bigint | number
    tradeCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TradingBalanceNullableScalarRelationFilter = {
    is?: TradingBalanceWhereInput | null
    isNot?: TradingBalanceWhereInput | null
  }

  export type OrderListRelationFilter = {
    every?: OrderWhereInput
    some?: OrderWhereInput
    none?: OrderWhereInput
  }

  export type BalanceTransferListRelationFilter = {
    every?: BalanceTransferWhereInput
    some?: BalanceTransferWhereInput
    none?: BalanceTransferWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BalanceTransferOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    vaultlyUserId?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    welcomeBonusCredited?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    vaultlyUserId?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    welcomeBonusCredited?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    vaultlyUserId?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    welcomeBonusCredited?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type TradingBalanceCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    available?: SortOrder
    locked?: SortOrder
    updatedAt?: SortOrder
  }

  export type TradingBalanceAvgOrderByAggregateInput = {
    available?: SortOrder
    locked?: SortOrder
  }

  export type TradingBalanceMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    available?: SortOrder
    locked?: SortOrder
    updatedAt?: SortOrder
  }

  export type TradingBalanceMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    available?: SortOrder
    locked?: SortOrder
    updatedAt?: SortOrder
  }

  export type TradingBalanceSumOrderByAggregateInput = {
    available?: SortOrder
    locked?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type EnumOrderSideFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderSide | EnumOrderSideFieldRefInput<$PrismaModel>
    in?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderSideFilter<$PrismaModel> | $Enums.OrderSide
  }

  export type EnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type TradeListRelationFilter = {
    every?: TradeWhereInput
    some?: TradeWhereInput
    none?: TradeWhereInput
  }

  export type TradeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    market?: SortOrder
    side?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    filledQty?: SortOrder
    status?: SortOrder
    lockedAmount?: SortOrder
    commandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    price?: SortOrder
    qty?: SortOrder
    filledQty?: SortOrder
    lockedAmount?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    market?: SortOrder
    side?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    filledQty?: SortOrder
    status?: SortOrder
    lockedAmount?: SortOrder
    commandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    market?: SortOrder
    side?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    filledQty?: SortOrder
    status?: SortOrder
    lockedAmount?: SortOrder
    commandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    price?: SortOrder
    qty?: SortOrder
    filledQty?: SortOrder
    lockedAmount?: SortOrder
  }

  export type EnumOrderSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderSide | EnumOrderSideFieldRefInput<$PrismaModel>
    in?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderSideWithAggregatesFilter<$PrismaModel> | $Enums.OrderSide
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderSideFilter<$PrismaModel>
    _max?: NestedEnumOrderSideFilter<$PrismaModel>
  }

  export type EnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type OrderScalarRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type TradeMakerOrderIdTakerOrderIdCompoundUniqueInput = {
    makerOrderId: string
    takerOrderId: string
  }

  export type TradeCountOrderByAggregateInput = {
    id?: SortOrder
    market?: SortOrder
    makerOrderId?: SortOrder
    takerOrderId?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    takerSide?: SortOrder
    executedAt?: SortOrder
  }

  export type TradeAvgOrderByAggregateInput = {
    price?: SortOrder
    qty?: SortOrder
  }

  export type TradeMaxOrderByAggregateInput = {
    id?: SortOrder
    market?: SortOrder
    makerOrderId?: SortOrder
    takerOrderId?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    takerSide?: SortOrder
    executedAt?: SortOrder
  }

  export type TradeMinOrderByAggregateInput = {
    id?: SortOrder
    market?: SortOrder
    makerOrderId?: SortOrder
    takerOrderId?: SortOrder
    price?: SortOrder
    qty?: SortOrder
    takerSide?: SortOrder
    executedAt?: SortOrder
  }

  export type TradeSumOrderByAggregateInput = {
    price?: SortOrder
    qty?: SortOrder
  }

  export type EnumTransferDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferDirection | EnumTransferDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferDirectionFilter<$PrismaModel> | $Enums.TransferDirection
  }

  export type EnumTransferStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferStatus | EnumTransferStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferStatusFilter<$PrismaModel> | $Enums.TransferStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BalanceTransferCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    direction?: SortOrder
    amountInPaise?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    vaultlyRef?: SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type BalanceTransferAvgOrderByAggregateInput = {
    amountInPaise?: SortOrder
  }

  export type BalanceTransferMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    direction?: SortOrder
    amountInPaise?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    vaultlyRef?: SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type BalanceTransferMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    direction?: SortOrder
    amountInPaise?: SortOrder
    status?: SortOrder
    idempotencyKey?: SortOrder
    vaultlyRef?: SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type BalanceTransferSumOrderByAggregateInput = {
    amountInPaise?: SortOrder
  }

  export type EnumTransferDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferDirection | EnumTransferDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferDirectionWithAggregatesFilter<$PrismaModel> | $Enums.TransferDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransferDirectionFilter<$PrismaModel>
    _max?: NestedEnumTransferDirectionFilter<$PrismaModel>
  }

  export type EnumTransferStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferStatus | EnumTransferStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferStatusWithAggregatesFilter<$PrismaModel> | $Enums.TransferStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransferStatusFilter<$PrismaModel>
    _max?: NestedEnumTransferStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumKlineIntervalFilter<$PrismaModel = never> = {
    equals?: $Enums.KlineInterval | EnumKlineIntervalFieldRefInput<$PrismaModel>
    in?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    notIn?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    not?: NestedEnumKlineIntervalFilter<$PrismaModel> | $Enums.KlineInterval
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type KlineMarketIntervalOpenTimeCompoundUniqueInput = {
    market: string
    interval: $Enums.KlineInterval
    openTime: Date | string
  }

  export type KlineCountOrderByAggregateInput = {
    id?: SortOrder
    market?: SortOrder
    interval?: SortOrder
    openTime?: SortOrder
    closeTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    tradeCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KlineAvgOrderByAggregateInput = {
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    tradeCount?: SortOrder
  }

  export type KlineMaxOrderByAggregateInput = {
    id?: SortOrder
    market?: SortOrder
    interval?: SortOrder
    openTime?: SortOrder
    closeTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    tradeCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KlineMinOrderByAggregateInput = {
    id?: SortOrder
    market?: SortOrder
    interval?: SortOrder
    openTime?: SortOrder
    closeTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    tradeCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KlineSumOrderByAggregateInput = {
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    tradeCount?: SortOrder
  }

  export type EnumKlineIntervalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KlineInterval | EnumKlineIntervalFieldRefInput<$PrismaModel>
    in?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    notIn?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    not?: NestedEnumKlineIntervalWithAggregatesFilter<$PrismaModel> | $Enums.KlineInterval
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumKlineIntervalFilter<$PrismaModel>
    _max?: NestedEnumKlineIntervalFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type TradingBalanceCreateNestedOneWithoutUserInput = {
    create?: XOR<TradingBalanceCreateWithoutUserInput, TradingBalanceUncheckedCreateWithoutUserInput>
    connectOrCreate?: TradingBalanceCreateOrConnectWithoutUserInput
    connect?: TradingBalanceWhereUniqueInput
  }

  export type OrderCreateNestedManyWithoutUserInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type BalanceTransferCreateNestedManyWithoutUserInput = {
    create?: XOR<BalanceTransferCreateWithoutUserInput, BalanceTransferUncheckedCreateWithoutUserInput> | BalanceTransferCreateWithoutUserInput[] | BalanceTransferUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BalanceTransferCreateOrConnectWithoutUserInput | BalanceTransferCreateOrConnectWithoutUserInput[]
    createMany?: BalanceTransferCreateManyUserInputEnvelope
    connect?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
  }

  export type TradingBalanceUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<TradingBalanceCreateWithoutUserInput, TradingBalanceUncheckedCreateWithoutUserInput>
    connectOrCreate?: TradingBalanceCreateOrConnectWithoutUserInput
    connect?: TradingBalanceWhereUniqueInput
  }

  export type OrderUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type BalanceTransferUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<BalanceTransferCreateWithoutUserInput, BalanceTransferUncheckedCreateWithoutUserInput> | BalanceTransferCreateWithoutUserInput[] | BalanceTransferUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BalanceTransferCreateOrConnectWithoutUserInput | BalanceTransferCreateOrConnectWithoutUserInput[]
    createMany?: BalanceTransferCreateManyUserInputEnvelope
    connect?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TradingBalanceUpdateOneWithoutUserNestedInput = {
    create?: XOR<TradingBalanceCreateWithoutUserInput, TradingBalanceUncheckedCreateWithoutUserInput>
    connectOrCreate?: TradingBalanceCreateOrConnectWithoutUserInput
    upsert?: TradingBalanceUpsertWithoutUserInput
    disconnect?: TradingBalanceWhereInput | boolean
    delete?: TradingBalanceWhereInput | boolean
    connect?: TradingBalanceWhereUniqueInput
    update?: XOR<XOR<TradingBalanceUpdateToOneWithWhereWithoutUserInput, TradingBalanceUpdateWithoutUserInput>, TradingBalanceUncheckedUpdateWithoutUserInput>
  }

  export type OrderUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUserInput | OrderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUserInput | OrderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUserInput | OrderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type BalanceTransferUpdateManyWithoutUserNestedInput = {
    create?: XOR<BalanceTransferCreateWithoutUserInput, BalanceTransferUncheckedCreateWithoutUserInput> | BalanceTransferCreateWithoutUserInput[] | BalanceTransferUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BalanceTransferCreateOrConnectWithoutUserInput | BalanceTransferCreateOrConnectWithoutUserInput[]
    upsert?: BalanceTransferUpsertWithWhereUniqueWithoutUserInput | BalanceTransferUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BalanceTransferCreateManyUserInputEnvelope
    set?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    disconnect?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    delete?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    connect?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    update?: BalanceTransferUpdateWithWhereUniqueWithoutUserInput | BalanceTransferUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BalanceTransferUpdateManyWithWhereWithoutUserInput | BalanceTransferUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BalanceTransferScalarWhereInput | BalanceTransferScalarWhereInput[]
  }

  export type TradingBalanceUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<TradingBalanceCreateWithoutUserInput, TradingBalanceUncheckedCreateWithoutUserInput>
    connectOrCreate?: TradingBalanceCreateOrConnectWithoutUserInput
    upsert?: TradingBalanceUpsertWithoutUserInput
    disconnect?: TradingBalanceWhereInput | boolean
    delete?: TradingBalanceWhereInput | boolean
    connect?: TradingBalanceWhereUniqueInput
    update?: XOR<XOR<TradingBalanceUpdateToOneWithWhereWithoutUserInput, TradingBalanceUpdateWithoutUserInput>, TradingBalanceUncheckedUpdateWithoutUserInput>
  }

  export type OrderUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUserInput | OrderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUserInput | OrderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUserInput | OrderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type BalanceTransferUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<BalanceTransferCreateWithoutUserInput, BalanceTransferUncheckedCreateWithoutUserInput> | BalanceTransferCreateWithoutUserInput[] | BalanceTransferUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BalanceTransferCreateOrConnectWithoutUserInput | BalanceTransferCreateOrConnectWithoutUserInput[]
    upsert?: BalanceTransferUpsertWithWhereUniqueWithoutUserInput | BalanceTransferUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BalanceTransferCreateManyUserInputEnvelope
    set?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    disconnect?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    delete?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    connect?: BalanceTransferWhereUniqueInput | BalanceTransferWhereUniqueInput[]
    update?: BalanceTransferUpdateWithWhereUniqueWithoutUserInput | BalanceTransferUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BalanceTransferUpdateManyWithWhereWithoutUserInput | BalanceTransferUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BalanceTransferScalarWhereInput | BalanceTransferScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutTradingBalanceInput = {
    create?: XOR<UserCreateWithoutTradingBalanceInput, UserUncheckedCreateWithoutTradingBalanceInput>
    connectOrCreate?: UserCreateOrConnectWithoutTradingBalanceInput
    connect?: UserWhereUniqueInput
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type UserUpdateOneRequiredWithoutTradingBalanceNestedInput = {
    create?: XOR<UserCreateWithoutTradingBalanceInput, UserUncheckedCreateWithoutTradingBalanceInput>
    connectOrCreate?: UserCreateOrConnectWithoutTradingBalanceInput
    upsert?: UserUpsertWithoutTradingBalanceInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTradingBalanceInput, UserUpdateWithoutTradingBalanceInput>, UserUncheckedUpdateWithoutTradingBalanceInput>
  }

  export type UserCreateNestedOneWithoutOrdersInput = {
    create?: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput
    connect?: UserWhereUniqueInput
  }

  export type TradeCreateNestedManyWithoutMakerOrderInput = {
    create?: XOR<TradeCreateWithoutMakerOrderInput, TradeUncheckedCreateWithoutMakerOrderInput> | TradeCreateWithoutMakerOrderInput[] | TradeUncheckedCreateWithoutMakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMakerOrderInput | TradeCreateOrConnectWithoutMakerOrderInput[]
    createMany?: TradeCreateManyMakerOrderInputEnvelope
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
  }

  export type TradeCreateNestedManyWithoutTakerOrderInput = {
    create?: XOR<TradeCreateWithoutTakerOrderInput, TradeUncheckedCreateWithoutTakerOrderInput> | TradeCreateWithoutTakerOrderInput[] | TradeUncheckedCreateWithoutTakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutTakerOrderInput | TradeCreateOrConnectWithoutTakerOrderInput[]
    createMany?: TradeCreateManyTakerOrderInputEnvelope
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
  }

  export type TradeUncheckedCreateNestedManyWithoutMakerOrderInput = {
    create?: XOR<TradeCreateWithoutMakerOrderInput, TradeUncheckedCreateWithoutMakerOrderInput> | TradeCreateWithoutMakerOrderInput[] | TradeUncheckedCreateWithoutMakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMakerOrderInput | TradeCreateOrConnectWithoutMakerOrderInput[]
    createMany?: TradeCreateManyMakerOrderInputEnvelope
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
  }

  export type TradeUncheckedCreateNestedManyWithoutTakerOrderInput = {
    create?: XOR<TradeCreateWithoutTakerOrderInput, TradeUncheckedCreateWithoutTakerOrderInput> | TradeCreateWithoutTakerOrderInput[] | TradeUncheckedCreateWithoutTakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutTakerOrderInput | TradeCreateOrConnectWithoutTakerOrderInput[]
    createMany?: TradeCreateManyTakerOrderInputEnvelope
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
  }

  export type EnumOrderSideFieldUpdateOperationsInput = {
    set?: $Enums.OrderSide
  }

  export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus
  }

  export type UserUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput
    upsert?: UserUpsertWithoutOrdersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOrdersInput, UserUpdateWithoutOrdersInput>, UserUncheckedUpdateWithoutOrdersInput>
  }

  export type TradeUpdateManyWithoutMakerOrderNestedInput = {
    create?: XOR<TradeCreateWithoutMakerOrderInput, TradeUncheckedCreateWithoutMakerOrderInput> | TradeCreateWithoutMakerOrderInput[] | TradeUncheckedCreateWithoutMakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMakerOrderInput | TradeCreateOrConnectWithoutMakerOrderInput[]
    upsert?: TradeUpsertWithWhereUniqueWithoutMakerOrderInput | TradeUpsertWithWhereUniqueWithoutMakerOrderInput[]
    createMany?: TradeCreateManyMakerOrderInputEnvelope
    set?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    disconnect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    delete?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    update?: TradeUpdateWithWhereUniqueWithoutMakerOrderInput | TradeUpdateWithWhereUniqueWithoutMakerOrderInput[]
    updateMany?: TradeUpdateManyWithWhereWithoutMakerOrderInput | TradeUpdateManyWithWhereWithoutMakerOrderInput[]
    deleteMany?: TradeScalarWhereInput | TradeScalarWhereInput[]
  }

  export type TradeUpdateManyWithoutTakerOrderNestedInput = {
    create?: XOR<TradeCreateWithoutTakerOrderInput, TradeUncheckedCreateWithoutTakerOrderInput> | TradeCreateWithoutTakerOrderInput[] | TradeUncheckedCreateWithoutTakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutTakerOrderInput | TradeCreateOrConnectWithoutTakerOrderInput[]
    upsert?: TradeUpsertWithWhereUniqueWithoutTakerOrderInput | TradeUpsertWithWhereUniqueWithoutTakerOrderInput[]
    createMany?: TradeCreateManyTakerOrderInputEnvelope
    set?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    disconnect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    delete?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    update?: TradeUpdateWithWhereUniqueWithoutTakerOrderInput | TradeUpdateWithWhereUniqueWithoutTakerOrderInput[]
    updateMany?: TradeUpdateManyWithWhereWithoutTakerOrderInput | TradeUpdateManyWithWhereWithoutTakerOrderInput[]
    deleteMany?: TradeScalarWhereInput | TradeScalarWhereInput[]
  }

  export type TradeUncheckedUpdateManyWithoutMakerOrderNestedInput = {
    create?: XOR<TradeCreateWithoutMakerOrderInput, TradeUncheckedCreateWithoutMakerOrderInput> | TradeCreateWithoutMakerOrderInput[] | TradeUncheckedCreateWithoutMakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMakerOrderInput | TradeCreateOrConnectWithoutMakerOrderInput[]
    upsert?: TradeUpsertWithWhereUniqueWithoutMakerOrderInput | TradeUpsertWithWhereUniqueWithoutMakerOrderInput[]
    createMany?: TradeCreateManyMakerOrderInputEnvelope
    set?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    disconnect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    delete?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    update?: TradeUpdateWithWhereUniqueWithoutMakerOrderInput | TradeUpdateWithWhereUniqueWithoutMakerOrderInput[]
    updateMany?: TradeUpdateManyWithWhereWithoutMakerOrderInput | TradeUpdateManyWithWhereWithoutMakerOrderInput[]
    deleteMany?: TradeScalarWhereInput | TradeScalarWhereInput[]
  }

  export type TradeUncheckedUpdateManyWithoutTakerOrderNestedInput = {
    create?: XOR<TradeCreateWithoutTakerOrderInput, TradeUncheckedCreateWithoutTakerOrderInput> | TradeCreateWithoutTakerOrderInput[] | TradeUncheckedCreateWithoutTakerOrderInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutTakerOrderInput | TradeCreateOrConnectWithoutTakerOrderInput[]
    upsert?: TradeUpsertWithWhereUniqueWithoutTakerOrderInput | TradeUpsertWithWhereUniqueWithoutTakerOrderInput[]
    createMany?: TradeCreateManyTakerOrderInputEnvelope
    set?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    disconnect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    delete?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    update?: TradeUpdateWithWhereUniqueWithoutTakerOrderInput | TradeUpdateWithWhereUniqueWithoutTakerOrderInput[]
    updateMany?: TradeUpdateManyWithWhereWithoutTakerOrderInput | TradeUpdateManyWithWhereWithoutTakerOrderInput[]
    deleteMany?: TradeScalarWhereInput | TradeScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutTradesInput = {
    create?: XOR<OrderCreateWithoutTradesInput, OrderUncheckedCreateWithoutTradesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutTradesInput
    connect?: OrderWhereUniqueInput
  }

  export type OrderCreateNestedOneWithoutTakerTradesInput = {
    create?: XOR<OrderCreateWithoutTakerTradesInput, OrderUncheckedCreateWithoutTakerTradesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutTakerTradesInput
    connect?: OrderWhereUniqueInput
  }

  export type OrderUpdateOneRequiredWithoutTradesNestedInput = {
    create?: XOR<OrderCreateWithoutTradesInput, OrderUncheckedCreateWithoutTradesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutTradesInput
    upsert?: OrderUpsertWithoutTradesInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutTradesInput, OrderUpdateWithoutTradesInput>, OrderUncheckedUpdateWithoutTradesInput>
  }

  export type OrderUpdateOneRequiredWithoutTakerTradesNestedInput = {
    create?: XOR<OrderCreateWithoutTakerTradesInput, OrderUncheckedCreateWithoutTakerTradesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutTakerTradesInput
    upsert?: OrderUpsertWithoutTakerTradesInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutTakerTradesInput, OrderUpdateWithoutTakerTradesInput>, OrderUncheckedUpdateWithoutTakerTradesInput>
  }

  export type UserCreateNestedOneWithoutTransfersInput = {
    create?: XOR<UserCreateWithoutTransfersInput, UserUncheckedCreateWithoutTransfersInput>
    connectOrCreate?: UserCreateOrConnectWithoutTransfersInput
    connect?: UserWhereUniqueInput
  }

  export type EnumTransferDirectionFieldUpdateOperationsInput = {
    set?: $Enums.TransferDirection
  }

  export type EnumTransferStatusFieldUpdateOperationsInput = {
    set?: $Enums.TransferStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutTransfersNestedInput = {
    create?: XOR<UserCreateWithoutTransfersInput, UserUncheckedCreateWithoutTransfersInput>
    connectOrCreate?: UserCreateOrConnectWithoutTransfersInput
    upsert?: UserUpsertWithoutTransfersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTransfersInput, UserUpdateWithoutTransfersInput>, UserUncheckedUpdateWithoutTransfersInput>
  }

  export type EnumKlineIntervalFieldUpdateOperationsInput = {
    set?: $Enums.KlineInterval
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumOrderSideFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderSide | EnumOrderSideFieldRefInput<$PrismaModel>
    in?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderSideFilter<$PrismaModel> | $Enums.OrderSide
  }

  export type NestedEnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type NestedEnumOrderSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderSide | EnumOrderSideFieldRefInput<$PrismaModel>
    in?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderSide[] | ListEnumOrderSideFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderSideWithAggregatesFilter<$PrismaModel> | $Enums.OrderSide
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderSideFilter<$PrismaModel>
    _max?: NestedEnumOrderSideFilter<$PrismaModel>
  }

  export type NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type NestedEnumTransferDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferDirection | EnumTransferDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferDirectionFilter<$PrismaModel> | $Enums.TransferDirection
  }

  export type NestedEnumTransferStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferStatus | EnumTransferStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferStatusFilter<$PrismaModel> | $Enums.TransferStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumTransferDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferDirection | EnumTransferDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferDirection[] | ListEnumTransferDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferDirectionWithAggregatesFilter<$PrismaModel> | $Enums.TransferDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransferDirectionFilter<$PrismaModel>
    _max?: NestedEnumTransferDirectionFilter<$PrismaModel>
  }

  export type NestedEnumTransferStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransferStatus | EnumTransferStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransferStatus[] | ListEnumTransferStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTransferStatusWithAggregatesFilter<$PrismaModel> | $Enums.TransferStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransferStatusFilter<$PrismaModel>
    _max?: NestedEnumTransferStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumKlineIntervalFilter<$PrismaModel = never> = {
    equals?: $Enums.KlineInterval | EnumKlineIntervalFieldRefInput<$PrismaModel>
    in?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    notIn?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    not?: NestedEnumKlineIntervalFilter<$PrismaModel> | $Enums.KlineInterval
  }

  export type NestedEnumKlineIntervalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KlineInterval | EnumKlineIntervalFieldRefInput<$PrismaModel>
    in?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    notIn?: $Enums.KlineInterval[] | ListEnumKlineIntervalFieldRefInput<$PrismaModel>
    not?: NestedEnumKlineIntervalWithAggregatesFilter<$PrismaModel> | $Enums.KlineInterval
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumKlineIntervalFilter<$PrismaModel>
    _max?: NestedEnumKlineIntervalFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type TradingBalanceCreateWithoutUserInput = {
    id?: string
    available?: bigint | number
    locked?: bigint | number
    updatedAt?: Date | string
  }

  export type TradingBalanceUncheckedCreateWithoutUserInput = {
    id?: string
    available?: bigint | number
    locked?: bigint | number
    updatedAt?: Date | string
  }

  export type TradingBalanceCreateOrConnectWithoutUserInput = {
    where: TradingBalanceWhereUniqueInput
    create: XOR<TradingBalanceCreateWithoutUserInput, TradingBalanceUncheckedCreateWithoutUserInput>
  }

  export type OrderCreateWithoutUserInput = {
    id: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trades?: TradeCreateNestedManyWithoutMakerOrderInput
    takerTrades?: TradeCreateNestedManyWithoutTakerOrderInput
  }

  export type OrderUncheckedCreateWithoutUserInput = {
    id: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trades?: TradeUncheckedCreateNestedManyWithoutMakerOrderInput
    takerTrades?: TradeUncheckedCreateNestedManyWithoutTakerOrderInput
  }

  export type OrderCreateOrConnectWithoutUserInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
  }

  export type OrderCreateManyUserInputEnvelope = {
    data: OrderCreateManyUserInput | OrderCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type BalanceTransferCreateWithoutUserInput = {
    id?: string
    direction: $Enums.TransferDirection
    amountInPaise: bigint | number
    status?: $Enums.TransferStatus
    idempotencyKey: string
    vaultlyRef?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BalanceTransferUncheckedCreateWithoutUserInput = {
    id?: string
    direction: $Enums.TransferDirection
    amountInPaise: bigint | number
    status?: $Enums.TransferStatus
    idempotencyKey: string
    vaultlyRef?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BalanceTransferCreateOrConnectWithoutUserInput = {
    where: BalanceTransferWhereUniqueInput
    create: XOR<BalanceTransferCreateWithoutUserInput, BalanceTransferUncheckedCreateWithoutUserInput>
  }

  export type BalanceTransferCreateManyUserInputEnvelope = {
    data: BalanceTransferCreateManyUserInput | BalanceTransferCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TradingBalanceUpsertWithoutUserInput = {
    update: XOR<TradingBalanceUpdateWithoutUserInput, TradingBalanceUncheckedUpdateWithoutUserInput>
    create: XOR<TradingBalanceCreateWithoutUserInput, TradingBalanceUncheckedCreateWithoutUserInput>
    where?: TradingBalanceWhereInput
  }

  export type TradingBalanceUpdateToOneWithWhereWithoutUserInput = {
    where?: TradingBalanceWhereInput
    data: XOR<TradingBalanceUpdateWithoutUserInput, TradingBalanceUncheckedUpdateWithoutUserInput>
  }

  export type TradingBalanceUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    available?: BigIntFieldUpdateOperationsInput | bigint | number
    locked?: BigIntFieldUpdateOperationsInput | bigint | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradingBalanceUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    available?: BigIntFieldUpdateOperationsInput | bigint | number
    locked?: BigIntFieldUpdateOperationsInput | bigint | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUpsertWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutUserInput, OrderUncheckedUpdateWithoutUserInput>
    create: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutUserInput, OrderUncheckedUpdateWithoutUserInput>
  }

  export type OrderUpdateManyWithWhereWithoutUserInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutUserInput>
  }

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[]
    OR?: OrderScalarWhereInput[]
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[]
    id?: StringFilter<"Order"> | string
    userId?: StringFilter<"Order"> | string
    market?: StringFilter<"Order"> | string
    side?: EnumOrderSideFilter<"Order"> | $Enums.OrderSide
    price?: BigIntFilter<"Order"> | bigint | number
    qty?: BigIntFilter<"Order"> | bigint | number
    filledQty?: BigIntFilter<"Order"> | bigint | number
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    lockedAmount?: BigIntFilter<"Order"> | bigint | number
    commandId?: StringFilter<"Order"> | string
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
  }

  export type BalanceTransferUpsertWithWhereUniqueWithoutUserInput = {
    where: BalanceTransferWhereUniqueInput
    update: XOR<BalanceTransferUpdateWithoutUserInput, BalanceTransferUncheckedUpdateWithoutUserInput>
    create: XOR<BalanceTransferCreateWithoutUserInput, BalanceTransferUncheckedCreateWithoutUserInput>
  }

  export type BalanceTransferUpdateWithWhereUniqueWithoutUserInput = {
    where: BalanceTransferWhereUniqueInput
    data: XOR<BalanceTransferUpdateWithoutUserInput, BalanceTransferUncheckedUpdateWithoutUserInput>
  }

  export type BalanceTransferUpdateManyWithWhereWithoutUserInput = {
    where: BalanceTransferScalarWhereInput
    data: XOR<BalanceTransferUpdateManyMutationInput, BalanceTransferUncheckedUpdateManyWithoutUserInput>
  }

  export type BalanceTransferScalarWhereInput = {
    AND?: BalanceTransferScalarWhereInput | BalanceTransferScalarWhereInput[]
    OR?: BalanceTransferScalarWhereInput[]
    NOT?: BalanceTransferScalarWhereInput | BalanceTransferScalarWhereInput[]
    id?: StringFilter<"BalanceTransfer"> | string
    userId?: StringFilter<"BalanceTransfer"> | string
    direction?: EnumTransferDirectionFilter<"BalanceTransfer"> | $Enums.TransferDirection
    amountInPaise?: BigIntFilter<"BalanceTransfer"> | bigint | number
    status?: EnumTransferStatusFilter<"BalanceTransfer"> | $Enums.TransferStatus
    idempotencyKey?: StringFilter<"BalanceTransfer"> | string
    vaultlyRef?: StringNullableFilter<"BalanceTransfer"> | string | null
    createdAt?: DateTimeFilter<"BalanceTransfer"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"BalanceTransfer"> | Date | string | null
  }

  export type UserCreateWithoutTradingBalanceInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    orders?: OrderCreateNestedManyWithoutUserInput
    transfers?: BalanceTransferCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTradingBalanceInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    orders?: OrderUncheckedCreateNestedManyWithoutUserInput
    transfers?: BalanceTransferUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTradingBalanceInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTradingBalanceInput, UserUncheckedCreateWithoutTradingBalanceInput>
  }

  export type UserUpsertWithoutTradingBalanceInput = {
    update: XOR<UserUpdateWithoutTradingBalanceInput, UserUncheckedUpdateWithoutTradingBalanceInput>
    create: XOR<UserCreateWithoutTradingBalanceInput, UserUncheckedCreateWithoutTradingBalanceInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTradingBalanceInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTradingBalanceInput, UserUncheckedUpdateWithoutTradingBalanceInput>
  }

  export type UserUpdateWithoutTradingBalanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    orders?: OrderUpdateManyWithoutUserNestedInput
    transfers?: BalanceTransferUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTradingBalanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    orders?: OrderUncheckedUpdateManyWithoutUserNestedInput
    transfers?: BalanceTransferUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutOrdersInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    tradingBalance?: TradingBalanceCreateNestedOneWithoutUserInput
    transfers?: BalanceTransferCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOrdersInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    tradingBalance?: TradingBalanceUncheckedCreateNestedOneWithoutUserInput
    transfers?: BalanceTransferUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOrdersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
  }

  export type TradeCreateWithoutMakerOrderInput = {
    id?: string
    market: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
    takerOrder: OrderCreateNestedOneWithoutTakerTradesInput
  }

  export type TradeUncheckedCreateWithoutMakerOrderInput = {
    id?: string
    market: string
    takerOrderId: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
  }

  export type TradeCreateOrConnectWithoutMakerOrderInput = {
    where: TradeWhereUniqueInput
    create: XOR<TradeCreateWithoutMakerOrderInput, TradeUncheckedCreateWithoutMakerOrderInput>
  }

  export type TradeCreateManyMakerOrderInputEnvelope = {
    data: TradeCreateManyMakerOrderInput | TradeCreateManyMakerOrderInput[]
    skipDuplicates?: boolean
  }

  export type TradeCreateWithoutTakerOrderInput = {
    id?: string
    market: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
    makerOrder: OrderCreateNestedOneWithoutTradesInput
  }

  export type TradeUncheckedCreateWithoutTakerOrderInput = {
    id?: string
    market: string
    makerOrderId: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
  }

  export type TradeCreateOrConnectWithoutTakerOrderInput = {
    where: TradeWhereUniqueInput
    create: XOR<TradeCreateWithoutTakerOrderInput, TradeUncheckedCreateWithoutTakerOrderInput>
  }

  export type TradeCreateManyTakerOrderInputEnvelope = {
    data: TradeCreateManyTakerOrderInput | TradeCreateManyTakerOrderInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutOrdersInput = {
    update: XOR<UserUpdateWithoutOrdersInput, UserUncheckedUpdateWithoutOrdersInput>
    create: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOrdersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOrdersInput, UserUncheckedUpdateWithoutOrdersInput>
  }

  export type UserUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    tradingBalance?: TradingBalanceUpdateOneWithoutUserNestedInput
    transfers?: BalanceTransferUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    tradingBalance?: TradingBalanceUncheckedUpdateOneWithoutUserNestedInput
    transfers?: BalanceTransferUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TradeUpsertWithWhereUniqueWithoutMakerOrderInput = {
    where: TradeWhereUniqueInput
    update: XOR<TradeUpdateWithoutMakerOrderInput, TradeUncheckedUpdateWithoutMakerOrderInput>
    create: XOR<TradeCreateWithoutMakerOrderInput, TradeUncheckedCreateWithoutMakerOrderInput>
  }

  export type TradeUpdateWithWhereUniqueWithoutMakerOrderInput = {
    where: TradeWhereUniqueInput
    data: XOR<TradeUpdateWithoutMakerOrderInput, TradeUncheckedUpdateWithoutMakerOrderInput>
  }

  export type TradeUpdateManyWithWhereWithoutMakerOrderInput = {
    where: TradeScalarWhereInput
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyWithoutMakerOrderInput>
  }

  export type TradeScalarWhereInput = {
    AND?: TradeScalarWhereInput | TradeScalarWhereInput[]
    OR?: TradeScalarWhereInput[]
    NOT?: TradeScalarWhereInput | TradeScalarWhereInput[]
    id?: StringFilter<"Trade"> | string
    market?: StringFilter<"Trade"> | string
    makerOrderId?: StringFilter<"Trade"> | string
    takerOrderId?: StringFilter<"Trade"> | string
    price?: BigIntFilter<"Trade"> | bigint | number
    qty?: BigIntFilter<"Trade"> | bigint | number
    takerSide?: EnumOrderSideFilter<"Trade"> | $Enums.OrderSide
    executedAt?: DateTimeFilter<"Trade"> | Date | string
  }

  export type TradeUpsertWithWhereUniqueWithoutTakerOrderInput = {
    where: TradeWhereUniqueInput
    update: XOR<TradeUpdateWithoutTakerOrderInput, TradeUncheckedUpdateWithoutTakerOrderInput>
    create: XOR<TradeCreateWithoutTakerOrderInput, TradeUncheckedCreateWithoutTakerOrderInput>
  }

  export type TradeUpdateWithWhereUniqueWithoutTakerOrderInput = {
    where: TradeWhereUniqueInput
    data: XOR<TradeUpdateWithoutTakerOrderInput, TradeUncheckedUpdateWithoutTakerOrderInput>
  }

  export type TradeUpdateManyWithWhereWithoutTakerOrderInput = {
    where: TradeScalarWhereInput
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyWithoutTakerOrderInput>
  }

  export type OrderCreateWithoutTradesInput = {
    id: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutOrdersInput
    takerTrades?: TradeCreateNestedManyWithoutTakerOrderInput
  }

  export type OrderUncheckedCreateWithoutTradesInput = {
    id: string
    userId: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    takerTrades?: TradeUncheckedCreateNestedManyWithoutTakerOrderInput
  }

  export type OrderCreateOrConnectWithoutTradesInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutTradesInput, OrderUncheckedCreateWithoutTradesInput>
  }

  export type OrderCreateWithoutTakerTradesInput = {
    id: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutOrdersInput
    trades?: TradeCreateNestedManyWithoutMakerOrderInput
  }

  export type OrderUncheckedCreateWithoutTakerTradesInput = {
    id: string
    userId: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trades?: TradeUncheckedCreateNestedManyWithoutMakerOrderInput
  }

  export type OrderCreateOrConnectWithoutTakerTradesInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutTakerTradesInput, OrderUncheckedCreateWithoutTakerTradesInput>
  }

  export type OrderUpsertWithoutTradesInput = {
    update: XOR<OrderUpdateWithoutTradesInput, OrderUncheckedUpdateWithoutTradesInput>
    create: XOR<OrderCreateWithoutTradesInput, OrderUncheckedCreateWithoutTradesInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutTradesInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutTradesInput, OrderUncheckedUpdateWithoutTradesInput>
  }

  export type OrderUpdateWithoutTradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    takerTrades?: TradeUpdateManyWithoutTakerOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutTradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    takerTrades?: TradeUncheckedUpdateManyWithoutTakerOrderNestedInput
  }

  export type OrderUpsertWithoutTakerTradesInput = {
    update: XOR<OrderUpdateWithoutTakerTradesInput, OrderUncheckedUpdateWithoutTakerTradesInput>
    create: XOR<OrderCreateWithoutTakerTradesInput, OrderUncheckedCreateWithoutTakerTradesInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutTakerTradesInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutTakerTradesInput, OrderUncheckedUpdateWithoutTakerTradesInput>
  }

  export type OrderUpdateWithoutTakerTradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput
    trades?: TradeUpdateManyWithoutMakerOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutTakerTradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trades?: TradeUncheckedUpdateManyWithoutMakerOrderNestedInput
  }

  export type UserCreateWithoutTransfersInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    tradingBalance?: TradingBalanceCreateNestedOneWithoutUserInput
    orders?: OrderCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTransfersInput = {
    id?: string
    vaultlyUserId: string
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    welcomeBonusCredited?: boolean
    tradingBalance?: TradingBalanceUncheckedCreateNestedOneWithoutUserInput
    orders?: OrderUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTransfersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTransfersInput, UserUncheckedCreateWithoutTransfersInput>
  }

  export type UserUpsertWithoutTransfersInput = {
    update: XOR<UserUpdateWithoutTransfersInput, UserUncheckedUpdateWithoutTransfersInput>
    create: XOR<UserCreateWithoutTransfersInput, UserUncheckedCreateWithoutTransfersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTransfersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTransfersInput, UserUncheckedUpdateWithoutTransfersInput>
  }

  export type UserUpdateWithoutTransfersInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    tradingBalance?: TradingBalanceUpdateOneWithoutUserNestedInput
    orders?: OrderUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTransfersInput = {
    id?: StringFieldUpdateOperationsInput | string
    vaultlyUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    welcomeBonusCredited?: BoolFieldUpdateOperationsInput | boolean
    tradingBalance?: TradingBalanceUncheckedUpdateOneWithoutUserNestedInput
    orders?: OrderUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OrderCreateManyUserInput = {
    id: string
    market: string
    side: $Enums.OrderSide
    price: bigint | number
    qty: bigint | number
    filledQty?: bigint | number
    status?: $Enums.OrderStatus
    lockedAmount: bigint | number
    commandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BalanceTransferCreateManyUserInput = {
    id?: string
    direction: $Enums.TransferDirection
    amountInPaise: bigint | number
    status?: $Enums.TransferStatus
    idempotencyKey: string
    vaultlyRef?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type OrderUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trades?: TradeUpdateManyWithoutMakerOrderNestedInput
    takerTrades?: TradeUpdateManyWithoutTakerOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trades?: TradeUncheckedUpdateManyWithoutMakerOrderNestedInput
    takerTrades?: TradeUncheckedUpdateManyWithoutTakerOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    side?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    filledQty?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    lockedAmount?: BigIntFieldUpdateOperationsInput | bigint | number
    commandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BalanceTransferUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: EnumTransferDirectionFieldUpdateOperationsInput | $Enums.TransferDirection
    amountInPaise?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTransferStatusFieldUpdateOperationsInput | $Enums.TransferStatus
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    vaultlyRef?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BalanceTransferUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: EnumTransferDirectionFieldUpdateOperationsInput | $Enums.TransferDirection
    amountInPaise?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTransferStatusFieldUpdateOperationsInput | $Enums.TransferStatus
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    vaultlyRef?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BalanceTransferUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    direction?: EnumTransferDirectionFieldUpdateOperationsInput | $Enums.TransferDirection
    amountInPaise?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTransferStatusFieldUpdateOperationsInput | $Enums.TransferStatus
    idempotencyKey?: StringFieldUpdateOperationsInput | string
    vaultlyRef?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TradeCreateManyMakerOrderInput = {
    id?: string
    market: string
    takerOrderId: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
  }

  export type TradeCreateManyTakerOrderInput = {
    id?: string
    market: string
    makerOrderId: string
    price: bigint | number
    qty: bigint | number
    takerSide: $Enums.OrderSide
    executedAt?: Date | string
  }

  export type TradeUpdateWithoutMakerOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    takerOrder?: OrderUpdateOneRequiredWithoutTakerTradesNestedInput
  }

  export type TradeUncheckedUpdateWithoutMakerOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    takerOrderId?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateManyWithoutMakerOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    takerOrderId?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUpdateWithoutTakerOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    makerOrder?: OrderUpdateOneRequiredWithoutTradesNestedInput
  }

  export type TradeUncheckedUpdateWithoutTakerOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    makerOrderId?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateManyWithoutTakerOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    market?: StringFieldUpdateOperationsInput | string
    makerOrderId?: StringFieldUpdateOperationsInput | string
    price?: BigIntFieldUpdateOperationsInput | bigint | number
    qty?: BigIntFieldUpdateOperationsInput | bigint | number
    takerSide?: EnumOrderSideFieldUpdateOperationsInput | $Enums.OrderSide
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}