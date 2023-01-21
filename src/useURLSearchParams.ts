import { z } from 'zod'

/**
 * A way to parse URLSearchParams
 * 
 * ### Usage:
 * ```
 * import { zu } from 'zod_utilz'
 * const schema = zu.useURLSearchParams(
 *     z.object( {
 *         string: z.string(),
 *         number: z.number(),
 *         boolean: z.boolean(),
 *     } )
 * )
 * 
 * zu.SPR( schema.safeParse(
 *     new URLSearchParams( {
 *         string: 'foo',
 *         number: '42',
 *         boolean: 'false',
 *     } )
 * ) ).data
 * // { string: 'foo', number: 42, boolean: false }
 * 
 * zu.SPR( schema.safeParse(
 *     new URLSearchParams( {
 *         string: '42',
 *         number: 'false',
 *         boolean: 'foo',
 *     } )
 * ) ).error?.flatten().fieldErrors
 * // {
 * //     string: [ 'Expected string, received number' ],
 * //     number: [ 'Expected number, received boolean' ],
 * //     boolean: [ 'Expected boolean, received string' ],
 * // }
 * ```
 */
export function useURLSearchParams<
    Schema extends z.ZodObject<z.ZodRawShape, z.UnknownKeysParam>
> ( schema: Schema ) {
    const { unknownKeys } = schema._def
    const keys = unknownKeys == 'strip' ? Object.keys( schema.shape ) : undefined
    return z.instanceof( URLSearchParams )
        .transform( searchParamsToValues( keys ) )
        .pipe( schema )
}

function safeParseJSON ( string: string ): any {
    try { return JSON.parse( string ) }
    catch { return string }
}

const searchParamsToValues = ( keys?: string[] ) =>
    ( searchParams: URLSearchParams ): Record<string, any> => {
        return Array.from( keys ?? searchParams.keys() ).reduce( ( record, key ) => {
            const values = searchParams.getAll( key ).map( safeParseJSON )
            return { ...record, [ key ]: values.length > 1 ? values : values[ 0 ] }
        }, {} as Record<string, any> )
    }