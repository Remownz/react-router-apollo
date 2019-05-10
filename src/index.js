import React from 'react';
import gql from 'graphql-tag';
import { ApolloLink } from 'apollo-link';
import { generatePath, matchPath, Route } from 'react-router';
import { createHashHistory } from 'history';
import { withApollo } from 'react-apollo';

export const history = createHashHistory();

export const link = new ApolloLink((operation, forward) => {
  const { cache, transform } = operation.getContext();

  const data = cache.readQuery({
    query: gql`
        query {
            currentRoute @client
        }
    `
  });

  // apply transform function
  const variables = Object.keys(operation.variables).reduce((acc, current) => {
    if (transform.toURL !== undefined && typeof transform.toURL[current] === 'function') {
      acc[current] = transform.toURL[current](operation.variables[current]);
    } else {
      acc[current] = operation.variables[current];
    }

    return acc;
  }, {});

  history.push(generatePath(data.currentRoute, variables));

  return forward(operation);
});


class ContextComponent extends React.Component {
  componentDidMount() {
    const { client, transform, mutate } = this.props;

    client.writeData({
      data: {
        currentRoute: this.props.match.path
      }
    });

    client.defaultOptions = { // make transform available to context
      ...client.defaultOptions,
      mutate: {
        ...(client.defaultOptions.mutate || {}),
        context: {
          ...((client.defaultOptions.mutate && client.defaultOptions.mutate.context) || {}),
          transform: {
            ...transform
          }
        }
      }
    };

    history.listen((location, action) => {
      const matchedPath = matchPath(location.pathname, {
        path: this.props.match.path
      });

      if (action === 'POP') {
        const data = Object.keys(matchedPath.params).reduce((acc, current) => {
          if (transform.toState !== undefined && typeof transform.toState[current] === 'function') {
            acc[current] = transform.toState[current](matchedPath.params[current]);
          } else {
            acc[current] = matchedPath.params[current];
          }

          return acc;
        }, {});

        if (typeof mutate === 'function') mutate(client, data);
      }
    });
  }

  render() {
    const Component = this.props.component;

    return <Component />;
  }

}

export const ApolloRoute = ({ component, transform, mutate, ...rest }) => {
  const ContextComponentWithClient = (props) =>
    <ContextComponent
      {...props}
      component={component} transform={transform}
      mutate={mutate}
    />;

  return <Route {...rest} component={withApollo(ContextComponentWithClient)} />;
};

