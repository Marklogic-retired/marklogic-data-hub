import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import { PROJECT_ROOT, DIST_DIR } from '../../config';

const plugins = <any>gulpLoadPlugins();

export = () => {
  gulp
    .src(`${PROJECT_ROOT}/node_modules`)
    .pipe(plugins.sym(`${DIST_DIR}/node_modules`));
}
