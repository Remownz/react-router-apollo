import { match, matchPath, RouteComponentProps } from 'react-router';
import ApolloClient from 'apollo-client/ApolloClient';
import * as H from 'history';
import * as React from 'react';
import { withApollo } from 'react-apollo';


interface MutateFunc {
  (client: object, data: object): void;
}

interface Transform {
  toState: any
}

interface ComponentWrapperProps extends RouteComponentProps<MatchParams>{
  client: ApolloClient<any>,
  transform: Transform,
  mutate: MutateFunc,
  component: any,
  history: H.History,
  location: any,
  pushPath: string
}

interface MatchParams {
  [key:string]: string;
}

class ComponentWrapper extends React.Component<ComponentWrapperProps, any> {
  unlisten: any;

  mutate = (matchedPath: match) => {
    const { client, transform, mutate } = this.props;

    const data = Object.keys(matchedPath.params).reduce((acc: any, current: string) => {
      if (
        transform !== undefined
        && transform.toState !== undefined
        && typeof transform.toState[current] === 'function'
      ) {
        // @ts-ignore
        acc[current] = transform.toState[current](matchedPath.params[current]);
      } else {
        // @ts-ignore
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
        this.mutate(matchedPath);
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

  render(): JSX.Element {
    const { component, ...rest } = this.props;

    return React.createElement(component, rest);
  }
}

export default withApollo(ComponentWrapper);