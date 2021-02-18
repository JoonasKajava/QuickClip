declare global {
    interface Number {
        round: (decimals: number) => number;
    }
}