export default interface Respond<T> {
    data: T | T[];
    error: boolean;
    msg: string;
}
