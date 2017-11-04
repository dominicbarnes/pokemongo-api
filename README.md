# pokemongo-api

> A [GraphQL][graphql] API for [Pokemon GO][pogo] built using data from mining
> the `GAME_MASTER` file. The goal is to produce a unified API that developers
> can use to produce tools like IV checkers and team builders without needing
> to keep up with changes to the `GAME_MASTER` themselves.

## Stages

Each of the "stages" below is a different deployment. New versions will be first
tested on "development" before moving on to "staging" and then finally
"production":

 - [development][dev]
 - ~~[staging][stage]~~ *(not yet available)*
 - ~~[production][prod]~~ *(not yet available)*

**NOTE:** only "development" will have [GraphIQL][graphiql], as it is a
development tool and staging/production should be queried directly.

## Contributions

If you'd like to contribute to this project, check out the [issues][issues] to
see what is being requested first. Feel free to submit your own ideas as well!


[pogo]: http://www.pokemongo.com/
[graphql]: http://graphql.org/
[graphiql]: https://github.com/graphql/graphiql
[dev]: https://61heu9qv1g.execute-api.us-west-2.amazonaws.com/development/
[stage]: https://61heu9qv1g.execute-api.us-west-2.amazonaws.com/staging/
[prod]: https://61heu9qv1g.execute-api.us-west-2.amazonaws.com/production/
