import { Route, RouteComponentProps } from 'react-router';
import * as React from 'react';
import ComponentWrapper from './ComponentWrapper';

interface MatchParams {
  [key:string]: string;
}

interface ApolloRoute extends RouteComponentProps<MatchParams>{
  component: any,
  transform: any,
  mutate: any,
  pushPath: string
}

export default ({ component, transform, mutate, pushPath, ...rest }: ApolloRoute) => {
  const Component = (props: any) =>
    <ComponentWrapper
      {...props}
      component={component}
      transform={transform}
      mutate={mutate}
      pushPath={pushPath || props.match.path}
    />;

  return <Route {...rest} component={Component} />;
};
