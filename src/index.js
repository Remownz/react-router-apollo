import React from 'react';
import { ApolloLink } from 'apollo-link';
import { generatePath, matchPath, Route } from 'react-router';
import { withApollo } from 'react-apollo';

export function createLink(history){
  return new ApolloLink((operation, forward) => {
    const { transform, pushPath } = operation.getContext();

    // apply transform function
    const variables = Object.keys(operation.variables).reduce((acc, current) => {
      if (
        transform !== undefined
        && transform.toURL !== undefined
        && typeof transform.toURL[current] === 'function') {
        acc[current] = transform.toURL[current](operation.variables[current]);
      } else {
        acc[current] = operation.variables[current];
      }

      return acc;
    }, {});

    const generatedPath = generatePath(pushPath, variables);

    if(generatedPath !== history.location.pathname){
      history.push(generatedPath);
    }

    return forward(operation);
  });
}

class ComponentWrapper extends React.Component {
  mutate = (matchedPath) => {
    const { client, transform, mutate } = this.props;

    const data = Object.keys(matchedPath.params).reduce((acc, current) => {
      if (
        transform !== undefined
        && transform.toState !== undefined
        && typeof transform.toState[current] === 'function'
      ) {
        acc[current] = transform.toState[current](matchedPath.params[current]);
      } else {
        acc[current] = matchedPath.params[current];
      }

      return acc;
    }, {});

    if (typeof mutate === 'function' && data) mutate(client, data);
  };

  addHistoryListener = () => {
    const { match, history } = this.props;

    this.unlisten = history.listen((location, action) => {
      const matchedPath = matchPath(location.pathname, {
        path: match.path
      });

      if (action === 'POP') {
        this.mutate(matchedPath)
      }
    });
  };

  componentDidMount() {
    const { client, transform, match, location, pushPath } = this.props;

    client.defaultOptions = { // make transform available to context
      ...client.defaultOptions,
      mutate: {
        ...(client.defaultOptions.mutate || {}),
        context: {
          ...((client.defaultOptions.mutate && client.defaultOptions.mutate.context) || {}),
          pushPath,
          transform: {
            ...transform
          }
        }
      }
    };

    const matchedPath = matchPath(location.pathname, {
      path: match.path
    });

    this.mutate(matchedPath);
    this.addHistoryListener();
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const { component, ...rest } = this.props;

    return React.createElement(component, rest)
  }
}

const ComponentWrapperWithClient = withApollo(ComponentWrapper);

export const ApolloRoute = ({ component, transform, mutate, pushPath, ...rest }) => {
  const Component = props =>
    <ComponentWrapperWithClient
      {...props}
      component={component}
      transform={transform}
      mutate={mutate}
      pushPath={pushPath || props.match.path}
    />;

  return <Route {...rest} component={Component} />;
};

