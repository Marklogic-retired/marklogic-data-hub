import {Component, Input, Output, Inject, EventEmitter} from 'ng-forward';
import template from './folder-browser.html';
import './folder-browser.scss';

@Component({
  selector: 'folder-browser',
  template,
  inputs: ['startPath'],
})
@Inject('$scope', '$http')
/**
 * @ngdoc directive
 * @name folder-browser
 * @restrict E
 *
 */
export class FolderBrowser {
  @Output() folderChosen = new EventEmitter();


  constructor($scope, $http) {
    this.$scope = $scope;
    this.$http = $http;
    // this.startPath = this.startPath || '.';

    this.$scope.$watch('ctrl.startPath', () => {
      if (this.startPath) {
        this.getFolders(this.startPath);
      }
    });
    this.getFolders(this.startPath);
  }

  changedPath() {
    this.getFolders(this.currentPath);
  }

  getFolders(path) {
    if (path) {
      this.isLoading = true;
      return this.$http.get('/api/utils/searchPath?path=' + path).then(resp => {
        this.folders = resp.data.folders;
        this.currentPath = resp.data.currentPath;
        this.folderChosen.next(this.currentPath);
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }

  entryClicked(entry) {
    this.getFolders(entry.path);
  }

}
