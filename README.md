[![Build Status](https://jenkins2.eu.idealo.com/jenkins/buildStatus/icon?job=RFLUG_javascript-react-router-apollo_commit)](https://jenkins2.eu.idealo.com/jenkins/view/Reise/view/Flug/view/JavaScript/job/RFLUG_javascript-react-router-apollo_commit/)

# react-router-apollo

Just a prove of concept. Keep your router in sync with apollo client cache.

## Installation

```
npm install @idealo/react-router-apollo
```

## How It Works

For every mutation request your history (push) will be synced. 
On every pop state the mutate function will be triggered.

## Tutorial

```jsx harmony
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloRoute, history, link as reactRouterLink} from '@idealo/react-router-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';

const link = new HttpLink({
  uri: 'http://api.githunt.com/graphql'
});

const cache = new InMemoryCache();
const client = new ApolloClient({
    cache,
    link: ApolloLink.from([
        reactRouterLink,
        link
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
                                outboundDate,
                                returnDate
                            }
                        }
                    })
                }}
                path="/:outboundDate?/:returnDate?"
                component={MyComponent}
            />
        </Router>
    </ApolloProvider>, document.getElementById("reactRoot"));
```

