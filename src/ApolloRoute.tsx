import ApolloClient from "apollo-client";
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { Route, RouteComponentProps } from 'react-router';
import ComponentWrapper from './ComponentWrapper';

interface MatchParams {
  [key: string]: string;
}

type CreateClientFunc = () => ApolloClient<object>;

interface ApolloRoute extends RouteComponentProps<MatchParams> {
  client?: CreateClientFunc,
  component: any,
  transform: any,
  mutate: any,
  pushPath: string
}

export default ({ client, component, transform, mutate, pushPath, ...rest }: ApolloRoute) => {
  const componentWrapperFunc = (props: any) => <ComponentWrapper
        {...props}
        component={component}
        transform={transform}
        mutate={mutate}
        pushPath={pushPath || props.match.path}
  />;

  const componentFunc = client !== undefined
    ? (props: any) => <ApolloProvider client={client()}>{componentWrapperFunc(props)}</ApolloProvider>
    : (props: any) => componentWrapperFunc(props);

  return <Route {...rest} component={componentFunc} />;
};
