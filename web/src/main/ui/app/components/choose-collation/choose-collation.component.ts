import {
  Component,
  Inject,
  OnInit,
  HostListener
} from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';

@Component({
  selector: 'app-external-def-dialog',
  templateUrl: './choose-collation.component.html',
  styleUrls: ['./choose-collation.component.scss']
})
export class ChooseCollationComponent implements OnInit {

  actions: any;
  collation: string;

  collations: Array<any> = [
    {
      label: 'Root Collation',
      value: 'http://marklogic.com/collation/'
    },
    {
      label: 'Unicode Codepoint',
      value: 'http://marklogic.com/collation/codepoint'
    },
    {
      label: 'English - Base',
      value: 'http://marklogic.com/collation/en'
    },
    {
      label: 'French - Base',
      value: 'http://marklogic.com/collation/fr'
    },
    {
      label: 'Italian - Base',
      value: 'http://marklogic.com/collation/it'
    },
    {
      label: 'German - Base',
      value: 'http://marklogic.com/collation/de'
    },
    {
      label: 'Spanish - Base',
      value: 'http://marklogic.com/collation/es'
    },
    {
      label: 'Russian - Base',
      value: 'http://marklogic.com/collation/ru'
    },
    {
      label: 'Arabic - Base',
      value: 'http://marklogic.com/collation/ar'
    },
    {
      label: 'Chinese (S) - Base',
      value: 'http://marklogic.com/collation/zh'
    },
    {
      label: 'Chinese (T) - Base',
      value: 'http://marklogic.com/collation/zh-Hant'
    },
    {
      label: 'Persian - Base',
      value: 'http://marklogic.com/collation/fa'
    },
    {
      label: 'Korean - Base',
      value: 'http://marklogic.com/collation/ko'
    },
    {
      label: 'Dutch - Base',
      value: 'http://marklogic.com/collation/nl'
    },
    {
      label: 'Japanese - Base',
      value: 'http://marklogic.com/collation/ja'
    },
    {
      label: 'Portuguese - Base',
      value: 'http://marklogic.com/collation/pt'
    },
    {
      label: 'Bokmål - Base',
      value: 'http://marklogic.com/collation/nb'
    },
    {
      label: 'Nynorsk - Base',
      value: 'http://marklogic.com/collation/nn'
    },
    {
      label: 'Swedish - Base',
      value: 'http://marklogic.com/collation/sv'
    }
  ];

  constructor(
    private dialog: MdlDialogReference,
    @Inject('collation') collation: string,
    @Inject('actions') actions: any) {
    this.collation = collation;
    this.actions = actions;
  }

  public ngOnInit() {
  }

  createCollation() {
    if (this.actions.save) {
      this.actions.save(this.collation);
    }
    this.dialog.hide();
  }

  close() {
    if (this.actions.cancel) {
      this.actions.cancel();
    }
    this.dialog.hide();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.dialog.hide();
  }
}
