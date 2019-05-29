import { ApolloLink } from 'apollo-link';
import { generatePath } from 'react-router';
import * as H from 'history';

export default function createLink(history: H.History) {
  return new ApolloLink((operation, forward) => {
    const { transform, pushPath } = operation.getContext();

    // apply transform function
    const variables = Object.keys(operation.variables).reduce((acc: any, current: string) => {
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

    if (generatedPath !== history.location.pathname) {
      history.push(generatedPath);
    }

    return forward(operation);
  });
}






