import { ApolloClient } from 'apollo-client';
import * as H from 'history';
import * as React from 'react';
import { withApollo } from 'react-apollo';
import { match as matchType, matchPath, RouteComponentProps } from 'react-router';

type MutateFunc = (client: ApolloClient<{}>, data: object) => void;

interface Transform {
  toState: any
}

interface ComponentWrapperProps extends RouteComponentProps<MatchParams> {
  client: ApolloClient<any>,
  transform: Transform,
  mutate: MutateFunc,
  component: any,
  history: H.History,
  location: any,
  pushPath: string
}

interface MatchParams {
  [key: string]: string;
}

class ComponentWrapper extends React.Component<ComponentWrapperProps, any> {

  static _hasToStateTransform(transform, key) {
    return transform !== undefined
      && transform.toState !== undefined
      && typeof transform.toState[key] === 'function';
  }

  private unlisten: any;

  _mutate = (matchedPath: matchType) => {
    const { client, transform, mutate } = this.props;

    const data = Object.keys(matchedPath.params).reduce((acc: any, current: string) => {
      acc[current] = ComponentWrapper._hasToStateTransform(transform, current)
        ? transform.toState[current](matchedPath.params[current])
        : matchedPath.params[current];

      return acc;
    }, {});

    if (typeof mutate === 'function' && data) {
      mutate(client, data);
    }
  };

  _addHistoryListener = (history: H.History) => {
    this.unlisten = history.listen((location, action) => {
      const { match } = this.props;

      const matchedPath = matchPath(location.pathname, {
        path: match.path,
      });

      if (action === 'POP') {
        this._mutate(matchedPath);
      }
    });
  };

  componentDidMount() {
    const { client, transform, match, location, pushPath, history } = this.props;

    client.defaultOptions = { // make transform available to context
      ...client.defaultOptions,
      mutate: {
        ...(client.defaultOptions.mutate || {}),
        context: {
          ...((client.defaultOptions.mutate && client.defaultOptions.mutate.context) || {}),
          pushPath,
          transform: {
            ...transform,
          },
        },
      },
    };

    const matchedPath = matchPath(location.pathname, {
      path: match.path,
    });

    this._mutate(matchedPath);
    this._addHistoryListener(history);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render(): JSX.Element {
    const { component, ...rest } = this.props;

    return React.createElement(component, rest);
  }
}

export default withApollo(ComponentWrapper);
