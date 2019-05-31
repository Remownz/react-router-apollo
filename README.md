[![Build Status](https://jenkins2.eu.idealo.com/jenkins/buildStatus/icon?job=RFLUG_javascript-react-router-apollo_commit)](https://jenkins2.eu.idealo.com/jenkins/view/Reise/view/Flug/view/JavaScript/job/RFLUG_javascript-react-router-apollo_commit/)

# react-router-apollo

Keep your router in sync with apollo client cache.

## Installation

```
npm install @idealo/react-router-apollo
```

## How It Works

For every mutation request your history (push) will be synced. 
On every pop state the mutate function will be triggered.

## Tutorial

Create a history.js:
```jsx harmony

import { createHashHistory } from "history";
export default createHashHistory();
```

```jsx harmony
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloRoute, createLink as createReactRouterLink} from '@idealo/react-router-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import history from './history'; // your history.js

// you need a terminating link, here HttpLink
// @see https://www.apollographql.com/docs/link/overview#terminating
const httpLink = new HttpLink({
  uri: 'http://api.githunt.com/graphql'
});

const cache = new InMemoryCache();
const client = new ApolloClient({
    cache,
    link: ApolloLink.from([
        createReactRouterLink(history),
        httpLink
    ]),
    resolvers: {}
});

class MyComponent extends React.Component {
  render() {
    return <div>MyComponent</div>
  }
}

ReactDOM.render(
    <ApolloProvider client={client}>
        <Router history={history}>
            <ApolloRoute
                transform={{
                    toState: {
                        outboundDate: (dateString) => dateString ? new Date(dateString).toISOString() : null,
                        returnDate: (dateString) => dateString ? new Date(dateString).toISOString() : null
                    },
                    toURL: {
                        outboundDate: (isoDateString) => isoDateString ? dateFormat(new Date(isoDateString), URL_DATE_FORMAT) : null,
                        returnDate: (isoDateString) => isoDateString ? dateFormat(new Date(isoDateString), URL_DATE_FORMAT) : null
                    },
                }}
                mutate={(client, data) => {
                    client.writeData({
                        data: {
                            flightRecommendation: {
                                __typename: "FlightRecommendation",
                                outboundDate: data.outboundDate,
                                returnDate: data.returnDate
                            }
                        }
                    })
                }}
                exact
                path={["/", "/foobar/:outboundDate?/:returnDate?"]}
                pushPath="/foobar/:outboundDate?/:returnDate?"
                component={MyComponent}
            />
        </Router>
    </ApolloProvider>, document.getElementById("reactRoot"));
```
### ApolloRoute Properties

 __transform__ (optional):  Define transform callbacks for push history (toUrl) and pop history (toState) on your path parameters.  
 __mutate__ (optional):  Is called on pop history with apollo client and extracted path parameters.  
 __pushPath__ (optional): The history path to push local state changes. __Default__: current path
 
 [Complete property list](https://reacttraining.com/react-router/web/api/Route)