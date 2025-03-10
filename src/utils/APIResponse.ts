import Respond from "../types/Respond.js";

export default class APIResponse<T> {
    private response: Respond<T>;

    public constructor(data: T) {
        this.response = {
            data: data,
            error: false,
            msg: "",
        };
    }

    public error(msg: string): Respond<T> {
        this.response.error = true;
        this.response.msg = msg;
        return this.response;
    }

    public success(): Respond<T> {
        return this.response;
    }
}
