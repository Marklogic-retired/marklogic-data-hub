import { Component, Input, ViewChild } from '@angular/core';

import { Task } from './task.model';

import { TaskService } from './tasks.service';

import * as _ from 'lodash';

@Component({
  selector: 'tasks',
  templateUrl: './tasks.tpl.html',
  directives: [],
  providers: [TaskService],
  styleUrls: ['./tasks.style.scss'],
})
export class Tasks {

  tasks: Array<Task>;

  constructor(private taskService: TaskService) {
    this.getTasks();
  }

  getTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }
}
