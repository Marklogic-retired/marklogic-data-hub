/* tslint:disable:max-line-length */
import {
  Component,
  Injectable,
  DynamicComponentLoader,
  ElementRef,
  Renderer,
  ComponentResolver,
  Injector,
  ViewChild,
  ViewContainerRef
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
  styleUrls: ['./confirm.style.css'],
  templateUrl: './confirm.tpl.html'
})
export class ConfirmComponent {
  public title: string;
  public textContent: string;
  public okText: string;
  public cancelText: string;

  @ViewChild('dlg') dlg: ElementRef;

  private _showIt: boolean = false;
  private subject: Subject<void> = new Subject<void>();
  private _startX: string;
  private _startY: string;

  constructor(private renderer: Renderer) {}

  isActive() {
    return this._showIt;
  }

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

  public show($evt: MouseEvent): Observable<void> {
    const dlg = this.dlg.nativeElement;
    this._startX = $evt.clientX - (dlg.clientWidth / 2) + 'px';
    this._startY = $evt.clientY - (dlg.clientHeight / 2) + 'px';
    this.renderer.setElementStyle(dlg, 'left', this._startX);
    this.renderer.setElementStyle(dlg, 'top', this._startY);

    const left = (window.innerWidth / 2) - (dlg.clientWidth / 2);
    const top = (window.innerHeight / 2) - (dlg.clientHeight / 2);

    this.renderer.setElementStyle(dlg, 'left', left + 'px');
    this.renderer.setElementStyle(dlg, 'top', top + 'px');
    this.renderer.setElementStyle(dlg, 'transform', 'scale(1)');

    this._showIt = true;
    return this.subject.share();
  }

  public hide(): Promise<void> {
    const dlg = this.dlg.nativeElement;
    this.renderer.setElementStyle(dlg, 'left', this._startX);
    this.renderer.setElementStyle(dlg, 'top', this._startY);
    this.renderer.setElementStyle(dlg, 'transform', 'scale(0)');
    this._showIt = false;

    return new Promise<void>((resolve, reject) => {
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

  public showConfirm(msg: IConfirmMessage, $evt: MouseEvent): Promise<ConfirmComponent> {

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
          let subject: Observable<any> = confirmComponent.show($evt);
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
