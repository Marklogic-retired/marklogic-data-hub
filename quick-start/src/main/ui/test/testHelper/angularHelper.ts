import {module} from 'angular-mocks';

export function stubDirectives(...directives) {
  return module(($compileProvider) => {
    directives.forEach((name) => {
      $compileProvider.directive(name, () => {
        return {
          priority: 100,
          terminal: true,
        };
      });
    });
  });
}
