import { IncomingMessage, ServerResponse } from 'http';
import * as httpAssert from 'http-assert';
import * as Cookies from 'cookies';
import { Application } from './application';
import { ContextDelegatedRequest, Request } from './request';
import { ContextDelegatedResponse, Response } from './response';

declare namespace ctx {
    export interface BaseContext extends ContextDelegatedRequest, ContextDelegatedResponse {
        /**
         * util.inspect() implementation, which
         * just returns the JSON output.
         */
        inspect(): any;

        /**
         * Return JSON representation.
         *
         * Here we explicitly invoke .toJSON() on each
         * object, as iteration will otherwise fail due
         * to the getters and cause utilities such as
         * clone() to fail.
         */
        toJSON(): any;

        /**
         * Similar to .throw(), adds assertion.
         *
         *    this.assert(this.user, 401, 'Please login!');
         *
         * See: https://github.com/jshttp/http-assert
         */
        assert: typeof httpAssert;

        /**
         * Throw an error with `msg` and optional `status`
         * defaulting to 500. Note that these are user-level
         * errors, and the message may be exposed to the client.
         *
         *    this.throw(403)
         *    this.throw('name required', 400)
         *    this.throw(400, 'name required')
         *    this.throw('something exploded')
         *    this.throw(new Error('invalid'), 400);
         *    this.throw(400, new Error('invalid'));
         *
         * See: https://github.com/jshttp/http-errors
         */
        throw(code: number): void;
        throw(message: string): void;
        throw(properties: any): void;
        throw(code: number, message: string, properties?: any): void;

        /**
         * Default error handling.
         */
        onerror(err: Error): void;
    }

    export interface Context extends BaseContext {
        app: Application;
        request: Request;
        response: Response;
        req: IncomingMessage;
        res: ServerResponse;
        originalUrl: string;
        cookies: Cookies;
        accept: any;
        state: any;
    }
}

export = ctx;
