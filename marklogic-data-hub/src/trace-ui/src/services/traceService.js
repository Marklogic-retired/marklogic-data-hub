import {Inject, Injectable} from 'ng-forward';

@Injectable()
@Inject('$http')

/**
 *
 */
export class TraceService {

  constructor($http) {
    this.$http = $http;
  }

  search(query, page, pageCount) {
    return this.$http.post('/hub/traces/search', {
      q: query,
      p: page,
      pc: pageCount || 10,
    });
  }

  getTraces() {
    return this.$http.get('/hub/traces');
  }

  getTrace(id) {
    return this.$http.get('/hub/traces/' + id);
  }

  getIds(query) {
    return this.$http.get('/hub/traces/ids?q=' + query);
  }
}
