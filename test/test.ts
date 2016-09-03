/// <reference path="../out/lib/application.d.ts" />
import * as http from 'http';
import * as Url from 'url';
import test = require('blue-tape');
import Koa = require('koa');

test('simple test', t => {
    t.plan(8);

    const app = new Koa();
    const reqData = JSON.stringify({ foo: 'bar' });
    const calls: number[] = [];

    app.use(async (ctx, next) => {
        t.equal(ctx.cookies.get('hello'), 'world');

        t.equal(ctx.is('xml', 'json'), 'json');
        t.notOk(ctx.is('xml') === true);

        t.equal(ctx.accepts('xml', 'json'), 'xml');
        t.notOk(ctx.accepts('json') === true);

        await new Promise((resolve, reject) => {
            let data = '';
            ctx.req
                .on('data', chunk => data += chunk)
                .on('end', () => resolve(data))
                .on('error', err => reject(err));
        })
        .then(data => t.equal(data, reqData), reason => t.fail(reason));

        await next();
    });

    app.use(async (ctx, next) => {
        calls.push(1);
        await next();
        calls.push(6);
    });

    app.use(async (ctx, next) => {
        calls.push(2);
        await next();
        calls.push(5);
    });

    app.use(async (ctx, next) => {
        calls.push(3);
        await next();
        calls.push(4);
    });

    const server = app.listen();

    server.on('listening', () => {
        let url = `http://localhost:${server.address().port}/`;
        let opts = Url.parse(url) as http.RequestOptions;
        opts.method = 'POST';
        opts.headers = {
            Cookie: 'hello=world',
            'Content-Type': 'application/json',
            Accept: 'text/html,application/xhtml+xml,application/xml'
        };

        let req = http.request(opts, res => {
            t.equal(res.statusCode, 404);
            t.same(calls, [1, 2, 3, 4, 5, 6]);

            t.end();
            process.exit();
        })
        .on('error', err => {
            t.fail(err);
            process.exit();
        });

        req.write(reqData);
        req.end();
    });
});
