import { ApolloLink } from 'apollo-link';
import * as H from 'history';
import { generatePath } from 'react-router';

export default function createLink(history: H.History) {
  const hasToURLTransform = (transform, key) => {
    return transform !== undefined
      && transform.toURL !== undefined
      && typeof transform.toURL[key] === 'function';
  };

  return new ApolloLink((operation, forward) => {
    const { transform, pushPath } = operation.getContext();

    // apply transform function
    const variables = Object.keys(operation.variables).reduce((acc: any, current: string) => {
      acc[current] = hasToURLTransform(transform, current)
        ? transform.toURL[current](operation.variables[current])
        : operation.variables[current];

      return acc;
    }, {});

    const generatedPath = generatePath(pushPath, variables);

    if (generatedPath !== history.location.pathname) {
      history.push(generatedPath);
    }

    return forward(operation);
  });
}






