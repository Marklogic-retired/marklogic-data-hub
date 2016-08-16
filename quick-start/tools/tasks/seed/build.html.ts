import * as gulp from 'gulp';
import {join} from 'path';
import {APP_SRC, TMP_DIR} from '../../config';

export = () => {
  return gulp.src(join(APP_SRC, '**', '*.html'))
    .pipe(gulp.dest(TMP_DIR));
}
