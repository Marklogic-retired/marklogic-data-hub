import {Inject, Injectable, EventEmitter} from 'ng-forward';

@Injectable()
@Inject('$http', '$stomp')

/**
 *
 */
export class InstallService {

  messageEmitter = null;

  constructor($http, $stomp) {
    this.$http = $http;
    this.$stomp = $stomp;
    this.messageEmitter = new EventEmitter();
  }

  install() {
    this.$stomp.connect('/install-status').then(() => {
      this.$stomp.subscribe('/topic/install-status', payload => {
        this.messageEmitter.next(payload);
      });
    });

    this.$http.put('/projects/1/local/install');
    // this.messageEmitter.next('this is a test, my friend.\n\nHello friend.\n\n\n\n\n' +
    // 'This\n\n\n\nis\n\n\na\n\n\n\ntest..\n\n\n\nfriend.');
  }
}
