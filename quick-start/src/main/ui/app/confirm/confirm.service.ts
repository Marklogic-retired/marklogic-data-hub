/* tslint:disable:max-line-length */
import {
  Component,
  Injectable,
  DynamicComponentLoader,
  ComponentResolver,
  Injector,
  ViewContainerRef,
  trigger, state, style, transition, animate
} from '@angular/core';

import { Subject, Observable } from 'rxjs/Rx';

export class ConfirmError extends Error {
  constructor(message: string) {
    super(`${message}`);
  }
}

const ANIMATION_TIME = 500;

@Component({
  selector: 'confirm-component',
  styleUrls: ['./confirm.style.scss'],
  templateUrl: './confirm.tpl.html',
  animations: [
    trigger('fadeState', [
      state('hidden', style({
        opacity: 0,
        visibility: 'hidden'
      })),
      state('active', style({
        opacity: 1,
        visibility: 'visible'
      })),
      transition('* => active', animate('0.5s ease-in')),
      transition('active => hidden', animate('0.5s ease-in'))
    ]),
    trigger('growState', [
      state('hidden', style({
        overflow: 'hidden',
        top: 0,
        left: 0,
        transform: 'scale(0)'
      })),
      state('active', style({
        overflow: '*',
        top: '*',
        left: '*',
        transform: 'scale(1)'
      })),
      transition('* => active', animate('0.5s ease-in')),
      transition('active => hidden', animate('0.5s ease-in'))
    ]),
  ]
})
export class ConfirmComponent {
  public title: string;
  public textContent: string;
  public okText: string;
  public cancelText: string;
  private showIt: string = 'hidden';

  private subject: Subject<void> = new Subject<void>();

  public ok() {
    this.hide().then(() => {
      this.subject.next(null);
    });
  }

  public cancel() {
    this.hide().then(() => {
      this.subject.error();
    });
  }

  public show(): Observable<void> {
    this.showIt = 'active';
    return this.subject.share();
  }

  public hide(): Promise<void> {
    this.showIt = 'hidden';
    return new Promise<void>(function(resolve, reject) {
      // fire after the view animation is done
      setTimeout(() => {
        resolve();
      }, ANIMATION_TIME);
    });
  }
}

export interface IConfirmMessage {
  title: string;
  message: string;
  okText: string;
  cancelText: string;
  timeout?: number;
  vcRef?: ViewContainerRef;
}

@Injectable()
export class ConfirmService {

  private defaultViewContainerRef: ViewContainerRef;
  constructor(
    private componentResolver: ComponentResolver,
    private injector: Injector,
    private dynamicComponentLoader: DynamicComponentLoader) {
  }

  public setDefaultViewContainerRef(vcRef: ViewContainerRef) {
    this.defaultViewContainerRef = vcRef;
  }

  public showConfirm(msg: IConfirmMessage): Promise<ConfirmComponent> {

    let optTimeout        = msg.timeout || 2750;
    let viewContainerRef  = msg.vcRef || this.defaultViewContainerRef;

    if (!viewContainerRef) {
      throw new ConfirmError('A viewContainerRef must be present. ' +
        'Wether as by setDefaultViewContainerRef or as IConfirmMessage param.');
    }

    let c = this.componentResolver.resolveComponent(ConfirmComponent);
    return c.then( (cFactory) => {

      let cRef = viewContainerRef.createComponent(cFactory);
      let confirmComponent: ConfirmComponent = cRef.instance;
      confirmComponent.title = msg.title;
      confirmComponent.textContent = msg.message;
      confirmComponent.okText = msg.okText;
      confirmComponent.cancelText = msg.cancelText;
      return new Promise<ConfirmComponent>(function(resolve, reject) {
        setTimeout(() => {
          let subject: Observable<any> = confirmComponent.show();
          subject.subscribe(() => {
            cRef.destroy();
            resolve();
          }, () => {
            cRef.destroy();
            reject();
          });
        },
        0);
      });
    });

  }
}

/* tslint:enable:max-line-length */
