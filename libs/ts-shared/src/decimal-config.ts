import Decimal from 'decimal.js'

export const configureDecimal = () => {
    Decimal.set({
        precision: 20,
        rounding: Decimal.ROUND_DOWN,
        toExpNeg: -9,
        toExpPos: 9,
        minE: -9,
        maxE: 9,
        modulo: Decimal.ROUND_DOWN,
        crypto: true
    })
}

export { Decimal }