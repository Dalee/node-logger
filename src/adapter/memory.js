/**
 * Memory adaptor, not for production use
 */
export default class Memory {

    /**
     *
     */
    constructor(messages) {
        this.messages = messages;
    }

    /**
     *
     * @param {any} args
     */
    write(...args) {
        this.messages.push(args);
    }
}
